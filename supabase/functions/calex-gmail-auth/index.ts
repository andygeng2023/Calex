import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-requested-with",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: corsHeaders });
const b64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
const unb64 = (value: string) => Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
const allowedOrigins = new Set([
  "https://andygeng2023.github.io",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
]);

async function cryptoKey() {
  const raw = Deno.env.get("CALEX_GMAIL_TOKEN_ENCRYPTION_KEY") || "";
  if (!raw) throw new Error("Gmail token encryption is not configured on the server.");
  const bytes = unb64(raw);
  if (bytes.length !== 32) throw new Error("Gmail token encryption key must be base64-encoded 32 bytes.");
  return crypto.subtle.importKey("raw", bytes, "AES-GCM", false, ["encrypt", "decrypt"]);
}
async function encrypt(value: string) {
  const key = await cryptoKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(value));
  return { ciphertext: b64(new Uint8Array(cipher)), iv: b64(iv) };
}
async function decrypt(ciphertext: string, iv: string) {
  const data = await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(iv) }, await cryptoKey(), unb64(ciphertext));
  return new TextDecoder().decode(data);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);
  try {
    const origin = req.headers.get("Origin") || "";
    if (!allowedOrigins.has(origin)) return json({ error: "This Calex origin is not allowed." }, 403);
    if (req.headers.get("X-Requested-With") !== "XmlHttpRequest") return json({ error: "Request validation failed." }, 403);
    const authorization = req.headers.get("Authorization") || "";
    const accessJwt = authorization.toLowerCase().startsWith("bearer ") ? authorization.slice(7).trim() : "";
    if (!accessJwt) return json({ error: "Sign in to Calex first." }, 401);
    const url = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    if (!url || !anonKey || !serviceKey) throw new Error("Supabase server configuration is incomplete.");
    const userClient = createClient(url, anonKey, { global: { headers: { Authorization: "Bearer " + accessJwt } }, auth: { persistSession: false, autoRefreshToken: false } });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) return json({ error: "Your Calex session is invalid. Sign in again." }, 401);
    const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const body = await req.json().catch(() => ({}));
    const action = String(body.action || "status");
    const { data: existing, error: existingError } = await admin.from("calex_gmail_connections").select("*").eq("user_id", user.id).maybeSingle();
    if (existingError) throw existingError;

    if (action === "status") return json({ connected: !!existing, email: existing?.email || null, connectedAt: existing?.connected_at || null });

    if (action === "disconnect") {
      if (existing) {
        try {
          const refreshToken = await decrypt(existing.refresh_token_ciphertext, existing.refresh_token_iv);
          await fetch("https://oauth2.googleapis.com/revoke", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ token: refreshToken }) });
        } catch (_) { /* Still remove the saved connection if remote revocation is unavailable. */ }
        const { error } = await admin.from("calex_gmail_connections").delete().eq("user_id", user.id);
        if (error) throw error;
      }
      return json({ connected: false });
    }

    if (action === "exchange") {
      const code = String(body.code || "");
      const redirectUri = String(body.redirectUri || "");
      if (!code) return json({ error: "Google authorization code is missing." }, 400);
      if (redirectUri !== origin) return json({ error: "Google authorization origin did not match this request." }, 400);
      const clientId = Deno.env.get("CALEX_GMAIL_CLIENT_ID") || "";
      const clientSecret = Deno.env.get("CALEX_GMAIL_CLIENT_SECRET") || "";
      if (!clientId || !clientSecret) return json({ error: "Gmail server OAuth credentials are not configured yet." }, 503);
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, grant_type: "authorization_code", redirect_uri: redirectUri }),
      });
      const tokens = await tokenResponse.json();
      if (!tokenResponse.ok || !tokens.access_token) return json({ error: tokens.error_description || tokens.error || "Google token exchange failed." }, 400);
      const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", { headers: { Authorization: "Bearer " + tokens.access_token } });
      const userInfo = await userInfoResponse.json();
      if (!userInfoResponse.ok || !userInfo.email) return json({ error: "Google did not return an email address for this account." }, 400);
      const refreshToken = String(tokens.refresh_token || (existing ? await decrypt(existing.refresh_token_ciphertext, existing.refresh_token_iv) : ""));
      if (!refreshToken) return json({ error: "Google did not issue a durable refresh token. Revoke Calex's existing Gmail permission in your Google Account and connect again." }, 400);
      const sealed = await encrypt(refreshToken);
      const row = {
        user_id: user.id,
        email: String(userInfo.email),
        google_subject: String(userInfo.sub || ""),
        scopes: String(tokens.scope || "https://www.googleapis.com/auth/gmail.readonly").split(" "),
        refresh_token_ciphertext: sealed.ciphertext,
        refresh_token_iv: sealed.iv,
        updated_at: new Date().toISOString(),
      };
      const { error } = await admin.from("calex_gmail_connections").upsert(row, { onConflict: "user_id" });
      if (error) throw error;
      return json({ connected: true, email: row.email, accessToken: tokens.access_token, expiresIn: Number(tokens.expires_in) || 3600 });
    }

    if (action === "refresh") {
      if (!existing) return json({ error: "No Gmail account is connected to this Calex account." }, 404);
      const clientId = Deno.env.get("CALEX_GMAIL_CLIENT_ID") || "";
      const clientSecret = Deno.env.get("CALEX_GMAIL_CLIENT_SECRET") || "";
      if (!clientId || !clientSecret) return json({ error: "Gmail server OAuth credentials are not configured yet." }, 503);
      const refreshToken = await decrypt(existing.refresh_token_ciphertext, existing.refresh_token_iv);
      const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ refresh_token: refreshToken, client_id: clientId, client_secret: clientSecret, grant_type: "refresh_token" }),
      });
      const tokens = await response.json();
      if (!response.ok || !tokens.access_token) {
        if (tokens.error === "invalid_grant") await admin.from("calex_gmail_connections").delete().eq("user_id", user.id);
        return json({ error: tokens.error_description || tokens.error || "Could not refresh Gmail access." }, 401);
      }
      return json({ connected: true, email: existing.email, accessToken: tokens.access_token, expiresIn: Number(tokens.expires_in) || 3600 });
    }
    return json({ error: "Unsupported action." }, 400);
  } catch (error) {
    console.error("calex-gmail-auth error", error instanceof Error ? error.message : "unknown");
    return json({ error: error instanceof Error ? error.message : "Gmail account operation failed." }, 500);
  }
});
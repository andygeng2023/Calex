(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const GMAIL_SCOPE = "https://www.googleapis.com/auth/gmail.readonly";
  const GMAIL_API = "https://gmail.googleapis.com/gmail/v1/users/me";
  const MAX_MESSAGES = 20;
  const CACHE_TTL_MS = 60 * 1000;
  const MAX_BODY_CHARS = 12000;

  let accessToken = "";
  let tokenExpiresAt = 0;
  let tokenClient = null;
  let linkedEmail = "";
  let restoringConnection = false;
  const GMAIL_AUTH_FUNCTION = "https://fwcijtjahtwpyaqedyhq.supabase.co/functions/v1/calex-gmail-auth";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_oWpplxsSIvn3KfinwmlLjg_3No69nPW";
  let messages = [];
  let pendingConversion = null;
  let loading = false;
  let activeConversions = new Set();
  let activeFilter = "inbox";
  let nextPageToken = "";
  let hasMoreMessages = false;
  // Session-memory caches avoid repeat Gmail API and Puter requests without
  // persisting message content to browser storage.
  const queryPageCache = new Map();
  const metadataCache = new Map();
  const bodyCache = new Map();
  const conversionCache = new Map();

  const emailScreen = $("emailScreen");
  const results = $("gmailEmails");
  const status = $("gmailStatus");
  const connectButton = $("gmailConnect");
  const refreshButton = $("gmailRefresh");
  const disconnectButton = $("gmailDisconnect");
  const searchInput = $("gmailSearch");
  const searchButton = $("gmailSearchButton");
  const setupHelp = $("gmailSetupHelp");
  const loadMoreHint = $("gmailLoadMore");
  const detailDialog = $("gmailDetailDialog");
  const detailSubject = $("gmailDetailSubject");
  const detailFrom = $("gmailDetailFrom");
  const detailTo = $("gmailDetailTo");
  const detailCc = $("gmailDetailCc");
  const detailCcRow = $("gmailDetailCcRow");
  const detailDate = $("gmailDetailDate");
  const detailStatus = $("gmailDetailStatus");
  const detailBody = $("gmailDetailBody");
  const detailOpenGmail = $("gmailDetailOpenGmail");
  const detailMakeEvent = $("gmailDetailMakeEvent");
  let detailMessageId = "";

  function clientId() {
    return String(window.CALEX_GMAIL_CLIENT_ID || "").trim();
  }

  function setStatus(text, error) {
    status.textContent = text;
    status.classList.toggle("is-error", !!error);
  }

  function hasToken() {
    return !!accessToken && Date.now() < tokenExpiresAt - 30000;
  }

  function renderControls() {
    const configured = !!clientId();
    setupHelp.hidden = configured;
    connectButton.disabled = !configured;
    connectButton.textContent = hasToken() ? "Gmail connected" : "Connect Gmail";
    connectButton.hidden = hasToken();
    disconnectButton.hidden = !hasToken() && !linkedEmail;
    refreshButton.disabled = !hasToken() || loading;
    searchInput.disabled = !hasToken() || loading;
    searchButton.disabled = !hasToken() || loading;
    document.querySelectorAll("[data-gmail-filter]").forEach((button) => {
      button.disabled = !hasToken() || loading;
      const active = button.dataset.gmailFilter === activeFilter;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    if (!configured) {
      setStatus("Gmail is not configured for this deployment yet.");
    }
  }

  function loadIdentityLibrary() {
    if (window.google && window.google.accounts && window.google.accounts.oauth2) {
      return Promise.resolve();
    }
    const existing = document.querySelector('script[data-calex-google-identity="true"]');
    if (existing) {
      return new Promise((resolve, reject) => {
        existing.addEventListener("load", resolve, { once: true });
        existing.addEventListener("error", () => reject(new Error("Google authorization could not load.")), { once: true });
      });
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.dataset.calexGoogleIdentity = "true";
      script.onload = () => {
        if (window.google && window.google.accounts && window.google.accounts.oauth2) resolve();
        else reject(new Error("Google authorization did not initialize. Refresh and retry."));
      };
      script.onerror = () => reject(new Error("Google authorization could not load. Check your connection."));
      document.head.appendChild(script);
    });
  }

  async function serverAction(action, payload = {}) {
    const sessionToken = await window.Calex?.getAuthAccessToken?.();
    if (!sessionToken) throw new Error("Sign in to your Calex account first. Gmail connections are saved to your account.");
    let response;
    try {
      response = await fetch(GMAIL_AUTH_FUNCTION, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_PUBLISHABLE_KEY,
          Authorization: "Bearer " + sessionToken,
          "X-Requested-With": "XmlHttpRequest",
        },
        body: JSON.stringify({ action, ...payload }),
        cache: "no-store",
      });
    } catch (_) {
      throw new Error("Could not reach Calex's secure Gmail connection service.");
    }
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "Gmail account operation failed.");
    return result;
  }

  function requestAuthorizationCode() {
    return new Promise((resolve, reject) => {
      tokenClient = window.google.accounts.oauth2.initCodeClient({
        client_id: clientId(),
        scope: GMAIL_SCOPE,
        include_granted_scopes: true,
        ux_mode: "popup",
        select_account: true,
        callback: (response) => {
          if (response.error || !response.code) {
            reject(new Error(response.error_description || response.error || "Gmail access was not granted."));
            return;
          }
          resolve(response.code);
        },
        error_callback: (error) => {
          reject(new Error(error && error.message ? error.message : "Google's authorization window was closed."));
        },
      });
      tokenClient.requestCode();
    });
  }

  async function refreshAccessToken() {
    const result = await serverAction("refresh");
    accessToken = result.accessToken || "";
    tokenExpiresAt = Date.now() + (Number(result.expiresIn) || 3600) * 1000;
    linkedEmail = result.email || linkedEmail;
    renderControls();
    return result;
  }

  async function restoreConnection() {
    if (restoringConnection) return;
    restoringConnection = true;
    try {
      if (!window.Calex?.isSignedIn?.()) {
        disconnectLocalState();
        linkedEmail = "";
        setStatus("Sign in to Calex to restore your linked Gmail account.");
        return;
      }
      const statusResult = await serverAction("status");
      linkedEmail = statusResult.connected ? statusResult.email || "" : "";
      if (!statusResult.connected) {
        disconnectLocalState();
        setStatus("Connect Gmail to link an account to your Calex profile.");
        return;
      }
      await refreshAccessToken();
      setStatus("Gmail restored for " + linkedEmail + ". Loading your inbox…");
      if (emailScreen.classList.contains("active")) await loadMessages();
    } catch (error) {
      accessToken = "";
      tokenExpiresAt = 0;
      renderControls();
      setStatus(error?.message || "Could not restore Gmail. Reconnect to continue.", true);
    } finally {
      restoringConnection = false;
      renderControls();
    }
  }

  function disconnectLocalState() {
    accessToken = "";
    tokenExpiresAt = 0;
    tokenClient = null;
    queryPageCache.clear();
    metadataCache.clear();
    bodyCache.clear();
    conversionCache.clear();
    if (detailDialog && detailDialog.open) detailDialog.close();
    detailMessageId = "";
    messages = [];
    nextPageToken = "";
    hasMoreMessages = false;
    renderMessages();
    renderControls();
  }

  async function connectGmail() {
    if (!clientId()) {
      renderControls();
      return;
    }
    if (!window.Calex?.isSignedIn?.()) {
      setStatus("Sign in to your Calex account first so this Gmail connection can be remembered.", true);
      return;
    }
    connectButton.disabled = true;
    setStatus("Opening Google consent…");
    try {
      await loadIdentityLibrary();
      const code = await requestAuthorizationCode();
      const result = await serverAction("exchange", { code, redirectUri: location.origin });
      accessToken = result.accessToken || "";
      tokenExpiresAt = Date.now() + (Number(result.expiresIn) || 3600) * 1000;
      linkedEmail = result.email || "";
      renderControls();
      setStatus("Gmail connected and saved to your Calex account. Loading your inbox…");
      await loadMessages();
    } catch (error) {
      disconnectLocalState();
      setStatus(error && error.message ? error.message : "Could not connect Gmail. Try again.", true);
    } finally {
      renderControls();
    }
  }

  async function gmailApi(path) {
    if (!hasToken()) {
      try {
        await refreshAccessToken();
      } catch (_) {
        disconnectLocalState();
        throw new Error("Gmail access could not be restored. Reconnect Gmail to continue.");
      }
    }
    let response;
    try {
      response = await fetch(GMAIL_API + path, {
        method: "GET",
        headers: { Authorization: "Bearer " + accessToken },
        cache: "no-store",
      });
    } catch (_) {
      throw new Error("Could not reach Gmail. Check your connection and retry.");
    }
    let payload = {};
    try {
      payload = await response.json();
    } catch (_) {}
    if (response.status === 401) {
      disconnectLocalState();
      throw new Error("Gmail access has expired. Connect Gmail again to continue.");
    }
    if (!response.ok) {
      const detail = payload && payload.error && payload.error.message;
      throw new Error(detail || "Gmail returned an error (" + response.status + ").");
    }
    return payload;
  }

  function headerValue(headers, name) {
    const item = (headers || []).find((header) => String(header.name || "").toLowerCase() === name.toLowerCase());
    return decodeHeader(item ? item.value || "" : "");
  }

  function decodeHeader(value) {
    return String(value).replace(/=\?([^?]+)\?([bq])\?([^?]*)\?=/gi, (full, charset, encoding, data) => {
      try {
        let bytes;
        if (encoding.toLowerCase() === "b") {
          bytes = Uint8Array.from(atob(data), (character) => character.charCodeAt(0));
        } else {
          const decoded = data.replace(/_/g, " ").replace(/=([0-9a-f]{2})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
          bytes = Uint8Array.from(decoded, (character) => character.charCodeAt(0));
        }
        return new TextDecoder(charset).decode(bytes);
      } catch (_) {
        return data;
      }
    }).replace(/\s+/g, " ").trim();
  }

  async function loadMessages(reset = true) {
    if (!hasToken()) {
      setStatus("Connect Gmail to show your inbox.");
      return;
    }
    if (loading) return;
    if (!reset && (!hasMoreMessages || !nextPageToken)) return;
    loading = true;
    renderControls();
    updateLoadMoreHint();
    if (reset) {
      messages = [];
      nextPageToken = "";
      hasMoreMessages = false;
      renderMessages();
      setStatus("Loading emails…");
    } else {
      setStatus("Loading more emails…");
    }
    try {
      const query = searchInput.value.trim();
      const filterQuery = {
        inbox: "in:inbox",
        unread: "in:inbox is:unread",
        starred: "in:inbox is:starred",
      }[activeFilter] || "in:inbox";
      const gmailQuery = [filterQuery, query].filter(Boolean).join(" ");
      const requestedPageToken = reset ? "" : nextPageToken;
      const cacheKey = gmailQuery + "|" + requestedPageToken;
      const cachedPage = queryPageCache.get(cacheKey);
      let loaded;
      let page;

      if (cachedPage && Date.now() - cachedPage.timestamp < CACHE_TTL_MS) {
        loaded = cachedPage.messages;
        page = { nextPageToken: cachedPage.nextPageToken };
      } else {
        const params = new URLSearchParams();
        params.set("q", gmailQuery);
        params.set("maxResults", String(MAX_MESSAGES));
        params.set("fields", "messages(id,threadId),nextPageToken,resultSizeEstimate");
        if (requestedPageToken) params.set("pageToken", requestedPageToken);
        page = await gmailApi("/messages?" + params.toString());
        const ids = Array.isArray(page.messages) ? page.messages : [];
        const pending = ids.filter((item) => {
          const cached = metadataCache.get(item.id);
          return !cached || Date.now() - cached.timestamp >= 5 * 60 * 1000;
        });
        const metadataById = new Map();
        let cursor = 0;
        const worker = async () => {
          while (cursor < pending.length) {
            const item = pending[cursor++];
            const metadata = new URLSearchParams();
            metadata.set("format", "metadata");
            ["From", "To", "Cc", "Subject", "Date"].forEach((name) => metadata.append("metadataHeaders", name));
            metadata.set("fields", "id,threadId,internalDate,snippet,labelIds,payload(headers,mimeType)");
            const data = await gmailApi("/messages/" + encodeURIComponent(item.id) + "?" + metadata.toString());
            const email = {
              id: data.id,
              threadId: data.threadId || item.threadId || "",
              from: headerValue(data.payload && data.payload.headers, "From") || "Unknown sender",
              to: headerValue(data.payload && data.payload.headers, "To"),
              cc: headerValue(data.payload && data.payload.headers, "Cc"),
              subject: headerValue(data.payload && data.payload.headers, "Subject") || "(No subject)",
              date: headerValue(data.payload && data.payload.headers, "Date"),
              internalDate: Number(data.internalDate) || 0,
              snippet: String(data.snippet || ""),
              labelIds: Array.isArray(data.labelIds) ? data.labelIds : [],
            };
            metadataCache.set(item.id, { timestamp: Date.now(), email });
            metadataById.set(item.id, email);
          }
        };
        await Promise.all(Array.from({ length: Math.min(4, pending.length) }, worker));
        loaded = ids.map((item) => metadataById.get(item.id) || metadataCache.get(item.id)?.email).filter(Boolean);
        queryPageCache.set(cacheKey, {
          timestamp: Date.now(),
          messages: loaded,
          nextPageToken: page.nextPageToken || "",
        });
      }

      const existingIds = new Set(messages.map((message) => message.id));
      const uniqueLoaded = loaded.filter((message) => message && message.id && !existingIds.has(message.id));
      messages = (reset ? loaded : messages.concat(uniqueLoaded)).sort((a, b) => b.internalDate - a.internalDate);
      nextPageToken = page.nextPageToken || "";
      hasMoreMessages = !!nextPageToken;
      renderMessages();
      setStatus(messages.length
        ? "Showing " + messages.length + " email" + (messages.length === 1 ? "" : "s") + "."
        : "No inbox messages matched that search.");
    } catch (error) {
      setStatus(error && error.message ? error.message : "Could not load Gmail messages.", true);
    } finally {
      loading = false;
      renderControls();
      updateLoadMoreHint();
    }
  }

  function updateLoadMoreHint() {
    if (!loadMoreHint) return;
    loadMoreHint.replaceChildren();
    loadMoreHint.hidden = !hasToken() || (!loading && !hasMoreMessages);
    if (loadMoreHint.hidden) return;
    if (loading) {
      const spinner = document.createElement("span");
      spinner.className = "gmail-spinner";
      spinner.setAttribute("aria-hidden", "true");
      const label = document.createElement("span");
      label.textContent = messages.length ? "Loading more emails…" : "Loading emails…";
      loadMoreHint.append(spinner, label);
      return;
    }
    const button = document.createElement("button");
    button.type = "button";
    button.className = "gmail-load-more-button";
    button.textContent = "Load more emails";
    button.addEventListener("click", () => loadMessages(false));
    loadMoreHint.append(button);
  }

  function renderMessages() {
    results.replaceChildren();
    if (!messages.length) {
      const empty = document.createElement("div");
      empty.className = "gmail-empty-state";
      const heading = document.createElement("strong");
      heading.textContent = loading ? "Loading your inbox…" : hasToken() ? "No matching messages" : "Connect Gmail to get started";
      const detail = document.createElement("p");
      detail.textContent = loading
        ? "Your messages will appear here shortly."
        : hasToken()
          ? "Try another search or choose a different inbox filter."
          : "Your inbox will appear here after you grant read-only access.";
      empty.append(heading, detail);
      results.append(empty);
      return;
    }
    messages.forEach((email) => {
      const card = document.createElement("article");
      card.className = "gmail-email";
      card.dataset.messageId = email.id;
      card.tabIndex = 0;
      card.setAttribute("aria-label", "Open email from " + email.from + ": " + email.subject);
      card.title = "Open full email";
      card.addEventListener("click", (event) => {
        if (event.target.closest("a, button")) return;
        openEmailDetail(email);
      });
      card.addEventListener("keydown", (event) => {
        if ((event.key === "Enter" || event.key === " ") && !event.target.closest("a, button")) {
          event.preventDefault();
          openEmailDetail(email);
        }
      });

      const top = document.createElement("div");
      top.className = "gmail-email-top";
      const sender = document.createElement("strong");
      sender.className = "gmail-email-sender";
      sender.dataset.userContent = "true";
      sender.textContent = email.from;
      const date = document.createElement("time");
      date.className = "gmail-email-date";
      date.textContent = displayDate(email.internalDate, email.date);
      top.append(sender, date);

      const subject = document.createElement("h3");
      subject.className = "gmail-email-subject";
      subject.dataset.userContent = "true";
      subject.textContent = email.subject;
      if (email.labelIds.includes("UNREAD")) {
        const unread = document.createElement("span");
        unread.className = "gmail-message-badge";
        unread.textContent = "Unread";
        unread.dataset.i18n = "Unread";
        unread.setAttribute("aria-label", "Unread message");
        subject.append(" ", unread);
      }
      if (email.labelIds.includes("STARRED")) {
        const starred = document.createElement("span");
        starred.className = "gmail-message-badge is-starred";
        starred.textContent = "Starred";
        starred.dataset.i18n = "Starred";
        subject.append(" ", starred);
      }
      const snippet = document.createElement("p");
      snippet.className = "gmail-email-snippet";
      snippet.dataset.userContent = "true";
      snippet.textContent = email.snippet || "No preview text is available.";

      const actions = document.createElement("div");
      actions.className = "gmail-email-actions";
      const makeEvent = document.createElement("button");
      makeEvent.className = "secondary";
      makeEvent.type = "button";
      makeEvent.textContent = activeConversions.has(email.id) ? "Working…" : "Make event";
      makeEvent.dataset.i18n = activeConversions.has(email.id) ? "Working…" : "Make event";
      makeEvent.disabled = activeConversions.has(email.id);
      makeEvent.addEventListener("click", () => {
        convertMessage(email.id);
      });
      const openMessage = document.createElement("button");
      openMessage.className = "gmail-open-message";
      openMessage.type = "button";
      openMessage.addEventListener("click", () => openEmailDetail(email));
      openMessage.textContent = "View email";
      openMessage.dataset.i18n = "View email";
      const gmailLink = document.createElement("a");
      gmailLink.className = "gmail-open-message";
      gmailLink.href = "https://mail.google.com/mail/u/0/#all/" + encodeURIComponent(email.id);
      gmailLink.target = "_blank";
      gmailLink.rel = "noopener noreferrer";
      gmailLink.textContent = "Open in Gmail";
      gmailLink.dataset.i18n = "Open in Gmail";
      actions.append(openMessage, gmailLink, makeEvent);
      card.append(top, subject, snippet, actions);
      results.append(card);
    });
  }

  function displayDate(timestamp, headerDate) {
    const date = timestamp ? new Date(timestamp) : new Date(headerDate);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }

  function decodeBase64Url(data) {
    const clean = String(data || "").replace(/-/g, "+").replace(/_/g, "/");
    const padded = clean + "=".repeat((4 - (clean.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    return new TextDecoder("utf-8").decode(bytes);
  }

  function extractBody(payload) {
    const plain = [];
    const html = [];
    function visit(part) {
      if (!part || part.filename) return;
      const type = String(part.mimeType || "").toLowerCase();
      if (part.body && part.body.data) {
        try {
          const value = decodeBase64Url(part.body.data);
          if (type === "text/plain") plain.push(value);
          else if (type === "text/html") html.push(value);
        } catch (_) {}
      }
      (part.parts || []).forEach(visit);
    }
    visit(payload);
    if (plain.length) return plain.join("\n\n").trim();
    if (html.length) {
      const doc = new DOMParser().parseFromString(html.join("\n"), "text/html");
      doc.querySelectorAll("script,style,head,noscript").forEach((node) => node.remove());
      return (doc.body ? doc.body.textContent : doc.documentElement.textContent).replace(/\s+/g, " ").trim();
    }
    return "";
  }

  async function getMessageBody(email) {
    const cached = bodyCache.get(email.id);
    if (cached && Date.now() - cached.timestamp < 10 * 60 * 1000) return cached.message;
    const data = await gmailApi(
      "/messages/" + encodeURIComponent(email.id) + "?format=full",
    );
    const headers = data.payload && data.payload.headers;
    const message = {
      subject: headerValue(headers, "Subject") || email.subject,
      from: headerValue(headers, "From") || email.from,
      to: headerValue(headers, "To") || email.to || "",
      cc: headerValue(headers, "Cc") || email.cc || "",
      date: headerValue(headers, "Date") || email.date,
      snippet: email.snippet,
      body: extractBody(data.payload).slice(0, MAX_BODY_CHARS),
    };
    bodyCache.set(email.id, { timestamp: Date.now(), message });
    return message;
  }

  async function openEmailDetail(email) {
    if (!detailDialog || !email) return;
    detailMessageId = email.id;
    detailSubject.textContent = email.subject || "(No subject)";
    detailFrom.textContent = email.from || "Unknown sender";
    detailTo.textContent = email.to || "—";
    detailCc.textContent = email.cc || "";
    detailCcRow.hidden = !email.cc;
    detailDate.textContent = email.date || displayDate(email.internalDate, email.date) || "—";
    detailBody.textContent = "";
    detailStatus.classList.remove("is-error");
    detailStatus.textContent = "Loading full email…";
    detailOpenGmail.href = "https://mail.google.com/mail/u/0/#all/" + encodeURIComponent(email.id);
    detailMakeEvent.disabled = true;
    if (!detailDialog.open) detailDialog.showModal();
    try {
      const full = await getMessageBody(email);
      if (detailMessageId !== email.id) return;
      detailSubject.textContent = full.subject || "(No subject)";
      detailFrom.textContent = full.from || "Unknown sender";
      detailTo.textContent = full.to || "—";
      detailCc.textContent = full.cc || "";
      detailCcRow.hidden = !full.cc;
      detailDate.textContent = full.date || "—";
      detailBody.textContent = full.body || full.snippet || "No readable text was found in this message.";
      detailStatus.textContent = full.body ? "Full message text" : "Preview only";
      detailMakeEvent.disabled = false;
    } catch (error) {
      detailMakeEvent.disabled = false;
      detailStatus.classList.add("is-error");
      detailStatus.textContent = error?.message || "Could not load the full email. Close this view and retry.";
      detailBody.textContent = email.snippet || "";
    }
  }

  async function convertMessage(messageId) {
    const email = messages.find((item) => item.id === messageId);
    if (!email) {
      setStatus("That email is no longer in the visible inbox. Refresh and try again.", true);
      return;
    }
    if (activeConversions.has(messageId)) return;
    if (!window.CalexPuter || !window.CalexPuter.isReady()) {
      pendingConversion = { messageId };
      setStatus("Connect Puter in the assistant first. This email will be processed after Puter is enabled.");
      window.Calex.switchScreen("email");
      $("openAssistant").click();
      return;
    }
    activeConversions.add(messageId);
    renderMessages();
    setStatus("Reading the selected email and extracting event details with Puter…");
    try {
      let extracted = conversionCache.get(messageId);
      if (!extracted) {
        const emailContent = await getMessageBody(email);
        if (!emailContent.body && !emailContent.snippet) {
          setStatus("This email has no readable message text. Try another email.", true);
          return;
        }
        extracted = await window.CalexPuter.convertEmailToEvent({
          ...emailContent,
          preferredDate: "",
        });
        // Cache the parsed result for this page session, including no-event
        // results, so repeated clicks do not spend another Puter request.
        if (extracted) conversionCache.set(messageId, extracted);
      }
      if (!extracted || !extracted.event) {
        setStatus((extracted && extracted.reply) || "Puter could not identify a specific event in this email. Try another message or create the event manually.");
        return;
      }
      const draft = extracted.event;
      if ($("assistantDialog").open) $("assistantDialog").close();
      window.Calex.switchScreen("calendar");
      window.Calex.draftEvent(draft);
      window.Calex.showToast("Event draft ready. Review the details and save to add it to your calendar.");
      if (extracted.reply) console.info("Calex Gmail event extraction:", extracted.reply);
    } catch (error) {
      setStatus(error && error.message ? error.message : "Could not convert this email. Check Gmail and Puter access, then retry.", true);
    } finally {
      activeConversions.delete(messageId);
      renderMessages();
    }
  }

  $("openGmail").addEventListener("click", () => window.Calex.switchScreen("email"));
  $("gmailDetailClose").addEventListener("click", () => detailDialog.close());
  detailDialog.addEventListener("click", (event) => {
    if (event.target === detailDialog) detailDialog.close();
  });
  detailMakeEvent.addEventListener("click", () => {
    const id = detailMessageId;
    if (!id) return;
    detailDialog.close();
    convertMessage(id);
  });
  window.addEventListener("calex:auth", () => restoreConnection());
  window.addEventListener("calex:screen", (event) => {
    if (event.detail !== "email") return;
    renderControls();
    if (hasToken() && !loading) loadMessages();
    else if (!hasToken() && clientId()) restoreConnection();
  });
  document.querySelectorAll("[data-gmail-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.gmailFilter;
      renderControls();
      if (hasToken()) loadMessages();
    });
  });
  connectButton.addEventListener("click", connectGmail);
  refreshButton.addEventListener("click", () => {
    queryPageCache.clear();
    metadataCache.clear();
    loadMessages(true);
  });
  searchButton.addEventListener("click", loadMessages);
  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      loadMessages();
    }
  });
  disconnectButton.addEventListener("click", async () => {
    disconnectButton.disabled = true;
    try {
      await serverAction("disconnect");
      if (accessToken && window.google && window.google.accounts && window.google.accounts.oauth2) {
        try { window.google.accounts.oauth2.revoke(accessToken, () => {}); } catch (_) {}
      }
      disconnectLocalState();
      linkedEmail = "";
      setStatus("Gmail disconnected from your Calex account.");
    } catch (error) {
      setStatus(error?.message || "Could not disconnect Gmail. Try again.", true);
    } finally {
      renderControls();
    }
  });
  $("gmailEnablePuter").addEventListener("click", () => {
    $("openAssistant").click();
  });

  window.addEventListener("calex:puter-ready", () => {
    if (!pendingConversion) return;
    const pending = pendingConversion;
    pendingConversion = null;
    convertMessage(pending.messageId, pending.preferredDate);
  });
  window.addEventListener("calex:language", () => {
    if (emailScreen.classList.contains("active")) renderMessages();
  });

  renderControls();
  if (window.Calex?.isSignedIn?.()) restoreConnection();
  if (!clientId()) setStatus("Gmail is not configured for this deployment yet. The OAuth client ID must be added before connecting.");
  window.CalexGmail = {
    isConnected: hasToken,
    listMessages: loadMessages,
    disconnect: disconnectLocalState,
    setFilter: (filter) => {
      if (!["inbox", "unread", "starred"].includes(filter)) return;
      activeFilter = filter;
      renderControls();
      if (hasToken()) loadMessages();
    },
  };
})();
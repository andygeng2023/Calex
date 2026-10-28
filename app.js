window.CalexReady = (async function () {
  "use strict";
  let sqliteReadySettled = false;
  window.CalexSQLiteReady?.then(() => { sqliteReadySettled = true; });
  const nativeStorageAvailable = (() => {
    try {
      const key = "__calex_storage_probe__";
      window.localStorage.setItem(key, "1");
      window.localStorage.removeItem(key);
      return true;
    } catch (_) {
      return false;
    }
  })();
  if (!nativeStorageAvailable) await window.CalexSQLiteReady;
  let fallbackStorageMode = !nativeStorageAvailable;
  const appStorage = {
    getItem(key) {
      try {
        const value = window.localStorage.getItem(key);
        if (value !== null) {
          if (window.CalexSQLite && window.CalexSQLite.getItem(key) !== value)
            window.CalexSQLite.setItem(key, value);
          return value;
        }
        if (!fallbackStorageMode) return null;
      } catch (_) {
        fallbackStorageMode = true;
      }
      return window.CalexSQLite?.getItem(key) ?? null;
    },
    setItem(key, value) {
      value = String(value);
      let nativeError = null;
      try {
        window.localStorage.setItem(key, value);
      } catch (error) {
        fallbackStorageMode = true;
        nativeError = error;
      }
      if (window.CalexSQLite) {
        window.CalexSQLite.setItem(key, value);
        return;
      }
      if (nativeError && window.CalexSQLiteReady && !sqliteReadySettled) {
        window.CalexSQLiteReady.then((store) => {
          if (store) store.setItem(key, value);
        });
        return;
      }
      if (nativeError) throw nativeError;
    },
    removeItem(key) {
      let nativeError = null;
      try {
        window.localStorage.removeItem(key);
      } catch (error) {
        fallbackStorageMode = true;
        nativeError = error;
      }
      if (window.CalexSQLite) window.CalexSQLite.removeItem(key);
      else if (nativeError) throw nativeError;
    },
  };
  const $ = (id) => document.getElementById(id),
    pad = (n) => String(n).padStart(2, "0"),
    dateKey = (d) =>
      d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()),
    parseDate = (s) => {
      const [y, m, d] = s.split("-").map(Number);
      return new Date(y, m - 1, d, 12);
    },
    addDays = (d, n) => {
      const x = new Date(d);
      x.setDate(x.getDate() + n);
      return x;
    },
    sameDay = (a, b) => dateKey(a) === dateKey(b),
    today = new Date();
  let selected = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      12,
    ),
    cursor = new Date(selected),
    view = "all",
    modalMode = "normal",
    toastTimer;
  function translateUiText(value) {
    return window.CalexI18n?.translate(value) || value;
  }
  const SUPABASE_URL = "https://fwcijtjahtwpyaqedyhq.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_oWpplxsSIvn3KfinwmlLjg_3No69nPW";
  let supabaseClient = null,
    authUser = null,
    recoveringPassword = false,
    cloudSyncBusy = false,
    cloudSyncPending = false,
    cloudSyncTimer = null;
  const guestEventsKey = "calex-guest-events-v1",
    guestSettingsKey = "calex-guest-settings-v1";
  let guestEventsSnapshot = null,
    guestSettingsSnapshot = null;
  function activeEventsKey() {
    return authUser ? "calex-events-" + authUser.id : guestEventsKey;
  }
  function activeSettingsKey() {
    return authUser ? "calex-settings-" + authUser.id : guestSettingsKey;
  }
  try {
    if (
      !appStorage.getItem(guestEventsKey) &&
      appStorage.getItem("daymark-events-v1")
    )
      appStorage.setItem(
        guestEventsKey,
        appStorage.getItem("daymark-events-v1"),
      );
    if (
      !appStorage.getItem(guestSettingsKey) &&
      appStorage.getItem("daymark-settings-v1")
    )
      appStorage.setItem(
        guestSettingsKey,
        appStorage.getItem("daymark-settings-v1"),
      );
  } catch (_) {}
  function initSupabase() {
    const authReturnParams = new URLSearchParams(location.hash.slice(1));
    const authReturnError = authReturnParams.get("error_description");
    if (!window.supabase || !window.supabase.createClient) {
      const unavailable = () =>
        showToast(
          "Authentication could not load. Check your connection, then refresh Calex.",
        );
      $("authForm").addEventListener("submit", (e) => {
        e.preventDefault();
        unavailable();
      });
      ["authSignup", "authGoogle", "authForgot", "authResend"].forEach((id) =>
        $(id).addEventListener("click", unavailable),
      );
      return;
    }
    supabaseClient = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      },
    );
    window.CalexSupabaseClient = supabaseClient;
    $("authForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      await authAction("signin");
    });
    $("authSignup").addEventListener("click", () => authAction("signup"));
    $("authResend").addEventListener("click", resendConfirmation);
    $("authGoogle").addEventListener("click", async () => {
      if (window.self !== window.top) {
        authFeedback(
          "Google sign-in must run outside this embedded preview. Open the live Calex site using the link below, then choose Continue with Google.",
          true,
        );
        $("authOpenLive").hidden = false;
        return;
      }
      if (!supabaseClient)
        return showToast(
          "Could not load authentication. Refresh and try again.",
        );
      $("authGoogle").disabled = true;
      try {
        const { error } = await supabaseClient.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo: location.origin + location.pathname },
        });
        if (error) authFeedback(error.message, true);
      } catch (err) {
        authFeedback(err.message || "Google sign-in could not start.", true);
      } finally {
        $("authGoogle").disabled = false;
      }
    });
    $("authForgot").addEventListener("click", async () => {
      if (!supabaseClient)
        return showToast(
          "Authentication library is unavailable. Refresh and try again.",
        );
      const email = $("authEmail").value.trim();
      if (!email) {
        showToast("Enter your email first.");
        $("authEmail").focus();
        return;
      }
      $("authForgot").disabled = true;
      try {
        const { error } = await supabaseClient.auth.resetPasswordForEmail(
          email,
          {
            redirectTo: location.origin + location.pathname,
          },
        );
        authFeedback(
          error
            ? authErrorMessage(error)
            : "Password reset requested. If an account exists for this email, check your inbox and spam folder.",
          !!error,
        );
      } catch (err) {
        authFeedback(
          err.message || "Could not request a reset. Please try again.",
          true,
        );
      } finally {
        $("authForgot").disabled = false;
      }
    });
    $("authSignout").addEventListener("click", async () => {
      if (!supabaseClient) return;
      await saveCloudNow();
      const { error } = await supabaseClient.auth.signOut();
      if (error) return showToast(error.message);
      await activateUser(null);
      showToast("Signed out");
    });
    $("authRecovery").addEventListener("submit", async (event) => {
      event.preventDefault();
      const password = $("recoveryPassword").value;
      if (password !== $("recoveryConfirm").value) {
        authFeedback("Passwords do not match.", true);
        $("recoveryConfirm").focus();
        return;
      }
      $("recoverySubmit").disabled = true;
      try {
        const { error } = await supabaseClient.auth.updateUser({ password });
        if (error) {
          authFeedback(authErrorMessage(error), true);
          return;
        }
        recoveringPassword = false;
        $("recoveryPassword").value = $("recoveryConfirm").value = "";
        renderAuth();
        authFeedback(
          "Password set. You can now use email/password or Google for this account.",
        );
      } catch (error) {
        authFeedback(error.message || "Could not set a password.", true);
      } finally {
        $("recoverySubmit").disabled = false;
      }
    });
    supabaseClient.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") recoveringPassword = false;
      if (event === "PASSWORD_RECOVERY") {
        recoveringPassword = true;
        switchScreen("auth");
        authFeedback("Reset link accepted. Choose a new password below.");
      }
      setTimeout(() => activateUser(session?.user || null), 0);
    });
    supabaseClient.auth
      .getSession()
      .then(({ data, error }) => {
        if (error || authReturnError) {
          switchScreen("auth");
          authFeedback(authReturnError || authErrorMessage(error), true);
        }
        return activateUser(data?.session?.user || null);
      })
      .catch((error) => {
        switchScreen("auth");
        authFeedback(
          error.message ||
            "Could not restore your sign-in session. Please try again.",
          true,
        );
      });
  }
  function authFeedback(message, isError = false) {
    const el = $("authFeedback");
    el.hidden = false;
    el.textContent = message;
    el.classList.toggle("is-error", isError);
  }
  function authErrorMessage(error) {
    if (error.code === "email_not_confirmed")
      return "Your email is not confirmed yet. Check your inbox and spam folder, or request a new confirmation below.";
    if (error.code === "invalid_credentials")
      return "Email or password was not accepted. If you originally used Google, choose Continue with Google: that account may not have a password. Otherwise use password reset or confirm your email.";
    if (
      error.status === 429 ||
      /rate.?limit|too many|over_email_send_rate_limit/i.test(
        error.code || error.message || "",
      )
    )
      return "The authentication service has reached its sending limit. Wait before retrying. The app maintainer may need to configure custom SMTP; Google sign-in is another option.";
    if (/email.*not.*authorized/i.test(error.message || ""))
      return "The email service cannot send to this address. The app maintainer must configure custom SMTP in Supabase. You can also try Google sign-in.";
    if (
      error.code === "unexpected_failure" ||
      /sending.*email|smtp/i.test(error.message || "")
    )
      return "Supabase could not send the email. The app maintainer needs to check SMTP settings and Auth delivery logs.";
    return (
      error.message ||
      "Authentication could not complete. Check your connection and try again."
    );
  }
  let resendUntil = 0,
    resendTimer;
  async function resendConfirmation() {
    if (!supabaseClient || Date.now() < resendUntil) return;
    const email = $("authEmail").value.trim();
    if (!$("authEmail").checkValidity() || !email) {
      authFeedback(
        "Enter a valid email address before requesting a confirmation.",
        true,
      );
      $("authEmail").focus();
      return;
    }
    $("authResend").disabled = true;
    try {
      const { error } = await supabaseClient.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: location.origin + location.pathname },
      });
      if (error) {
        authFeedback(authErrorMessage(error), true);
        return;
      }
      authFeedback(
        "Confirmation requested. Check your inbox and spam folder. A successful request does not guarantee delivery; if nothing arrives, the maintainer must check Supabase email settings.",
      );
      resendUntil = Date.now() + 60000;
      clearInterval(resendTimer);
      resendTimer = setInterval(() => {
        const seconds = Math.max(
          0,
          Math.ceil((resendUntil - Date.now()) / 1000),
        );
        $("authResend").textContent = seconds
          ? "Resend available in " + seconds + "s"
          : "Resend confirmation email";
        if (!seconds) {
          clearInterval(resendTimer);
          $("authResend").disabled = false;
        }
      }, 1000);
    } catch (error) {
      authFeedback(
        error.message || "Could not request a confirmation email.",
        true,
      );
    } finally {
      $("authResend").disabled = Date.now() < resendUntil;
    }
  }
  async function authAction(mode) {
    if (!supabaseClient)
      return showToast("Could not load authentication. Refresh and try again.");
    const email = $("authEmail").value.trim(),
      password = $("authPassword").value;
    if (!email || password.length < 6)
      return showToast(
        "Enter a valid email and password of at least 6 characters.",
      );
    $("authSubmit").disabled = true;
    $("authSignup").disabled = true;
    try {
      const result =
        mode === "signup"
          ? await supabaseClient.auth.signUp({
              email,
              password,
              options: { emailRedirectTo: location.origin + location.pathname },
            })
          : await supabaseClient.auth.signInWithPassword({ email, password });
      if (result.error) {
        $("authResend").hidden = false;
        authFeedback(authErrorMessage(result.error), true);
        return;
      }
      if (mode === "signup" && !result.data.session) {
        $("authResend").hidden = false;
        authFeedback(
          "Signup request accepted. If this address needs confirmation, check your inbox and spam folder. If you already used Google, choose Continue with Google instead: creating the account again does not set a password or require another confirmation.",
        );
      } else {
        authFeedback("Signed in. Your calendar is connected.");
        showToast(
          mode === "signup" ? "Account created" : "Sign-in request completed",
        );
      }
    } catch (err) {
      console.error("Calex authentication action failed", err);
      authFeedback(
        err?.message ||
          "Could not contact authentication. Check your connection and try again.",
        true,
      );
    } finally {
      $("authSubmit").disabled = false;
      $("authSignup").disabled = false;
    }
  }
  function renderAuth() {
    const signedIn = !!authUser;
    $("authStatus").textContent = translateUiText(
      signedIn
        ? "Signed in as " + authUser.email
        : "Not signed in · using this device",
    );
    $("authForm").hidden = signedIn;
    $("authSignout").hidden = !signedIn || recoveringPassword;
    $("authRecovery").hidden = !signedIn || !recoveringPassword;
    if ($("settingsSignInTitle")) {
      $("settingsSignInTitle").textContent = translateUiText(
        signedIn ? "Account connected" : "Sign in or create account",
      );
      $("settingsSignInSubtitle").textContent = translateUiText(
        signedIn
          ? "Manage your account and sign-out options"
          : "Securely sync your calendar across devices",
      );
      $("settingsSyncNote").textContent = translateUiText(syncText());
      $("syncNow").hidden = !signedIn;
      $("syncNow").disabled = syncState === "syncing";
    }
    $("authEmail").autocomplete = "email";
    $("authPassword").autocomplete = "current-password";
  }
  /* ---- Cloud sync: pure merge rules live in sync.js (unit-tested) ---- */
  let localRev = 0,
    syncState = "idle",
    syncFailToasted = false;
  const lsGet = (k, fallback) => {
      try {
        const v = JSON.parse(appStorage.getItem(k));
        return v == null ? fallback : v;
      } catch (_) {
        return fallback;
      }
    },
    lsSet = (k, v) => {
      try {
        appStorage.setItem(k, JSON.stringify(v));
      } catch (_) {}
    },
    tombKey = (id) => "calex-tombstones-" + id,
    metaKey = (id) => "calex-syncmeta-" + id,
    touch = (e) => {
      e.updatedAt = Date.now();
      return e;
    };
  function setSyncState(state) {
    syncState = state;
    renderAuth();
    window.dispatchEvent(new CustomEvent("calex:render"));
  }
  function syncText() {
    if (!authUser) return "Your events stay on this device until you sign in.";
    if (syncState === "syncing") return "Syncing…";
    if (syncState === "offline")
      return "You’re offline. Changes are saved here and will sync when you’re back online.";
    if (syncState === "error")
      return "Couldn’t sync just now. Your changes are safe on this device. Tap Sync now to retry.";
    const t = lsGet(metaKey(authUser.id), {}).lastSyncAt;
    return t
      ? "Synced at " +
          new Date(t).toLocaleTimeString(
            window.CalexI18n?.locale() || "en-GB",
            {
              hour: "2-digit",
              minute: "2-digit",
            },
          ) +
          ". Your calendar is up to date across devices."
      : "You’re signed in. Your calendar syncs with your account.";
  }
  async function activateUser(user) {
    if ((authUser?.id || null) === (user?.id || null)) {
      renderAuth();
      return;
    }
    if (authUser) await saveCloudNow();
    if (!authUser) {
      guestEventsSnapshot = JSON.parse(JSON.stringify(events));
      guestSettingsSnapshot = JSON.parse(JSON.stringify(appSettings));
    }
    authUser = user;
    window.dispatchEvent(new CustomEvent("calex:auth", { detail: !!authUser }));
    if (authUser) {
      const migrationKey = "calex-guest-migrated-" + authUser.id;
      const shouldMigrateGuest = lsGet(migrationKey, 0) !== 1;
      const local = lsGet(activeEventsKey(), []);
      if (shouldMigrateGuest) {
        const have = new Set(local.map((x) => x.id));
        (guestEventsSnapshot || lsGet(guestEventsKey, [])).forEach((item) => {
          if (!have.has(item.id)) local.push(item);
        });
      }
      events = local;
      appSettings = {
        ...defaultSettings,
        ...(shouldMigrateGuest
          ? guestSettingsSnapshot || lsGet(guestSettingsKey, {})
          : {}),
        ...lsGet(activeSettingsKey(), {}),
      };
      lsSet(activeEventsKey(), events);
      const synced = await saveCloudNow();
      if (synced && shouldMigrateGuest) lsSet(migrationKey, 1);
    } else {
      events = guestEventsSnapshot || lsGet(guestEventsKey, []);
      appSettings = {
        ...defaultSettings,
        ...(guestSettingsSnapshot || lsGet(guestSettingsKey, {})),
      };
      persist();
      saveAppSettings();
    }
    if (window.CalexI18n?.isPreference(appSettings.language))
      window.CalexI18n.setLanguage(appSettings.language);
    renderAuth();
    renderProfile();
    renderTimezone();
    applyAppearance();
    renderAll();
  }
  /** Pull, merge, push. Safe to call any time; coalesces overlapping calls. */
  async function saveCloudNow() {
    if (!supabaseClient || !authUser) return false;
    if (cloudSyncBusy) {
      cloudSyncPending = true;
      return false;
    }
    if (navigator.onLine === false) {
      setSyncState("offline");
      return false;
    }
    cloudSyncBusy = true;
    setSyncState("syncing");
    let success = false;
    const uid = authUser.id,
      startedAt = Date.now(),
      rev = localRev;
    try {
      const { data: rows, error } = await supabaseClient
        .from("calex_events")
        .select("id,event_data,updated_at")
        .eq("user_id", uid);
      if (error) throw error;
      const remote = (rows || []).map((r) => ({
          id: r.id,
          data: r.event_data,
          ts:
            Number(r.event_data && r.event_data.updatedAt) ||
            Date.parse(r.updated_at) ||
            0,
        })),
        meta = lsGet(metaKey(uid), {}),
        tombs = lsGet(tombKey(uid), {}),
        res = window.CalexSync.mergeEvents({
          local: events,
          remote,
          tombstones: tombs,
          syncedIds: meta.syncedIds || [],
          lastSyncAt: meta.lastSyncAt || 0,
          now: startedAt,
        });
      if (res.remove.length) {
        const { error: delError } = await supabaseClient
          .from("calex_events")
          .delete()
          .eq("user_id", uid)
          .in("id", res.remove);
        if (delError) throw delError;
      }
      if (res.push.length) {
        const { error: upsertError } = await supabaseClient
          .from("calex_events")
          .upsert(
            res.push.map((item) => ({
              id: item.id,
              user_id: uid,
              event_data: item,
              updated_at: new Date(item.updatedAt || startedAt).toISOString(),
            })),
            { onConflict: "user_id,id" },
          );
        if (upsertError) throw upsertError;
      }
      const prefsOk = await syncSettings(uid);
      if (authUser && authUser.id === uid && rev === localRev) {
        const changed = JSON.stringify(res.events) !== JSON.stringify(events);
        events = res.events;
        const left = { ...lsGet(tombKey(uid), {}) };
        res.clearTombstones.forEach((id) => delete left[id]);
        lsSet(tombKey(uid), left);
        lsSet(metaKey(uid), {
          syncedIds: events.map((e) => e.id),
          lastSyncAt: startedAt,
        });
        lsSet(activeEventsKey(), events);
        if (changed) renderAll();
      } else cloudSyncPending = true; // edited mid-sync: run again, nothing lost
      success = prefsOk;
      syncFailToasted = false;
    } catch (err) {
      console.error("Calex event sync failed", err);
      if (!syncFailToasted) {
        syncFailToasted = true;
        showToast("Couldn’t sync. Your changes are saved on this device.");
      }
    } finally {
      cloudSyncBusy = false;
      setSyncState(
        success ? "idle" : navigator.onLine === false ? "offline" : "error",
      );
      if (cloudSyncPending) {
        cloudSyncPending = false;
        scheduleCloudSync();
      }
    }
    return success;
  }
  async function syncSettings(uid) {
    const { data, error } = await supabaseClient
      .from("calex_preferences")
      .select("preferences")
      .eq("user_id", uid)
      .maybeSingle();
    if (error) throw error;
    const m = window.CalexSync.mergeSettings(
      appSettings,
      data && data.preferences,
    );
    if (m.adopt) {
      appSettings = { ...defaultSettings, ...m.adopt };
      lsSet(activeSettingsKey(), appSettings);
      if (window.CalexI18n && appSettings.language)
        window.CalexI18n.setLanguage(appSettings.language);
      renderProfile();
      renderTimezone();
      applyAppearance();
      return true;
    }
    return m.push ? saveSettingsCloudNow() : true;
  }
  async function saveSettingsCloudNow() {
    if (!supabaseClient || !authUser) return false;
    const { error } = await supabaseClient.from("calex_preferences").upsert(
      {
        user_id: authUser.id,
        preferences: appSettings,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
    if (error) {
      console.error("Calex preferences sync failed", error);
      return false;
    }
    return true;
  }
  function scheduleCloudSync() {
    if (!authUser) return;
    clearTimeout(cloudSyncTimer);
    cloudSyncTimer = setTimeout(() => saveCloudNow(), 300);
  }
  window.addEventListener("online", scheduleCloudSync);
  window.addEventListener("offline", () => authUser && setSyncState("offline"));
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") scheduleCloudSync();
  });
  const key = "daymark-events-v1";
  let events = [],
    storageAvailable = true,
    hasStoredEvents = false;
  try {
    const stored = appStorage.getItem(activeEventsKey());
    hasStoredEvents = stored !== null;
    events = stored ? JSON.parse(stored) : [];
    if (!Array.isArray(events)) events = [];
  } catch (_) {
    storageAvailable = false;
    events = [];
  }
  if (!hasStoredEvents && storageAvailable) {
    // Real calendars start empty; do not migrate demo events into accounts.
    events = [];
    persist();
  }

  function persist() {
    try {
      localRev++;
      appStorage.setItem(activeEventsKey(), JSON.stringify(events));
      scheduleCloudSync();
      return true;
    } catch (_) {
      storageAvailable = false;
      showToast(
        "Browser storage is unavailable. Changes may not persist after closing this page.",
      );
      return false;
    }
  }

  function validEventTimes(start, end) {
    return !start || !end || start < end;
  }

  function validEventDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return false;
    const d = parseDate(value);
    return !Number.isNaN(d.getTime()) && dateKey(d) === value;
  }

  function fmtDate(
    d,
    opts = {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  ) {
    return new Intl.DateTimeFormat(
      window.CalexI18n?.locale() || "en-GB",
      opts,
    ).format(d);
  }

  function eventOccurs(e, d) {
    if (e.date === dateKey(d)) return true;
    if (!e.repeat || e.repeat === "none") return false;
    const start = parseDate(e.date),
      delta = Math.round((parseDate(dateKey(d)) - start) / 86400000);
    if (delta < 0) return false;
    const interval = Math.max(
        1,
        Number(e.repeatInterval) || (e.repeat === "fortnightly" ? 2 : 1),
      ),
      unit =
        e.repeatUnit ||
        {
          daily: "day",
          weekly: "week",
          fortnightly: "week",
          monthly: "month",
          yearly: "year",
        }[e.repeat] ||
        "day";
    if (unit === "day") return delta % interval === 0;
    if (unit === "week") return delta % (7 * interval) === 0;
    if (unit === "month") {
      const months =
          (d.getFullYear() - start.getFullYear()) * 12 +
          d.getMonth() -
          start.getMonth(),
        lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
      return (
        months >= 0 &&
        months % interval === 0 &&
        d.getDate() === Math.min(start.getDate(), lastDay)
      );
    }
    if (unit === "year") {
      const years = d.getFullYear() - start.getFullYear(),
        lastDay = new Date(d.getFullYear(), start.getMonth() + 1, 0).getDate();
      return (
        years >= 0 &&
        years % interval === 0 &&
        d.getMonth() === start.getMonth() &&
        d.getDate() === Math.min(start.getDate(), lastDay)
      );
    }
    return false;
  }

  function onDay(d) {
    return events
      .filter((e) => eventOccurs(e, d))
      .filter(
        (e) =>
          !window.CalexCategories || window.CalexCategories.has(categoryOf(e)),
      )
      .sort((a, b) => (a.start || "99:99").localeCompare(b.start || "99:99"));
  }

  function timeText(e) {
    if (!e.start && !e.end) return "All day";
    if (e.start && e.end) return e.start + " – " + e.end;
    if (e.start) return e.start;
    return "Until " + e.end;
  }

  // One formatter drives both the Quick Add preview and saved-event metadata.
  // This prevents the preview from collapsing weekly/monthly/yearly rules to daily.
  function repeatDescription(e) {
    if (!e || !e.repeat || e.repeat === "none") return "";
    const unit =
        e.repeatUnit ||
        {
          daily: "day",
          weekly: "week",
          fortnightly: "week",
          monthly: "month",
          yearly: "year",
        }[e.repeat] ||
        "day",
      interval = Math.max(
        1,
        Number(e.repeatInterval) || (e.repeat === "fortnightly" ? 2 : 1),
      ),
      units = { day: "day", week: "week", month: "month", year: "year" },
      adverbs = { day: "daily", week: "weekly", month: "monthly", year: "yearly" };
    if (interval === 1 && adverbs[unit]) return "Repeats " + adverbs[unit];
    return (
      "Repeats every " +
      interval +
      " " +
      (units[unit] || unit) +
      (interval === 1 ? "" : "s")
    );
  }

  function repeatText(e) {
    return repeatDescription(e);
  }

  function renderEventSubtasks(event, items = event.subtasks || [], parentPath = []) {
    if (!items.length) return "";
    return '<div class="event-subtasks" role="group" aria-label="Subtasks">' + items.map((task, index) => {
      const path = parentPath.concat(index);
      const pathValue = path.join(".");
      return '<div class="event-subtask ' + (task.done ? "done" : "") + '">' +
        '<input class="check event-subtask-check" type="checkbox" data-subtask-toggle="' + esc(pathValue) + '" data-subtask-event="' + esc(event.id) + '" aria-label="Complete subtask ' + esc(task.title) + '" ' + (task.done ? "checked" : "") + '>' +
        '<span class="event-subtask-title">' + esc(task.title) + '</span>' +
        '<button type="button" class="event-add-subtask" data-add-subtask="' + esc(event.id) + '" data-subtask-path="' + esc(pathValue) + '" aria-label="Add subtask under ' + esc(task.title) + '" title="Add nested subtask">+ Subtask</button>' +
        renderEventSubtasks(event, task.subtasks || [], path) + '</div>';
    }).join("") + '</div>';
  }

  function eventMarkup(e) {
    return (
      '<article class="event category-' +
      categoryOf(e) +
      " " +
      (e.done ? "done" : "") +
      '"><input class="check" type="checkbox" aria-label="Mark ' +
      esc(e.title) +
      ' completed" data-check="' +
      esc(e.id) +
      '" ' +
      (e.done ? "checked" : "") +
      '><div class="event-content"><div class="event-title">' +
      esc(e.title) +
      '</div><div class="event-meta">' +
      esc(timeText(e)) +
      (e.location ? " · " + esc(e.location) : "") +
      (repeatText(e) ? "<br>" + esc(repeatText(e)) : "") +
      (e.description ? "<br>" + esc(e.description) : "") +
      (e.people
        ? '<br><span class="event-people-label">With</span> <span data-user-content="true">' +
          esc(e.people) +
          "</span>"
        : "") +
      "</div>" +
      (e.tag ? '<span class="tag">' + esc(e.tag) + "</span>" : "") +
      ((e.isTask || (e.subtasks || []).length) ? '<div class="event-subtask-actions"><button type="button" class="event-add-subtask" data-add-subtask="' + esc(e.id) + '" data-subtask-path="" aria-label="Add subtask to ' + esc(e.title) + '">+ Add subtask</button>' +
      ((e.subtasks || []).length ? '<span class="event-subtask-count">' + countNestedSubtasks(e.subtasks) + ' subtask' + (countNestedSubtasks(e.subtasks) === 1 ? "" : "s") + '</span>' : "") +
      '</div>' + renderEventSubtasks(e) : "") + '</div><button class="icon-btn edit-btn" data-edit="' +
      esc(e.id) +
      '" aria-label="Edit ' +
      esc(e.title) +
      '" style="width:32px;height:32px;border:0"><svg viewBox="0 0 24 24"><path d="m14 5 5 5M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16z"/></svg></button></article>'
    );
  }

  function countNestedSubtasks(items) {
    return (items || []).reduce((total, item) => total + 1 + countNestedSubtasks(item.subtasks), 0);
  }

  function esc(s) {
    return String(s || "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  }

  function categoryOf(e) {
    if (["personal", "work", "wellbeing"].includes(e.category))
      return e.category;
    if (/work|study|meeting|team/i.test(e.tag || "")) return "work";
    if (/gym|wellbeing|health/i.test(e.tag || "")) return "wellbeing";
    return "personal";
  }

  function cellEvents(items) {
    return (
      '<span class="cell-events">' +
      items
        .slice(0, 3)
        .map(
          (e) =>
            '<span class="cell-event category-' +
            categoryOf(e) +
            '">' +
            (e.start
              ? '<span class="cell-time">' + esc(e.start) + "</span>"
              : "") +
            "<span>" +
            esc(e.title) +
            "</span></span>",
        )
        .join("") +
      (items.length > 3
        ? '<span class="cell-more">+' + (items.length - 3) + " more</span>"
        : "") +
      "</span>"
    );
  }

  function listMarkup(list, empty) {
    return list.length
      ? list.map(eventMarkup).join("")
      : '<div class="empty">' + empty + "</div>";
  }

  function bindEventActions(root) {
    root.querySelectorAll("[data-check]").forEach((el) =>
      el.addEventListener("change", () => {
        const e = events.find((x) => x.id === el.dataset.check);
        if (e) {
          e.done = el.checked;
          touch(e);
          persist();
          renderAll();
        }
      }),
    );
    root
      .querySelectorAll("[data-edit]")
      .forEach((el) =>
        el.addEventListener("click", () =>
          openNormal(events.find((x) => x.id === el.dataset.edit)),
        ),
      );
    root.querySelectorAll("[data-add-subtask]").forEach((button) => {
      button.addEventListener("click", () => {
        const event = events.find((item) => item.id === button.dataset.addSubtask);
        if (!event) return;
        const title = window.prompt("Subtask title");
        if (!title || !title.trim()) return;
        const path = (button.dataset.subtaskPath || "").split(".").filter(Boolean).map(Number);
        let siblings = event.subtasks || (event.subtasks = []);
        for (const index of path) {
          if (!siblings[index]) return;
          siblings[index].subtasks = siblings[index].subtasks || [];
          siblings = siblings[index].subtasks;
        }
        siblings.push({ id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random(), title: title.trim(), done: false, subtasks: [] });
        touch(event);
        persist();
        renderAll();
      });
    });
    root.querySelectorAll("[data-subtask-toggle]").forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        const event = events.find((item) => item.id === checkbox.dataset.subtaskEvent);
        if (!event) return;
        const path = checkbox.dataset.subtaskToggle.split(".").filter(Boolean).map(Number);
        let siblings = event.subtasks || [];
        let task = null;
        for (const index of path) {
          task = siblings[index];
          if (!task) return;
          siblings = task.subtasks || [];
        }
        task.done = checkbox.checked;
        touch(event);
        persist();
        renderAll();
      });
    });
  }

  function upcomingMarkup(from) {
    let out = "",
      shown = 0;
    for (let i = 1; i <= 7 && shown < 12; i++) {
      const day = addDays(from, i),
        list = onDay(day).filter((e) => !e.done);
      if (!list.length) continue;
      shown += list.length;
      out +=
        '<div class="upcoming-day"><div class="upcoming-label">' +
        esc(
          i === 1
            ? "Tomorrow"
            : fmtDate(day, { weekday: "long", day: "numeric", month: "short" }),
        ) +
        '</div><div class="event-list">' +
        list.map(eventMarkup).join("") +
        "</div></div>";
    }
    return out;
  }

  function renderHome() {
    const homeDay = today;
    $("heroWeekday").textContent = fmtDate(homeDay, {
      weekday: "long",
    });
    $("heroDate").textContent = fmtDate(homeDay, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    $("homeScreen").querySelector(".section-heading").textContent = sameDay(
      homeDay,
      today,
    )
      ? "Today"
      : fmtDate(homeDay, {
          day: "numeric",
          month: "long",
        }) + " · To do";
    const list = onDay(homeDay),
      todo = list.filter((e) => !e.done),
      done = list.filter((e) => e.done);
      $("todayEvents").innerHTML =
        '<div class="eyebrow">To do · ' +
        todo.length +
        '</div><div class="event-list">' +
        listMarkup(todo, "Nothing planned for this day.") +
        '</div><div class="eyebrow">Completed · ' +
        done.length +
        '</div><div class="event-list">' +
        listMarkup(done, "Completed events will appear here.") +
        "</div>";

      const comingUpMarkup = upcomingMarkup(homeDay);
      $("comingUpEvents").innerHTML = comingUpMarkup;
      $("comingUpHeading").hidden = !comingUpMarkup;
      $("comingUpEvents").hidden = !comingUpMarkup;
      bindEventActions($("todayEvents"));
      bindEventActions($("comingUpEvents"));

      const todayKey = dateKey(today);
      const overdueEvents = events.filter((item) => !item.done && item.date && item.date < todayKey).sort((a, b) => a.date.localeCompare(b.date));
      const overdueRoot = $("homeOverdueEvents");
      const overdueHeading = $("homeOverdueHeading");
      if (overdueRoot) {
        overdueRoot.innerHTML = overdueEvents.length
          ? '<div class="event-list">' + overdueEvents.slice(0, 8).map((item) => eventMarkup(item)).join("") + '</div>'
          : '<div class="home-muted-empty">You are all caught up.</div>';
        bindEventActions(overdueRoot);
      }
      if (overdueHeading) overdueHeading.textContent = "Overdue · " + overdueEvents.length;

      const activeTasks = events.filter((item) => item.isTask && !item.done);
      const overdueTasks = activeTasks.filter((task) => task.date && task.date < todayKey);
      const timelineRoot = $("homeTaskTimeline");
      if (timelineRoot) {
        const timelineTasks = activeTasks.filter((task) => task.date && task.date >= todayKey)
          .sort((a, b) => a.date.localeCompare(b.date) || String(a.start || "").localeCompare(String(b.start || "")) || String(a.title).localeCompare(String(b.title))).slice(0, 8);
        timelineRoot.innerHTML = timelineTasks.length
          ? timelineTasks.map((task) => {
              const progress = Math.max(0, Math.min(100, Number(task.progress) || 0));
              return '<article class="home-timeline-row"><time>' + esc(task.date) + '</time><div class="home-timeline-main"><strong>' + esc(task.title) + '</strong><div class="home-timeline-track"><span style="width:' + progress + '%"></span></div></div><label class="home-timeline-progress"><span>' + progress + '% complete</span><input type="range" min="0" max="100" value="' + progress + '" data-task-progress="' + esc(task.id) + '" aria-label="Progress for ' + esc(task.title) + '"></label></article>';
            }).join("")
          : '<div class="home-muted-empty">Tasks you schedule will appear here.</div>';
        timelineRoot.querySelectorAll("[data-task-progress]").forEach((input) => {
          input.addEventListener("input", () => {
            const row = input.closest(".home-timeline-row");
            const progress = Math.max(0, Math.min(100, Number(input.value) || 0));
            row?.querySelector(".home-timeline-track span")?.style.setProperty("width", progress + "%");
            const label = row?.querySelector(".home-timeline-progress span");
            if (label) label.textContent = progress + "% complete";
          });
          input.addEventListener("change", () => {
            const task = events.find((item) => item.id === input.dataset.taskProgress && item.isTask);
            if (!task) return;
            task.progress = Math.max(0, Math.min(100, Number(input.value) || 0));
            touch(task);
            persist();
            renderHome();
          });
        });
      }

      const insightsRoot = $("homeInsights");
      if (insightsRoot) {
        const completedTasks = events.filter((task) => task.isTask && task.done).length;
        const dueToday = activeTasks.filter((task) => task.date === todayKey).length;
        insightsRoot.innerHTML = '<div class="home-insight-grid">' +
          '<article><span>Events today</span><strong>' + list.filter((item) => !item.isTask).length + '</strong></article>' +
          '<article><span>Tasks due today</span><strong>' + dueToday + '</strong></article>' +
          '<article><span>Overdue items</span><strong>' + overdueEvents.length + '</strong></article>' +
          '<article><span>Tasks completed</span><strong>' + completedTasks + '</strong></article>' +
          '</div>';
      }
  }

  function monthStart(d) {
    return new Date(d.getFullYear(), d.getMonth(), 1, 12);
  }

  function monthKey(d) {
    return d.getFullYear() + "-" + pad(d.getMonth() + 1);
  }

  function makeMonth(d) {
    const first = monthStart(d),
      offset = (first.getDay() + 6) % 7,
      days = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate(),
      count = Math.ceil((offset + days) / 7) * 7,
      start = addDays(first, -offset);
    let out =
      '<section class="timeline-month" data-month="' +
      monthKey(first) +
      '"><div class="timeline-title">' +
      esc(
        fmtDate(first, {
          month: "long",
          year: "numeric",
        }),
      ) +
      '</div><div class="date-grid">';
    for (let i = 0; i < count; i++) {
      const day = addDays(start, i),
        items = onDay(day);
      out +=
        '<button class="date-cell ' +
        (day.getMonth() !== first.getMonth() ? "outside " : "") +
        (sameDay(day, today) ? "today " : "") +
        (sameDay(day, selected) ? "selected" : "") +
        '" data-date="' +
        dateKey(day) +
        '" aria-label="' +
        esc(fmtDate(day)) +
        (items.length ? ", " + items.length + " events" : "") +
        '"><span>' +
        day.getDate() +
        '</span><span class="dots">' +
        items
          .slice(0, 3)
          .map(() => "<i></i>")
          .join("") +
        "</span>" +
        cellEvents(items) +
        "</button>";
    }
    return out + "</div></section>";
  }

  function bindDateCells(root) {
    root.querySelectorAll("[data-date]:not([data-bound])").forEach((b) => {
      b.dataset.bound = "1";
      b.addEventListener("click", () => {
        selected = parseDate(b.dataset.date);
        cursor = new Date(selected);
        if (view === "all") view = "month";
        renderCalendar();
        renderPanel();
        renderHome();
      });
    });
  }

  function renderCalendar(settleTransition = false) {
    // Ordinary navigation updates immediately. The restored drag-release path
    // retains the original FLIP animation without ghosting over other screens.
    if (!settleTransition) {
      renderCalendarContent();
      return;
    }
    const screen = $("calendarScreen"),
      sc = $("calendarScroller"),
      grid = $("dateGrid");
    if (settleTransition) {
      const reduced =
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const canGlide =
        screen.classList.contains("active") &&
        typeof sc.animate === "function" &&
        !reduced;
      const beforeScroller = sc.getBoundingClientRect(),
        beforePanel = $("selectedPanel").getBoundingClientRect();
      clearTimeout(viewSettleTimer);
      screen.classList.add("is-view-settling", "is-release-flip");
      // Keep the pointer-driven layout in place until the destination DOM exists.
      renderCalendarContent(true);
      screen.classList.remove(
        "is-view-dragging",
        "drag-toward-open",
        "drag-toward-closed",
      );
      [
        "--drag-progress",
        "--drag-panel-size",
        "--drag-close-size",
        "--drag-scroller-max",
        "--drag-scroller-scale",
        "--drag-scroller-height",
      ].forEach((k) => screen.style.removeProperty(k));
      $("selectedPanel").style.removeProperty("--panel-drag-y");
      void sc.offsetWidth;
      const afterScroller = sc.getBoundingClientRect(),
        afterPanel = $("selectedPanel").getBoundingClientRect();
      const glide = (el, from, to) => {
        if (!canGlide || !from.width || !from.height || !to.width || !to.height)
          return;
        const dx = from.left - to.left,
          dy = from.top - to.top,
          sx = from.width / to.width,
          sy = from.height / to.height;
        if (
          Math.abs(dx) < 1 &&
          Math.abs(dy) < 1 &&
          Math.abs(sx - 1) < 0.015 &&
          Math.abs(sy - 1) < 0.015
        )
          return;
        const anim = el.animate(
          [
            {
              transformOrigin: "top left",
              transform:
                "translate(" +
                dx +
                "px," +
                dy +
                "px) scale(" +
                sx +
                "," +
                sy +
                ")",
            },
            {
              transformOrigin: "top left",
              transform: "translate(0,0) scale(1,1)",
            },
          ],
          {
            duration: 520,
            easing: "cubic-bezier(.22,.75,.25,1)",
            fill: "both",
          },
        );
        anim.onfinish = () => anim.cancel();
      };
      if (canGlide) {
        glide(sc, beforeScroller, afterScroller);
        glide($("selectedPanel"), beforePanel, afterPanel);
      }
      viewSettleTimer = setTimeout(
        () => screen.classList.remove("is-view-settling", "is-release-flip"),
        canGlide ? 550 : 0,
      );
      return;
    }
    const canAnimate =
      screen.classList.contains("active") &&
      typeof sc.animate === "function" &&
      !(
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      );
    const oldCells = new Map(),
      oldVisibleCells = [];
    if (canAnimate) {
      const clip = screen.getBoundingClientRect();
      grid.querySelectorAll(".date-cell[data-date]").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (
          !r.width ||
          !r.height ||
          r.bottom <= clip.top ||
          r.top >= clip.bottom ||
          r.right <= clip.left ||
          r.left >= clip.right
        )
          return;
        const key = el.dataset.date,
          outside = el.classList.contains("outside");
        oldVisibleCells.push({
          key,
          rect: r,
          outside,
          node: el,
        });
        const old = oldCells.get(key);
        if (!old || (old.outside && !outside))
          oldCells.set(key, {
            rect: r,
            outside,
            node: el,
          });
      });
    }
    if (canAnimate) {
      clearTimeout(viewSettleTimer);
      screen.classList.add("is-view-settling");
    }
    renderCalendarContent(true);
    if (!canAnimate) {
      screen.classList.remove("is-view-settling");
      return;
    }
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const newCells = new Map(),
          clip = sc.getBoundingClientRect();
        grid.querySelectorAll(".date-cell[data-date]").forEach((el) => {
          const r = el.getBoundingClientRect();
          if (
            !r.width ||
            !r.height ||
            r.bottom <= clip.top ||
            r.top >= clip.bottom ||
            r.right <= clip.left ||
            r.left >= clip.right
          )
            return;
          const key = el.dataset.date,
            old = newCells.get(key),
            outside = el.classList.contains("outside");
          if (!old || (old.classList.contains("outside") && !outside))
            newCells.set(key, el);
        });
        const duration = 460,
          easing = "cubic-bezier(.22,.75,.25,1)";
        oldVisibleCells.forEach((entry) => {
          const representative = oldCells.get(entry.key);
          if (newCells.has(entry.key) && representative?.node === entry.node)
            return;
          const clone = entry.node.cloneNode(true);
          clone.setAttribute("aria-hidden", "true");
          clone.removeAttribute("data-bound");
          clone.disabled = true;
          clone.style.cssText +=
            ";position:fixed;left:" +
            entry.rect.left +
            "px;top:" +
            entry.rect.top +
            "px;width:" +
            entry.rect.width +
            "px;height:" +
            entry.rect.height +
            "px;margin:0;z-index:9999;pointer-events:none;transform-origin:center";
          document.body.appendChild(clone);
          const fade = clone.animate(
            [
              {
                opacity: 1,
                transform: "scale(1)",
              },
              {
                opacity: 0,
                transform: "scale(.86)",
              },
            ],
            {
              duration: 260,
              easing: "ease-out",
              fill: "forwards",
            },
          );
          fade.onfinish = () => clone.remove();
        });
        newCells.forEach((el, key) => {
          const from = oldCells.get(key)?.rect,
            to = el.getBoundingClientRect();
          if (from && to.width && to.height) {
            const dx = from.left - to.left,
              dy = from.top - to.top,
              sx = from.width / to.width,
              sy = from.height / to.height;
            if (
              Math.abs(dx) > 1 ||
              Math.abs(dy) > 1 ||
              Math.abs(sx - 1) > 0.015 ||
              Math.abs(sy - 1) > 0.015
            ) {
              el.animate(
                [
                  {
                    transform:
                      "translate(" +
                      dx +
                      "px," +
                      dy +
                      "px) scale(" +
                      sx +
                      "," +
                      sy +
                      ")",
                    opacity: 0.84,
                  },
                  {
                    transform: "translate(0,0) scale(1,1)",
                    opacity: 1,
                  },
                ],
                {
                  duration,
                  easing,
                  fill: "both",
                },
              );
            }
          } else {
            el.animate(
              [
                {
                  opacity: 0,
                  transform: "scale(.88)",
                },
                {
                  opacity: 1,
                  transform: "scale(1)",
                },
              ],
              {
                duration: 300,
                easing,
                fill: "both",
              },
            );
          }
        });
        viewSettleTimer = setTimeout(
          () => screen.classList.remove("is-view-settling"),
          520,
        );
      }),
    );
  }

  function renderCalendarContent(settleTransition = false) {
    const screen = $("calendarScreen");
    if (!settleTransition) screen.classList.remove("is-view-settling");
    screen.classList.toggle("panel-open", view !== "all");
    screen.dataset.view = view;
    const viewName =
      view === "all" ? "Full dates" : view === "month" ? "Month" : "Week";
    screen.setAttribute(
      "aria-label",
      translateUiText("Calendar: " + viewName + " view"),
    );
    $("viewHandle").setAttribute(
      "aria-label",
      translateUiText(
        viewName +
          " view. Drag up for month and week, down for full dates. Keyboard shortcuts: M, W, Y.",
      ),
    );
    $("viewHandle").title = translateUiText("Drag to change view");
    $("monthTitle").textContent = fmtDate(cursor, {
      month: "long",
      year: "numeric",
    });
    const sc = $("calendarScroller"),
      grid = $("dateGrid");
    sc.className =
      "calendar-scroller " +
      (view === "week"
        ? "week-mode"
        : view === "month"
          ? "month-mode"
          : "all-mode");
    sc.classList.remove("view-enter");
    void sc.offsetWidth;
    sc.classList.add("view-enter");
    if (view === "all") {
      timelineBusy = true;
      const anchorKey = monthKey(cursor);
      grid.style.display = "block";
      grid.innerHTML = "";
      const start = new Date(
        cursor.getFullYear(),
        cursor.getMonth() - 6,
        1,
        12,
      );
      for (let i = 0; i < 13; i++)
        grid.insertAdjacentHTML(
          "beforeend",
          makeMonth(new Date(start.getFullYear(), start.getMonth() + i, 1, 12)),
        );
      bindDateCells(grid);
      requestAnimationFrame(() => {
        const target = grid.querySelector('[data-month="' + anchorKey + '"]');
        if (target) {
          const sr = sc.getBoundingClientRect(),
            tr = target.getBoundingClientRect();
          sc.scrollTop += tr.top - sr.top - 44;
        }
        requestAnimationFrame(() => {
          timelineBusy = false;
        });
      });
    } else {
      grid.style.display = "grid";
      const first = monthStart(cursor);
      let start;
      if (view === "week") {
        start = new Date(selected);
        start = addDays(start, -((start.getDay() + 6) % 7));
      } else start = addDays(first, -((first.getDay() + 6) % 7));
      const count = view === "week" ? 7 : 42;
      let out = "";
      for (let i = 0; i < count; i++) {
        const d = addDays(start, i),
          inside = d.getMonth() === cursor.getMonth(),
          items = onDay(d);
        out +=
          '<button class="date-cell ' +
          (!inside && view !== "week" ? "outside " : "") +
          (sameDay(d, today) ? "today " : "") +
          (sameDay(d, selected) ? "selected" : "") +
          '" data-date="' +
          dateKey(d) +
          '" aria-label="' +
          esc(fmtDate(d)) +
          (items.length ? ", " + items.length + " events" : "") +
          '"><span>' +
          d.getDate() +
          '</span><span class="dots">' +
          items
            .slice(0, 3)
            .map(() => "<i></i>")
            .join("") +
          "</span>" +
          cellEvents(items) +
          "</button>";
      }
      grid.innerHTML = out;
      bindDateCells(grid);
    }
    renderPanel();
    window.dispatchEvent(new CustomEvent("calex:render"));
  }

  function renderPanel() {
    $("panelDate").textContent = fmtDate(selected, {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    const list = onDay(selected);
    const todayKey = dateKey(today);
    const overdue = events.filter((item) => !item.done && item.date && item.date < todayKey).sort((a, b) => a.date.localeCompare(b.date));
    const overdueRoot = $("panelOverdueEvents");
    const overdueSection = overdueRoot?.closest(".panel-overdue");
    if (overdueRoot) {
      overdueRoot.innerHTML = overdue.length
        ? '<div class="event-list">' + overdue.slice(0, 4).map((item) => eventMarkup(item)).join("") + '</div>'
        : '<p class="panel-overdue-empty">Nothing overdue.</p>';
      bindEventActions(overdueRoot);
    }
    if (overdueSection) overdueSection.hidden = false;
    $("panelEvents").innerHTML =
      '<div class="event-list">' +
      listMarkup(list, "No events planned for this day.") +
      "</div>";
    bindEventActions($("panelEvents"));
  }

  function renderAll() {
    renderHome();
    renderCalendar();
  }

  function switchScreen(name) {
    document
      .querySelectorAll(".screen")
      .forEach((s) => s.classList.toggle("active", s.id === name + "Screen"));
    document
      .querySelectorAll(".nav-btn")
      .forEach((b) => b.classList.toggle("active", b.dataset.screen === name));
    if (name === "calendar") renderCalendar();
    const titles = {
      home: "Your day, at a glance",
      calendar: "A little space for everything",
      agenda: "What's on the horizon",
      email: "Email workspace",
      settings: "Make yourself at home",
      auth: "Your Calex account",
      about: "About Calex",
      privacy: "Your privacy matters",
      terms: "Terms of service",
    };
    if ($("workspaceTitle"))
      $("workspaceTitle").textContent = translateUiText(titles[name] || "Calex");
    document.querySelectorAll(".nav-btn").forEach((b) => {
      if (b.dataset.screen === name) b.setAttribute("aria-current", "page");
      else b.removeAttribute("aria-current");
    });
    window.dispatchEvent(new CustomEvent("calex:screen", { detail: name }));
  }
  document
    .querySelectorAll(".nav-btn")
    .forEach((b) =>
      b.addEventListener("click", () => switchScreen(b.dataset.screen)),
    );
  $("settingsSignIn").addEventListener("click", (event) => {
    event.preventDefault();
    switchScreen("auth");
    $("authEmail").focus({ preventScroll: true });
  });
  $("authBack").addEventListener("click", () => switchScreen("settings"));
  document.querySelectorAll("[data-legal-screen]").forEach((button) => {
    button.addEventListener("click", () =>
      switchScreen(button.dataset.legalScreen),
    );
  });
  document.querySelectorAll("[data-legal-back]").forEach((button) => {
    button.addEventListener("click", () => switchScreen("settings"));
  });

  function showToast(msg, action) {
    const t = $("toast");
    if (!storageAvailable && /^Event (added|updated|restored)/.test(msg))
      msg += " · session only; export a backup";
    t.textContent = msg;
    if (action) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "toast-action";
      b.textContent = action.label;
      b.addEventListener("click", () => {
        t.classList.remove("show");
        action.fn();
      });
      t.appendChild(b);
    }
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(
      () => t.classList.remove("show"),
      action ? 6000 : 2600,
    );
  }

  function openModal(mode) {
    modalMode = mode;
    $("modalBackdrop").dataset.mode = mode;
    $("modalTitle").textContent = translateUiText(
      mode === "quick" ? "Quick add" : "New event",
    );
    $("quickForm").hidden = mode !== "quick";
    $("eventForm").hidden = mode === "quick";
    $("modalBackdrop").classList.add("open");
    $("modalBackdrop").setAttribute("aria-hidden", "false");
    if ($("eventFeedback")) $("eventFeedback").textContent = "";
    if (mode === "quick") {
      $("quickText").value = "";
      setQuickPreviewEmpty();
      setTimeout(() => $("quickText").focus(), 100);
    } else if (!$("eventTitle").value) setNormalDefaults();
    window.CalexI18n?.refresh();
  }

  function closeModal() {
    $("modalBackdrop").classList.remove("open");
    $("modalBackdrop").setAttribute("aria-hidden", "true");
  }

  function setNormalDefaults(e) {
    $("eventTitle").value = e?.title || "";
    $("eventDescription").value = e?.description || "";
    $("eventDate").value = e?.date || dateKey(selected);
    $("eventLocation").value = e?.location || "";
    $("eventStart").value = e?.start || "";
    $("eventEnd").value = e?.end || "";
    $("eventRepeat").value = e?.repeat || "none";
    $("eventPeople").value = e?.people || "";
    $("eventNotes").value = e?.notes || "";
    $("eventCategory").value = e ? categoryOf(e) : "personal";
    $("eventForm").dataset.editId = e?.id || "";
  }

  function openNormal(e) {
    switchScreen("calendar");
    openModal("normal");
    $("eventTitle").placeholder = "Event name";
    $("eventTitle").setAttribute("aria-label", "Event title");
    const submitLabel = $("eventForm").querySelector('[type="submit"] span');
    if (submitLabel) submitLabel.textContent = "Save event";
    $("eventForm").querySelector('[type="submit"]').setAttribute("aria-label", "Save event");
    setNormalDefaults(e);
    $("eventForm").dataset.source = "";
    setTimeout(() => $("eventTitle").focus(), 0);
    $("modalTitle").textContent = translateUiText(
      e ? (e.isTask ? "Edit task" : "Edit event") : "New event",
    );
    if (e?.isTask) {
      $("modalBackdrop").dataset.mode = "task";
      $("eventTitle").placeholder = "What needs doing?";
      $("eventTitle").setAttribute("aria-label", "Task title");
      const taskLabel = $("eventForm").querySelector('[type="submit"] span');
      if (taskLabel) taskLabel.textContent = "Save task";
      $("eventForm").querySelector('[type="submit"]').setAttribute("aria-label", "Save task");
    }
    if (e) {
      const old = $("eventForm").querySelector(".delete-event");
      if (old) old.remove();
      const del = document.createElement("button");
      del.type = "button";
      del.className = "secondary delete-event";
      del.innerHTML =
        '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6"/></svg>';
      del.setAttribute("aria-label", "Delete event");
      del.title = "Delete event";
      del.style.cssText =
        "width:48px;height:44px;display:grid;place-items:center;margin:10px 0 0 auto;padding:0";
      del.onclick = () => {
        const removed = e;
        events = events.filter((x) => x.id !== removed.id);
        if (authUser) {
          const t = lsGet(tombKey(authUser.id), {});
          t[removed.id] = Date.now();
          lsSet(tombKey(authUser.id), t);
        }
        persist();
        closeModal();
        renderAll();
        showToast("Event deleted", {
          label: "Undo",
          fn: () => {
            if (authUser) {
              const t = lsGet(tombKey(authUser.id), {});
              delete t[removed.id];
              lsSet(tombKey(authUser.id), t);
            }
            events.push(touch({ ...removed }));
            persist();
            renderAll();
            showToast("Event restored");
          },
        });
      };
      $("eventForm").appendChild(del);
    } else {
      $("eventForm").querySelector(".delete-event")?.remove();
    }
    window.CalexI18n?.refresh();
  }
  function openTask() {
    openNormal();
    $("modalBackdrop").dataset.mode = "task";
    $("modalTitle").textContent = "New task";
    $("eventTitle").placeholder = "What needs doing?";
    $("eventTitle").setAttribute("aria-label", "Task title");
    $("eventForm").querySelector('[type="submit"] span').textContent = "Save task";
    $("eventForm").querySelector('[type="submit"]').setAttribute("aria-label", "Save task");
    $("eventTitle").focus();
  }
  $("panelQuick").addEventListener("click", () => openModal("quick"));
  $("panelAdd").addEventListener("click", () => openNormal());
  $("panelTask").addEventListener("click", openTask);
  $("homeAddTask").addEventListener("click", openTask);
  $("closeModal").addEventListener("click", closeModal);
  $("modalBackdrop").addEventListener("click", (e) => {
    if (e.target === $("modalBackdrop")) closeModal();
  });

  function parseNatural(raw) {
    let s = raw.trim(),
      title = s,
      date = new Date(selected),
      start = "",
      end = "",
      repeat = "none",
      repeatInterval = 1,
      repeatUnit = "",
      explicitDate = false;
    const now = new Date();

    function setDate(d) {
      date = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12);
      explicitDate = true;
    }
    let m;
    if ((m = s.match(/\b(today|tomorrow|day after tomorrow)\b/i))) {
      setDate(
        addDays(
          now,
          /day after tomorrow/i.test(m[0]) ? 2 : /tomorrow/i.test(m[0]) ? 1 : 0,
        ),
      );
      title = title.replace(m[0], " ");
    }
    if (
      (m = s.match(
        /\b(on\s+)?(\d{1,2})(?:st|nd|rd|th)?\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)(?:\s+(\d{4}))?\b/i,
      ))
    ) {
      const months = [
          "jan",
          "feb",
          "mar",
          "apr",
          "may",
          "jun",
          "jul",
          "aug",
          "sep",
          "oct",
          "nov",
          "dec",
        ],
        mo = months.indexOf(m[3].slice(0, 3).toLowerCase()),
        yr = Number(m[4] || now.getFullYear());
      setDate(new Date(yr, mo, Number(m[2]), 12));
      if (
        !m[4] &&
        date < new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12)
      )
        date.setFullYear(date.getFullYear() + 1);
      title = title.replace(m[0], " ");
    }

    function norm(t, other) {
      let z = t.toLowerCase().replace(/\s/g, "");
      const ap = z.match(/(am|pm)$/);
      z = z.replace(/(am|pm)$/, "");
      const p = z.split(":"),
        h0 = Number(p[0]),
        min = Number(p[1] || 0);
      let h = h0;
      if (ap) {
        if (ap[1] === "pm" && h < 12) h += 12;
        if (ap[1] === "am" && h === 12) h = 0;
      } else if (other) {
        const oa = other
          .toLowerCase()
          .replace(/\s/g, "")
          .match(/(am|pm)$/);
        if (oa) {
          if (oa[1] === "pm" && h < 12) h += 12;
          if (oa[1] === "am" && h === 12) h = 0;
        }
      }
      if (h > 23 || min > 59) return "";
      return pad(h) + ":" + pad(min);
    }
    const timePattern = "(?:[01]?\\d|2[0-3]):[0-5]\\d";
    const rangeRe = new RegExp(
      "(" + timePattern + ")\\\\s*(?:to|until|[-–])\\\\s*(" + timePattern + ")",
      "i",
    );
    let tm = rangeRe.exec(s);
    if (!tm)
      tm =
        /(\b(?:[01]?\d|2[0-3]):[0-5]\d)\s*(?:to|until|[-–])\s*(\b(?:[01]?\d|2[0-3]):[0-5]\d)\b/i.exec(
          s,
        );
    if (tm) {
      start = norm(tm[1], tm[2]);
      end = norm(tm[2], tm[1]);
      title = title.replace(tm[0], " ");
    } else if ((m = s.match(/\b(?:at\s*)?((?:[01]?\d|2[0-3]):[0-5]\d)\b/i))) {
      start = norm(m[1]);
      title = title.replace(m[0], " ");
    } else if (
      (m = s.match(/\b(?:at\s*)?(\d{1,2})(?::([0-5]\d))?\s*(am|pm)\b/i))
    ) {
      let h = Number(m[1]),
        min = Number(m[2] || 0);
      if (m[3].toLowerCase() === "pm" && h < 12) h += 12;
      if (m[3].toLowerCase() === "am" && h === 12) h = 0;
      start = pad(h) + ":" + pad(min);
      title = title.replace(m[0], " ");
    } else if (/\bnoon\b/i.test(s)) {
      start = "12:00";
      title = title.replace(/\bnoon\b/i, " ");
    } else if (/\bmidnight\b/i.test(s)) {
      start = "00:00";
      title = title.replace(/\bmidnight\b/i, " ");
    }
    let rec = null;
    const combo = /\bevery\s+(\d+)\s*weeks?\s+and\s+(\d+)\s*days?\b/i.exec(s),
      biweekly = /\b(?:fortnightly|biweekly|every\s+other\s+week)\b/i.exec(s);
    if (biweekly) {
      repeat = "weekly";
      repeatUnit = "week";
      repeatInterval = 2;
      rec = biweekly[0];
    } else if (combo) {
      repeat = "daily";
      repeatUnit = "day";
      repeatInterval = Math.max(1, Number(combo[1]) * 7 + Number(combo[2]));
      rec = combo[0];
    } else if ((m = /\bevery\s+(\d+)\s*days?\b/i.exec(s))) {
      repeat = "daily";
      repeatUnit = "day";
      repeatInterval = Math.max(1, Number(m[1]));
      rec = m[0];
    } else if ((m = /\bevery\s+(\d+)\s*weeks?\b/i.exec(s))) {
      repeat = "weekly";
      repeatUnit = "week";
      repeatInterval = Math.max(1, Number(m[1]));
      rec = m[0];
    } else if ((m = /\bevery\s+(\d+)\s*months?\b/i.exec(s))) {
      repeat = "monthly";
      repeatUnit = "month";
      repeatInterval = Math.max(1, Number(m[1]));
      rec = m[0];
    } else if ((m = /\bevery\s+(\d+)\s*years?\b/i.exec(s))) {
      repeat = "yearly";
      repeatUnit = "year";
      repeatInterval = Math.max(1, Number(m[1]));
      rec = m[0];
    } else if ((m = /\bevery\s+day\b|\bdaily\b/i.exec(s))) {
      repeat = "daily";
      repeatUnit = "day";
      repeatInterval = 1;
      rec = m[0];
    } else if (
      (m =
        /\bevery\s+week\b|\bweekly\b|\bevery\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i.exec(
          s,
        ))
    ) {
      repeat = "weekly";
      repeatUnit = "week";
      repeatInterval = 1;
      rec = m[0];
    } else if ((m = /\bevery\s+month\b|\bmonthly\b/i.exec(s))) {
      repeat = "monthly";
      repeatUnit = "month";
      repeatInterval = 1;
      rec = m[0];
    } else if ((m = /\bevery\s+year\b|\byearly\b|\bannually\b/i.exec(s))) {
      repeat = "yearly";
      repeatUnit = "year";
      repeatInterval = 1;
      rec = m[0];
    }
    if (rec) title = title.replace(rec, " ");
    title = title
      .replace(/\b(on|at)\b/gi, " ")
      .replace(/[,.]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!title) title = raw.trim();
    return {
      title,
      date: dateKey(date),
      start,
      end,
      repeat,
      repeatInterval,
      repeatUnit,
      tag: repeat !== "none" ? "Repeating" : start ? "Timed" : "All day",
    };
  }
  let quickParseTimer = null;

  function quickPreviewRepeatText(p) {
    const description = repeatDescription(p);
    return description ? " · " + description : "";
  }

  function setQuickPreviewEmpty() {
    const preview = $("quickPreview");
    preview.replaceChildren();
    preview.setAttribute("data-i18n", "Start typing to see the preview...");
    preview.textContent = "Start typing to see the preview...";
    preview.classList.add("is-empty");
    window.CalexI18n?.refresh();
  }

  function showQuickPreview(p, prefix = "Preview") {
    const preview = $("quickPreview");
    preview.removeAttribute("data-i18n");
    preview.replaceChildren();

    function addPreviewPart(value, userContent = false, translationKey = "") {
      const part = document.createElement("span");
      if (userContent) part.setAttribute("data-user-content", "true");
      if (translationKey) {
        part.setAttribute("data-i18n", translationKey);
        part.textContent = translationKey;
      } else {
        part.textContent = value;
      }
      preview.appendChild(part);
    }
    function addSeparator() {
      addPreviewPart(" · ");
    }

    // Keep translatable labels separate from the user's title, description, and location.
    addPreviewPart(prefix, false, prefix);
    addPreviewPart(": ");
    addPreviewPart(p.title, true);
    addSeparator();
    addPreviewPart(
      fmtDate(parseDate(p.date), {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    );
    addSeparator();
    addPreviewPart(
      p.start
        ? p.start + (p.end ? "–" + p.end : "")
        : "All day",
      false,
      p.start ? "" : "All day",
    );

    const repeat = repeatDescription(p);
    if (repeat) {
      addSeparator();
      addPreviewPart(repeat, false, repeat);
    }
    if (p.description) {
      addSeparator();
      addPreviewPart(p.description, true);
    }
    if (p.location) {
      addSeparator();
      addPreviewPart(p.location, true);
    }
    window.CalexI18n?.refresh();
  }
  $("quickText").addEventListener("input", () => {
    const raw = $("quickText").value.trim();
    clearTimeout(quickParseTimer);
    if (!raw) {
      setQuickPreviewEmpty();
      return;
    }
    $("quickPreview").classList.remove("is-empty");
    showQuickPreview(parseNatural(raw), "Rule-based preview");
  });
  $("quickSave").addEventListener("click", () => {
    const raw = $("quickText").value.trim();
    if (!raw) {
      showToast("Describe your event first.");
      return;
    }
    const p = parseNatural(raw);
    if (!p.title || !validEventDate(p.date)) {
      showToast("Add a valid event name and date.");
      return;
    }
    if (!validEventTimes(p.start, p.end)) {
      showToast("End time must be later than start time.");
      return;
    }
    events.push(
      touch({
        id: crypto.randomUUID(),
        ...p,
        done: false,
        description: "",
        location: "",
        people: "",
        notes: "",
      }),
    );
    persist();
    selected = parseDate(p.date);
    cursor = new Date(selected);
    view = "month";
    closeModal();
    renderAll();
    switchScreen("calendar");
    showToast("Event added");
  });
  $("eventForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const id = $("eventForm").dataset.editId;
    const isTask = $("modalBackdrop").dataset.mode === "task";
    const fromPuterEmail = $("eventForm").dataset.source === "puter-email";
    const old = events.find((x) => x.id === id);
    const item = {
      id: id || crypto.randomUUID(),
      title: $("eventTitle").value.trim(),
      description: $("eventDescription").value.trim(),
      date: $("eventDate").value,
      start: $("eventStart").value,
      end: $("eventEnd").value,
      repeat: $("eventRepeat").value,
      location: $("eventLocation").value.trim(),
      people: $("eventPeople").value.trim(),
      notes: $("eventNotes").value.trim(),
      category: $("eventCategory").value,
      done: old?.done || false,
      tag:
        $("eventRepeat").value !== "none"
          ? "Repeating"
          : $("eventStart").value
            ? "Timed"
            : "",
      isTask: isTask || old?.isTask || false,
      progress: Number(old?.progress) || 0,
      urgent: !!old?.urgent,
      important: !!old?.important,
      subtasks: old?.subtasks || [],
    };
    if (!item.title) {
      showToast("Add an event title.");
      $("eventTitle").focus();
      return;
    }
    if (!validEventDate(item.date)) {
      showToast("Choose a valid event date.");
      $("eventDate").focus();
      return;
    }
    if (!validEventTimes(item.start, item.end)) {
      showToast("End time must be later than start time.");
      $("eventFeedback").textContent =
        "End time must be later than start time.";
      $("eventEnd").focus();
      return;
    }
    touch(item);
    if (id) events = events.map((x) => (x.id === id ? item : x));
    else events.push(item);
    selected = parseDate(item.date);
    cursor = new Date(selected);
    view = "month";
    persist();
    closeModal();
    renderAll();
    showToast(id ? (isTask ? "Task updated" : "Event updated") : (isTask ? "Task added" : "Event added"));
    $("eventForm").dataset.editId = "";
    $("eventForm").dataset.source = "";
    if (fromPuterEmail) {
      switchScreen("calendar");
      renderAll();
      showToast("Email event added to your calendar");
    }
  });
  ["prevYear", "nextYear", "prevMonth", "nextMonth"].forEach((id) =>
    $(id).addEventListener("click", () => {
      const amount =
        id === "prevYear"
          ? -12
          : id === "nextYear"
            ? 12
            : id === "prevMonth"
              ? -1
              : 1;
      cursor = new Date(
        cursor.getFullYear(),
        cursor.getMonth() + amount,
        1,
        12,
      );
      selected = new Date(
        cursor.getFullYear(),
        cursor.getMonth(),
        Math.min(
          selected.getDate(),
          new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate(),
        ),
        12,
      );
      renderCalendar();
    }),
  );

  $("searchInput").addEventListener("input", () => {
    const raw = $("searchInput").value.trim(),
      q = raw.toLowerCase(),
      root = $("searchResults");
    root.innerHTML = "";
    if (!q) return;
    const parsed = new Date(raw),
      exactDate = /^\d{4}-\d{2}-\d{2}$/.test(raw)
        ? parseDate(raw)
        : !Number.isNaN(parsed.getTime()) && raw.length > 5
          ? new Date(
              parsed.getFullYear(),
              parsed.getMonth(),
              parsed.getDate(),
              12,
            )
          : null;
    const dateSet = new Map();
    events.forEach((e) => {
      const d = parseDate(e.date),
        label = fmtDate(d, {
          month: "long",
          day: "numeric",
          year: "numeric",
        });
      if (label.toLowerCase().includes(q) || e.date.includes(q))
        dateSet.set(e.date, d);
    });
    if (exactDate) dateSet.set(dateKey(exactDate), exactDate);
    if (dateSet.size) {
      const heading = document.createElement("div");
      heading.className = "search-section-label";
      heading.textContent = "Dates";
      root.appendChild(heading);
      const dates = document.createElement("div");
      dates.className = "date-suggestions";
      Array.from(dateSet.values())
        .sort((a, b) => a - b)
        .slice(0, 8)
        .forEach((d) => {
          const b = document.createElement("button");
          b.type = "button";
          b.className = "date-suggestion";
          b.innerHTML =
            "<span>" +
            esc(
              fmtDate(d, {
                month: "long",
                day: "numeric",
                year: "numeric",
              }),
            ) +
            '</span><span class="suggestion-weekday">' +
            esc(
              fmtDate(d, {
                weekday: "long",
              }),
            ) +
            "</span>";
          b.addEventListener("click", () => {
            selected = new Date(d);
            cursor = new Date(d);
            view = "month";
            $("searchInput").value = "";
            root.innerHTML = "";
            renderCalendar();
            renderHome();
          });
          dates.appendChild(b);
        });
      root.appendChild(dates);
    }
    const matches = events
      .filter((e) =>
        (
          e.title +
          " " +
          e.description +
          " " +
          e.location +
          " " +
          e.date +
          " " +
          fmtDate(parseDate(e.date), {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        )
          .toLowerCase()
          .includes(q),
      )
      .sort(
        (a, b) =>
          a.date.localeCompare(b.date) ||
          (a.start || "99:99").localeCompare(b.start || "99:99"),
      )
      .slice(0, 20);
    if (matches.length) {
      const h = document.createElement("div");
      h.className = "search-section-label";
      h.textContent = "Events · chronological";
      root.appendChild(h);
      const list = document.createElement("div");
      list.className = "search-event-list";
      list.innerHTML = matches
        .map(
          (e) =>
            '<div class="search-event-date">' +
            esc(
              fmtDate(parseDate(e.date), {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
              }),
            ) +
            "</div>" +
            eventMarkup(e),
        )
        .join("");
      root.appendChild(list);
      bindEventActions(list);
    } else if (!dateSet.size) {
      const empty = document.createElement("div");
      empty.className = "empty";
      empty.textContent = "No matching events or dates.";
      root.appendChild(empty);
    }
  });
  let handleY = 0,
    handleX = 0,
    handleLastY = 0,
    handleStartView = "all",
    handleStartScrollerHeight = 0,
    handleDragging = false,
    handlePreviewView = null;
  const handle = $("selectedPanel").querySelector(".handle-grip"),
    selectedPanel = $("selectedPanel"),
    calendarScreen = $("calendarScreen");

  function clearHandleDrag(keepLayoutPreview = false) {
    handleDragging = false;
    handlePreviewView = null;
    handle.classList.remove("dragging");
    selectedPanel.classList.remove("is-dragging");
    if (keepLayoutPreview) return;
    calendarScreen.classList.remove(
      "is-view-dragging",
      "drag-toward-open",
      "drag-toward-closed",
    );
    [
      "--drag-progress",
      "--drag-panel-size",
      "--drag-close-size",
      "--drag-scroller-max",
      "--drag-scroller-scale",
      "--drag-scroller-height",
    ].forEach((k) => calendarScreen.style.removeProperty(k));
    selectedPanel.style.removeProperty("--panel-drag-y");
  }

  function nextDragView(startView, dy) {
    if (dy < 0)
      return startView === "all"
        ? "month"
        : startView === "month"
          ? "week"
          : "week";
    return startView === "week"
      ? "month"
      : startView === "month"
        ? "all"
        : "all";
  }

  function handleDragCanChange(startView, dy) {
    return (
      (startView === "all" && dy < 0) ||
      (startView === "month" && dy !== 0) ||
      (startView === "week" && dy > 0)
    );
  }

  function updateDragPreview(dy) {
    const canPreview = handleDragCanChange(handleStartView, dy);
    const distance = Math.max(140, Math.min(220, window.innerHeight * 0.28));
    const progress = canPreview ? Math.min(1, Math.abs(dy) / distance) : 0;
    calendarScreen.style.setProperty("--drag-progress", String(progress));
    calendarScreen.style.setProperty(
      "--drag-panel-size",
      Math.max(0, Math.min(-dy, Math.min(window.innerHeight * 0.55, 420))) +
        "px",
    );
    calendarScreen.style.setProperty(
      "--drag-close-size",
      Math.max(
        0,
        Math.min(Math.abs(dy), Math.min(window.innerHeight * 0.55, 420)),
      ) + "px",
    );
    const previewTarget =
      canPreview && progress >= 0.42
        ? nextDragView(handleStartView, dy)
        : handleStartView;
    if (handleStartView !== "all") {
      const maxHeight = Math.max(
        150,
        calendarScreen.clientHeight -
          (calendarScreen.querySelector(".search-wrap")?.offsetHeight || 0) -
          80,
      );
      const base = Math.min(maxHeight, Math.max(78, handleStartScrollerHeight));
      const targetHeight = Math.max(78, Math.min(maxHeight, base + dy));
      calendarScreen.style.setProperty(
        "--drag-scroller-height",
        targetHeight + "px",
      );
    }
    calendarScreen.classList.toggle("drag-toward-open", canPreview && dy < 0);
    calendarScreen.classList.toggle("drag-toward-closed", canPreview && dy > 0);
    // Preview only the layout while dragging. Re-rendering here replaces the grid
    // and resets panel-open, which causes the drag to snap instead of following
    // the pointer. The actual view is committed once, on pointerup.
    handlePreviewView = previewTarget;
  }
  handle.addEventListener("pointerdown", (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    handleY = e.clientY;
    handleX = e.clientX;
    handleLastY = e.clientY;
    handleStartView = view;
    handlePreviewView = view;
    handleStartScrollerHeight =
      $("calendarScroller").getBoundingClientRect().height;
    handleDragging = true;
    selectedPanel.classList.add("is-dragging");
    calendarScreen.classList.add("is-view-dragging");
    handle.classList.add("dragging");
    calendarScreen.style.setProperty("--drag-progress", "0");
    selectedPanel.style.setProperty("--panel-drag-y", "0px");
    if (handleStartView !== "all")
      calendarScreen.style.setProperty(
        "--drag-scroller-height",
        handleStartScrollerHeight + "px",
      );
    handle.setPointerCapture?.(e.pointerId);
  });
  handle.addEventListener("pointermove", (e) => {
    if (!handleDragging) return;
    handleLastY = e.clientY;
    const dy = Math.max(
      -Math.min(window.innerHeight * 0.55, 420),
      Math.min(window.innerHeight * 0.45, handleLastY - handleY),
    );
    updateDragPreview(dy);
  });

  function settleHandleDrag(target) {
    if (!handleDragging) return;
    // Keep the pointer-driven geometry for both outcomes: commit the new view if
    // the drag crossed its threshold, or glide back to the current view otherwise.
    // In either case, renderCalendar captures the release position and eases the
    // calendar and panel into their final geometry without opacity effects.
    clearTimeout(viewSettleTimer);
    clearHandleDrag(true);
    view = target;
    renderCalendar(true);
  }

  function finishHandleDrag(e) {
    if (!handleDragging) return;
    const dy = (e.clientY ?? handleLastY) - handleY,
      dx = (e.clientX ?? handleX) - handleX;
    const threshold = Math.max(40, Math.min(64, window.innerHeight * 0.06));
    const valid =
      Math.abs(dy) >= threshold &&
      Math.abs(dy) >= Math.abs(dx) * 1.15 &&
      handleDragCanChange(handleStartView, dy);
    settleHandleDrag(
      valid ? nextDragView(handleStartView, dy) : handleStartView,
    );
  }
  handle.addEventListener("pointerup", finishHandleDrag);
  handle.addEventListener("pointercancel", () => {
    if (handleDragging) settleHandleDrag(handleStartView);
  });
  handle.addEventListener("lostpointercapture", () => {
    if (handleDragging) settleHandleDrag(handleStartView);
  });
  let timelineBusy = false,
    viewWheelLock = false,
    viewSettleTimer = null;
  $("calendarScroller").addEventListener(
    "scroll",
    () => {
      if (
        view !== "all" ||
        timelineBusy ||
        !$("calendarScreen").classList.contains("active")
      )
        return;
      const sc = $("calendarScroller"),
        grid = $("dateGrid"),
        sections = grid.querySelectorAll(".timeline-month");
      if (!sections.length) return;
      const scRect = sc.getBoundingClientRect();
      let nearest = sections[0];
      for (const sec of sections) {
        if (sec.getBoundingClientRect().top <= scRect.top + 65) nearest = sec;
        else break;
      }
      const shown = nearest.dataset.month.split("-").map(Number);
      cursor = new Date(shown[0], shown[1] - 1, 1, 12);
      $("monthTitle").textContent = fmtDate(cursor, {
        month: "long",
        year: "numeric",
      });
      if (sc.scrollTop < 220) {
        timelineBusy = true;
        const first = sections[0],
          parts = first.dataset.month.split("-").map(Number),
          newMonth = new Date(parts[0], parts[1] - 12, 1, 12),
          oldHeight = sc.scrollHeight;
        grid.insertAdjacentHTML(
          "afterbegin",
          Array.from(
            {
              length: 12,
            },
            (_, i) =>
              makeMonth(
                new Date(
                  newMonth.getFullYear(),
                  newMonth.getMonth() + i,
                  1,
                  12,
                ),
              ),
          ).join(""),
        );
        bindDateCells(grid);
        sc.scrollTop += sc.scrollHeight - oldHeight;
        requestAnimationFrame(() => {
          timelineBusy = false;
        });
      } else if (sc.scrollHeight - sc.scrollTop - sc.clientHeight < 260) {
        timelineBusy = true;
        const last = sections[sections.length - 1],
          parts = last.dataset.month.split("-").map(Number),
          newMonth = new Date(parts[0], parts[1], 1, 12);
        grid.insertAdjacentHTML(
          "beforeend",
          Array.from(
            {
              length: 12,
            },
            (_, i) =>
              makeMonth(
                new Date(
                  newMonth.getFullYear(),
                  newMonth.getMonth() + i,
                  1,
                  12,
                ),
              ),
          ).join(""),
        );
        bindDateCells(grid);
        requestAnimationFrame(() => {
          timelineBusy = false;
        });
      }
    },
    {
      passive: true,
    },
  );
  const calendarScroller = $("calendarScroller");
  calendarScroller.addEventListener(
    "wheel",
    (e) => {
      if (
        view === "all" ||
        viewWheelLock ||
        $("searchInput").value.trim()
      )
        return;

      const horizontalIntent =
        Math.abs(e.deltaX) >= 18 &&
        Math.abs(e.deltaX) > Math.abs(e.deltaY) * 1.15;
      if (horizontalIntent) {
        e.preventDefault();
        viewWheelLock = true;
        calendarScreen.classList.add("is-calendar-swiping");
        commitCalendarSwipe(
          e.deltaX < 0 ? -1 : 1,
          0,
          Math.max(1, calendarScroller.clientWidth),
          e.deltaX / 16,
        );
        setTimeout(() => {
          viewWheelLock = false;
        }, 520);
        return;
      }

      if (Math.abs(e.deltaY) < 18) return;
      if (Math.abs(e.deltaY) < Math.abs(e.deltaX) * 1.15) return;
      e.preventDefault();
      viewWheelLock = true;
      const direction = e.deltaY > 0 ? 1 : -1;
      const next =
        view === "month"
          ? direction > 0
            ? "all"
            : "week"
          : direction > 0
            ? "month"
            : "week";
      if (next !== view) {
        view = next;
        renderCalendar();
      }
      setTimeout(() => {
        viewWheelLock = false;
      }, 520);
    },
    {
      passive: false,
    },
  );
  let calendarSwipe = null,
    suppressCalendarClick = false,
    suppressCalendarClickTimer = null;

  function calendarSwipeMotionAllowed() {
    return !(
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function clearCalendarSwipeStyles() {
    calendarScroller.style.removeProperty("transform");
    calendarScroller.style.removeProperty("will-change");
    calendarScreen.classList.remove("is-calendar-swiping");
  }

  function shiftCalendarPeriod(step) {
    if (view === "week") {
      selected = addDays(selected, step * 7);
      cursor = new Date(selected);
      return;
    }
    if (view !== "month") return;
    const nextCursor = new Date(
      cursor.getFullYear(),
      cursor.getMonth() + step,
      1,
      12,
    );
    const daysInMonth = new Date(
      nextCursor.getFullYear(),
      nextCursor.getMonth() + 1,
      0,
    ).getDate();
    selected = new Date(
      nextCursor.getFullYear(),
      nextCursor.getMonth(),
      Math.min(selected.getDate(), daysInMonth),
      12,
    );
    cursor = nextCursor;
  }

  function suppressCalendarClickAfterDrag() {
    suppressCalendarClick = true;
    clearTimeout(suppressCalendarClickTimer);
    suppressCalendarClickTimer = setTimeout(() => {
      suppressCalendarClick = false;
    }, 450);
  }

  calendarScreen.addEventListener(
    "click",
    (event) => {
      if (!suppressCalendarClick) return;
      suppressCalendarClick = false;
      clearTimeout(suppressCalendarClickTimer);
      event.preventDefault();
      event.stopImmediatePropagation();
    },
    true,
  );

  function glideCalendarSwipeBack(offset) {
    const canAnimate =
      Math.abs(offset) > 1 &&
      calendarSwipeMotionAllowed() &&
      typeof calendarScroller.animate === "function";
    calendarScroller.style.removeProperty("transform");
    if (!canAnimate) {
      clearCalendarSwipeStyles();
      return;
    }
    const animation = calendarScroller.animate(
      [
        { transform: "translate3d(" + offset + "px,0,0)" },
        { transform: "translate3d(0,0,0)" },
      ],
      {
        duration: 220,
        easing: "cubic-bezier(.22,.75,.25,1)",
        fill: "both",
      },
    );
    animation.onfinish = () => {
      animation.cancel();
      clearCalendarSwipeStyles();
    };
  }

  function commitCalendarSwipe(swipeDirection, offset, width, velocity) {
    // A leftward swipe advances; a rightward swipe goes back.
    const step = swipeDirection < 0 ? 1 : -1;
    const canAnimate =
      calendarSwipeMotionAllowed() &&
      typeof calendarScroller.animate === "function";
    if (!canAnimate) {
      shiftCalendarPeriod(step);
      renderCalendarContent(true);
      clearCalendarSwipeStyles();
      return;
    }

    const scrollerRect = calendarScroller.getBoundingClientRect();
    const screenRect = calendarScreen.getBoundingClientRect();
    const snapshot = calendarScroller.cloneNode(true);
    snapshot.removeAttribute("id");
    snapshot.setAttribute("aria-hidden", "true");
    snapshot.style.cssText +=
      ";position:fixed;left:" +
      (scrollerRect.left - screenRect.left) +
      "px;top:" +
      (scrollerRect.top - screenRect.top) +
      "px;width:" +
      scrollerRect.width +
      "px;height:" +
      scrollerRect.height +
      "px;margin:0;z-index:999;pointer-events:none;transform:translate3d(" +
      offset +
      "px,0,0);will-change:transform";
    calendarScreen.appendChild(snapshot);

    shiftCalendarPeriod(step);
    renderCalendarContent(true);
    calendarScroller.style.removeProperty("transform");
    calendarScroller.style.removeProperty("will-change");

    const incomingOffset = offset - swipeDirection * width;
    const duration = Math.max(
      220,
      Math.min(430, Math.round(370 - Math.abs(velocity) * 110)),
    );
    const easing = "cubic-bezier(.18,.67,.32,1)";
    const outgoingAnimation = snapshot.animate(
      [
        { transform: "translate3d(" + offset + "px,0,0)" },
        { transform: "translate3d(" + swipeDirection * width + "px,0,0)" },
      ],
      { duration, easing, fill: "both" },
    );
    const incomingAnimation = calendarScroller.animate(
      [
        { transform: "translate3d(" + incomingOffset + "px,0,0)" },
        { transform: "translate3d(0,0,0)" },
      ],
      { duration, easing, fill: "both" },
    );
    let finishedAnimations = 0;
    const finishAnimation = () => {
      finishedAnimations += 1;
      if (finishedAnimations !== 2) return;
      outgoingAnimation.cancel();
      incomingAnimation.cancel();
      snapshot.remove();
      clearCalendarSwipeStyles();
    };
    outgoingAnimation.onfinish = finishAnimation;
    incomingAnimation.onfinish = finishAnimation;
  }

  function finishCalendarSwipeAt(x, cancelled = false) {
    const state = calendarSwipe;
    if (!state) return;
    calendarSwipe = null;
    if (!state.dragging) return;

    const width = Math.max(1, calendarScroller.clientWidth);
    const endX = Number.isFinite(x) ? x : state.lastX;
    const rawOffset = endX - state.startX;
    const offset = Math.max(-width * 0.94, Math.min(width * 0.94, rawOffset));
    calendarScroller.style.transform = "translate3d(" + offset + "px,0,0)";

    const now = performance.now();
    state.samples.push({ x: endX, time: now });
    const recent = state.samples.filter((sample) => now - sample.time <= 120);
    const first = recent[0] || state.samples[0];
    const last =
      recent[recent.length - 1] || state.samples[state.samples.length - 1];
    const elapsed = Math.max(1, last.time - first.time);
    const velocity = (last.x - first.x) / elapsed;
    const distanceThreshold = Math.max(56, width * 0.18);
    const shouldNavigate =
      !cancelled &&
      (Math.abs(offset) >= distanceThreshold ||
        (Math.abs(velocity) >= 0.55 && Math.abs(offset) >= 28));

    suppressCalendarClickAfterDrag();
    if (!shouldNavigate) {
      glideCalendarSwipeBack(offset);
      return;
    }
    commitCalendarSwipe(offset < 0 ? -1 : 1, offset, width, velocity);
  }

  function finishCalendarSwipe(event, cancelled = false) {
    const state = calendarSwipe;
    if (!state || event.pointerId !== state.pointerId) return;
    finishCalendarSwipeAt(event.clientX, cancelled);
  }

  function calendarGestureStartAllowed(event) {
    const target = event.target;
    if (!(target instanceof Element)) return true;
    return !target.closest(
      "#searchInput, .search-wrap, .month-controls, .view-segment, " +
        "#filterCalendars, .handle-grip, button:not(.date-cell), " +
        "input, textarea, select, a, [role='dialog']",
    );
  }

  function calendarTouchById(list, identifier) {
    return Array.from(list || []).find((touch) => touch.identifier === identifier);
  }

  // Keep a Touch Events path for mobile browsers/WebViews that cancel Pointer
  // Events during gesture arbitration. Pointer handling remains for mouse/pen.
  calendarScreen.addEventListener(
    "touchstart",
    (event) => {
      if (
        view === "all" ||
        !calendarScreen.classList.contains("active") ||
        calendarScreen.classList.contains("is-view-settling") ||
        !calendarGestureStartAllowed(event) ||
        $("searchInput").value.trim() ||
        event.touches.length !== 1
      )
        return;
      const touch = event.touches[0];
      const now = performance.now();
      calendarSwipe = {
        pointerId: "touch-" + touch.identifier,
        touchIdentifier: touch.identifier,
        isTouch: true,
        startX: touch.clientX,
        startY: touch.clientY,
        lastX: touch.clientX,
        dragging: false,
        offset: 0,
        samples: [{ x: touch.clientX, time: now }],
      };
    },
    { passive: true },
  );

  calendarScreen.addEventListener(
    "touchmove",
    (event) => {
      const state = calendarSwipe;
      if (!state || !state.isTouch) return;
      const touch = calendarTouchById(event.touches, state.touchIdentifier);
      if (!touch) return;
      const now = performance.now();
      state.lastX = touch.clientX;
      state.samples.push({ x: touch.clientX, time: now });
      state.samples = state.samples.filter((sample) => now - sample.time <= 180);
      const dx = touch.clientX - state.startX;
      const dy = touch.clientY - state.startY;
      if (!state.dragging) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        if (Math.abs(dy) > Math.abs(dx) * 1.15) {
          calendarSwipe = null;
          return;
        }
        state.dragging = true;
        calendarScreen.classList.add("is-calendar-swiping");
        calendarScroller.style.willChange = "transform";
      }
      // Horizontal gestures belong to the calendar, not the browser's native
      // scroll handling; vertical gestures are left untouched.
      if (event.cancelable) event.preventDefault();
      const width = Math.max(1, calendarScroller.clientWidth);
      state.offset = Math.max(-width * 0.94, Math.min(width * 0.94, dx));
      calendarScroller.style.transform =
        "translate3d(" + state.offset + "px,0,0)";
    },
    { passive: false },
  );

  calendarScreen.addEventListener(
    "touchend",
    (event) => {
      const state = calendarSwipe;
      if (!state || !state.isTouch) return;
      const touch = calendarTouchById(
        event.changedTouches,
        state.touchIdentifier,
      );
      if (!touch) return;
      finishCalendarSwipeAt(touch.clientX);
    },
    { passive: true },
  );

  calendarScreen.addEventListener(
    "touchcancel",
    (event) => {
      const state = calendarSwipe;
      if (!state || !state.isTouch) return;
      const touch = calendarTouchById(
        event.changedTouches,
        state.touchIdentifier,
      );
      finishCalendarSwipeAt(touch ? touch.clientX : state.lastX, true);
    },
    { passive: true },
  );

  calendarScreen.addEventListener(
    "pointerdown",
    (event) => {
      if (
        event.pointerType === "touch" ||
        view === "all" ||
        !calendarGestureStartAllowed(event) ||
        !calendarScreen.classList.contains("active") ||
        calendarScreen.classList.contains("is-calendar-swiping") ||
        calendarScreen.classList.contains("is-view-settling") ||
        $("searchInput").value.trim() ||
        event.isPrimary === false ||
        (event.pointerType === "mouse" && event.button !== 0)
      )
        return;
      const now = performance.now();
      calendarSwipe = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        lastX: event.clientX,
        dragging: false,
        offset: 0,
        samples: [{ x: event.clientX, time: now }],
      };
    },
    { passive: true },
  );

  calendarScreen.addEventListener(
    "pointermove",
    (event) => {
      const state = calendarSwipe;
      if (!state || event.pointerId !== state.pointerId) return;
      const now = performance.now();
      state.lastX = event.clientX;
      state.samples.push({ x: event.clientX, time: now });
      state.samples = state.samples.filter((sample) => now - sample.time <= 180);
      const dx = event.clientX - state.startX;
      const dy = event.clientY - state.startY;
      if (!state.dragging) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        if (Math.abs(dy) > Math.abs(dx) * 1.15) {
          calendarSwipe = null;
          return;
        }
        state.dragging = true;
        calendarScreen.classList.add("is-calendar-swiping");
        calendarScroller.style.willChange = "transform";
        calendarScroller.setPointerCapture?.(event.pointerId);
      }
      event.preventDefault();
      const width = Math.max(1, calendarScroller.clientWidth);
      state.offset = Math.max(-width * 0.94, Math.min(width * 0.94, dx));
      calendarScroller.style.transform =
        "translate3d(" + state.offset + "px,0,0)";
    },
    { passive: false },
  );
  calendarScreen.addEventListener("pointerup", finishCalendarSwipe);
  calendarScreen.addEventListener("pointercancel", (event) =>
    finishCalendarSwipe(event, true),
  );
  calendarScreen.addEventListener("lostpointercapture", (event) =>
    finishCalendarSwipe(event, true),
  );

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
  // Keep long-running installed sessions correct across midnight.
  function refreshToday() {
    const now = new Date();
    if (dateKey(now) !== dateKey(today)) {
      today.setTime(now.getTime());
      renderAll();
    }
  }
  setInterval(refreshToday, 60000);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") refreshToday();
  });
  /* Local profile, time-zone preference, appearance, and calendar export */
  const settingsKey = "daymark-settings-v1";
  const deviceTimezone = () => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch (_) {
      return "UTC";
    }
  };
  const defaultSettings = {
    name: "",
    location: "",
    language: window.CalexI18n?.preference() || "auto",
    timezoneMode: "auto",
    timezone: deviceTimezone(),
    dark: !!(
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ),
  };
  let appSettings = {
    ...defaultSettings,
  };
  try {
    const saved = JSON.parse(appStorage.getItem(activeSettingsKey()) || "{}");
    if (saved && typeof saved === "object")
      appSettings = {
        ...defaultSettings,
        ...saved,
      };
  } catch (_) {}
  // Account-specific preferences may override a device's guest language.
  if (window.CalexI18n?.isPreference(appSettings.language))
    window.CalexI18n.setLanguage(appSettings.language);

  function saveAppSettings() {
    try {
      appSettings.updatedAt = Date.now();
      appStorage.setItem(activeSettingsKey(), JSON.stringify(appSettings));
      if (authUser) saveSettingsCloudNow();
      return true;
    } catch (_) {
      showToast("Could not save settings in this browser.");
      return false;
    }
  }

  function timezoneNames() {
    try {
      if (typeof Intl.supportedValuesOf === "function")
        return Intl.supportedValuesOf("timeZone");
    } catch (_) {}
    return [
      "UTC",
      "Europe/London",
      "Europe/Paris",
      "Europe/Berlin",
      "Europe/Madrid",
      "Europe/Rome",
      "Europe/Amsterdam",
      "Europe/Dublin",
      "Europe/Helsinki",
      "America/New_York",
      "America/Chicago",
      "America/Denver",
      "America/Los_Angeles",
      "America/Toronto",
      "America/Vancouver",
      "Asia/Dubai",
      "Asia/Kolkata",
      "Asia/Singapore",
      "Asia/Tokyo",
      "Asia/Seoul",
      "Australia/Perth",
      "Australia/Sydney",
      "Pacific/Auckland",
    ];
  }
  let allTimezones = timezoneNames();

  function renderProfile() {
    const t = (text) => window.CalexI18n?.translate(text) || text;
    const name = appSettings.name.trim() || t("Your name"),
      location = appSettings.location.trim() || t("Add your location");
    $("profileName").textContent = name;
    $("profileLocation").textContent = location;
    $("profileAvatar").textContent = appSettings.name.trim()
      ? appSettings.name
          .trim()
          .split(/\s+/)
          .slice(0, 2)
          .map((x) => x[0])
          .join("")
          .toUpperCase()
      : "A";
    $("settingsName").value = appSettings.name;
    $("settingsLocation").value = appSettings.location;
  }

  function currentTimezone() {
    return appSettings.timezoneMode === "manual" &&
      allTimezones.includes(appSettings.timezone)
      ? appSettings.timezone
      : deviceTimezone();
  }

  function timezoneDescription(tz) {
    const city =
      tz === "UTC" ? "UTC" : (tz.split("/").pop() || tz).replace(/_/g, " ");
    let longName = tz,
      offset = "";
    try {
      const parts = new Intl.DateTimeFormat(
        window.CalexI18n?.locale() || undefined,
        {
          timeZone: tz,
          timeZoneName: "long",
        },
      ).formatToParts(new Date());
      longName = parts.find((p) => p.type === "timeZoneName")?.value || tz;
      const offsetParts = new Intl.DateTimeFormat("en", {
        timeZone: tz,
        timeZoneName: "longOffset",
        hour: "2-digit",
      }).formatToParts(new Date());
      offset = offsetParts.find((p) => p.type === "timeZoneName")?.value || "";
      if (offset === "GMT") offset = "UTC+00:00";
      else if (offset.startsWith("GMT")) offset = "UTC" + offset.slice(3);
    } catch (_) {}
    return { city, longName, offset };
  }

  function renderTimezone() {
    const tz = currentTimezone();
    const zoneInfo = timezoneDescription(tz);
    const t = (text) => window.CalexI18n?.translate(text) || text;
    $("timezoneSummary").textContent =
      t(appSettings.timezoneMode === "auto" ? "Automatic" : "Manual") +
      " · " +
      zoneInfo.city +
      " · " +
      (zoneInfo.offset || zoneInfo.longName);
    $("timezoneAuto").setAttribute(
      "aria-pressed",
      String(appSettings.timezoneMode === "auto"),
    );
    $("timezoneManual").setAttribute(
      "aria-pressed",
      String(appSettings.timezoneMode === "manual"),
    );
    $("timezoneSearchWrap").hidden = appSettings.timezoneMode !== "manual";
    $("timezoneHelp").textContent =
      appSettings.timezoneMode === "auto"
        ? t("Using") +
          " " +
          tz +
          " (" +
          zoneInfo.longName +
          (zoneInfo.offset ? ", " + zoneInfo.offset : "") +
          "). " +
          t("This follows your device setting automatically.")
        : t("Selected:") +
          " " +
          tz +
          " (" +
          zoneInfo.longName +
          (zoneInfo.offset ? ", " + zoneInfo.offset : "") +
          "). " +
          t("Save to apply.") +
          " " +
          t("Existing event dates and times are not converted.");
    populateTimezoneOptions($("timezoneSearch").value || "");
  }

  function populateTimezoneOptions(query = "") {
    const root = $("timezoneResults"),
      q = query.trim().toLowerCase();
    const filtered = allTimezones
      .filter((z) => z.toLowerCase().replace(/_/g, " ").includes(q))
      .sort((a, b) => {
        const ap = a === appSettings.timezone ? -1 : 0,
          bp = b === appSettings.timezone ? -1 : 0;
        return ap - bp || a.localeCompare(b);
      })
      .slice(0, 80);
    root.innerHTML = "";
    if (!filtered.length) {
      const empty = document.createElement("p");
      empty.className = "timezone-no-results";
      empty.setAttribute(
        "data-i18n",
        "No matching time zones. Try a city or region name.",
      );
      empty.textContent = "No matching time zones. Try a city or region name.";
      root.replaceChildren(empty);
      window.CalexI18n?.refresh();
      return;
    }
    filtered.forEach((z) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className =
        "timezone-result" + (z === appSettings.timezone ? " selected" : "");
      b.setAttribute("role", "option");
      b.setAttribute("aria-selected", String(z === appSettings.timezone));
      const name = z.split("/").pop().replace(/_/g, " "),
        region = z.includes("/")
          ? z.slice(0, z.lastIndexOf("/")).replace(/_/g, " ")
          : translateUiText("Global");
      const localizedRegion = region
        .split(" ")
        .map((part) => translateUiText(part))
        .join(" ");
      b.innerHTML =
        '<span class="timezone-result-name">' +
        esc(name) +
        '</span><span class="timezone-result-region">' +
        esc(localizedRegion) +
        "</span>";
      b.addEventListener("click", () => {
        appSettings.timezone = z;
        populateTimezoneOptions($("timezoneSearch").value);
        const info = timezoneDescription(z);
        $("timezoneHelp").textContent =
          translateUiText("Selected:") +
          " " +
          z +
          " (" +
          info.longName +
          (info.offset ? ", " + info.offset : "") +
          "). " +
          translateUiText("Save to apply.") +
          " " +
          translateUiText("Existing event dates and times are not converted.");
      });
      root.appendChild(b);
    });
  }

  function openSettingsDetail(which) {
    const ids = {
      timezone: "timezoneDetail",
      language: "languageDetail",
      account: "accountDetail",
    };
    Object.entries(ids).forEach(([key, id]) => {
      const open = key === which && $(id).hidden;
      $(id).hidden = !open;
      const triggerId =
        key === "timezone"
          ? "timezoneToggle"
          : key === "language"
            ? "languageToggle"
            : "profileEdit";
      $(triggerId).setAttribute("aria-expanded", String(open));
    });
    if (which === "timezone" && !$("timezoneDetail").hidden) {
      renderTimezone();
    }
    if (which === "language" && !$("languageDetail").hidden) {
      renderLanguage();
    }
  }
  function populateLanguageOptions(query) {
    const results = $("languageResults");
    if (!results) return;
    const filter = String(query || "").trim().toLocaleLowerCase();
    const current = window.CalexI18n?.preference() || appSettings.language || "auto";
    const choices = [
      { code: "auto", label: window.CalexI18n?.translate("Auto", window.CalexI18n.language()) || "Auto", detail: window.CalexI18n?.translate("System settings", window.CalexI18n.language()) || "System settings" },
      ...Object.entries(window.CalexI18n?.languages || {}).map(([code, info]) => ({
        code, label: info.label, detail: info.locale
      }))
    ].filter((item) => {
      const searchable = (item.label + " " + item.detail + " " + item.code).toLocaleLowerCase();
      return !filter || searchable.includes(filter);
    });

    results.replaceChildren();
    if (!choices.length) {
      const empty = document.createElement("div");
      empty.className = "timezone-no-results";
      empty.textContent = window.CalexI18n?.translate("No matching languages.", window.CalexI18n.language()) || "No matching languages.";
      results.append(empty);
      return;
    }
    choices.forEach((item) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "timezone-result language-result" + (item.code === current ? " selected" : "");
      button.setAttribute("role", "option");
      button.setAttribute("aria-selected", String(item.code === current));
      button.dataset.language = item.code;
      const name = document.createElement("span");
      name.className = "timezone-result-name";
      name.textContent = item.label;
      const detail = document.createElement("span");
      detail.className = "timezone-result-region";
      detail.textContent = item.code === "auto"
        ? item.detail + " · " + (window.CalexI18n?.languageLabel(window.CalexI18n.language()) || "English")
        : item.detail;
      button.append(name, detail);
      button.addEventListener("click", () => {
        $("languageSearch").value = "";
        if (!window.CalexI18n?.setLanguage(item.code)) return;
        appSettings.language = window.CalexI18n.preference();
        renderLanguage();
        if (!saveAppSettings()) showToast("Could not save settings in this browser.");
        $("languageSearch").focus();
      });
      results.append(button);
    });
  }
  function renderLanguage() {
    const current = window.CalexI18n?.preference() || appSettings.language || "auto";
    $("languageSummary").textContent =
      window.CalexI18n?.languageLabel(current) || "Auto · System settings";
    $("languageToggle").setAttribute("aria-expanded", String(!$("languageDetail").hidden));
    populateLanguageOptions($("languageSearch")?.value || "");
  }
  $("profileEdit").addEventListener("click", () => {
    openSettingsDetail("account");
    $("settingsName").focus();
  });
  $("timezoneToggle").addEventListener("click", () =>
    openSettingsDetail("timezone"),
  );
  $("languageToggle").addEventListener("click", () => {
    openSettingsDetail("language");
  });
  $("languageSearch").addEventListener("input", () =>
    populateLanguageOptions($("languageSearch").value),
  );
  $("languageResults").addEventListener("keydown", (event) => {
    const options = [...$("languageResults").querySelectorAll("button[data-language]")];
    const currentIndex = options.indexOf(document.activeElement);
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const delta = event.key === "ArrowDown" ? 1 : -1;
      options[(currentIndex + delta + options.length) % options.length]?.focus();
    } else if (event.key === "Home") {
      event.preventDefault();
      options[0]?.focus();
    } else if (event.key === "End") {
      event.preventDefault();
      options[options.length - 1]?.focus();
    }
  });
  window.addEventListener("calex:language", () => {
    appSettings.language = window.CalexI18n?.preference() || appSettings.language || "auto";
    renderAll();
    renderAuth();
    renderProfile();
    renderTimezone();
    renderLanguage();
    if ($("modalBackdrop").classList.contains("open") && $("modalBackdrop").dataset.mode === "quick") {
      const raw = $("quickText").value.trim();
      if (raw) {
        showQuickPreview(parseNatural(raw), "Rule-based preview");
      } else {
        setQuickPreviewEmpty();
      }
    }
  });
  $("timezoneAuto").addEventListener("click", () => {
    appSettings.timezoneMode = "auto";
    appSettings.timezone = deviceTimezone();
    renderTimezone();
  });
  $("timezoneManual").addEventListener("click", () => {
    appSettings.timezoneMode = "manual";
    renderTimezone();
    $("timezoneSearch").focus();
  });
  $("timezoneSearch").addEventListener("input", () =>
    populateTimezoneOptions($("timezoneSearch").value),
  );
  $("saveTimezone").addEventListener("click", () => {
    if (
      appSettings.timezoneMode === "manual" &&
      !allTimezones.includes(appSettings.timezone)
    ) {
      showToast("Choose a time zone from the search results.");
      return;
    }
    if (appSettings.timezoneMode === "auto")
      appSettings.timezone = deviceTimezone();
    if (saveAppSettings()) {
      renderTimezone();
      showToast("Time zone preference saved");
    }
  });
  $("saveProfile").addEventListener("click", () => {
    appSettings.name = $("settingsName").value.trim();
    appSettings.location = $("settingsLocation").value.trim();
    if (saveAppSettings()) {
      renderProfile();
      showToast("Profile saved");
    }
  });

  function applyAppearance() {
    const enabled = !!appSettings.dark;
    document.querySelector(".app").classList.toggle("settings-dark", enabled);
    document.body.classList.toggle("settings-dark", enabled);
    $("appearanceToggle").setAttribute("aria-checked", String(enabled));
    $("appearanceSwitch").setAttribute("data-enabled", String(enabled));
    const appearanceText = window.CalexI18n?.translate("Dark appearance") || "Dark appearance";
    $("appearanceToggle").setAttribute(
      "aria-label",
      appearanceText + " " + (enabled
        ? (window.CalexI18n?.translate("on") || "on")
        : (window.CalexI18n?.translate("off") || "off")),
    );
    document.documentElement.style.colorScheme = enabled ? "dark" : "light";
    document.documentElement.style.backgroundColor = enabled ? "#101512" : "";
    document.body.style.background = enabled ? "#101512" : "";
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor)
      themeColor.setAttribute("content", enabled ? "#101512" : "#ffffff");
    document.documentElement.dataset.theme = enabled ? "dark" : "light";
    window.dispatchEvent(new CustomEvent("calex:theme", { detail: enabled }));
  }
  $("appearanceToggle").addEventListener("click", () => {
    appSettings.dark = !appSettings.dark;
    applyAppearance();
    if (!saveAppSettings())
      showToast("Appearance changed for this session, but could not be saved.");
  });
  $("goToday").addEventListener("click", () => {
    const n = new Date();
    selected = new Date(n.getFullYear(), n.getMonth(), n.getDate(), 12);
    cursor = new Date(selected);
    view = "month";
    renderAll();
  });
  $("syncNow").addEventListener("click", () => {
    syncFailToasted = false;
    saveCloudNow();
  });
  $("exportCalendar").addEventListener("click", () => {
    const text = window.CalexICS.build(events, {
      name: "Calex",
      timezone: currentTimezone(),
    });
    const blob = new Blob([text], { type: "text/calendar;charset=utf-8" }),
      url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = "calex-calendar.ics";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast("Exported " + events.length + " events");
  });
  $("importCalendar").addEventListener("click", () => $("importFile").click());
  $("importFile").addEventListener("change", async () => {
    const file = $("importFile").files[0];
    $("importFile").value = "";
    if (!file) return;
    if (file.size > 5 * 1024 * 1024)
      return showToast("That file is too large to import (5 MB max).");
    try {
      const parsed = window.CalexICS.parse(await file.text());
      if (!parsed.events.length)
        return showToast("No events found in that file.");
      const now = Date.now(),
        res = window.CalexICS.toCalexEvents(parsed.events, {
          tz: currentTimezone(),
          from: now - 30 * 86400000,
          to: now + 366 * 86400000,
          max: 1000,
        }),
        sig = (e) => [e.title, e.date, e.start].join("|").toLowerCase(),
        have = new Set(events.map(sig));
      let added = 0;
      res.events.forEach((e) => {
        if (!e.title || !validEventDate(e.date) || have.has(sig(e))) return;
        have.add(sig(e));
        events.push(
          touch({
            id: crypto.randomUUID(),
            ...e,
            done: false,
            tag: e.repeat !== "none" ? "Repeating" : e.start ? "Timed" : "",
          }),
        );
        added++;
      });
      if (added) {
        persist();
        renderAll();
      }
      const dup = res.events.length - added;
      showToast(
        added
          ? "Imported " +
              added +
              " event" +
              (added === 1 ? "" : "s") +
              (dup ? " · " + dup + " duplicates skipped" : "") +
              (res.truncated ? " · limit reached" : "")
          : "Nothing new to import.",
      );
    } catch (err) {
      console.error("Calex import failed", err);
      showToast("Couldn’t read that file. Is it a valid .ics calendar?");
    }
  });
  if (
    "serviceWorker" in navigator &&
    (location.protocol === "https:" ||
      location.hostname === "localhost" ||
      location.hostname === "127.0.0.1")
  ) {
    window.addEventListener(
      "load",
      () => {
        navigator.serviceWorker.register("./sw.js").catch(() => {
          // The app remains usable when service-worker registration is unavailable.
        });
      },
      {
        once: true,
      },
    );
  }

  window.Calex = {
    getAuthAccessToken: async () => {
      if (!supabaseClient) return "";
      const { data } = await supabaseClient.auth.getSession();
      return data?.session?.access_token || "";
    },
    isSignedIn: () => !!authUser,
    onDay,
    eventMarkup,
    bindEventActions,
    esc,
    dateKey,
    parseDate,
    addDays,
    categoryOf,
    occurs: eventOccurs,
    editEvent: openNormal,
    selected: () => new Date(selected),
    cursor: () => new Date(cursor),
    events: () => events.map((e) => ({ ...e })),
    calendarTasks: () => events.filter((event) => event.isTask).map((event) => ({ ...event })),
    updateCalendarTask: (id, patch) => {
      const event = events.find((item) => item.id === id && item.isTask);
      if (!event || !patch || typeof patch !== "object") return false;
      ["urgent", "important"].forEach((key) => {
        if (typeof patch[key] === "boolean") event[key] = patch[key];
      });
      touch(event);
      persist();
      renderAll();
      return true;
    },
    getView: () => view,
    storageAvailable: () => storageAvailable,
    syncStatus: () => ({ signedIn: !!authUser, state: syncState }),
    selectDate: (value) => {
      if (!validEventDate(value)) return;
      selected = parseDate(value);
      cursor = new Date(selected);
      if (view === "all") view = "month";
      switchScreen("calendar");
      renderAll();
    },
    setView: (value) => {
      if (!["month", "week", "all"].includes(value)) return;
      if (value !== "all" && view === "all") {
        selected = new Date(
          cursor.getFullYear(),
          cursor.getMonth(),
          Math.min(
            selected.getDate(),
            new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate(),
          ),
          12,
        );
      }
      view = value;
      switchScreen("calendar");
    },
    refresh: renderAll,
    switchScreen,
    newEvent: () => openNormal(),
    quickAdd: () => openModal("quick"),
    draftEvent: (draft) => {
      openNormal();
      $("eventForm").dataset.source = "puter-email";
      $("eventTitle").value = draft.title;
      $("eventDate").value = draft.date;
      $("eventStart").value = draft.start || "";
      $("eventEnd").value = draft.end || "";
      $("eventLocation").value = draft.location || "";
      $("eventDescription").value = draft.description || "";
      $("eventPeople").value = draft.people || "";
      $("eventNotes").value = draft.notes || "";
      $("eventCategory").value = ["personal", "work", "wellbeing"].includes(
        draft.category,
      )
        ? draft.category
        : "personal";
      $("eventRepeat").value = [
        "none",
        "daily",
        "weekly",
        "fortnightly",
        "monthly",
        "yearly",
      ].includes(draft.repeat)
        ? draft.repeat
        : "none";
      window.CalexI18n?.refresh();
    },
    showToast,
    validEventDate,
    validEventTimes,
    parseNatural,
  };
  initSupabase();
  renderAuth();
  renderProfile();
  renderTimezone();
  applyAppearance();
  renderAll();
})();

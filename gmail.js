(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const GMAIL_SCOPE = "https://www.googleapis.com/auth/gmail.readonly";
  const GMAIL_API = "https://gmail.googleapis.com/gmail/v1/users/me";
  const MAX_MESSAGES = 20;
  const MAX_BODY_CHARS = 12000;

  let accessToken = "";
  let tokenExpiresAt = 0;
  let tokenClient = null;
  let messages = [];
  let pendingConversion = null;
  let loading = false;
  let activeConversions = new Set();
  let activeFilter = "inbox";
  let nextPageToken = "";
  let hasMoreMessages = false;

  const emailScreen = $("emailScreen");
  const results = $("gmailEmails");
  const status = $("gmailStatus");
  const connectButton = $("gmailConnect");
  const refreshButton = $("gmailRefresh");
  const disconnectButton = $("gmailDisconnect");
  const searchInput = $("gmailSearch");
  const searchButton = $("gmailSearchButton");
  const setupHelp = $("gmailSetupHelp");

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
    disconnectButton.hidden = !hasToken();
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

  function requestAccessToken(prompt) {
    return new Promise((resolve, reject) => {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId(),
        scope: GMAIL_SCOPE,
        include_granted_scopes: true,
        callback: (response) => {
          if (response.error || !response.access_token) {
            reject(new Error(response.error_description || response.error || "Gmail access was not granted."));
            return;
          }
          accessToken = response.access_token;
          tokenExpiresAt = Date.now() + (Number(response.expires_in) || 3600) * 1000;
          resolve(response);
        },
        error_callback: (error) => {
          reject(new Error(error && error.message ? error.message : "Google's authorization window was closed."));
        },
      });
      tokenClient.requestAccessToken({ prompt: prompt || "consent" });
    });
  }

  function disconnectLocalState() {
    accessToken = "";
    tokenExpiresAt = 0;
    tokenClient = null;
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
    connectButton.disabled = true;
    setStatus("Opening Google consent…");
    try {
      await loadIdentityLibrary();
      await requestAccessToken("consent");
      renderControls();
      setStatus("Connected to Gmail. Loading your inbox…");
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
      disconnectLocalState();
      throw new Error("Gmail access has expired. Connect Gmail again to continue.");
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
      const params = new URLSearchParams();
      params.set("q", [filterQuery, query].filter(Boolean).join(" "));
      params.set("maxResults", String(MAX_MESSAGES));
      params.set("fields", "messages(id,threadId),nextPageToken,resultSizeEstimate");
      if (!reset && nextPageToken) params.set("pageToken", nextPageToken);
      const page = await gmailApi("/messages?" + params.toString());
      const ids = Array.isArray(page.messages) ? page.messages : [];
      const loaded = await Promise.all(ids.map(async (item) => {
        const metadata = new URLSearchParams();
        metadata.set("format", "metadata");
        metadata.append("metadataHeaders", "From");
        metadata.append("metadataHeaders", "Subject");
        metadata.append("metadataHeaders", "Date");
        metadata.set("fields", "id,threadId,internalDate,snippet,labelIds,payload(headers,mimeType)");
        const data = await gmailApi("/messages/" + encodeURIComponent(item.id) + "?" + metadata.toString());
        return {
          id: data.id,
          threadId: data.threadId || item.threadId || "",
          from: headerValue(data.payload && data.payload.headers, "From") || "Unknown sender",
          subject: headerValue(data.payload && data.payload.headers, "Subject") || "(No subject)",
          date: headerValue(data.payload && data.payload.headers, "Date"),
          internalDate: Number(data.internalDate) || 0,
          snippet: String(data.snippet || ""),
          labelIds: Array.isArray(data.labelIds) ? data.labelIds : [],
        };
      }));
      const existingIds = new Set(messages.map((message) => message.id));
      const uniqueLoaded = loaded.filter((message) => message && message.id && !existingIds.has(message.id));
      messages = (reset ? uniqueLoaded : messages.concat(uniqueLoaded)).sort((a, b) => b.internalDate - a.internalDate);
      nextPageToken = page.nextPageToken || "";
      hasMoreMessages = !!nextPageToken;
      renderMessages();
      setStatus(messages.length
        ? "Showing " + messages.length + " email" + (messages.length === 1 ? "" : "s") + (hasMoreMessages ? ". Scroll down to load more." : ". All matching messages loaded.")
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
    const hint = $("gmailLoadMore");
    if (!hint) return;
    hint.hidden = !hasToken() || (!loading && !hasMoreMessages);
    if (loading) {
      hint.innerHTML = '<span class="gmail-spinner" aria-hidden="true"></span><span>' +
        (messages.length ? "Loading more emails…" : "Loading emails…") + "</span>";
    } else {
      hint.textContent = hasMoreMessages ? "Scroll to load more" : "";
    }
  }

  function renderMessages() {
    results.replaceChildren();
    if (!messages.length) {
      const empty = document.createElement("div");
      empty.className = "gmail-empty-state";
      const heading = document.createElement("strong");
      heading.textContent = hasToken() ? "No matching messages" : "Connect Gmail to get started";
      const detail = document.createElement("p");
      detail.textContent = hasToken()
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
      card.setAttribute("aria-label", "Email from " + email.from + ": " + email.subject);

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
      const openMessage = document.createElement("a");
      openMessage.className = "gmail-open-message";
      openMessage.href = "https://mail.google.com/mail/u/0/#all/" + encodeURIComponent(email.id);
      openMessage.target = "_blank";
      openMessage.rel = "noopener noreferrer";
      openMessage.textContent = "Open in Gmail";
      openMessage.dataset.i18n = "Open in Gmail";
      actions.append(openMessage, makeEvent);
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
    const data = await gmailApi(
      "/messages/" + encodeURIComponent(email.id) + "?format=full",
    );
    const body = extractBody(data.payload).slice(0, MAX_BODY_CHARS);
    return {
      subject: email.subject,
      from: email.from,
      date: email.date,
      snippet: email.snippet,
      body,
    };
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
      const emailContent = await getMessageBody(email);
      if (!emailContent.body && !emailContent.snippet) {
        setStatus("This email has no readable message text. Try another email.", true);
        return;
      }
      const extracted = await window.CalexPuter.convertEmailToEvent({
        ...emailContent,
        preferredDate: "",
      });
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
  window.addEventListener("calex:screen", (event) => {
    if (event.detail !== "email") return;
    renderControls();
    if (hasToken() && !loading) loadMessages();
    else if (!hasToken() && clientId()) setStatus("Connect Gmail to view your inbox.");
  });
  document.querySelectorAll("[data-gmail-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.gmailFilter;
      renderControls();
      if (hasToken()) loadMessages();
    });
  });
  connectButton.addEventListener("click", connectGmail);
  refreshButton.addEventListener("click", loadMessages);
  searchButton.addEventListener("click", loadMessages);
  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      loadMessages();
    }
  });
  disconnectButton.addEventListener("click", () => {
    if (accessToken && window.google && window.google.accounts && window.google.accounts.oauth2) {
      try {
        window.google.accounts.oauth2.revoke(accessToken, () => {});
      } catch (_) {}
    }
    disconnectLocalState();
    setStatus("Gmail disconnected. No email access token is stored by Calex.");
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
  const loadMoreSentinel = $("gmailLoadMore");
  if (loadMoreSentinel && "IntersectionObserver" in window) {
    const loadObserver = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting) && hasToken() && hasMoreMessages && !loading) {
        loadMessages(false);
      }
    }, { root: emailScreen, rootMargin: "0px 0px 180px 0px" });
    loadObserver.observe(loadMoreSentinel);
  }

  window.addEventListener("calex:language", () => {
    if (emailScreen.classList.contains("active")) renderMessages();
  });

  renderControls();
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
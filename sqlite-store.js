/* Browser-side SQLite mirror/fallback for Calex key-value data.
 * sql.js runs SQLite in WebAssembly; the database file is persisted in IndexedDB.
 * localStorage remains the fast primary store when available.
 */
(function () {
  "use strict";
  const DB_NAME = "calex-sqlite-fallback-v1";
  const DB_STORE = "files";
  const DB_KEY = "calex";
  let db = null;
  let writeQueue = Promise.resolve();

  function openFileStore() {
    return new Promise((resolve, reject) => {
      if (!("indexedDB" in window)) return reject(new Error("IndexedDB unavailable"));
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(DB_STORE))
          request.result.createObjectStore(DB_STORE);
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("Could not open IndexedDB"));
    });
  }

  function readFile(store) {
    return new Promise((resolve, reject) => {
      const request = store.transaction(DB_STORE, "readonly").objectStore(DB_STORE).get(DB_KEY);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error || new Error("Could not read SQLite database"));
    });
  }

  function writeFile(store, bytes) {
    return new Promise((resolve, reject) => {
      const tx = store.transaction(DB_STORE, "readwrite");
      tx.objectStore(DB_STORE).put(bytes, DB_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error("Could not persist SQLite database"));
      tx.onabort = () => reject(tx.error || new Error("SQLite persistence was aborted"));
    });
  }

  function loadSqlJs() {
    if (typeof window.initSqlJs === "function") return Promise.resolve(window.initSqlJs);
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      const timeout = setTimeout(() => {
        script.remove();
        reject(new Error("SQLite engine timed out"));
      }, 7000);
      script.src = "https://cdn.jsdelivr.net/npm/sql.js@1.15.1/dist/sql-wasm-inline.js";
      script.async = true;
      script.onload = () => {
        clearTimeout(timeout);
        typeof window.initSqlJs === "function"
          ? resolve(window.initSqlJs)
          : reject(new Error("SQLite engine did not initialise"));
      };
      script.onerror = () => {
        clearTimeout(timeout);
        script.remove();
        reject(new Error("SQLite engine could not be loaded"));
      };
      document.head.appendChild(script);
    });
  }

  function getValue(key) {
    const statement = db.prepare("SELECT value FROM storage WHERE key = ?");
    try {
      statement.bind([String(key)]);
      return statement.step() ? statement.getAsObject().value : null;
    } finally {
      statement.free();
    }
  }

  function saveDatabase() {
    if (!db || !window.CalexSQLiteFileStore) return Promise.resolve();
    const exported = db.export();
    const bytes = exported.buffer.slice(
      exported.byteOffset,
      exported.byteOffset + exported.byteLength,
    );
    writeQueue = writeQueue
      .catch(() => {})
      .then(() => writeFile(window.CalexSQLiteFileStore, bytes));
    return writeQueue;
  }

  function putValue(key, value) {
    const statement = db.prepare(
      "INSERT INTO storage(key, value) VALUES(?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    );
    try {
      statement.run([String(key), String(value)]);
    } finally {
      statement.free();
    }
    saveDatabase().catch(() => {});
  }

  function deleteValue(key) {
    const statement = db.prepare("DELETE FROM storage WHERE key = ?");
    try {
      statement.run([String(key)]);
    } finally {
      statement.free();
    }
    saveDatabase().catch(() => {});
  }

  const ready = (async () => {
    try {
      const initSqlJs = await loadSqlJs();
      const SQL = await initSqlJs();
      const fileStore = await openFileStore();
      window.CalexSQLiteFileStore = fileStore;
      const saved = await readFile(fileStore);
      db = saved ? new SQL.Database(new Uint8Array(saved)) : new SQL.Database();
      db.run("CREATE TABLE IF NOT EXISTS storage (key TEXT PRIMARY KEY, value TEXT NOT NULL)");

      // When localStorage is available, it is authoritative and refreshes the mirror.
      let localStorageWorks = false;
      try {
        const probe = "__calex_sqlite_probe__";
        window.localStorage.setItem(probe, "1");
        window.localStorage.removeItem(probe);
        localStorageWorks = true;
      } catch (_) {}
      if (localStorageWorks) {
        db.run("DELETE FROM storage");
        try {
          for (let i = 0; i < window.localStorage.length; i++) {
            const key = window.localStorage.key(i);
            if (key !== null) {
              const value = window.localStorage.getItem(key);
              if (value !== null) {
                const statement = db.prepare(
                  "INSERT OR REPLACE INTO storage(key, value) VALUES(?, ?)",
                );
                try {
                  statement.run([key, value]);
                } finally {
                  statement.free();
                }
              }
            }
          }
        } catch (_) {}
      }
      await saveDatabase();
      const api = {
        available: true,
        getItem: (key) => getValue(key),
        setItem: (key, value) => putValue(key, value),
        removeItem: (key) => deleteValue(key),
        flush: saveDatabase,
      };
      window.CalexSQLite = api;
      return api;
    } catch (error) {
      window.CalexSQLiteError = error?.message || "SQLite fallback unavailable";
      return null;
    }
  })();

  window.CalexSQLiteReady = ready;
  window.addEventListener("pagehide", () => {
    saveDatabase().catch(() => {});
  });
})();

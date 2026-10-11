/*
 * Calex sync merge: pure functions, no network or storage.
 * The app feeds in what it has locally plus what the server returned, and gets
 * back the merged list and exactly what to push or delete. Because it is pure,
 * the rules that protect user data are unit-tested (tests/sync.unit.js).
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module && module.exports)
    module.exports = api;
  else root.CalexSync = api;
})(typeof self !== "undefined" ? self : globalThis, function () {
  "use strict";

  const stamp = (e) => Number(e && e.updatedAt) || 0;
  const canon = (v) =>
    Array.isArray(v)
      ? v.map(canon)
      : v && typeof v === "object"
        ? Object.keys(v)
            .sort()
            .reduce((o, k) => ((o[k] = canon(v[k])), o), {})
        : v;
  const sameContent = (a, b) => {
    const strip = (e) => {
      const { updatedAt, ...rest } = e || {};
      return JSON.stringify(canon(rest));
    };
    return strip(a) === strip(b);
  };

  /**
   * @param {object} p
   * @param {object[]} p.local       events held on this device
   * @param {{id:string,data:object,ts:number}[]} p.remote  rows from the server
   * @param {Object<string,number>} p.tombstones  ids deleted here, with deletion time
   * @param {string[]} p.syncedIds   ids the server had at the last successful sync
   * @param {number} p.lastSyncAt    when that sync's merge ran (device clock, ms)
   * @param {number} p.now
   * @returns {{events:object[], push:object[], remove:string[], clearTombstones:string[]}}
   */
  function mergeEvents(p) {
    const local = p.local || [],
      remote = p.remote || [],
      tombs = p.tombstones || {},
      synced = new Set(p.syncedIds || []),
      lastSyncAt = p.lastSyncAt || 0,
      now = p.now || Date.now(),
      L = new Map(local.map((e) => [e.id, e])),
      R = new Set(remote.map((r) => r.id)),
      out = new Map(),
      push = [],
      remove = [];

    remote.forEach((r) => {
      const l = L.get(r.id);
      if (tombs[r.id] !== undefined) {
        // Deleted here. Delete on the server too, unless it was edited elsewhere afterwards.
        if (r.ts > tombs[r.id]) out.set(r.id, r.data);
        else remove.push(r.id);
        return;
      }
      if (!l) return void out.set(r.id, r.data);
      let ls = stamp(l);
      if (!ls) {
        // Legacy event from before timestamps existed.
        if (sameContent(l, r.data)) return void out.set(r.id, r.data);
        const stamped = { ...l, updatedAt: now };
        out.set(r.id, stamped);
        return void push.push(stamped);
      }
      if (ls > r.ts) {
        out.set(r.id, l);
        push.push(l);
      } else out.set(r.id, ls === r.ts ? l : r.data);
    });

    local.forEach((l) => {
      if (R.has(l.id)) return;
      // Gone from the server. If we knew it there and have not touched it since,
      // another device deleted it. Anything else is new or edited here: keep and push.
      if (synced.has(l.id) && stamp(l) <= lastSyncAt) return;
      out.set(l.id, l);
      push.push(l);
    });

    return {
      events: [...out.values()],
      push,
      remove,
      clearTombstones: Object.keys(tombs),
    };
  }

  /** Newer settings win. Returns { adopt: object|null, push: boolean }. */
  function mergeSettings(local, remote) {
    if (!remote) return { adopt: null, push: true };
    const ls = stamp(local),
      rs = stamp(remote);
    if (rs > ls) return { adopt: remote, push: false };
    return { adopt: null, push: ls > rs };
  }

  return { mergeEvents, mergeSettings, sameContent };
});

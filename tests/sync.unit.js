// Run with: node --test tests/sync.unit.js
const test = require("node:test");
const assert = require("node:assert/strict");
const { mergeEvents, mergeSettings } = require("../sync.js");

const ev = (id, updatedAt, extra = {}) => ({ id, title: "T" + id, date: "2026-10-12", updatedAt, ...extra });
const row = (e) => ({ id: e.id, data: e, ts: e.updatedAt });
const ids = (list) => list.map((e) => e.id).sort();

test("a stale device never deletes events another device added", () => {
  // Remote has a and b. This device only knows a, and synced when only a existed.
  const a = ev("a", 100);
  const b = ev("b", 200);
  const r = mergeEvents({
    local: [a],
    remote: [row(a), row(b)],
    tombstones: {},
    syncedIds: ["a"],
    lastSyncAt: 150,
    now: 300,
  });
  assert.deepEqual(ids(r.events), ["a", "b"]);
  assert.deepEqual(r.remove, []);
  assert.deepEqual(r.push, []);
});

test("new local events are pushed", () => {
  const a = ev("a", 100);
  const c = ev("c", 400);
  const r = mergeEvents({ local: [a, c], remote: [row(a)], tombstones: {}, syncedIds: ["a"], lastSyncAt: 300, now: 500 });
  assert.deepEqual(ids(r.events), ["a", "c"]);
  assert.deepEqual(r.push.map((e) => e.id), ["c"]);
});

test("newer edit wins in either direction", () => {
  const localNewer = mergeEvents({
    local: [ev("a", 500, { title: "mine" })],
    remote: [row(ev("a", 400, { title: "theirs" }))],
    tombstones: {},
    syncedIds: ["a"],
    lastSyncAt: 300,
    now: 600,
  });
  assert.equal(localNewer.events[0].title, "mine");
  assert.deepEqual(localNewer.push.map((e) => e.id), ["a"]);

  const remoteNewer = mergeEvents({
    local: [ev("a", 400, { title: "mine" })],
    remote: [row(ev("a", 500, { title: "theirs" }))],
    tombstones: {},
    syncedIds: ["a"],
    lastSyncAt: 300,
    now: 600,
  });
  assert.equal(remoteNewer.events[0].title, "theirs");
  assert.deepEqual(remoteNewer.push, []);
});

test("a local delete is sent to the server and the marker is cleared", () => {
  const a = ev("a", 100);
  const r = mergeEvents({ local: [], remote: [row(a)], tombstones: { a: 200 }, syncedIds: ["a"], lastSyncAt: 150, now: 300 });
  assert.deepEqual(r.events, []);
  assert.deepEqual(r.remove, ["a"]);
  assert.deepEqual(r.clearTombstones, ["a"]);
});

test("an edit made elsewhere after a local delete brings the event back", () => {
  const edited = ev("a", 250, { title: "edited elsewhere" });
  const r = mergeEvents({ local: [], remote: [row(edited)], tombstones: { a: 200 }, syncedIds: ["a"], lastSyncAt: 150, now: 300 });
  assert.deepEqual(ids(r.events), ["a"]);
  assert.deepEqual(r.remove, []);
});

test("an event deleted on another device is dropped here if untouched", () => {
  const a = ev("a", 100);
  const r = mergeEvents({ local: [a], remote: [], tombstones: {}, syncedIds: ["a"], lastSyncAt: 150, now: 300 });
  assert.deepEqual(r.events, []);
  assert.deepEqual(r.push, []);
});

test("but a local edit made after the last sync survives a remote delete", () => {
  const a = ev("a", 200);
  const r = mergeEvents({ local: [a], remote: [], tombstones: {}, syncedIds: ["a"], lastSyncAt: 150, now: 300 });
  assert.deepEqual(ids(r.events), ["a"]);
  assert.deepEqual(r.push.map((e) => e.id), ["a"]);
});

test("legacy events without timestamps: identical content defers to the server", () => {
  const legacy = { id: "a", title: "Same", date: "2026-10-12" };
  const r = mergeEvents({ local: [legacy], remote: [row({ ...legacy, updatedAt: 90 })], tombstones: {}, syncedIds: [], lastSyncAt: 0, now: 300 });
  assert.deepEqual(r.push, []);
  assert.equal(r.events.length, 1);
});

test("legacy events without timestamps: differing content is kept and pushed", () => {
  const legacy = { id: "a", title: "Edited offline", date: "2026-10-12" };
  const r = mergeEvents({ local: [legacy], remote: [row({ id: "a", title: "Old", date: "2026-10-12", updatedAt: 90 })], tombstones: {}, syncedIds: [], lastSyncAt: 0, now: 300 });
  assert.equal(r.events[0].title, "Edited offline");
  assert.equal(r.events[0].updatedAt, 300);
  assert.deepEqual(r.push.map((e) => e.id), ["a"]);
});

test("first sync on a new device pulls everything and pushes nothing", () => {
  const remote = [ev("a", 100), ev("b", 200)].map(row);
  const r = mergeEvents({ local: [], remote, tombstones: {}, syncedIds: [], lastSyncAt: 0, now: 300 });
  assert.deepEqual(ids(r.events), ["a", "b"]);
  assert.deepEqual(r.push, []);
});

test("settings: newer wins, missing remote is pushed", () => {
  assert.deepEqual(mergeSettings({ updatedAt: 5 }, null), { adopt: null, push: true });
  assert.deepEqual(mergeSettings({ updatedAt: 5 }, { updatedAt: 9 }), { adopt: { updatedAt: 9 }, push: false });
  assert.deepEqual(mergeSettings({ updatedAt: 9 }, { updatedAt: 5 }), { adopt: null, push: true });
  assert.deepEqual(mergeSettings({ updatedAt: 5 }, { updatedAt: 5 }), { adopt: null, push: false });
});

// Run with: node --test tests/ics.unit.js
const test = require("node:test");
const assert = require("node:assert/strict");
const ICS = require("../ics.js");

const win = (from, to, tz = "Europe/London") => ({
  tz,
  from: Date.UTC(...from),
  to: Date.UTC(...to),
});
const cal = (...vevents) =>
  "BEGIN:VCALENDAR\r\nVERSION:2.0\r\n" +
  vevents.map((v) => "BEGIN:VEVENT\r\nUID:" + v.uid + "\r\n" + v.lines.join("\r\n") + "\r\nEND:VEVENT\r\n").join("") +
  "END:VCALENDAR\r\n";
const dates = (occs) => occs.map((o) => o.date);
const run = (vevents, w) => ICS.expand(ICS.parse(cal(...vevents)).events, w);

test("all-day multi-day event treats DTEND as exclusive", () => {
  const o = run(
    [{ uid: "a", lines: ["SUMMARY:Trip", "DTSTART;VALUE=DATE:20261012", "DTEND;VALUE=DATE:20261015"] }],
    win([2026, 9, 1], [2026, 10, 30]),
  );
  assert.equal(o.length, 1);
  assert.equal(o[0].date, "2026-10-12");
  assert.equal(o[0].endDate, "2026-10-14");
  assert.equal(o[0].allDay, true);
});

test("UTC times are converted into the target zone", () => {
  const o = run(
    [{ uid: "u", lines: ["SUMMARY:Call", "DTSTART:20261012T080000Z", "DTEND:20261012T090000Z"] }],
    win([2026, 9, 1], [2026, 10, 30]),
  );
  assert.equal(o[0].start, "09:00"); // London is on BST (UTC+1) until 25 Oct
  assert.equal(o[0].end, "10:00");
});

test("floating times are left alone", () => {
  const o = run(
    [{ uid: "f", lines: ["SUMMARY:Lunch", "DTSTART:20261012T090000", "DTEND:20261012T100000"] }],
    win([2026, 9, 1], [2026, 10, 30], "Asia/Tokyo"),
  );
  assert.equal(o[0].start, "09:00");
});

test("overnight timed events report an end date", () => {
  const o = run(
    [{ uid: "n", lines: ["SUMMARY:Party", "DTSTART:20261012T220000", "DTEND:20261013T020000"] }],
    win([2026, 9, 1], [2026, 10, 30]),
  );
  assert.equal(o[0].start, "22:00");
  assert.equal(o[0].end, "02:00");
  assert.equal(o[0].endDate, "2026-10-13");
});

test("weekly BYDAY with COUNT", () => {
  const o = run(
    [{ uid: "w", lines: ["SUMMARY:Gym", "DTSTART:20261012T180000", "RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR;COUNT=5"] }],
    win([2026, 9, 1], [2026, 11, 30]),
  );
  assert.deepEqual(dates(o), ["2026-10-12", "2026-10-14", "2026-10-16", "2026-10-19", "2026-10-21"]);
});

test("every other week skips the in-between weeks", () => {
  const o = run(
    [{ uid: "b", lines: ["SUMMARY:Bins", "DTSTART;VALUE=DATE:20261012", "RRULE:FREQ=WEEKLY;INTERVAL=2;COUNT=3"] }],
    win([2026, 9, 1], [2026, 11, 30]),
  );
  assert.deepEqual(dates(o), ["2026-10-12", "2026-10-26", "2026-11-09"]);
});

test("monthly second Tuesday and last Friday", () => {
  const second = run(
    [{ uid: "m1", lines: ["SUMMARY:Club", "DTSTART;VALUE=DATE:20261013", "RRULE:FREQ=MONTHLY;BYDAY=2TU;COUNT=3"] }],
    win([2026, 9, 1], [2027, 1, 30]),
  );
  assert.deepEqual(dates(second), ["2026-10-13", "2026-11-10", "2026-12-08"]);
  const last = run(
    [{ uid: "m2", lines: ["SUMMARY:Drinks", "DTSTART;VALUE=DATE:20261030", "RRULE:FREQ=MONTHLY;BYDAY=-1FR;COUNT=3"] }],
    win([2026, 9, 1], [2027, 1, 30]),
  );
  assert.deepEqual(dates(last), ["2026-10-30", "2026-11-27", "2026-12-25"]);
});

test("last weekday of the month via BYSETPOS", () => {
  const o = run(
    [{ uid: "lw", lines: ["SUMMARY:Payroll", "DTSTART;VALUE=DATE:20261030", "RRULE:FREQ=MONTHLY;BYDAY=MO,TU,WE,TH,FR;BYSETPOS=-1;COUNT=3"] }],
    win([2026, 9, 1], [2027, 1, 30]),
  );
  assert.deepEqual(dates(o), ["2026-10-30", "2026-11-30", "2026-12-31"]);
});

test("yearly leap-day events skip non-leap years", () => {
  const o = run(
    [{ uid: "y", lines: ["SUMMARY:Leap", "DTSTART;VALUE=DATE:20240229", "RRULE:FREQ=YEARLY"] }],
    win([2024, 0, 1], [2029, 11, 31]),
  );
  assert.deepEqual(dates(o), ["2024-02-29", "2028-02-29"]);
});

test("EXDATE removes one occurrence", () => {
  const o = run(
    [{ uid: "x", lines: ["SUMMARY:Daily", "DTSTART;VALUE=DATE:20261012", "RRULE:FREQ=DAILY;COUNT=5", "EXDATE;VALUE=DATE:20261014"] }],
    win([2026, 9, 1], [2026, 10, 30]),
  );
  assert.deepEqual(dates(o), ["2026-10-12", "2026-10-13", "2026-10-15", "2026-10-16"]);
});

test("RECURRENCE-ID moves or cancels a single occurrence", () => {
  const master = {
    uid: "r",
    lines: ["SUMMARY:Standup", "DTSTART:20261012T090000", "DTEND:20261012T093000", "RRULE:FREQ=WEEKLY;COUNT=3"],
  };
  const moved = {
    uid: "r",
    lines: ["SUMMARY:Moved", "RECURRENCE-ID:20261019T090000", "DTSTART:20261020T100000", "DTEND:20261020T103000"],
  };
  const o = run([master, moved], win([2026, 9, 1], [2026, 11, 30]));
  assert.deepEqual(dates(o), ["2026-10-12", "2026-10-20", "2026-10-26"]);
  assert.equal(o[1].title, "Moved");
  assert.equal(o[1].start, "10:00");
  const cancelled = {
    uid: "r",
    lines: ["SUMMARY:x", "STATUS:CANCELLED", "RECURRENCE-ID:20261019T090000", "DTSTART:20261019T090000"],
  };
  assert.deepEqual(dates(run([master, cancelled], win([2026, 9, 1], [2026, 11, 30]))), ["2026-10-12", "2026-10-26"]);
});

test("a cancelled standalone event is dropped", () => {
  const o = run(
    [{ uid: "c", lines: ["SUMMARY:Nope", "STATUS:CANCELLED", "DTSTART;VALUE=DATE:20261012"] }],
    win([2026, 9, 1], [2026, 10, 30]),
  );
  assert.equal(o.length, 0);
});

test("repeating events follow the zone through daylight saving", () => {
  // 09:00 London, weekly. London clocks go back on 25 Oct 2026; New York's do not until 1 Nov.
  const o = run(
    [{ uid: "d", lines: ["SUMMARY:Sync", "DTSTART;TZID=Europe/London:20261019T090000", "DTEND;TZID=Europe/London:20261019T100000", "RRULE:FREQ=WEEKLY;COUNT=2"] }],
    win([2026, 9, 1], [2026, 11, 30], "America/New_York"),
  );
  assert.deepEqual(o.map((x) => x.start), ["04:00", "05:00"]);
});

test("Windows zone names are understood", () => {
  const o = run(
    [{ uid: "wz", lines: ["SUMMARY:Win", "DTSTART;TZID=GMT Standard Time:20261012T090000"] }],
    win([2026, 9, 1], [2026, 10, 30], "UTC"),
  );
  assert.equal(o[0].start, "08:00");
});

test("skipping ahead matches brute force for a long-running daily series", () => {
  const o = run(
    [{ uid: "long", lines: ["SUMMARY:Pill", "DTSTART;VALUE=DATE:20200101", "RRULE:FREQ=DAILY;INTERVAL=3"] }],
    win([2026, 9, 1], [2026, 9, 31]),
  );
  const start = Date.UTC(2020, 0, 1) / 86400000;
  const expected = [];
  for (let d = Date.UTC(2026, 9, 1) / 86400000; d <= Date.UTC(2026, 9, 31) / 86400000; d++)
    if ((d - start) % 3 === 0) expected.push(new Date(d * 86400000).toISOString().slice(0, 10));
  assert.deepEqual(dates(o), expected);
});

test("alarms and unknown properties are ignored; folded lines are joined", () => {
  const text =
    "BEGIN:VCALENDAR\r\nBEGIN:VEVENT\r\nUID:z\r\nSUMMARY:Long\r\n  title\r\nDTSTART;VALUE=DATE:20261012\r\nBEGIN:VALARM\r\nACTION:DISPLAY\r\nDESCRIPTION:ALARM\r\nEND:VALARM\r\nEND:VEVENT\r\nEND:VCALENDAR";
  const e = ICS.parse(text).events[0];
  assert.equal(e.summary, "Long title");
  assert.equal(e.description, undefined);
});

test("garbage input never throws", () => {
  assert.deepEqual(ICS.parse("not a calendar").events, []);
  assert.deepEqual(ICS.parse("").events, []);
});

test("import keeps simple series as series and expands the rest", () => {
  const parsed = ICS.parse(
    cal(
      { uid: "s", lines: ["SUMMARY:Weekly", "DTSTART:20261012T090000", "DTEND:20261012T100000", "RRULE:FREQ=WEEKLY"] },
      { uid: "c", lines: ["SUMMARY:Complex", "DTSTART:20261012T090000", "RRULE:FREQ=WEEKLY;BYDAY=MO,WE;COUNT=4"] },
      { uid: "o", lines: ["SUMMARY:Once", "DTSTART;VALUE=DATE:20261101"] },
    ),
  ).events;
  const r = ICS.toCalexEvents(parsed, { ...win([2026, 9, 1], [2027, 9, 1]) });
  assert.equal(r.series, 1);
  assert.equal(r.expanded, 4);
  const weekly = r.events.find((e) => e.title === "Weekly");
  assert.equal(weekly.repeat, "weekly");
  assert.equal(weekly.repeatInterval, 1);
  assert.equal(weekly.start, "09:00");
  assert.equal(r.events.filter((e) => e.title === "Complex").length, 4);
  assert.equal(r.events.find((e) => e.title === "Once").start, "");
});

test("import spreads multi-day events across their days", () => {
  const parsed = ICS.parse(
    cal({ uid: "t", lines: ["SUMMARY:Trip", "DTSTART;VALUE=DATE:20261012", "DTEND;VALUE=DATE:20261015"] }),
  ).events;
  const r = ICS.toCalexEvents(parsed, { ...win([2026, 9, 1], [2026, 10, 30]) });
  assert.deepEqual(r.events.map((e) => e.date), ["2026-10-12", "2026-10-13", "2026-10-14"]);
});

test("build writes repeats, escapes text and round-trips", () => {
  const out = ICS.build(
    [
      { id: "abc-1", title: "Lunch, with; friends", date: "2026-10-12", start: "12:30", end: "13:15", repeat: "fortnightly" },
      { id: "abc-2", title: "Holiday", date: "2026-10-12", repeat: "monthly", repeatUnit: "month", repeatInterval: 3 },
      { id: "bad", title: "No date", date: "" },
    ],
    { name: "Calex", timezone: "Europe/London" },
  );
  assert.match(out, /RRULE:FREQ=WEEKLY;INTERVAL=2/);
  assert.match(out, /RRULE:FREQ=MONTHLY;INTERVAL=3/);
  assert.match(out, /SUMMARY:Lunch\\, with\\; friends/);
  assert.match(out, /DTSTART:20261012T123000/);
  assert.match(out, /DTSTART;VALUE=DATE:20261012\r\nDTEND;VALUE=DATE:20261013/);
  assert.match(out, /X-WR-TIMEZONE:Europe\/London/);
  assert.ok(!out.includes("No date"));
  const back = ICS.parse(out);
  assert.equal(back.events.length, 2);
  assert.equal(back.events[0].summary, "Lunch, with; friends");
  assert.equal(back.name, "Calex");
});

test("build folds long lines at 75 octets without breaking characters", () => {
  const title = "é".repeat(120);
  const out = ICS.build([{ id: "f", title, date: "2026-10-12" }]);
  out.split("\r\n").forEach((l) => assert.ok(new TextEncoder().encode(l).length <= 75, l));
  assert.equal(ICS.parse(out).events[0].summary, title);
});

test("feed URLs are normalised and recognised", () => {
  assert.equal(ICS.normalizeFeedUrl("webcal://p01-caldav.icloud.com/published/2/abc"), "https://p01-caldav.icloud.com/published/2/abc");
  assert.equal(ICS.normalizeFeedUrl("  https://example.com/a.ics "), "https://example.com/a.ics");
  assert.equal(ICS.normalizeFeedUrl("http://example.com/a.ics"), "");
  assert.equal(ICS.normalizeFeedUrl("javascript:alert(1)"), "");
  assert.equal(ICS.normalizeFeedUrl(""), "");
  assert.equal(ICS.providerFromUrl("https://calendar.google.com/calendar/ical/x/basic.ics"), "google");
  assert.equal(ICS.providerFromUrl("https://outlook.office365.com/owa/calendar/x/reachcalendar.ics"), "outlook");
  assert.equal(ICS.providerFromUrl("webcal://p01-caldav.icloud.com/published/2/abc"), "apple");
  assert.equal(ICS.providerFromUrl("https://ticktick.com/webcal/abc.ics"), "ticktick");
  assert.equal(ICS.providerFromUrl("https://example.org/x.ics"), "other");
});

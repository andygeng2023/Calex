/*
 * Calex ICS engine: parse, expand recurrences, convert to Calex events, build.
 * One file shared by the browser app, the Node unit tests and the Edge Functions.
 * No dependencies. Works as a classic <script> (window.CalexICS), CommonJS, or a
 * side-effect import (globalThis.CalexICS).
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module && module.exports)
    module.exports = api;
  else root.CalexICS = api;
})(typeof self !== "undefined" ? self : globalThis, function () {
  "use strict";

  const DAY = 86400000;
  const WD = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
  const pad = (n, w = 2) => String(n).padStart(w, "0");
  const dn = (y, m, d) => Math.floor(Date.UTC(y, m - 1, d) / DAY);
  const fromDn = (n) => {
    const x = new Date(n * DAY);
    return { y: x.getUTCFullYear(), m: x.getUTCMonth() + 1, d: x.getUTCDate() };
  };
  const dim = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate();
  const wdOf = (y, m, d) => new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  const dkey = (y, m, d) => pad(y, 4) + "-" + pad(m) + "-" + pad(d);

  /* ---------- time zones ---------- */
  const WINDOWS_TZ = {
    "GMT Standard Time": "Europe/London",
    "Greenwich Standard Time": "Atlantic/Reykjavik",
    "W. Europe Standard Time": "Europe/Berlin",
    "Romance Standard Time": "Europe/Paris",
    "Central Europe Standard Time": "Europe/Budapest",
    "Central European Standard Time": "Europe/Warsaw",
    "GTB Standard Time": "Europe/Bucharest",
    "FLE Standard Time": "Europe/Kiev",
    "E. Europe Standard Time": "Europe/Chisinau",
    "Russian Standard Time": "Europe/Moscow",
    "Turkey Standard Time": "Europe/Istanbul",
    "Israel Standard Time": "Asia/Jerusalem",
    "Egypt Standard Time": "Africa/Cairo",
    "South Africa Standard Time": "Africa/Johannesburg",
    "Arabian Standard Time": "Asia/Dubai",
    "Arab Standard Time": "Asia/Riyadh",
    "India Standard Time": "Asia/Kolkata",
    "China Standard Time": "Asia/Shanghai",
    "Tokyo Standard Time": "Asia/Tokyo",
    "Korea Standard Time": "Asia/Seoul",
    "Singapore Standard Time": "Asia/Singapore",
    "W. Australia Standard Time": "Australia/Perth",
    "Cen. Australia Standard Time": "Australia/Adelaide",
    "E. Australia Standard Time": "Australia/Brisbane",
    "AUS Eastern Standard Time": "Australia/Sydney",
    "New Zealand Standard Time": "Pacific/Auckland",
    "Eastern Standard Time": "America/New_York",
    "Central Standard Time": "America/Chicago",
    "Mountain Standard Time": "America/Denver",
    "US Mountain Standard Time": "America/Phoenix",
    "Pacific Standard Time": "America/Los_Angeles",
    "Alaskan Standard Time": "America/Anchorage",
    "Hawaiian Standard Time": "Pacific/Honolulu",
    "Atlantic Standard Time": "America/Halifax",
    "Canada Central Standard Time": "America/Regina",
    "Mexico Standard Time": "America/Mexico_City",
    "SA Pacific Standard Time": "America/Bogota",
    "E. South America Standard Time": "America/Sao_Paulo",
    "Argentina Standard Time": "America/Argentina/Buenos_Aires",
    UTC: "UTC",
  };
  const dtfCache = {};
  function dtf(tz) {
    if (!dtfCache[tz])
      dtfCache[tz] = new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        hourCycle: "h23",
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
      });
    return dtfCache[tz];
  }
  function validTz(tz) {
    if (!tz || typeof tz !== "string") return false;
    try {
      dtf(tz);
      return true;
    } catch (_) {
      return false;
    }
  }
  function normTz(raw) {
    if (!raw) return "";
    let tz = String(raw).trim().replace(/^"|"$/g, "");
    if (validTz(tz)) return tz;
    if (WINDOWS_TZ[tz]) return WINDOWS_TZ[tz];
    const m = /([A-Za-z_]+\/[A-Za-z_+\-0-9]+(?:\/[A-Za-z_]+)?)$/.exec(tz);
    if (m && validTz(m[1])) return m[1];
    return "";
  }
  function partsInTz(ms, tz) {
    const p = {};
    dtf(tz)
      .formatToParts(new Date(ms))
      .forEach((x) => {
        if (x.type !== "literal") p[x.type] = Number(x.value);
      });
    return {
      y: p.year,
      m: p.month,
      d: p.day,
      hh: p.hour === 24 ? 0 : p.hour,
      mm: p.minute,
      ss: p.second,
    };
  }
  function offsetAt(ms, tz) {
    const s = Math.floor(ms / 1000) * 1000,
      p = partsInTz(s, tz);
    return Date.UTC(p.y, p.m - 1, p.d, p.hh, p.mm, p.ss) - s;
  }
  function wallToUtc(w, tz) {
    const guess = Date.UTC(w.y, w.m - 1, w.d, w.hh || 0, w.mm || 0, w.ss || 0);
    const off = offsetAt(guess, tz);
    let t = guess - off;
    const off2 = offsetAt(t, tz);
    if (off2 !== off) t = guess - off2;
    return t;
  }

  /* ---------- text helpers ---------- */
  const unescapeText = (v) =>
    String(v).replace(/\\([nN,;\\])/g, (_, c) => (c === "n" || c === "N" ? "\n" : c));
  const escapeText = (v) =>
    String(v == null ? "" : v)
      .replace(/\\/g, "\\\\")
      .replace(/\r?\n/g, "\\n")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;");
  function fold(line) {
    const enc = new TextEncoder();
    if (enc.encode(line).length <= 75) return line;
    const out = [];
    let cur = "",
      len = 0;
    for (const ch of line) {
      const l = enc.encode(ch).length;
      if (len + l > 75) {
        out.push(cur);
        cur = " " + ch;
        len = 1 + l;
      } else {
        cur += ch;
        len += l;
      }
    }
    out.push(cur);
    return out.join("\r\n");
  }

  /* ---------- parsing ---------- */
  function unfold(text) {
    return String(text)
      .replace(/^﻿/, "")
      .replace(/\r\n|\r/g, "\n")
      .replace(/\n[ \t]/g, "")
      .split("\n");
  }
  function splitUnquoted(s, sep) {
    const out = [];
    let cur = "",
      q = false;
    for (const c of s) {
      if (c === '"') q = !q;
      if (c === sep && !q) {
        out.push(cur);
        cur = "";
      } else cur += c;
    }
    out.push(cur);
    return out;
  }
  function parseLine(line) {
    let q = false,
      idx = -1;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') q = !q;
      else if (c === ":" && !q) {
        idx = i;
        break;
      }
    }
    if (idx < 1) return null;
    const parts = splitUnquoted(line.slice(0, idx), ";"),
      name = parts.shift().toUpperCase(),
      params = {};
    parts.forEach((p) => {
      const eq = p.indexOf("=");
      if (eq > 0)
        params[p.slice(0, eq).toUpperCase()] = p
          .slice(eq + 1)
          .replace(/^"|"$/g, "");
    });
    return { name, params, value: line.slice(idx + 1) };
  }
  function parseDt(value, params) {
    const v = String(value).trim();
    let m;
    if ((m = /^(\d{4})(\d{2})(\d{2})$/.exec(v)))
      return { allDay: true, y: +m[1], m: +m[2], d: +m[3], hh: 0, mm: 0, ss: 0 };
    if ((m = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})?(Z)?$/i.exec(v)))
      return {
        allDay: false,
        y: +m[1],
        m: +m[2],
        d: +m[3],
        hh: +m[4],
        mm: +m[5],
        ss: +(m[6] || 0),
        tzid: m[7] ? "UTC" : normTz(params && params.TZID),
      };
    return null;
  }
  function parseDuration(v) {
    const m = /^([+-])?P(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/i.exec(
      String(v).trim(),
    );
    if (!m) return 0;
    const ms =
      (+m[2] || 0) * 7 * DAY +
      (+m[3] || 0) * DAY +
      (+m[4] || 0) * 3600000 +
      (+m[5] || 0) * 60000 +
      (+m[6] || 0) * 1000;
    return m[1] === "-" ? -ms : ms;
  }
  function parseByDay(s) {
    const m = /^([+-]?\d{1,2})?(SU|MO|TU|WE|TH|FR|SA)$/i.exec(s.trim());
    return m
      ? { n: m[1] ? parseInt(m[1], 10) : 0, wd: WD.indexOf(m[2].toUpperCase()) }
      : null;
  }
  function parseRrule(v) {
    const r = {
      freq: "",
      interval: 1,
      count: 0,
      until: null,
      byday: [],
      bymonthday: [],
      bymonth: [],
      bysetpos: [],
      wkst: 1,
    };
    const nums = (val, lim) =>
      val
        .split(",")
        .map((x) => parseInt(x, 10))
        .filter((n) => n && Math.abs(n) <= lim);
    String(v)
      .split(";")
      .forEach((pair) => {
        const eq = pair.indexOf("=");
        if (eq < 1) return;
        const k = pair.slice(0, eq).toUpperCase(),
          val = pair.slice(eq + 1);
        if (k === "FREQ") r.freq = val.toUpperCase();
        else if (k === "INTERVAL") r.interval = Math.max(1, parseInt(val, 10) || 1);
        else if (k === "COUNT") r.count = Math.max(0, parseInt(val, 10) || 0);
        else if (k === "UNTIL") r.until = parseDt(val, {});
        else if (k === "BYDAY") r.byday = val.split(",").map(parseByDay).filter(Boolean);
        else if (k === "BYMONTHDAY") r.bymonthday = nums(val, 31);
        else if (k === "BYMONTH") r.bymonth = nums(val, 12).filter((n) => n > 0);
        else if (k === "BYSETPOS") r.bysetpos = nums(val, 366);
        else if (k === "WKST") {
          const i = WD.indexOf(val.toUpperCase().slice(0, 2));
          r.wkst = i < 0 ? 1 : i;
        }
      });
    return r;
  }
  /** Parse ICS text into { events, name, timezone }. Never throws on bad lines. */
  function parse(text) {
    const events = [];
    let cur = null,
      alarm = 0,
      name = "",
      timezone = "";
    unfold(text).forEach((ln) => {
      if (!ln) return;
      const up = ln.toUpperCase();
      if (up === "BEGIN:VEVENT") {
        cur = { exdates: [] };
        alarm = 0;
        return;
      }
      if (up === "END:VEVENT") {
        if (cur && cur.dtstart && cur.uid) events.push(cur);
        else if (cur && cur.dtstart) {
          cur.uid = "gen-" + events.length;
          events.push(cur);
        }
        cur = null;
        return;
      }
      if (up === "BEGIN:VALARM") return void alarm++;
      if (up === "END:VALARM") return void (alarm = Math.max(0, alarm - 1));
      const p = parseLine(ln);
      if (!p) return;
      if (!cur) {
        if (p.name === "X-WR-CALNAME") name = unescapeText(p.value);
        else if (p.name === "X-WR-TIMEZONE") timezone = normTz(p.value);
        return;
      }
      if (alarm) return;
      switch (p.name) {
        case "UID":
          cur.uid = p.value.trim();
          break;
        case "SUMMARY":
          cur.summary = unescapeText(p.value);
          break;
        case "DESCRIPTION":
          cur.description = unescapeText(p.value);
          break;
        case "LOCATION":
          cur.location = unescapeText(p.value);
          break;
        case "STATUS":
          cur.status = p.value.trim().toUpperCase();
          break;
        case "DTSTART":
          cur.dtstart = parseDt(p.value, p.params);
          break;
        case "DTEND":
          cur.dtend = parseDt(p.value, p.params);
          break;
        case "DURATION":
          cur.duration = parseDuration(p.value);
          break;
        case "RRULE":
          cur.rrule = parseRrule(p.value);
          break;
        case "EXDATE":
          p.value.split(",").forEach((v) => {
            const d = parseDt(v, p.params);
            if (d) cur.exdates.push(d);
          });
          break;
        case "RECURRENCE-ID":
          cur.recurrenceId = parseDt(p.value, p.params);
          break;
        default:
      }
    });
    return { events, name, timezone };
  }

  /* ---------- recurrence ---------- */
  function monthDays(rule, y, m, defDay) {
    const n = dim(y, m);
    let days = [];
    if (rule.bymonthday.length) {
      rule.bymonthday.forEach((v) => {
        const d = v > 0 ? v : n + 1 + v;
        if (d >= 1 && d <= n) days.push(d);
      });
      if (rule.byday.length) {
        const wds = rule.byday.map((b) => b.wd);
        days = days.filter((d) => wds.includes(wdOf(y, m, d)));
      }
    } else if (rule.byday.length) {
      rule.byday.forEach((b) => {
        const all = [];
        for (let d = 1; d <= n; d++) if (wdOf(y, m, d) === b.wd) all.push(d);
        if (!b.n) days.push(...all);
        else {
          const i = b.n > 0 ? b.n - 1 : all.length + b.n;
          if (all[i] !== undefined) days.push(all[i]);
        }
      });
    } else if (defDay <= n) days.push(defDay);
    days = [...new Set(days)].sort((a, b) => a - b);
    if (rule.bysetpos.length && days.length) {
      const picked = rule.bysetpos
        .map((p) => days[p > 0 ? p - 1 : days.length + p])
        .filter((x) => x !== undefined);
      days = [...new Set(picked)].sort((a, b) => a - b);
    }
    return days;
  }
  /** Candidate dates {y,m,d} for a rule between two day numbers (inclusive window). */
  function genDates(rule, st, winFrom, winTo, cap) {
    const out = [],
      startDn = dn(st.y, st.m, st.d),
      untilDn = rule.until ? dn(rule.until.y, rule.until.m, rule.until.d) + 1 : Infinity,
      ITER = 20000;
    let count = 0,
      done = false;
    const emit = (y, m, d) => {
      const x = dn(y, m, d);
      if (x < startDn || (x === startDn && count > 0)) return;
      if (x > untilDn || x > winTo) {
        done = true;
        return;
      }
      count++;
      if (rule.count && count > rule.count) {
        done = true;
        return;
      }
      if (x >= winFrom) out.push({ y, m, d });
      if (out.length >= cap) done = true;
    };
    emit(st.y, st.m, st.d);
    if (done) return out;
    const monthOk = (m) => !rule.bymonth.length || rule.bymonth.includes(m);
    const skipAhead = !rule.count && winFrom > startDn;
    if (rule.freq === "DAILY") {
      const k0 = skipAhead ? Math.max(0, Math.floor((winFrom - startDn) / rule.interval) - 1) : 0;
      for (let k = k0, i = 0; !done && i < ITER; k++, i++) {
        const x = startDn + k * rule.interval;
        if (x > winTo || x > untilDn) break;
        const c = fromDn(x);
        if (!monthOk(c.m)) continue;
        if (rule.byday.length && !rule.byday.some((b) => b.wd === wdOf(c.y, c.m, c.d))) continue;
        if (
          rule.bymonthday.length &&
          !rule.bymonthday.some((v) => (v > 0 ? v : dim(c.y, c.m) + 1 + v) === c.d)
        )
          continue;
        emit(c.y, c.m, c.d);
      }
    } else if (rule.freq === "WEEKLY") {
      const swd = wdOf(st.y, st.m, st.d),
        ws0 = startDn - ((swd - rule.wkst + 7) % 7),
        wds = rule.byday.length ? rule.byday.map((b) => b.wd) : [swd],
        order = [...new Set(wds)].sort(
          (a, b) => ((a - rule.wkst + 7) % 7) - ((b - rule.wkst + 7) % 7),
        ),
        span = 7 * rule.interval,
        k0 = skipAhead ? Math.max(0, Math.floor((winFrom - ws0) / span) - 1) : 0;
      for (let k = k0, i = 0; !done && i < ITER; k++, i++) {
        const base = ws0 + span * k;
        if (base > winTo || base > untilDn) break;
        for (const wd of order) {
          const c = fromDn(base + ((wd - rule.wkst + 7) % 7));
          if (!monthOk(c.m)) continue;
          emit(c.y, c.m, c.d);
          if (done) break;
        }
      }
    } else if (rule.freq === "MONTHLY") {
      const sIdx = st.y * 12 + st.m - 1;
      let k0 = 0;
      if (skipAhead) {
        const w = fromDn(winFrom);
        k0 = Math.max(0, Math.floor((w.y * 12 + w.m - 1 - sIdx) / rule.interval) - 1);
      }
      for (let k = k0, i = 0; !done && i < ITER; k++, i++) {
        const idx = sIdx + k * rule.interval,
          y = Math.floor(idx / 12),
          m = (idx % 12) + 1,
          first = dn(y, m, 1);
        if (first > winTo || first > untilDn) break;
        if (!monthOk(m)) continue;
        for (const d of monthDays(rule, y, m, st.d)) {
          emit(y, m, d);
          if (done) break;
        }
      }
    } else if (rule.freq === "YEARLY") {
      const months = (rule.bymonth.length ? [...rule.bymonth] : [st.m]).sort((a, b) => a - b),
        k0 = skipAhead
          ? Math.max(0, Math.floor((fromDn(winFrom).y - st.y) / rule.interval) - 1)
          : 0;
      for (let k = k0, i = 0; !done && i < ITER; k++, i++) {
        const y = st.y + k * rule.interval;
        if (dn(y, 1, 1) > winTo || dn(y, 1, 1) > untilDn) break;
        for (const m of months)
          for (const d of monthDays(rule, y, m, st.d)) {
            emit(y, m, d);
            if (done) break;
          }
      }
    }
    return out;
  }

  function baseInfo(ev, tz) {
    const s = ev.dtstart;
    if (!s) return null;
    if (s.allDay) {
      let span = 1;
      if (ev.dtend && ev.dtend.allDay)
        span = Math.max(1, dn(ev.dtend.y, ev.dtend.m, ev.dtend.d) - dn(s.y, s.m, s.d));
      else if (ev.duration) span = Math.max(1, Math.round(ev.duration / DAY));
      return { allDay: true, span };
    }
    const srcTz = s.tzid && validTz(s.tzid) ? s.tzid : tz,
      startUtc = wallToUtc(s, srcTz);
    let durMs = 0;
    if (ev.dtend && !ev.dtend.allDay) {
      const eTz = ev.dtend.tzid && validTz(ev.dtend.tzid) ? ev.dtend.tzid : srcTz;
      durMs = Math.max(0, wallToUtc(ev.dtend, eTz) - startUtc);
    } else if (ev.duration) durMs = Math.max(0, ev.duration);
    return { allDay: false, srcTz, durMs };
  }
  function occFor(ev, y, m, d, info, tz) {
    const base = {
      uid: ev.uid,
      title: ev.summary || "(No title)",
      description: ev.description || "",
      location: ev.location || "",
    };
    if (info.allDay) {
      const k = dkey(y, m, d),
        e = fromDn(dn(y, m, d) + info.span - 1);
      return {
        ...base,
        key: ev.uid + "@" + k,
        date: k,
        start: "",
        end: "",
        endDate: info.span > 1 ? dkey(e.y, e.m, e.d) : "",
        allDay: true,
        _k: k,
        _s: k,
        _e: info.span > 1 ? dkey(e.y, e.m, e.d) : k,
      };
    }
    const s = ev.dtstart,
      startMs = wallToUtc({ y, m, d, hh: s.hh, mm: s.mm, ss: s.ss }, info.srcTz),
      endMs = startMs + info.durMs,
      sp = partsInTz(startMs, tz),
      ep = partsInTz(endMs, tz),
      date = dkey(sp.y, sp.m, sp.d),
      endKey = dkey(ep.y, ep.m, ep.d);
    return {
      ...base,
      key: ev.uid + "@" + startMs,
      date,
      start: pad(sp.hh) + ":" + pad(sp.mm),
      end: info.durMs ? pad(ep.hh) + ":" + pad(ep.mm) : "",
      endDate: info.durMs && endKey !== date ? endKey : "",
      allDay: false,
      _k: startMs,
      _s: startMs,
      _e: endMs,
    };
  }
  const instKey = (dt, tz) => (dt.allDay ? dkey(dt.y, dt.m, dt.d) : wallToUtc(dt, dt.tzid && validTz(dt.tzid) ? dt.tzid : tz));

  /**
   * Expand parsed events into concrete occurrences inside [from, to] (epoch ms),
   * with times shown in `tz`. Handles RRULE, EXDATE, RECURRENCE-ID and CANCELLED.
   */
  function expand(events, opts) {
    const tz = validTz(opts.tz) ? opts.tz : "UTC",
      from = opts.from,
      to = opts.to,
      maxPer = opts.maxPerEvent || 2000,
      winFrom = Math.floor(from / DAY) - 2,
      winTo = Math.floor(to / DAY) + 2,
      fp = partsInTz(from, tz),
      tp = partsInTz(to, tz),
      fromKey = dkey(fp.y, fp.m, fp.d),
      toKey = dkey(tp.y, tp.m, tp.d),
      overrides = new Map(),
      consumed = new Set(),
      out = [];
    const inWindow = (o) =>
      o.allDay ? (o.endDate || o.date) >= fromKey && o.date <= toKey : o._s <= to && o._e >= from;
    events.forEach((e) => {
      if (e.recurrenceId && e.dtstart) overrides.set(e.uid + "|" + instKey(e.recurrenceId, tz), e);
    });
    const single = (ev) => {
      const info = baseInfo(ev, tz);
      return info ? occFor(ev, ev.dtstart.y, ev.dtstart.m, ev.dtstart.d, info, tz) : null;
    };
    events.forEach((ev) => {
      if (ev.recurrenceId || !ev.dtstart) return;
      if (ev.status === "CANCELLED") return;
      const info = baseInfo(ev, tz);
      if (!info) return;
      const s = ev.dtstart;
      if (!ev.rrule || !ev.rrule.freq) {
        const o = occFor(ev, s.y, s.m, s.d, info, tz);
        if (inWindow(o)) out.push(o);
        return;
      }
      const ex = new Set(ev.exdates.map((d) => instKey(d, tz)));
      let untilMs = Infinity;
      if (ev.rrule.until && !ev.rrule.until.allDay)
        untilMs = wallToUtc(ev.rrule.until, "UTC");
      genDates(ev.rrule, s, winFrom, winTo, maxPer).forEach((c) => {
        const o = occFor(ev, c.y, c.m, c.d, info, tz);
        if (!o.allDay && o._s > untilMs) return;
        if (ex.has(o._k)) return;
        const ov = overrides.get(ev.uid + "|" + o._k);
        if (ov) {
          consumed.add(ev.uid + "|" + o._k);
          if (ov.status === "CANCELLED") return;
          const oo = single(ov);
          if (oo && inWindow(oo)) out.push(oo);
          return;
        }
        if (inWindow(o)) out.push(o);
      });
    });
    overrides.forEach((ov, k) => {
      if (consumed.has(k) || ov.status === "CANCELLED") return;
      const o = single(ov);
      if (o && inWindow(o)) out.push(o);
    });
    out.sort((a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start));
    return out.map((o) => {
      const { _k, _s, _e, ...rest } = o;
      return rest;
    });
  }

  /* ---------- import into Calex events ---------- */
  const REPEAT_OF = { DAILY: ["daily", "day"], WEEKLY: ["weekly", "week"], MONTHLY: ["monthly", "month"], YEARLY: ["yearly", "year"] };
  function isSimpleSeries(ev, hasOverrides) {
    const r = ev.rrule;
    if (!r || !REPEAT_OF[r.freq] || r.count || r.until || ev.exdates.length || hasOverrides) return false;
    if (ev.dtend && ev.dtstart.allDay && dn(ev.dtend.y, ev.dtend.m, ev.dtend.d) - dn(ev.dtstart.y, ev.dtstart.m, ev.dtstart.d) > 1) return false;
    if (r.bysetpos.length) return false;
    const s = ev.dtstart,
      swd = wdOf(s.y, s.m, s.d);
    if (r.freq === "WEEKLY") {
      if (r.byday.length > 1 || (r.byday.length === 1 && (r.byday[0].n || r.byday[0].wd !== swd))) return false;
      if (r.bymonth.length || r.bymonthday.length) return false;
    } else if (r.freq === "MONTHLY") {
      if (r.byday.length || r.bymonth.length) return false;
      if (r.bymonthday.length > 1 || (r.bymonthday.length === 1 && r.bymonthday[0] !== s.d)) return false;
    } else if (r.freq === "YEARLY") {
      if (r.byday.length || r.bymonthday.length > 1) return false;
      if (r.bymonth.length > 1 || (r.bymonth.length === 1 && r.bymonth[0] !== s.m)) return false;
      if (r.bymonthday.length === 1 && r.bymonthday[0] !== s.d) return false;
    } else if (r.byday.length || r.bymonth.length || r.bymonthday.length) return false;
    return true;
  }
  function addDayKey(k, n) {
    const [y, m, d] = k.split("-").map(Number),
      x = fromDn(dn(y, m, d) + n);
    return dkey(x.y, x.m, x.d);
  }
  /**
   * Convert parsed events to Calex event objects (no ids). Simple repeating
   * series stay series; anything else repeating is expanded inside the window.
   * Returns { events, series, expanded, skipped, truncated }.
   */
  function toCalexEvents(evs, opts) {
    const tz = validTz(opts.tz) ? opts.tz : "UTC",
      max = opts.max || 1000,
      res = { events: [], series: 0, expanded: 0, skipped: 0, truncated: false },
      withOverride = new Set(evs.filter((e) => e.recurrenceId).map((e) => e.uid)),
      expandable = [];
    const push = (e) => {
      if (res.events.length >= max) return void (res.truncated = true);
      res.events.push({
        title: e.title,
        description: e.description || "",
        location: e.location || "",
        date: e.date,
        start: e.start || "",
        end: e.end || "",
        repeat: e.repeat || "none",
        repeatInterval: e.repeatInterval || 1,
        repeatUnit: e.repeatUnit || "",
        people: "",
        notes: "",
      });
    };
    evs.forEach((ev) => {
      if (ev.recurrenceId) return void expandable.push(ev);
      if (ev.status === "CANCELLED" || !ev.dtstart) return void res.skipped++;
      if (isSimpleSeries(ev, withOverride.has(ev.uid))) {
        const info = baseInfo(ev, tz),
          o = occFor(ev, ev.dtstart.y, ev.dtstart.m, ev.dtstart.d, info, tz),
          [repeat, unit] = REPEAT_OF[ev.rrule.freq];
        res.series++;
        push({ ...o, repeat, repeatUnit: unit, repeatInterval: ev.rrule.interval });
      } else expandable.push(ev);
    });
    const occs = expand(expandable, { tz, from: opts.from, to: opts.to, maxPerEvent: 400 });
    const recurringUids = new Set(expandable.filter((e) => e.rrule || e.recurrenceId).map((e) => e.uid));
    occs.forEach((o) => {
      if (recurringUids.has(o.uid)) res.expanded++;
      if (o.endDate && o.date !== o.endDate) {
        let k = o.date,
          i = 0;
        while (k <= o.endDate && i < 31) {
          push({ ...o, date: k, start: i ? "" : o.start, end: i ? "" : o.end });
          k = addDayKey(k, 1);
          i++;
        }
      } else push(o);
    });
    return res;
  }

  /* ---------- building ---------- */
  const utcStamp = (d) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const hhmmss = (t) => String(t).replace(":", "").padEnd(4, "0").slice(0, 4) + "00";
  const validDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v || "");
  function repeatSpec(e) {
    if (!e || !e.repeat || e.repeat === "none") return null;
    if (e.repeat === "fortnightly") return { freq: "WEEKLY", interval: 2 };
    const unit =
      e.repeatUnit ||
      { daily: "day", weekly: "week", monthly: "month", yearly: "year" }[e.repeat] ||
      "day";
    const freq = { day: "DAILY", week: "WEEKLY", month: "MONTHLY", year: "YEARLY" }[unit];
    return freq ? { freq, interval: Math.max(1, Number(e.repeatInterval) || 1) } : null;
  }
  /** Build an iCalendar document from Calex events. Times are floating (no zone). */
  function build(events, opts) {
    opts = opts || {};
    const stamp = utcStamp(new Date()),
      lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Calex//Calendar//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
      ];
    if (opts.name) lines.push("X-WR-CALNAME:" + escapeText(opts.name));
    if (opts.timezone && validTz(opts.timezone)) lines.push("X-WR-TIMEZONE:" + opts.timezone);
    events.forEach((e) => {
      if (!validDate(e.date)) return;
      const d = e.date.replace(/-/g, "");
      lines.push(
        "BEGIN:VEVENT",
        "UID:" + String(e.id || e.title).replace(/[^A-Za-z0-9-]/g, "") + "@calex",
        "DTSTAMP:" + stamp,
      );
      if (e.updatedAt) lines.push("LAST-MODIFIED:" + utcStamp(new Date(e.updatedAt)));
      if (e.start) {
        lines.push("DTSTART:" + d + "T" + hhmmss(e.start));
        if (e.end) lines.push("DTEND:" + d + "T" + hhmmss(e.end));
      } else {
        const n = addDayKey(e.date, 1).replace(/-/g, "");
        lines.push("DTSTART;VALUE=DATE:" + d, "DTEND;VALUE=DATE:" + n);
      }
      const rs = repeatSpec(e);
      if (rs) lines.push("RRULE:FREQ=" + rs.freq + (rs.interval > 1 ? ";INTERVAL=" + rs.interval : ""));
      lines.push("SUMMARY:" + escapeText(e.title));
      const desc = [e.description, e.people ? "With: " + e.people : "", e.notes]
        .filter(Boolean)
        .join("\n\n");
      if (desc) lines.push("DESCRIPTION:" + escapeText(desc));
      if (e.location) lines.push("LOCATION:" + escapeText(e.location));
      lines.push("END:VEVENT");
    });
    lines.push("END:VCALENDAR");
    return lines.map(fold).join("\r\n") + "\r\n";
  }

  /* ---------- links ---------- */
  /** webcal(s):// → https://, trims, validates. Returns "" if not a usable https URL. */
  function normalizeFeedUrl(raw) {
    let u = String(raw || "").trim();
    if (!u) return "";
    u = u.replace(/^webcals?:\/\//i, "https://");
    if (!/^https:\/\//i.test(u)) return "";
    try {
      const x = new URL(u);
      return x.protocol === "https:" && x.hostname ? x.toString() : "";
    } catch (_) {
      return "";
    }
  }
  function providerFromUrl(raw) {
    let h = "";
    try {
      h = new URL(normalizeFeedUrl(raw)).hostname.toLowerCase();
    } catch (_) {}
    if (/(^|\.)google\.com$/.test(h)) return "google";
    if (/(^|\.)(outlook\.com|outlook\.office365\.com|outlook\.office\.com|live\.com|office365\.com)$/.test(h)) return "outlook";
    if (/(^|\.)icloud\.com$/.test(h)) return "apple";
    if (/(^|\.)(ticktick\.com|dida365\.com)$/.test(h)) return "ticktick";
    return "other";
  }

  return {
    parse,
    expand,
    toCalexEvents,
    build,
    repeatSpec,
    normalizeFeedUrl,
    providerFromUrl,
    validTz,
    partsInTz,
    wallToUtc,
    escapeText,
    fold,
  };
});

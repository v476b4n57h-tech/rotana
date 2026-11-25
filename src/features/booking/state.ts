/**
 * Booking demo state: pure logic, no React and no DOM, so it is easy to test.
 *
 * UX rules:
 * - Going back to an earlier step never throws away later choices.
 * - Changing the barber or the day keeps the chosen time when it is still free;
 *   otherwise the time is cleared and a notice explains why.
 * - Choices survive a page reload (sessionStorage). Only selections are stored:
 *   no personal data, and nothing leaves the browser.
 */
import { bookingDemo, people, services, type Group } from "@/content/rotana";

export type View = "group" | "barber" | "service" | "time";

export interface BookingState {
  view: View;
  g: Group | null; // group
  p: number | null; // barber index
  s: number | null; // service index
  d: number; // day index (0 = tomorrow)
  t: string | null; // time slot "HH:MM"
  ok: boolean; // demo confirmation shown
  /** Set when a kept time had to be cleared because it is no longer free. */
  notice: { type: "timeUnavailable"; time: string } | null;
}

export const INITIAL: BookingState = {
  view: "group",
  g: null,
  p: null,
  s: null,
  d: 0,
  t: null,
  ok: false,
  notice: null,
};

export type Action =
  | { type: "group"; g: Group }
  | { type: "barber"; p: number }
  | { type: "service"; s: number }
  | { type: "day"; d: number }
  | { type: "time"; t: string }
  | { type: "back"; view: Exclude<View, "time"> }
  | { type: "confirm" }
  | { type: "restore"; state: BookingState };

/** The demo time grid: 20 slots of 30 minutes from 09:00. */
export function timeSlots(): string[] {
  const slots: string[] = [];
  for (let i = 0; i < bookingDemo.slotCount; i++) {
    const m = bookingDemo.firstSlotMinutes + bookingDemo.slotMinutes * i;
    slots.push(`${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`);
  }
  return slots;
}

/** Demo only: a fixed pattern of "taken" slots, as in the original. */
export function isTaken(barber: number, day: number, slot: number): boolean {
  return ((barber + 1) * 7 + day * 3 + slot * 5) % 4 === 0;
}

function isTimeFree(barber: number, day: number, time: string): boolean {
  const slot = timeSlots().indexOf(time);
  return slot >= 0 && !isTaken(barber, day, slot);
}

/** Keeps the chosen time if it is still free for this barber and day; otherwise clears it. */
function revalidateTime(state: BookingState): BookingState {
  if (state.t === null || state.p === null || isTimeFree(state.p, state.d, state.t)) return state;
  return { ...state, t: null, notice: { type: "timeUnavailable", time: state.t } };
}

export function bookingReducer(state: BookingState, action: Action): BookingState {
  switch (action.type) {
    case "group":
      if (action.g === state.g) return { ...state, view: "barber", ok: false, notice: null };
      // Another group has other barbers and services: keep only the chosen day.
      return { ...INITIAL, d: state.d, g: action.g, view: "barber" };
    case "barber": {
      const next = { ...state, p: action.p, ok: false, notice: null };
      return { ...revalidateTime(next), view: next.s === null ? "service" : "time" };
    }
    case "service":
      return { ...state, s: action.s, view: "time", ok: false, notice: null };
    case "day":
      return revalidateTime({ ...state, d: action.d, ok: false, notice: null });
    case "time":
      return { ...state, t: action.t, ok: false, notice: null };
    case "back":
      return { ...state, view: action.view, ok: false, notice: null };
    case "confirm":
      return state.t === null ? state : { ...state, ok: true };
    case "restore":
      return action.state;
  }
}

/* ---------- Upcoming days ---------- */

export interface Day {
  key: string; // "YYYY-MM-DD", stable across reloads
  weekday: number; // 0 = Sunday
  date: number;
  month: number; // 0 = January
}

export function upcomingDays(now: Date = new Date()): Day[] {
  const days: Day[] = [];
  for (let k = 1; k <= bookingDemo.daysAhead; k++) {
    const dt = new Date(now.getFullYear(), now.getMonth(), now.getDate() + k);
    const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
    days.push({ key, weekday: dt.getDay(), date: dt.getDate(), month: dt.getMonth() });
  }
  return days;
}

/* ---------- Saving and restoring (sessionStorage) ---------- */

export const STORAGE_KEY = "rotana.booking.v1";

/** What is stored: names and a date instead of indexes, so it stays valid if lists or dates shift. */
interface Saved {
  view: View;
  group: Group | null;
  barber: string | null;
  service: string | null;
  day: string | null;
  time: string | null;
}

export function serialize(state: BookingState, now: Date = new Date()): string {
  const g = state.g;
  const saved: Saved = {
    view: state.view,
    group: g,
    barber: g && state.p !== null ? (people[g][state.p]?.name ?? null) : null,
    service: g && state.s !== null ? (services[g][state.s]?.name ?? null) : null,
    day: upcomingDays(now)[state.d]?.key ?? null,
    time: state.t,
  };
  return JSON.stringify(saved);
}

/**
 * Rebuilds a valid state from stored data. Anything unknown, outdated (a day
 * that has passed) or inconsistent is dropped, never trusted blindly.
 */
export function deserialize(raw: string | null, now: Date = new Date()): BookingState | null {
  if (!raw) return null;
  let data: Partial<Saved>;
  try {
    data = JSON.parse(raw) as Partial<Saved>;
  } catch {
    return null;
  }
  if (typeof data !== "object" || data === null) return null;
  const g = data.group === "men" || data.group === "women" ? data.group : null;
  if (!g) return null;

  const p = people[g].findIndex((x) => x.name === data.barber);
  const s = services[g].findIndex((x) => x.name === data.service);
  const d = upcomingDays(now).findIndex((x) => x.key === data.day);
  const state: BookingState = {
    ...INITIAL,
    g,
    p: p >= 0 ? p : null,
    s: s >= 0 ? s : null,
    d: d >= 0 ? d : 0,
    t: d >= 0 && typeof data.time === "string" ? data.time : null,
  };
  // A time is only kept if it is a real, free slot for this barber on this day.
  if (state.t !== null && (state.p === null || !isTimeFree(state.p, state.d, state.t))) state.t = null;

  // Show the furthest step that the restored data supports.
  const wanted: View =
    data.view === "group" || data.view === "barber" || data.view === "service" || data.view === "time"
      ? data.view
      : "barber";
  const maxView: View = state.p === null ? "barber" : state.s === null ? "service" : "time";
  const order: View[] = ["group", "barber", "service", "time"];
  state.view = order.indexOf(wanted) <= order.indexOf(maxView) ? wanted : maxView;
  return state;
}

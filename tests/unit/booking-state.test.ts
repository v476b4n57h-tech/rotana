import { describe, expect, it } from "vitest";
import {
  INITIAL,
  bookingReducer,
  deserialize,
  isTaken,
  serialize,
  timeSlots,
  type Action,
  type BookingState,
} from "@/features/booking/state";

const NOW = new Date(2026, 10, 25, 10, 0); // 25 Nov 2026
const run = (actions: Action[], from: BookingState = INITIAL) => actions.reduce(bookingReducer, from);

/** First free slot for a barber on a day. */
const freeSlot = (barber: number, day: number) => timeSlots().find((_, i) => !isTaken(barber, day, i))!;
/** A slot that is free for barber A but taken for barber B on the same day. */
function slotFreeForATakenForB(a: number, b: number, day: number) {
  const i = timeSlots().findIndex((_, i) => !isTaken(a, day, i) && isTaken(b, day, i));
  return timeSlots()[i]!;
}

describe("booking flow keeps the customer's choices", () => {
  it("follows the normal steps: group → barber → service → time", () => {
    const st = run([
      { type: "group", g: "men" },
      { type: "barber", p: 1 },
      { type: "service", s: 2 },
    ]);
    expect(st).toMatchObject({ view: "time", g: "men", p: 1, s: 2 });
  });

  it("going back to the barber step keeps service, day and time", () => {
    const time = freeSlot(1, 3);
    const st = run([
      { type: "group", g: "men" },
      { type: "barber", p: 1 },
      { type: "service", s: 2 },
      { type: "day", d: 3 },
      { type: "time", t: time },
      { type: "back", view: "barber" },
    ]);
    expect(st).toMatchObject({ view: "barber", p: 1, s: 2, d: 3, t: time });
  });

  it("choosing another barber with a service already chosen jumps straight to the time step", () => {
    const st = run([
      { type: "group", g: "men" },
      { type: "barber", p: 0 },
      { type: "service", s: 4 },
      { type: "back", view: "barber" },
      { type: "barber", p: 2 },
    ]);
    expect(st).toMatchObject({ view: "time", p: 2, s: 4 });
  });

  it("keeps the time when it is still free for the new barber", () => {
    const day = 2;
    const i = timeSlots().findIndex((_, i) => !isTaken(0, day, i) && !isTaken(3, day, i));
    const time = timeSlots()[i]!;
    const st = run([
      { type: "group", g: "men" },
      { type: "barber", p: 0 },
      { type: "service", s: 0 },
      { type: "day", d: day },
      { type: "time", t: time },
      { type: "barber", p: 3 },
    ]);
    expect(st.t).toBe(time);
    expect(st.notice).toBeNull();
  });

  it("clears the time with a notice when it is taken for the new barber", () => {
    const day = 1;
    const time = slotFreeForATakenForB(0, 1, day);
    const st = run([
      { type: "group", g: "men" },
      { type: "barber", p: 0 },
      { type: "service", s: 0 },
      { type: "day", d: day },
      { type: "time", t: time },
      { type: "barber", p: 1 },
    ]);
    expect(st.t).toBeNull();
    expect(st.notice).toEqual({ type: "timeUnavailable", time });
  });

  it("changing the day keeps the time if it is free that day", () => {
    const time = timeSlots().find((_, i) => !isTaken(0, 0, i) && !isTaken(0, 4, i))!;
    const st = run([
      { type: "group", g: "men" },
      { type: "barber", p: 0 },
      { type: "service", s: 0 },
      { type: "time", t: time },
      { type: "day", d: 4 },
    ]);
    expect(st).toMatchObject({ d: 4, t: time, notice: null });
  });

  it("picking the same group again keeps everything", () => {
    const st = run([
      { type: "group", g: "women" },
      { type: "barber", p: 1 },
      { type: "service", s: 3 },
      { type: "back", view: "group" },
      { type: "group", g: "women" },
    ]);
    expect(st).toMatchObject({ view: "barber", g: "women", p: 1, s: 3 });
  });

  it("switching to the other group resets barber, service and time (they differ per group) but keeps the day", () => {
    const st = run([
      { type: "group", g: "women" },
      { type: "barber", p: 1 },
      { type: "service", s: 3 },
      { type: "day", d: 5 },
      { type: "back", view: "group" },
      { type: "group", g: "men" },
    ]);
    expect(st).toMatchObject({ view: "barber", g: "men", p: null, s: null, t: null, d: 5 });
  });

  it("the demo confirmation needs a time and is reset by any change", () => {
    let st = run([
      { type: "group", g: "men" },
      { type: "barber", p: 0 },
      { type: "service", s: 0 },
      { type: "confirm" },
    ]);
    expect(st.ok).toBe(false);
    st = run([{ type: "time", t: freeSlot(0, 0) }, { type: "confirm" }], st);
    expect(st.ok).toBe(true);
    st = run([{ type: "day", d: 1 }], st);
    expect(st.ok).toBe(false);
  });
});

describe("saving and restoring the booking (page reload)", () => {
  const filled = run([
    { type: "group", g: "men" },
    { type: "barber", p: 1 },
    { type: "service", s: 2 },
    { type: "day", d: 3 },
    { type: "time", t: freeSlot(1, 3) },
  ]);

  it("restores exactly the same choices", () => {
    const back = deserialize(serialize(filled, NOW), NOW);
    expect(back).toMatchObject({ view: "time", g: "men", p: 1, s: 2, d: 3, t: filled.t, ok: false });
  });

  it("stores names and a date, never personal data", () => {
    const saved = JSON.parse(serialize(filled, NOW));
    expect(Object.keys(saved).sort()).toEqual(["barber", "day", "group", "service", "time", "view"]);
    expect(saved).toMatchObject({
      group: "men",
      barber: "Yusuf",
      service: "Haar en baard",
      day: "2026-11-29",
    });
  });

  it("drops the day and time once that day is no longer in the upcoming week", () => {
    const later = new Date(2026, 11, 10); // two weeks later
    const back = deserialize(serialize(filled, NOW), later)!;
    expect(back).toMatchObject({ g: "men", p: 1, s: 2, d: 0, t: null });
  });

  it("ignores broken or tampered data instead of trusting it", () => {
    expect(deserialize(null)).toBeNull();
    expect(deserialize("{not json")).toBeNull();
    expect(deserialize(JSON.stringify({ group: "kids" }))).toBeNull();
    const tampered = deserialize(
      JSON.stringify({
        view: "time",
        group: "men",
        barber: "Nobody",
        service: "Knippen heren",
        day: "x",
        time: "25:99",
      }),
      NOW,
    )!;
    expect(tampered).toMatchObject({ g: "men", p: null, t: null, view: "barber" });
  });

  it("never restores a time that is taken", () => {
    const takenIndex = timeSlots().findIndex((_, i) => isTaken(1, 3, i));
    const raw = serialize({ ...filled, t: timeSlots()[takenIndex]! }, NOW);
    expect(deserialize(raw, NOW)!.t).toBeNull();
  });
});

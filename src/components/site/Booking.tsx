"use client";

import { useState } from "react";
import { bookingDemo, people, services, type Group } from "@/content/rotana";
import { t } from "@/i18n";
import { priceLabel } from "./priceLabel";

/**
 * Booking DEMO, identical to the original: group → barber → treatment → day → time.
 * Nothing is saved. Real booking (database, conflict checks) arrives in phase 5.
 */

interface State {
  g: Group | null; // group
  p: number | null; // barber index
  s: number | null; // service index
  d: number; // day index
  t: string | null; // time slot
  ok: boolean; // demo confirmation shown
}

const EMPTY: State = { g: null, p: null, s: null, d: 0, t: null, ok: false };
const groupTitle = (g: Group) => t(`common.${g}`);

function upcomingDays() {
  const weekdays = t("booking.weekdays").split(",");
  const months = t("booking.months").split(",");
  const days: { dow: string; date: string }[] = [];
  for (let k = 1; k <= bookingDemo.daysAhead; k++) {
    const dt = new Date();
    dt.setDate(dt.getDate() + k);
    days.push({ dow: weekdays[dt.getDay()] ?? "", date: `${dt.getDate()} ${months[dt.getMonth()] ?? ""}` });
  }
  return days;
}

function timeSlots() {
  const slots: string[] = [];
  for (let i = 0; i < bookingDemo.slotCount; i++) {
    const m = bookingDemo.firstSlotMinutes + bookingDemo.slotMinutes * i;
    slots.push(`${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`);
  }
  return slots;
}

/** Demo only: a fixed pattern of "taken" slots, as in the original. */
const isTaken = (barber: number, day: number, slot: number) =>
  ((barber + 1) * 7 + day * 3 + slot * 5) % 4 === 0;

export function Booking() {
  const [st, setSt] = useState<State>(EMPTY);

  let title: string;
  let body: React.ReactNode;

  if (!st.g) {
    title = t("booking.titleWho");
    body = (
      <div className="row" style={{ gap: 24 }}>
        {(["men", "women"] as const).map((g) => (
          <button key={g} type="button" className="choice" onClick={() => setSt({ ...EMPTY, g })}>
            <b>{groupTitle(g)}</b>
            <span>
              {t(g === "men" ? "booking.menChoice" : "booking.womenChoice", { count: people[g].length })}
            </span>
          </button>
        ))}
      </div>
    );
  } else if (st.p === null) {
    const g = st.g;
    title = t("booking.titleBarber", { group: groupTitle(g) });
    body = (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ fontSize: 19 }}>{t("booking.chooseBarber")}</div>
          <button type="button" className="small-btn" onClick={() => setSt(EMPTY)}>
            {t("common.otherChoice")}
          </button>
        </div>
        <div className="row" style={{ gap: 24 }}>
          {people[g].map((person, idx) => (
            <button
              key={person.name}
              type="button"
              className="person"
              onClick={() => setSt({ ...EMPTY, g, p: idx })}
            >
              <span className="avatar l" aria-hidden="true">
                {person.name.charAt(0)}
              </span>
              <b>{person.name}</b>
              <span className="role">{person.role}</span>
            </button>
          ))}
        </div>
        <div className="note">{t("booking.teamPhotosNote")}</div>
      </div>
    );
  } else if (st.s === null) {
    const g = st.g;
    const p = st.p;
    const person = people[g][p]!;
    title = t("booking.titleTreatment", { group: groupTitle(g) });
    body = (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ fontSize: 19 }}>{t("booking.whichTreatment", { name: person.name })}</div>
          <button type="button" className="small-btn" onClick={() => setSt({ ...EMPTY, g })}>
            {t("booking.otherBarber")}
          </button>
        </div>
        <div className="row" style={{ gap: 16 }}>
          {services[g].map((service, i) => (
            <button
              key={service.name}
              type="button"
              className="person"
              style={{ flexBasis: 240, textAlign: "left", alignItems: "flex-start" }}
              onClick={() => setSt({ ...EMPTY, g, p, s: i })}
            >
              <b style={{ fontSize: 24 }}>{service.name}</b>
              <span className="role">{service.description}</span>
              <span className="price" style={{ marginTop: "auto", fontSize: 18 }}>
                {priceLabel(service.priceCents)}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  } else {
    const g = st.g;
    const p = st.p;
    const s = st.s;
    const person = people[g][p]!;
    const service = services[g][s]!;
    const days = upcomingDays();
    const day = days[st.d]!;
    title = t("booking.titleTime", { group: groupTitle(g) });
    body = (
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span className="avatar s" aria-hidden="true">
              {person.name.charAt(0)}
            </span>
            <div>
              <div style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 30, lineHeight: 1.1 }}>
                {person.name}
              </div>
              <div className="note">{person.role}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button type="button" className="small-btn" onClick={() => setSt({ ...EMPTY, g })}>
              {t("booking.otherBarber")}
            </button>
            <button type="button" className="small-btn" onClick={() => setSt({ ...EMPTY, g, p })}>
              {t("booking.otherTreatment")}
            </button>
          </div>
        </div>
        <div className="note" style={{ fontSize: 16 }}>
          {t("booking.treatment")} <b>{service.name}</b> · <b>{priceLabel(service.priceCents)}</b>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="label">{t("booking.chooseDay")}</div>
          <div className="chips">
            {days.map((d, di) => (
              <button
                key={d.date}
                type="button"
                className={st.d === di ? "day on" : "day"}
                aria-pressed={st.d === di}
                onClick={() => setSt({ ...EMPTY, g, p, s, d: di })}
              >
                <span style={{ fontSize: 14 }}>{d.dow}</span>
                <span style={{ fontWeight: 500 }}>{d.date}</span>
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="label">{t("booking.availableTimes")}</div>
          <div className="chips">
            {timeSlots().map((slot, si) => (
              <button
                key={slot}
                type="button"
                className={st.t === slot ? "slot on" : "slot"}
                disabled={isTaken(p, st.d, si)}
                aria-pressed={st.t === slot}
                onClick={() => setSt({ ...st, t: slot, ok: false })}
              >
                {slot}
              </button>
            ))}
          </div>
          <div className="note">{t("booking.takenNote")}</div>
        </div>
        {st.t && (
          <div className="summary">
            <div style={{ flex: "1 1 300px", minWidth: 0 }}>
              <div className="note" style={{ letterSpacing: ".12em", textTransform: "uppercase" }}>
                {t("booking.yourAppointment")}
              </div>
              <h3>
                {service.name} · {groupTitle(g)} · {person.name} · {day.dow} {day.date} · {st.t}
              </h3>
              <div style={{ marginTop: 6 }}>
                {t("booking.price", { price: priceLabel(service.priceCents) })}
              </div>
            </div>
            <button type="button" className="btn" onClick={() => setSt({ ...st, ok: true })}>
              {t("booking.confirm")}
            </button>
          </div>
        )}
        {st.ok && <div className="demo-ok">{t("booking.demoConfirmed")}</div>}
      </div>
    );
  }

  return (
    <section id="afspraak" className="why" style={{ scrollMarginTop: 8 }}>
      <div className="wrap reveal">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="eyebrow">{t("booking.eyebrow")}</div>
          <h2 id="book-title">{title}</h2>
          <div className="note">{t("booking.demoNote")}</div>
        </div>
        <div id="book" aria-live="polite">
          {body}
        </div>
      </div>
    </section>
  );
}

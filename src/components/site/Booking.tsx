"use client";

import { useEffect, useReducer, useRef } from "react";
import { people, services, type Group } from "@/content/rotana";
import {
  INITIAL,
  STORAGE_KEY,
  bookingReducer,
  deserialize,
  isTaken,
  serialize,
  timeSlots,
  upcomingDays,
  type Action,
} from "@/features/booking/state";
import { t } from "@/i18n";
import { priceLabel } from "./priceLabel";

/**
 * Booking DEMO: group → barber → treatment → day → time.
 * Same look and texts as the original; choices are kept when going back a step
 * and survive a page reload. Nothing is sent anywhere. Real booking arrives in phase 5.
 */

const groupTitle = (g: Group) => t(`common.${g}`);
const weekdays = t("booking.weekdays").split(",");
const months = t("booking.months").split(",");

const rowStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
} as const;

function readSaved() {
  try {
    return deserialize(sessionStorage.getItem(STORAGE_KEY));
  } catch {
    return null; // storage blocked (private mode, settings): just start fresh
  }
}

export function Booking() {
  const [st, dispatch] = useReducer(bookingReducer, INITIAL);
  const restored = useRef(false);
  const userAction = useRef(false);

  // Restore saved choices after the page has loaded (storage only exists in the browser).
  useEffect(() => {
    const saved = readSaved();
    if (saved) dispatch({ type: "restore", state: saved });
    restored.current = true;
  }, []);

  // Save choices whenever they change.
  useEffect(() => {
    if (!restored.current) return;
    try {
      if (st.g === null) sessionStorage.removeItem(STORAGE_KEY);
      else sessionStorage.setItem(STORAGE_KEY, serialize(st));
    } catch {
      /* storage unavailable: the booking still works, it is just not remembered */
    }
  }, [st]);

  // After a step change made by the user: focus the step title, scroll it into view if needed.
  useEffect(() => {
    if (!userAction.current) return;
    userAction.current = false;
    const title = document.getElementById("book-title");
    if (!title) return;
    title.focus({ preventScroll: true });
    if (title.getBoundingClientRect().top < 0) {
      const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      title.scrollIntoView({ behavior: reduce ? "instant" : "smooth", block: "start" });
    }
  }, [st.view]);

  const act = (action: Action) => {
    userAction.current = true;
    dispatch(action);
  };

  let title: string;
  let body: React.ReactNode;

  if (st.view === "group" || !st.g) {
    title = t("booking.titleWho");
    body = (
      <div className="row" style={{ gap: 24 }}>
        {(["men", "women"] as const).map((g) => (
          <button
            key={g}
            type="button"
            className="choice"
            aria-pressed={st.g === g ? true : undefined}
            onClick={() => act({ type: "group", g })}
          >
            <b>{groupTitle(g)}</b>
            <span>
              {t(g === "men" ? "booking.menChoice" : "booking.womenChoice", { count: people[g].length })}
            </span>
          </button>
        ))}
      </div>
    );
  } else if (st.view === "barber" || st.p === null) {
    const g = st.g;
    title = t("booking.titleBarber", { group: groupTitle(g) });
    body = (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={rowStyle}>
          <div style={{ fontSize: 19 }}>{t("booking.chooseBarber")}</div>
          <button type="button" className="small-btn" onClick={() => act({ type: "back", view: "group" })}>
            {t("common.otherChoice")}
          </button>
        </div>
        <div className="row" style={{ gap: 24 }}>
          {people[g].map((person, idx) => (
            <button
              key={person.name}
              type="button"
              className="person"
              aria-pressed={st.p === idx ? true : undefined}
              onClick={() => act({ type: "barber", p: idx })}
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
  } else if (st.view === "service" || st.s === null) {
    const g = st.g;
    const person = people[g][st.p]!;
    title = t("booking.titleTreatment", { group: groupTitle(g) });
    body = (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={rowStyle}>
          <div style={{ fontSize: 19 }}>{t("booking.whichTreatment", { name: person.name })}</div>
          <button type="button" className="small-btn" onClick={() => act({ type: "back", view: "barber" })}>
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
              aria-pressed={st.s === i ? true : undefined}
              onClick={() => act({ type: "service", s: i })}
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
    const person = people[g][p]!;
    const service = services[g][st.s]!;
    const days = upcomingDays();
    const day = days[st.d]!;
    const label = (d: (typeof days)[number]) => ({
      dow: weekdays[d.weekday] ?? "",
      date: `${d.date} ${months[d.month] ?? ""}`,
    });
    title = t("booking.titleTime", { group: groupTitle(g) });
    body = (
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <div style={{ ...rowStyle, gap: 16 }}>
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
            <button type="button" className="small-btn" onClick={() => act({ type: "back", view: "barber" })}>
              {t("booking.otherBarber")}
            </button>
            <button
              type="button"
              className="small-btn"
              onClick={() => act({ type: "back", view: "service" })}
            >
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
                key={d.key}
                type="button"
                className={st.d === di ? "day on" : "day"}
                aria-pressed={st.d === di}
                onClick={() => dispatch({ type: "day", d: di })}
              >
                <span style={{ fontSize: 14 }}>{label(d).dow}</span>
                <span style={{ fontWeight: 500 }}>{label(d).date}</span>
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
                onClick={() => dispatch({ type: "time", t: slot })}
              >
                {slot}
              </button>
            ))}
          </div>
          <div className="note">{t("booking.takenNote")}</div>
        </div>
        {st.notice?.type === "timeUnavailable" && (
          <div className="booking-notice" role="status">
            {t("booking.timeUnavailable", { name: person.name, time: st.notice.time })}
          </div>
        )}
        {st.t && (
          <div className="summary">
            <div style={{ flex: "1 1 300px", minWidth: 0 }}>
              <div className="note" style={{ letterSpacing: ".12em", textTransform: "uppercase" }}>
                {t("booking.yourAppointment")}
              </div>
              <h3>
                {service.name} · {groupTitle(g)} · {person.name} · {label(day).dow} {label(day).date} · {st.t}
              </h3>
              <div style={{ marginTop: 6 }}>
                {t("booking.price", { price: priceLabel(service.priceCents) })}
              </div>
            </div>
            <button type="button" className="btn" onClick={() => dispatch({ type: "confirm" })}>
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
          <h2 id="book-title" tabIndex={-1}>
            {title}
          </h2>
          <div className="note">{t("booking.demoNote")}</div>
        </div>
        <div id="book" aria-live="polite">
          <div key={st.view} className="view-enter">
            {body}
          </div>
        </div>
      </div>
    </section>
  );
}

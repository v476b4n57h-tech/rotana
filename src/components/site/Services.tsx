"use client";

import { useEffect, useRef, useState } from "react";
import { serviceGroups, services, servicesNote, type Group } from "@/content/rotana";
import { t } from "@/i18n";
import { panelClass, usePanels } from "./panels";
import { priceLabel } from "./priceLabel";

/** Services and prices: a collapsible panel with a men/women choice (one of the Single Active Panels). */
export function Services() {
  const { active, closing, open, close } = usePanels();
  const isOpen = active === "services";
  const [which, setWhich] = useState<Group | null>(null);
  const [prevOpen, setPrevOpen] = useState(isOpen);
  const focusAfterSwitch = useRef(false);
  const toggle = useRef<HTMLButtonElement>(null);

  // Every time the panel opens it starts at the men/women choice (as in the original).
  if (isOpen !== prevOpen) {
    setPrevOpen(isOpen);
    if (isOpen) setWhich(null);
  }

  const show = (group: Group | null) => {
    focusAfterSwitch.current = true;
    setWhich(group);
  };

  // Inside the panel, move focus to the newly shown view (keyboard and screen readers).
  useEffect(() => {
    if (!focusAfterSwitch.current) return;
    focusAfterSwitch.current = false;
    const target = which
      ? document.querySelector<HTMLElement>(`#svc-${which} .svc-head h3`)
      : document.querySelector<HTMLElement>("#svc-choose .choice");
    target?.focus({ preventScroll: true });
  }, [which]);

  return (
    <section id="diensten">
      <div className="wrap reveal" style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="eyebrow">{t("services.eyebrow")}</div>
          <h2 id="svc-title">{t("services.title")}</h2>
        </div>
        <div id="svc-open-wrap">
          <button
            ref={toggle}
            type="button"
            className="btn"
            id="svc-open"
            aria-expanded={isOpen}
            aria-controls="svc-panel"
            onClick={() => (isOpen ? close("services") : open("services", { anchor: toggle.current }))}
          >
            {isOpen ? t("common.close") : t("services.open")}
          </button>
        </div>
        <div
          id="svc-panel"
          className={panelClass("services", active, closing)}
          role="region"
          aria-labelledby="svc-title"
          tabIndex={-1}
        >
          <div id="svc-choose" className="row view-enter" style={{ gap: 24 }} hidden={which !== null}>
            {(["men", "women"] as const).map((group) => (
              <button
                key={group}
                type="button"
                className="choice"
                data-svc={group}
                onClick={() => show(group)}
              >
                <b>{serviceGroups[group].title}</b>
                <span>{serviceGroups[group].summary}</span>
              </button>
            ))}
          </div>
          {(["men", "women"] as const).map((group) => (
            <div
              key={which === group ? `${group}-shown` : group}
              id={`svc-${group}`}
              className="svc-list view-enter"
              hidden={which !== group}
            >
              <div className="svc-head">
                <h3 tabIndex={-1}>{serviceGroups[group].title}</h3>
                <button type="button" className="small-btn" data-svc="back" onClick={() => show(null)}>
                  {t("common.otherChoice")}
                </button>
              </div>
              {services[group].map((service) => (
                <div className="svc" key={service.name}>
                  <div className="col" style={{ flexBasis: 220 }}>
                    <h3>{service.name}</h3>
                    <div>{service.description}</div>
                  </div>
                  <div className="price">{priceLabel(service.priceCents)}</div>
                </div>
              ))}
            </div>
          ))}
          <div className="note" style={{ marginTop: 16 }}>
            {servicesNote}
          </div>
        </div>
      </div>
    </section>
  );
}

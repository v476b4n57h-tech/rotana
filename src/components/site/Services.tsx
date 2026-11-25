"use client";

import { useEffect, useState } from "react";
import { serviceGroups, services, servicesNote, type Group } from "@/content/rotana";
import { t } from "@/i18n";
import { priceLabel } from "./priceLabel";

/** Services and prices: a collapsible panel with a men/women choice, as in the original. */
export function Services() {
  const [open, setOpen] = useState(false);
  const [which, setWhich] = useState<Group | null>(null);

  const openPanel = (value: boolean) => {
    setOpen(value);
    if (value) setWhich(null);
  };

  // Links marked with data-opensvc (header, hero) open the panel.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if ((e.target as Element | null)?.closest?.("[data-opensvc]")) openPanel(true);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <section id="diensten">
      <div className="wrap reveal" style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="eyebrow">{t("services.eyebrow")}</div>
          <h2 id="svc-title">{t("services.title")}</h2>
        </div>
        <div id="svc-open-wrap">
          <button
            type="button"
            className="btn"
            id="svc-open"
            aria-expanded={open}
            aria-controls="svc-panel"
            onClick={() => openPanel(!open)}
          >
            {open ? t("common.close") : t("services.open")}
          </button>
        </div>
        <div id="svc-panel" className={open ? "open" : undefined}>
          <div id="svc-choose" className="row" style={{ gap: 24 }} hidden={which !== null}>
            {(["men", "women"] as const).map((group) => (
              <button
                key={group}
                type="button"
                className="choice"
                data-svc={group}
                onClick={() => setWhich(group)}
              >
                <b>{serviceGroups[group].title}</b>
                <span>{serviceGroups[group].summary}</span>
              </button>
            ))}
          </div>
          {(["men", "women"] as const).map((group) => (
            <div key={group} id={`svc-${group}`} className="svc-list" hidden={which !== group}>
              <div className="svc-head">
                <h3>{serviceGroups[group].title}</h3>
                <button type="button" className="small-btn" data-svc="back" onClick={() => setWhich(null)}>
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

"use client";

import { useState } from "react";
import { t } from "@/i18n";

/** "Mijn account": placeholder until customer accounts arrive (phase 6). */
export function Account() {
  const [note, setNote] = useState(t("account.note"));
  const demo = (e: React.MouseEvent) => {
    e.preventDefault();
    setNote(t("account.demoNote"));
  };

  return (
    <section id="account">
      <div className="wrap reveal" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="eyebrow">{t("account.eyebrow")}</div>
          <h2>{t("account.title")}</h2>
        </div>
        <p style={{ margin: 0, maxWidth: 620 }}>{t("account.intro")}</p>
        <div className="chips" style={{ gap: 16 }}>
          <a className="btn acct-link" href="#account" onClick={demo}>
            {t("account.create")}
          </a>
          <a className="btn ghost acct-link" href="#account" onClick={demo}>
            {t("account.login")}
          </a>
        </div>
        <div id="acct-note" className="note" role="status">
          {note}
        </div>
      </div>
    </section>
  );
}

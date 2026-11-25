import { openingHours, salon } from "@/content/rotana";
import { t } from "@/i18n";
import { SocialLinks } from "./SocialLinks";

export function Contact() {
  return (
    <section id="contact">
      <div className="wrap reveal">
        <div className="row" style={{ gap: 48 }}>
          <div className="col" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h2>{t("contact.title")}</h2>
            <div>
              {salon.street}
              <br />
              {salon.postcode} {salon.city}
            </div>
            <div>
              {t("contact.phone")} {salon.phone}
              <br />
              {t("contact.email")} {salon.email}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="label">{t("contact.follow")}</div>
              <SocialLinks />
            </div>
          </div>
          <div className="col hours">
            <h3 style={{ fontWeight: 600, fontSize: 28, marginBottom: 12 }}>{t("contact.hours")}</h3>
            {openingHours.map((row) => (
              <div key={row.day}>
                <span>{row.day}</span>
                <span>{row.hours}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

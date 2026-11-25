import Image from "next/image";
import { salon } from "@/content/rotana";
import { t } from "@/i18n";

export function Header() {
  return (
    <header className="head">
      <div className="wrap tight">
        <div className="logo" aria-label="ROTANA">
          <span className="mono" aria-hidden="true">
            <Image src={salon.logo} alt="" sizes="64px" priority />
          </span>
          <span aria-hidden="true">OTANA</span>
        </div>
        <nav aria-label={t("nav.label")}>
          {/* data-panel: opens that panel and closes any other (see panels.tsx) */}
          <a href="#diensten" data-panel="services">
            {t("nav.services")}
          </a>
          <a href="#over-ons">{t("nav.about")}</a>
          <a href="#werk" data-panel="gallery">
            {t("nav.work")}
          </a>
          <a href="#contact">{t("nav.contact")}</a>
          <a href="#account">{t("nav.account")}</a>
          <a className="btn" href="#afspraak" data-panel="booking">
            {t("nav.book")}
          </a>
        </nav>
      </div>
    </header>
  );
}

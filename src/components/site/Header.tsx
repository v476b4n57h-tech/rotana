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
          {/* data-opensvc: opens the services panel (handled in Services.tsx) */}
          <a href="#diensten" data-opensvc="">
            {t("nav.services")}
          </a>
          <a href="#over-ons">{t("nav.about")}</a>
          <a href="#werk">{t("nav.work")}</a>
          <a href="#contact">{t("nav.contact")}</a>
          <a href="#account">{t("nav.account")}</a>
          <a className="btn" href="#afspraak">
            {t("nav.book")}
          </a>
        </nav>
      </div>
    </header>
  );
}

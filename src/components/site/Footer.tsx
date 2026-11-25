import { salon } from "@/content/rotana";
import { t } from "@/i18n";

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div>
          © ROTANA Hair Style · KVK {salon.kvk} · BTW {salon.btw}
        </div>
        <div>
          {t("footer.privacy")} {salon.privacyLink} · {t("footer.terms")} {salon.termsLink}
        </div>
      </div>
    </footer>
  );
}

import { t } from "@/i18n";

/**
 * Tijdelijke startpagina (fase 0).
 * In fase 1 wordt deze vervangen door de volledige website, visueel identiek aan het origineel.
 */
export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        padding: 16,
        textAlign: "center",
      }}
    >
      <h1
        style={{
          fontFamily: "var(--display)",
          fontWeight: 600,
          fontSize: 48,
          letterSpacing: ".14em",
          margin: 0,
        }}
      >
        ROTANA
      </h1>
      <p style={{ margin: 0, color: "var(--muted)" }}>{t("home.underConstruction")}</p>
    </main>
  );
}

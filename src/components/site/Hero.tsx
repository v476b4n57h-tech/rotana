import Image from "next/image";
import { hero } from "@/content/rotana";
import { t } from "@/i18n";
import { RotatingWord } from "./RotatingWord";

export function Hero() {
  return (
    <section>
      <div className="wrap">
        <div className="hero">
          <div className="col" style={{ flexBasis: 420, display: "flex", flexDirection: "column", gap: 24 }}>
            <div className="eyebrow">{hero.eyebrow}</div>
            <h1>
              {hero.titleStart}
              <RotatingWord words={hero.rotatingWords} />
              {hero.titleEnd}
            </h1>
            <p style={{ margin: 0, maxWidth: 520, fontSize: 19 }}>{hero.intro}</p>
            <div className="chips" style={{ gap: 16 }}>
              <a className="btn" href="#afspraak" data-panel="booking">
                {t("nav.book")}
              </a>
              <a className="btn ghost" href="#diensten" data-panel="services">
                {t("nav.services")}
              </a>
            </div>
          </div>
          <div className="col" style={{ flexBasis: 360, display: "flex", flexDirection: "column", gap: 8 }}>
            {/* Largest image above the fold: loaded first (priority) for a fast first paint. */}
            <Image
              src={hero.image}
              alt={hero.imageAlt}
              sizes="(max-width: 900px) calc(100vw - 32px), 520px"
              priority
              quality={85}
              // Keep the exact original proportions (resized files can round by a pixel).
              // Like the original's natural ratio, it applies inside the 1px border.
              style={{
                aspectRatio: `${hero.image.width} / ${hero.image.height}`,
                boxSizing: "content-box",
                width: "calc(100% - 2px)",
              }}
            />
            <div className="note">{hero.imageNote}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import { faFacebookF, faInstagram, faTiktok, faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import type { IconDefinition } from "@fortawesome/free-brands-svg-icons";
import { socialLinks } from "@/content/rotana";
import { t } from "@/i18n";

const NETWORKS: { key: keyof typeof socialLinks; label: string; icon: IconDefinition }[] = [
  { key: "instagram", label: "Instagram", icon: faInstagram },
  { key: "tiktok", label: "TikTok", icon: faTiktok },
  { key: "facebook", label: "Facebook", icon: faFacebookF },
  { key: "whatsapp", label: "WhatsApp", icon: faWhatsapp },
];

/**
 * Font Awesome brand icon as inline SVG (same glyphs and version, 6.4.0, as the
 * original). Inline SVG needs no icon font download, so the original "noicons"
 * text fallback is no longer needed.
 */
function BrandIcon({ icon }: { icon: IconDefinition }) {
  const [width, height, , , path] = icon.icon;
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox={`0 0 ${width} ${height}`}
      style={{ height: "1em", width: "auto", overflow: "visible", fill: "currentColor" }}
    >
      <path d={Array.isArray(path) ? path.join(" ") : path} />
    </svg>
  );
}

export function SocialLinks() {
  const [note, setNote] = useState(t("contact.socialNote"));

  return (
    <>
      <div className="social">
        {NETWORKS.map(({ key, label, icon }) => {
          const url = socialLinks[key];
          return url ? (
            <a key={key} href={url} data-k={key} aria-label={label} target="_blank" rel="noopener noreferrer">
              <BrandIcon icon={icon} />
              <span className="lbl">{label}</span>
            </a>
          ) : (
            <a
              key={key}
              href="#contact"
              data-k={key}
              aria-label={label}
              onClick={(e) => {
                e.preventDefault();
                setNote(t("contact.socialDemo", { name: label }));
              }}
            >
              <BrandIcon icon={icon} />
              <span className="lbl">{label}</span>
            </a>
          );
        })}
      </div>
      <div id="social-note" className="note" role="status">
        {note}
      </div>
    </>
  );
}

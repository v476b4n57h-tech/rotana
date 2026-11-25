"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { work, type Group, type WorkItem } from "@/content/rotana";
import { t } from "@/i18n";
import { panelClass, usePanels } from "./panels";

type Filter = "all" | Group;

/**
 * "Ons werk": collapsible masonry gallery (one of the Single Active Panels)
 * with filters and a lightbox. The lightbox is a modal layer on top of the
 * gallery: while it is open, the rest of the page cannot be reached.
 */
export function Gallery() {
  const { active, closing, open, close, lightbox, setLightbox } = usePanels();
  const isOpen = active === "gallery";
  const [filter, setFilter] = useState<Filter>("all");
  const [shown, setShown] = useState<WorkItem[]>([]);
  const [index, setIndex] = useState(0);
  const lastFocus = useRef<HTMLElement | null>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);

  const item = lightbox ? shown[index] : undefined;

  const openLightbox = (w: WorkItem) => {
    const list = work.filter((x) => filter === "all" || x.group === filter);
    lastFocus.current = document.activeElement as HTMLElement | null;
    setShown(list);
    setIndex(list.indexOf(w));
    setLightbox(true);
  };

  const closeLightbox = useCallback(() => setLightbox(false), [setLightbox]);

  const step = useCallback(
    (delta: number) => setIndex((i) => (i + delta + shown.length) % shown.length),
    [shown.length],
  );

  // While the lightbox is open: focus it, block the page behind it, handle the keyboard.
  useEffect(() => {
    if (!lightbox) return;
    closeButton.current?.focus({ preventScroll: true });
    const behind = [
      ...document.querySelectorAll<HTMLElement>("body > *:not(script), main > *:not(#lb)"),
    ].filter((el) => !el.contains(document.getElementById("lb")));
    behind.forEach((el) => (el.inert = true));
    document.body.classList.add("lb-open");

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        closeLightbox();
      } else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "Tab") {
        // Focus trap: Tab and Shift+Tab cycle through the lightbox buttons only.
        const buttons = [...document.querySelectorAll<HTMLElement>("#lb button")];
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        const inside = document.activeElement?.closest("#lb");
        if (e.shiftKey && (document.activeElement === first || !inside)) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && (document.activeElement === last || !inside)) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      behind.forEach((el) => (el.inert = false));
      document.body.classList.remove("lb-open");
      document.removeEventListener("keydown", onKey);
      // Only now (page unlocked) can focus go back to the photo that opened the lightbox.
      lastFocus.current?.focus({ preventScroll: true });
    };
  }, [lightbox, closeLightbox, step]);

  return (
    <>
      <section id="werk" className="why">
        <div className="wrap reveal" style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div className="eyebrow">{t("work.eyebrow")}</div>
            <h2 id="werk-title">{t("work.title")}</h2>
          </div>
          <div id="werk-open-wrap">
            <button
              ref={toggle}
              type="button"
              className="btn"
              id="werk-open"
              aria-expanded={isOpen}
              aria-controls="werk-panel"
              onClick={() => (isOpen ? close("gallery") : open("gallery", { anchor: toggle.current }))}
            >
              {isOpen ? t("common.close") : t("work.open")}
            </button>
          </div>
          <div
            id="werk-panel"
            className={panelClass("gallery", active, closing)}
            role="region"
            aria-labelledby="werk-title"
            tabIndex={-1}
            style={{ display: "flex", flexDirection: "column", gap: 28 }}
          >
            <div className="filters" role="group" aria-label={t("work.filterLabel")}>
              {(["all", "men", "women"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  className={filter === f ? "on" : undefined}
                  data-f={f}
                  aria-pressed={filter === f}
                  onClick={() => setFilter(f)}
                >
                  {f === "all" ? t("work.all") : t(`common.${f}`)}
                </button>
              ))}
            </div>
            <div className="masonry" id="masonry">
              {work.map((w) => (
                <button
                  key={w.alt}
                  type="button"
                  className={filter !== "all" && w.group !== filter ? "tile gone" : "tile"}
                  data-cat={w.group}
                  aria-label={t("work.viewPhoto", { alt: w.alt })}
                  onClick={() => openLightbox(w)}
                >
                  <Image
                    src={w.image}
                    alt={w.alt}
                    sizes="(max-width: 520px) calc(100vw - 32px), (max-width: 900px) 50vw, 380px"
                    style={{ aspectRatio: `${w.image.width} / ${w.image.height}` }}
                  />
                  <span className="cap">{t(`common.${w.group}`)}</span>
                </button>
              ))}
            </div>
            <div className="note">{t("work.note")}</div>
          </div>
        </div>
      </section>

      <div
        className="lb"
        id="lb"
        hidden={!item}
        role="dialog"
        aria-modal="true"
        aria-label={t("work.lightboxLabel")}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeLightbox();
        }}
      >
        <button
          type="button"
          className="x"
          id="lbx"
          aria-label={t("common.close")}
          ref={closeButton}
          onClick={closeLightbox}
        >
          &times;
        </button>
        <button
          type="button"
          className="pv"
          id="lbp"
          aria-label={t("work.previous")}
          onClick={() => step(-1)}
        >
          &#8249;
        </button>
        {item && (
          // The full photo is only fetched when the lightbox opens; natural size is kept as in the original.
          // eslint-disable-next-line @next/next/no-img-element
          <img id="lbi" src={item.image.src} alt={item.alt} />
        )}
        <button type="button" className="nx" id="lbn" aria-label={t("work.next")} onClick={() => step(1)}>
          &#8250;
        </button>
        <div className="lbc" id="lbc">
          {item ? `${item.alt}  (${index + 1}/${shown.length})` : ""}
        </div>
      </div>
    </>
  );
}

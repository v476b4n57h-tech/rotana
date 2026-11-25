"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { work, type Group, type WorkItem } from "@/content/rotana";
import { t } from "@/i18n";

type Filter = "all" | Group;

/** "Ons werk": collapsible masonry gallery with filters and a lightbox. */
export function Gallery() {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [shown, setShown] = useState<WorkItem[]>([]);
  const [current, setCurrent] = useState<number | null>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  const openLightbox = (item: WorkItem) => {
    const list = work.filter((w) => filter === "all" || w.group === filter);
    lastFocus.current = document.activeElement as HTMLElement | null;
    setShown(list);
    setCurrent(list.indexOf(item));
  };

  const closeLightbox = useCallback(() => {
    setCurrent(null);
    lastFocus.current?.focus();
  }, []);

  const step = useCallback(
    (delta: number) => setCurrent((i) => (i === null ? i : (i + delta + shown.length) % shown.length)),
    [shown.length],
  );

  useEffect(() => {
    if (current !== null) closeButton.current?.focus();
  }, [current === null]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard: Escape closes, arrows step through the photos.
  useEffect(() => {
    if (current === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "ArrowRight") step(1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [current, closeLightbox, step]);

  // Any link to #werk opens the gallery panel.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if ((e.target as Element | null)?.closest?.('a[href="#werk"]')) setOpen(true);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const item = current === null ? null : shown[current];

  return (
    <>
      <section id="werk" className="why">
        <div className="wrap reveal" style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div className="eyebrow">{t("work.eyebrow")}</div>
            <h2>{t("work.title")}</h2>
          </div>
          <div id="werk-open-wrap">
            <button
              type="button"
              className="btn"
              id="werk-open"
              aria-expanded={open}
              aria-controls="werk-panel"
              onClick={() => setOpen(!open)}
            >
              {open ? t("common.close") : t("work.open")}
            </button>
          </div>
          <div
            id="werk-panel"
            className={open ? "open" : undefined}
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
        hidden={item === null}
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
          {item ? `${item.alt}  (${(current ?? 0) + 1}/${shown.length})` : ""}
        </div>
      </div>
    </>
  );
}

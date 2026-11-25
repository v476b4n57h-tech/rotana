"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import type { Slide } from "@/content/rotana";
import { t } from "@/i18n";

/**
 * Cross-fading photo slider with dots, as in the original:
 * autoplay (paused on hover and with reduced motion), dots to pick a photo.
 */
export function Slider({
  slides,
  groupLabel,
  index,
}: {
  slides: Slide[];
  groupLabel: string;
  index: number;
}) {
  const [current, setCurrent] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const still = useRef(true);

  const play = useCallback(() => {
    clearInterval(timer.current);
    if (still.current) return;
    timer.current = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 4500 + index * 700);
  }, [slides.length, index]);

  useEffect(() => {
    still.current = !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    play();
    return () => clearInterval(timer.current);
  }, [play]);

  return (
    <>
      <div
        className="frame"
        data-slider=""
        onMouseEnter={() => clearInterval(timer.current)}
        onMouseLeave={play}
      >
        {slides.map((slide, i) => (
          <div
            key={slide.alt}
            className={i === current ? "pic on" : "pic"}
            style={{ "--i": `url('${slide.backdrop.src}')` } as CSSProperties}
          >
            <Image src={slide.image} alt={slide.alt} sizes="(max-width: 720px) calc(100vw - 32px), 560px" />
          </div>
        ))}
      </div>
      <div className="dots" role="group" aria-label={t("mood.chooseImage", { group: groupLabel })}>
        {slides.map((slide, i) => (
          <button
            key={slide.alt}
            type="button"
            aria-label={t("mood.image", { n: i + 1 })}
            className={i === current ? "on" : undefined}
            aria-pressed={i === current}
            onClick={() => {
              setCurrent(i);
              play();
            }}
          />
        ))}
      </div>
    </>
  );
}

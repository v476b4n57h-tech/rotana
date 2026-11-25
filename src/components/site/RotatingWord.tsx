"use client";

import { useEffect, useRef, useState } from "react";

/** Cycles through words with a fade, like the original ("hem" → "haar" → "hem en haar"). */
export function RotatingWord({ words }: { words: string[] }) {
  const [index, setIndex] = useState(words.length - 1);
  const [out, setOut] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    // Screen readers should not announce every word change.
    ref.current?.setAttribute("aria-live", "off");
    let swap: ReturnType<typeof setTimeout> | undefined;
    const timer = setInterval(() => {
      setOut(true);
      swap = setTimeout(() => {
        setIndex((i) => (i + 1) % words.length);
        setOut(false);
      }, 450);
    }, 2800);
    return () => {
      clearInterval(timer);
      clearTimeout(swap);
    };
  }, [words.length]);

  return (
    <span ref={ref} className={out ? "rot out" : "rot"} id="rot">
      {words[index]}
    </span>
  );
}

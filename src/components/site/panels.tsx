"use client";

/**
 * Single Active Panel controller.
 *
 * The page has interactive panels: "services", "gallery" and "booking".
 * At most ONE is active at a time: activating one closes the previous one.
 * The lightbox is a modal layer that only exists on top of the gallery.
 *
 * The controller also handles the details that make switching feel calm:
 * - links (header, hero) open the right panel and scroll to it smoothly;
 * - toggle buttons keep their position on screen when another panel closes;
 * - focus moves to the panel that was opened by a link (keyboard/screen readers);
 * - Escape closes the lightbox first, then the active panel;
 * - closing plays a short exit animation (skipped with reduced motion).
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type PanelId = "services" | "gallery" | "booking";

/** Where each panel lives on the page, and what gets focus when it opens via a link. */
const PANELS: Record<PanelId, { section: string; focus: string; toggle?: string }> = {
  services: { section: "diensten", focus: "#svc-panel", toggle: "#svc-open" },
  gallery: { section: "werk", focus: "#werk-panel", toggle: "#werk-open" },
  booking: { section: "afspraak", focus: "#book-title" },
};

const EXIT_MS = 180;

interface PanelContextValue {
  active: PanelId | null;
  closing: PanelId | null;
  lightbox: boolean;
  /** Open a panel. `anchor`: element that must stay put on screen (e.g. the clicked toggle). */
  open: (id: PanelId, opts?: { anchor?: HTMLElement | null; via?: "link" | "toggle" }) => void;
  close: (id: PanelId, opts?: { returnFocus?: boolean }) => void;
  setLightbox: (open: boolean) => void;
}

const PanelContext = createContext<PanelContextValue | null>(null);

export function usePanels(): PanelContextValue {
  const ctx = useContext(PanelContext);
  if (!ctx) throw new Error("usePanels must be used inside <PanelProvider>");
  return ctx;
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

type Pending =
  | { kind: "anchor"; el: HTMLElement; top: number }
  | { kind: "link"; id: PanelId }
  | { kind: "focus"; selector: string }
  | null;

export function PanelProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<PanelId | null>(null);
  const [closing, setClosing] = useState<PanelId | null>(null);
  const [lightbox, setLightboxState] = useState(false);
  const pending = useRef<Pending>(null);
  // Bumped on every open/close so scroll/focus run even when the active panel is unchanged.
  const [seq, setSeq] = useState(0);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Mirror of `active` for event handlers, so they never act on a stale value.
  const activeRef = useRef<PanelId | null>(null);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  const open = useCallback<PanelContextValue["open"]>((id, opts = {}) => {
    clearTimeout(exitTimer.current);
    setClosing(null); // switching: the previous panel closes at once (no stacking, no layout jump)
    setLightboxState(false);
    setActive(id);
    activeRef.current = id;
    setSeq((n) => n + 1);
    if (opts.via === "link") pending.current = { kind: "link", id };
    else if (opts.anchor)
      pending.current = { kind: "anchor", el: opts.anchor, top: opts.anchor.getBoundingClientRect().top };
  }, []);

  const close = useCallback<PanelContextValue["close"]>((id, opts = {}) => {
    if (activeRef.current !== id) return;
    activeRef.current = null;
    setActive(null);
    setLightboxState(false);
    clearTimeout(exitTimer.current);
    if (prefersReducedMotion()) {
      setClosing(null);
    } else {
      setClosing(id);
      exitTimer.current = setTimeout(() => setClosing(null), EXIT_MS);
    }
    const toggle = PANELS[id].toggle;
    if (opts.returnFocus && toggle) pending.current = { kind: "focus", selector: toggle };
    setSeq((n) => n + 1);
  }, []);

  const setLightbox = useCallback((value: boolean) => setLightboxState(value), []);

  // After React has updated the page: fix scroll position and focus.
  useLayoutEffect(() => {
    const job = pending.current;
    if (!job) return;
    pending.current = null;
    if (job.kind === "anchor") {
      // Keep the clicked button where it was, even if a panel above it just closed.
      // Corrected again on the next frames, because the browser's own scroll
      // anchoring may still nudge the page after this point.
      const { el, top } = job;
      const keep = () => {
        const delta = el.getBoundingClientRect().top - top;
        if (Math.abs(delta) > 0.5) window.scrollBy({ top: delta, behavior: "instant" });
      };
      keep();
      requestAnimationFrame(() => {
        keep();
        requestAnimationFrame(keep);
      });
    } else if (job.kind === "link") {
      const { section, focus } = PANELS[job.id];
      document.getElementById(section)?.scrollIntoView({
        behavior: prefersReducedMotion() ? "instant" : "smooth",
        block: "start",
      });
      document.querySelector<HTMLElement>(focus)?.focus({ preventScroll: true });
      history.replaceState(history.state, "", `#${section}`);
    } else {
      document.querySelector<HTMLElement>(job.selector)?.focus({ preventScroll: true });
    }
  }, [seq]);

  // Links anywhere on the page: <a data-panel="services|gallery|booking">.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest?.<HTMLAnchorElement>("a[data-panel]");
      const id = link?.dataset.panel as PanelId | undefined;
      if (!link || !id || !(id in PANELS)) return;
      e.preventDefault();
      open(id, { via: "link" });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [open]);

  // Escape: close the top-most layer only (lightbox first, then the active panel).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || lightbox) return; // the lightbox handles its own Escape
      if (active === "services" || active === "gallery") close(active, { returnFocus: true });
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active, lightbox, close]);

  useEffect(() => () => clearTimeout(exitTimer.current), []);

  const value = useMemo(
    () => ({ active, closing, lightbox, open, close, setLightbox }),
    [active, closing, lightbox, open, close, setLightbox],
  );
  return <PanelContext.Provider value={value}>{children}</PanelContext.Provider>;
}

/** CSS classes for a collapsible panel: "open", "closing" (exit animation) or none. */
export function panelClass(id: PanelId, active: PanelId | null, closing: PanelId | null): string | undefined {
  if (active === id) return "open";
  if (closing === id) return "closing";
  return undefined;
}

"use client";
import { Moon, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
const key = "portfolio-theme";
export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const active = useRef<ViewTransition | null>(null);
  const cleanupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sequence = useRef(0);
  const desired = useRef<"dark" | "light">("dark");
  useEffect(() => {
    const sync = () =>
      setTheme(
        document.documentElement.dataset.theme === "light" ? "light" : "dark",
      );
    const update = () => {
      let saved: string | null = null;
      try {
        saved = localStorage.getItem(key);
      } catch {}
      document.documentElement.dataset.theme =
        saved === "light" ? "light" : "dark";
      desired.current = saved === "light" ? "light" : "dark";
      sync();
    };
    sync();
    desired.current =
      document.documentElement.dataset.theme === "light" ? "light" : "dark";
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("storage", update);
      sequence.current++;
      active.current?.skipTransition();
      if (cleanupTimer.current) clearTimeout(cleanupTimer.current);
      document.documentElement.classList.remove(
        "theme-crossfading",
        "theme-changing",
      );
    };
  }, []);
  const toggle = () => {
    const root = document.documentElement;
    const next = desired.current === "light" ? "dark" : "light";
    desired.current = next;
    const id = ++sequence.current;
    active.current?.skipTransition();
    if (cleanupTimer.current) clearTimeout(cleanupTimer.current);
    root.classList.remove("theme-changing", "theme-crossfading");
    const apply = () => {
      if (id !== sequence.current) return;
      root.dataset.theme = next;
      flushSync(() => setTheme(next));
      try {
        localStorage.setItem(key, next);
      } catch {}
    };
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      apply();
      return;
    }
    // Blend complete rendered views, including gradients, rather than repainting
    // hundreds of individual colors at different rates.
    if (typeof document.startViewTransition === "function") {
      root.classList.add("theme-crossfading");
      const transition = document.startViewTransition(apply);
      active.current = transition;
      void transition.finished
        .catch(() => {})
        .finally(() => {
          if (id !== sequence.current) return;
          root.classList.remove("theme-crossfading");
          active.current = null;
        });
    } else {
      root.classList.add("theme-changing");
      // Commit the old colors before changing variables in older browsers.
      void root.offsetHeight;
      apply();
      cleanupTimer.current = setTimeout(() => {
        root.classList.remove("theme-changing");
        cleanupTimer.current = null;
      }, 950);
    }
  };
  return (
    <button
      className="theme-toggle"
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      <Moon className="theme-moon" size={19} aria-hidden="true" />
      <Sun className="theme-sun" size={19} aria-hidden="true" />
    </button>
  );
}

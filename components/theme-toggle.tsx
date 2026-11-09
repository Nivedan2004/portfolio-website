"use client";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
const key = "portfolio-theme";
export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
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
      sync();
    };
    sync();
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("storage", update);
    };
  }, []);
  const toggle = () => {
    const next =
      document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.classList.add("theme-changing");
    document.documentElement.dataset.theme = next;
    setTheme(next);
    try {
      localStorage.setItem(key, next);
    } catch {}
  };
  useEffect(() => {
    const timer = setTimeout(
      () => document.documentElement.classList.remove("theme-changing"),
      500,
    );
    return () => clearTimeout(timer);
  }, [theme]);
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

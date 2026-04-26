"use client";
import { useEffect, useState } from "react";

export function ThemeToggle({ theme, toggle }) {
  return (
    <button
      type="button"
      onClick={() => { console.debug('theme toggle clicked, current:', theme); toggle(); }}
      aria-label="Toggle theme"
      className="p-2 rounded bg-white/5 border border-white/10 text-current shadow-lg"
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}

export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("theme");
      const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initial = stored || (prefersDark ? "dark" : "light");
      setTheme(initial);
      applyTheme(initial);
    } catch (e) {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyTheme(t) {
    if (typeof document === "undefined") return;
    if (t === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      localStorage.setItem("theme", next);
    } catch (e) {}
    applyTheme(next);
  }

  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}

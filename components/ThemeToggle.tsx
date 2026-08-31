"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const THEME_STORAGE_KEY = "cash-lab-theme";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [light, setLight] = useState(false);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    const isLight =
      storedTheme === "light" ||
      (storedTheme === null &&
        document.documentElement.dataset.theme === "light");

    document.documentElement.dataset.theme = isLight ? "light" : "dark";
    setLight(isLight);
  }, []);

  function toggleTheme() {
    const nextTheme = light ? "dark" : "light";
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    setLight(!light);
  }

  return (
    <button
      type="button"
      className={`icon-button theme-button ${className}`.trim()}
      onClick={toggleTheme}
      aria-label={`Switch to ${light ? "dark" : "light"} theme`}
      title={`Switch to ${light ? "dark" : "light"} theme`}
    >
      {light ? <Moon size={17} /> : <Sun size={17} />}
    </button>
  );
}

"use client";

import { useTheme } from "@/contexts/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors"
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title={theme === "dark" ? "Light mode" : "Dark mode"}
    >
      {theme === "dark" ? (
        <>
          <span className="text-amber-400" aria-hidden>☀</span>
          <span className="hidden sm:inline">Light</span>
        </>
      ) : (
        <>
          <span className="text-slate-500" aria-hidden>☽</span>
          <span className="hidden sm:inline">Dark</span>
        </>
      )}
    </button>
  );
}

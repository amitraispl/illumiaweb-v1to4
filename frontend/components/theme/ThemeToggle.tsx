"use client";

import { useTheme } from "./theme";

/**
 * The switch each version puts in its nav. Unstyled apart from its parts:
 * an <i> glyph (drawn in globals.css) and a <span> label a version may hide on phones.
 * Both name the theme it switches to; data-theme-now carries the current one.
 */
export function ThemeToggle({ version, className }: { version: string; className?: string }) {
  const [theme, toggle] = useTheme(version);
  const next = theme === "light" ? "dark" : "light";
  return (
    <button type="button" className={className} onClick={toggle} aria-label={`Switch to ${next} theme`} data-theme-now={theme}>
      <i aria-hidden="true" />
      <span>{next === "dark" ? "Dark" : "Light"}</span>
    </button>
  );
}

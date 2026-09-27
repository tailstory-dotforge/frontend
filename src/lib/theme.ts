export type ThemeId = "light" | "dark" | "solarized" | "neon";

export const THEME_STORAGE_KEY = "dotforge-theme";

/**
 * Each theme's canvas color (--bg in themes.css): the browser-chrome theme
 * color, and the halves of the "System" swatch.
 */
export const themeColors: Record<ThemeId, string> = {
  light: "#f4f4f2",
  dark: "#141414",
  solarized: "#eee8d5",
  neon: "#0a0e27",
};

export const themes = [
  { id: "system", label: "System" },
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
  { id: "solarized", label: "Solarized" },
  { id: "neon", label: "Neon" },
] as const;

export function isThemeId(value: string): value is ThemeId {
  // Own-property check: `in` would accept inherited keys like "toString".
  return Object.hasOwn(themeColors, value);
}

/**
 * Resolve a stored preference to a concrete theme. "system" and any
 * unknown/stale value fall back to the OS preference.
 */
export function resolveTheme(theme: string): ThemeId {
  if (isThemeId(theme)) return theme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/**
 * Apply a resolved theme to the document: root class plus the browser-chrome
 * theme color. The pre-paint bootstrap in BaseLayout.astro mirrors this logic
 * inline (it runs before modules can load), so keep the two in sync.
 */
export function applyResolvedTheme(resolved: ThemeId) {
  document.documentElement.className = `theme-${resolved}`;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", themeColors[resolved]);
}

export type ThemeId = "light" | "dark" | "solarized" | "neon";

export const themeColors: Record<ThemeId, string> = {
  light: "#f6f8fa",
  dark: "#161b22",
  solarized: "#eee8d5",
  neon: "#1a1f3a",
};

export const themes = [
  { id: "system", label: "System" },
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
  { id: "solarized", label: "Solarized" },
  { id: "neon", label: "Neon" },
] as const;

export function isThemeId(value: string): value is ThemeId {
  return value in themeColors;
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

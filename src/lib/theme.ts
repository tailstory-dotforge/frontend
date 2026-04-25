export type ThemeId = "light" | "dark" | "solarized" | "neon";

export const themeColors: Record<ThemeId, string> = {
  light: "#f6f8fa",
  dark: "#161b22",
  solarized: "#eee8d5",
  neon: "#24283b",
};

export const themes = [
  { id: "system", label: "System" },
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
  { id: "solarized", label: "Solarized" },
  { id: "neon", label: "Neon" },
] as const;

export function resolveTheme(theme: string): ThemeId {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return theme as ThemeId;
}

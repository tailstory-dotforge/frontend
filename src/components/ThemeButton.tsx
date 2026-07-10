import { Palette } from "lucide-preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { applyResolvedTheme, resolveTheme, themes } from "../lib/theme";
import ToolbarIcon from "./ToolbarIcon";

export default function ThemeButton() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    // Read saved preference from localStorage (not resolved theme from DOM)
    if (typeof localStorage !== "undefined") {
      return localStorage.getItem("dotforge-theme") || "system";
    }
    return "system";
  });
  const ref = useRef<HTMLDivElement>(null);

  // Listen for system preference changes when using "system" theme
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    function handleChange() {
      const saved = localStorage.getItem("dotforge-theme");
      if (saved === "system" || !saved) {
        applyResolvedTheme(resolveTheme("system"));
      }
    }
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function applyTheme(t: string) {
    setTheme(t);
    localStorage.setItem("dotforge-theme", t);
    applyResolvedTheme(resolveTheme(t));
    setOpen(false);
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape" && open) {
      setOpen(false);
      ref.current?.querySelector("button")?.focus();
    }
  }

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: Escape handling for the popup; the trigger button itself is focusable and interactive.
    <div style={{ position: "relative" }} ref={ref} onKeyDown={handleKeyDown}>
      <ToolbarIcon
        label="Theme"
        onClick={() => setOpen(!open)}
        ariaHasPopup="menu"
        ariaExpanded={open}
      >
        <Palette />
      </ToolbarIcon>

      {open && (
        <div
          role="menu"
          aria-label="Theme"
          style={{
            position: "absolute",
            top: "40px",
            right: 0,
            background: "var(--panel)",
            border: "1px solid var(--panel-border)",
            borderRadius: "8px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
            padding: "6px 0",
            width: "140px",
            zIndex: 2000,
          }}
        >
          {themes.map((t) => (
            <button
              type="button"
              role="menuitemradio"
              aria-checked={theme === t.id}
              key={t.id}
              onClick={() => applyTheme(t.id)}
              class={`df-menu-item${theme === t.id ? " is-active" : ""}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

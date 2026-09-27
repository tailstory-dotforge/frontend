import {
  Check,
  Download,
  FolderOpen,
  LayoutDashboard,
  Menu,
} from "lucide-preact";
import type { TargetedKeyboardEvent } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import type { ModuleId } from "../../lib/modules";
import {
  applyResolvedTheme,
  resolveTheme,
  themeAccents,
  themeColors,
  themes,
} from "../../lib/theme";
import ToolbarIcon from "../ToolbarIcon";

// The ZPL editor has no page yet; its entry returns here once /zpl exists.
const modules: {
  id: ModuleId;
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
}[] = [{ id: "artboard", label: "Artboard", href: "/", icon: LayoutDashboard }];

const ITEM_SELECTOR = '[role="menuitem"], [role="menuitemradio"]';

export default function MainMenu({
  activeModule,
  onDownload,
  onUploadFile,
}: {
  activeModule: ModuleId;
  onDownload: () => void;
  onUploadFile: (file: File) => void;
}) {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    // Read saved preference from localStorage (not resolved theme from DOM)
    if (typeof localStorage !== "undefined") {
      return localStorage.getItem("dotforge-theme") || "system";
    }
    return "system";
  });
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Listen for system preference changes when using "system" theme. Lives
  // here rather than in the menu body so it runs while the menu is closed.
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
    if (!open) return;
    function handlePointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (open) {
      menuRef.current?.querySelector<HTMLElement>(ITEM_SELECTOR)?.focus();
    }
  }, [open]);

  function close() {
    setOpen(false);
    rootRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
  }

  function applyTheme(t: string) {
    setTheme(t);
    localStorage.setItem("dotforge-theme", t);
    applyResolvedTheme(resolveTheme(t));
  }

  function handleMenuKeyDown(e: TargetedKeyboardEvent<HTMLDivElement>) {
    // Keys pressed inside the menu belong to it: without this, the editor's
    // window shortcuts would also see them (Escape deselects, Delete
    // removes the selected element).
    e.stopPropagation();
    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>(ITEM_SELECTOR) ?? [],
    );
    const index = items.indexOf(document.activeElement as HTMLElement);
    const focusAt = (i: number) =>
      items[(i + items.length) % items.length]?.focus();
    switch (e.key) {
      case "ArrowDown":
      case "ArrowRight":
        e.preventDefault();
        focusAt(index + 1);
        break;
      case "ArrowUp":
      case "ArrowLeft":
        e.preventDefault();
        focusAt(index - 1);
        break;
      case "Home":
        e.preventDefault();
        focusAt(0);
        break;
      case "End":
        e.preventDefault();
        focusAt(items.length - 1);
        break;
      case "Escape":
        close();
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  }

  const themeLabel = themes.find((t) => t.id === theme)?.label ?? "System";

  return (
    <div class="df-float-left" ref={rootRef}>
      <div class="df-panel">
        <ToolbarIcon
          label="Menu"
          onClick={() => setOpen(!open)}
          ariaHasPopup="menu"
          ariaExpanded={open}
        >
          <Menu />
        </ToolbarIcon>
      </div>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Main menu"
          class="df-panel df-menu"
          onKeyDown={handleMenuKeyDown}
        >
          <button
            type="button"
            role="menuitem"
            tabIndex={-1}
            class="df-menu-item"
            onClick={() => {
              fileRef.current?.click();
              close();
            }}
          >
            <FolderOpen size={16} strokeWidth={1.5} aria-hidden="true" />
            Open…
          </button>
          <button
            type="button"
            role="menuitem"
            tabIndex={-1}
            class="df-menu-item"
            onClick={() => {
              onDownload();
              close();
            }}
          >
            <Download size={16} strokeWidth={1.5} aria-hidden="true" />
            Download .dotforge
          </button>

          <hr class="df-menu-separator" />

          <div class="df-menu-label" aria-hidden="true">
            <span>Theme</span>
            <span class="df-menu-label-value">{themeLabel}</span>
          </div>
          <fieldset aria-label="Theme" class="df-swatches">
            {themes.map((t) => (
              <button
                type="button"
                role="menuitemradio"
                tabIndex={-1}
                aria-checked={theme === t.id}
                aria-label={t.label}
                title={t.label}
                key={t.id}
                class="df-swatch-btn"
                onClick={() => applyTheme(t.id)}
              >
                {t.id === "system" ? (
                  <span
                    class="df-swatch"
                    style={{
                      background: `linear-gradient(135deg, ${themeColors.light} 50%, ${themeColors.dark} 50%)`,
                    }}
                  />
                ) : (
                  <span
                    class="df-swatch"
                    style={{ background: themeColors[t.id] }}
                  >
                    <span
                      class="df-swatch-dot"
                      style={{ background: themeAccents[t.id] }}
                    />
                  </span>
                )}
              </button>
            ))}
          </fieldset>

          <hr class="df-menu-separator" />

          <div class="df-menu-label" aria-hidden="true">
            Editor
          </div>
          {modules.map(({ id, label, href, icon: Icon }) => (
            <a
              key={id}
              href={href}
              role="menuitem"
              tabIndex={-1}
              aria-current={activeModule === id ? "page" : undefined}
              class="df-menu-item"
            >
              <Icon size={16} strokeWidth={1.5} aria-hidden="true" />
              {label}
              {activeModule === id && (
                <Check
                  class="df-menu-check"
                  size={16}
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
              )}
            </a>
          ))}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept=".dotforge,application/json"
        style={{ display: "none" }}
        onChange={(e) => {
          const input = e.currentTarget;
          const file = input.files?.[0];
          if (file) onUploadFile(file);
          input.value = "";
        }}
      />
    </div>
  );
}

import {
  Check,
  Download,
  FolderOpen,
  LayoutDashboard,
  type LucideIcon,
  Menu,
} from "lucide-preact";
import type { TargetedKeyboardEvent } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import type { ModuleId } from "../../lib/modules";
import {
  applyResolvedTheme,
  isThemeId,
  resolveTheme,
  THEME_STORAGE_KEY,
  themeColors,
  themes,
} from "../../lib/theme";
import ToolbarIcon from "../ToolbarIcon";

// The ZPL editor has no page yet; its entry returns here once /zpl exists.
const modules: {
  id: ModuleId;
  label: string;
  href: string;
  icon: LucideIcon;
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
  // The saved preference ("system" included), not the resolved theme.
  const [theme, setTheme] = useState(() =>
    typeof window === "undefined"
      ? "system"
      : (localStorage.getItem(THEME_STORAGE_KEY) ?? "system"),
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Follow OS light/dark changes while the preference isn't a concrete
  // theme ("system", or a stale stored value).
  useEffect(() => {
    if (isThemeId(theme)) return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => applyResolvedTheme(resolveTheme(theme));
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

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
    localStorage.setItem(THEME_STORAGE_KEY, t);
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
          icon={Menu}
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        />
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

          <hr />

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
                {/* Each swatch wears its theme's class, so it paints with
                    that theme's own --bg and --accent. */}
                {t.id === "system" ? (
                  <span
                    class="df-swatch"
                    style={{
                      background: `linear-gradient(135deg, ${themeColors.light} 50%, ${themeColors.dark} 50%)`,
                    }}
                  />
                ) : (
                  <span class={`df-swatch theme-${t.id}`}>
                    <span class="df-swatch-dot" />
                  </span>
                )}
              </button>
            ))}
          </fieldset>

          <hr />

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

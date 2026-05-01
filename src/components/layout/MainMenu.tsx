import { Menu, User } from "lucide-preact";
import { useEffect, useRef, useState } from "preact/hooks";
import ThemeButton from "../ThemeButton";
import ToolbarIcon from "../ToolbarIcon";

export default function MainMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        top: "20px",
        right: "20px",
        background: "var(--panel)",
        border: "1px solid var(--panel-border)",
        borderRadius: "10px",
        padding: "8px 12px",
        display: "flex",
        gap: "12px",
        zIndex: 1000,
        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
      }}
    >
      <div style={{ position: "relative" }}>
        <ToolbarIcon label="Menu" onClick={() => setOpen(!open)}>
          <Menu />
        </ToolbarIcon>

        {open && (
          <div
            style={{
              position: "absolute",
              top: "40px",
              right: 0,
              background: "var(--panel)",
              border: "1px solid var(--panel-border)",
              borderRadius: "8px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
              padding: "6px 0",
              width: "180px",
              zIndex: 2000,
            }}
          >
            <button
              type="button"
              onClick={() => {
                setOpen(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                width: "100%",
                textAlign: "left",
                border: "none",
                padding: "8px 12px",
                cursor: "pointer",
                color: "var(--text)",
                background: "transparent",
                transition: "background 0.1s",
                font: "inherit",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--button-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <User size={16} strokeWidth={2} />
              Account
            </button>
          </div>
        )}
      </div>

      <ThemeButton />
    </div>
  );
}

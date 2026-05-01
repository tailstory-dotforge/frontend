import { type ComponentChildren, cloneElement } from "preact";

export default function ToolbarIcon({
  label,
  children,
  onClick,
  active = false,
}: {
  label: string;
  children: ComponentChildren;
  onClick?: () => void;
  active?: boolean;
}) {
  const baseBg = active ? "var(--button-hover)" : "var(--button-bg)";
  const baseColor = active ? "var(--icon-hover)" : "var(--icon)";

  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      style={{
        width: "32px",
        height: "32px",
        borderRadius: "6px",
        background: baseBg,
        border: "1px solid var(--button-border)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
        transition: "background 0.15s, color 0.15s",
        color: baseColor,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "var(--icon-hover)";
        e.currentTarget.style.background = "var(--button-hover)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = baseColor;
        e.currentTarget.style.background = baseBg;
      }}
    >
      {cloneElement(children, {
        size: 20,
        strokeWidth: 2,
        color: "currentColor",
      })}
    </button>
  );
}

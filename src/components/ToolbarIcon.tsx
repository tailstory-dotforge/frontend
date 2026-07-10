import { cloneElement, type VNode } from "preact";

export default function ToolbarIcon({
  label,
  children,
  onClick,
  active,
  ariaHasPopup,
  ariaExpanded,
}: {
  label: string;
  children: VNode;
  onClick?: () => void;
  /** For toggle buttons; exposed to assistive tech as aria-pressed. */
  active?: boolean;
  /** For buttons that open a popup (e.g. the theme menu). */
  ariaHasPopup?: "menu";
  ariaExpanded?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      aria-haspopup={ariaHasPopup}
      aria-expanded={ariaExpanded}
      onClick={onClick}
      class={`df-toolbar-btn${active ? " is-active" : ""}`}
    >
      {cloneElement(children, {
        size: 20,
        strokeWidth: 2,
        color: "currentColor",
      })}
    </button>
  );
}

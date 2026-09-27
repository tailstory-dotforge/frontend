import type { LucideIcon } from "lucide-preact";
import type { ButtonHTMLAttributes } from "preact";

export default function ToolbarIcon({
  label,
  icon: Icon,
  active,
  ...props
}: {
  label: string;
  icon: LucideIcon;
  /** For toggle buttons; exposed as aria-pressed, which also styles it. */
  active?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      class="df-toolbar-btn"
      {...props}
    >
      <Icon size={18} strokeWidth={1.5} aria-hidden="true" />
    </button>
  );
}

import { FileText, LayoutDashboard } from "lucide-preact";
import ToolbarIcon from "../ToolbarIcon";

export type ModuleId = "artboard" | "zpl";

const modules: {
  id: ModuleId;
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
}[] = [
  { id: "artboard", label: "Artboard", href: "/", icon: LayoutDashboard },
  { id: "zpl", label: "ZPL Editor", href: "/zpl", icon: FileText },
];

export default function ModuleSwitcher({
  activeModule,
}: {
  activeModule: ModuleId;
}) {
  return (
    <div
      style={{
        position: "absolute",
        top: "20px",
        left: "20px",
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
      {modules.map(({ id, label, href, icon: Icon }) => (
        <ToolbarIcon
          key={id}
          label={label}
          active={activeModule === id}
          onClick={() => {
            window.location.href = href;
          }}
        >
          <Icon />
        </ToolbarIcon>
      ))}
    </div>
  );
}

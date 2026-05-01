import { MousePointer2, Type } from "lucide-preact";
import ToolbarIcon from "../ToolbarIcon";

export type Tool = "select" | "text";

const tools: { id: Tool; label: string; icon: typeof MousePointer2 }[] = [
  { id: "select", label: "Select", icon: MousePointer2 },
  { id: "text", label: "Text", icon: Type },
];

export default function ShapesToolbar({
  activeTool,
  onSelectTool,
}: {
  activeTool: Tool;
  onSelectTool: (tool: Tool) => void;
}) {
  return (
    <div
      style={{
        background: "var(--panel)",
        border: "1px solid var(--panel-border)",
        borderRadius: "10px",
        padding: "8px 12px",
        display: "flex",
        gap: "12px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
      }}
    >
      {tools.map(({ id, label, icon: Icon }) => (
        <ToolbarIcon
          key={id}
          label={label}
          active={activeTool === id}
          onClick={() => onSelectTool(id)}
        >
          <Icon />
        </ToolbarIcon>
      ))}
    </div>
  );
}

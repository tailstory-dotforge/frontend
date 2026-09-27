import { type LucideIcon, MousePointer2, Type } from "lucide-preact";
import ToolbarIcon from "../ToolbarIcon";

export type Tool = "select" | "text";

const tools: { id: Tool; label: string; icon: LucideIcon }[] = [
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
    <div class="df-panel">
      {tools.map(({ id, label, icon }) => (
        <ToolbarIcon
          key={id}
          label={label}
          icon={icon}
          active={activeTool === id}
          onClick={() => onSelectTool(id)}
        />
      ))}
    </div>
  );
}

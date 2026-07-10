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
    <div class="df-panel">
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

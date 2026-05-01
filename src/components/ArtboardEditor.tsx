import type { ArtboardDocument, TextElement } from "@dotforge/core";
import { useState } from "preact/hooks";
import InspectorBubble from "../components/layout/InspectorBubble";
import ShapesToolbar, { type Tool } from "../components/layout/ShapesToolbar";
import ArtboardRenderer from "./ArtboardRenderer";

export default function ArtboardEditor({
  artboard,
}: {
  artboard: ArtboardDocument;
}) {
  const [selected, setSelected] = useState<TextElement | null>(null);
  const [selectedNode, setSelectedNode] = useState<HTMLElement | null>(null);
  const [revision, setRevision] = useState(0);
  const [activeTool, setActiveTool] = useState<Tool>("select");

  function handleSelect(el: TextElement | null, node?: HTMLElement | null) {
    setSelected(el);
    setSelectedNode(node ?? null);
  }

  function forceUpdate() {
    setRevision((r) => r + 1);
  }

  return (
    <div
      style={{
        position: "relative",
        flex: 1,
        minHeight: 0,
        width: "100%",
      }}
    >
      <ArtboardRenderer
        artboard={artboard}
        selected={selected}
        onSelect={handleSelect}
        revision={revision}
      />

      <ShapesToolbar activeTool={activeTool} onSelectTool={setActiveTool} />

      <InspectorBubble
        element={selected}
        elementNode={selectedNode}
        onChange={forceUpdate}
      />
    </div>
  );
}

import type { ArtboardDocument, TextElement } from "@dotforge/core";
import { useState } from "preact/hooks";
import PropertiesPanel from "../components/layout/PropertiesPanel";
import ShapesToolbar, { type Tool } from "../components/layout/ShapesToolbar";
import ArtboardRenderer from "./ArtboardRenderer";

export default function ArtboardEditor({
  artboard,
}: {
  artboard: ArtboardDocument;
}) {
  const [selected, setSelected] = useState<TextElement | null>(null);
  const [revision, setRevision] = useState(0);
  const [activeTool, setActiveTool] = useState<Tool>("select");
  const [width, setWidth] = useState(artboard.width);
  const [height, setHeight] = useState(artboard.height);

  function handleSelect(el: TextElement | null) {
    setSelected(el);
  }

  function forceUpdate() {
    setRevision((r) => r + 1);
  }

  const sizedArtboard = { ...artboard, width, height };

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
        artboard={sizedArtboard}
        selected={selected}
        onSelect={handleSelect}
        revision={revision}
        onResize={(w, h) => {
          setWidth(w);
          setHeight(h);
        }}
      />

      <ShapesToolbar activeTool={activeTool} onSelectTool={setActiveTool} />

      <PropertiesPanel element={selected} onChange={forceUpdate} />
    </div>
  );
}

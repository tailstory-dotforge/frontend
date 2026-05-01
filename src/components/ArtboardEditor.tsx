import type { ArtboardDocument, TextElement } from "@dotforge/core";
import { useEffect, useState } from "preact/hooks";
import FileToolbar from "../components/layout/FileToolbar";
import PropertiesPanel from "../components/layout/PropertiesPanel";
import ShapesToolbar, { type Tool } from "../components/layout/ShapesToolbar";
import { downloadArtboard, parseArtboard } from "../lib/dotforge";
import ArtboardRenderer from "./ArtboardRenderer";

export default function ArtboardEditor({
  artboard: initialArtboard,
}: {
  artboard: ArtboardDocument;
}) {
  const [artboard, setArtboard] = useState<ArtboardDocument>(initialArtboard);
  const [selected, setSelected] = useState<TextElement | null>(null);
  const [revision, setRevision] = useState(0);
  const [activeTool, setActiveTool] = useState<Tool>("select");

  function handleSelect(el: TextElement | null) {
    setSelected(el);
  }

  function forceUpdate() {
    setRevision((r) => r + 1);
  }

  function handleMoveElement(el: TextElement, x: number, y: number) {
    el.x = x;
    el.y = y;
    forceUpdate();
  }

  function handleDeleteElement(el: TextElement) {
    const idx = artboard.elements.indexOf(el);
    if (idx === -1) return;
    artboard.elements.splice(idx, 1);
    setSelected((current) => (current === el ? null : current));
    forceUpdate();
  }

  useEffect(() => {
    if (!selected) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Delete" && e.key !== "Backspace") return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      e.preventDefault();
      if (selected) handleDeleteElement(selected);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selected]);

  function handleAddTextElement(x: number, y: number) {
    const newEl: TextElement = {
      type: "text",
      x,
      y,
      text: "Text",
      fontSize: 3,
    };
    artboard.elements.push(newEl);
    setSelected(newEl);
    setActiveTool("select");
    forceUpdate();
  }

  function handleResize(width: number, height: number) {
    setArtboard((prev) => ({ ...prev, width, height }));
  }

  function handleDownload() {
    downloadArtboard(artboard);
  }

  async function handleUploadFile(file: File) {
    try {
      const text = await file.text();
      const loaded = parseArtboard(text);
      setArtboard(loaded);
      setSelected(null);
      setActiveTool("select");
      forceUpdate();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      window.alert(`Failed to load .dotforge file: ${message}`);
    }
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
        onResize={handleResize}
        onMoveElement={handleMoveElement}
        onAddTextElement={handleAddTextElement}
        activeTool={activeTool}
      />

      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "12px",
          zIndex: 1000,
        }}
      >
        <ShapesToolbar activeTool={activeTool} onSelectTool={setActiveTool} />
        <FileToolbar
          onDownload={handleDownload}
          onUploadFile={handleUploadFile}
        />
      </div>

      <PropertiesPanel
        element={selected}
        onChange={forceUpdate}
        onDelete={() => selected && handleDeleteElement(selected)}
      />
    </div>
  );
}

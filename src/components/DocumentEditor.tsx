import type { TextElement } from "@dotforge/core";
import { useEffect, useState } from "preact/hooks";
import FileToolbar from "../components/layout/FileToolbar";
import PropertiesPanel from "../components/layout/PropertiesPanel";
import ShapesToolbar, { type Tool } from "../components/layout/ShapesToolbar";
import {
  createTextElement,
  downloadDocument,
  type EditorDocument,
  parseDocument,
} from "../lib/dotforge";
import ArtboardRenderer from "./ArtboardRenderer";

/** How much of an element must stay reachable inside the paper (mm). */
const EDGE_MARGIN_MM = 5;

export default function DocumentEditor({
  doc: initialDoc,
}: {
  doc: EditorDocument;
}) {
  const [doc, setDoc] = useState<EditorDocument>(initialDoc);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<Tool>("select");
  const [dirty, setDirty] = useState(false);

  const selected = doc.elements.find((el) => el.id === selectedId) ?? null;

  function updateDoc(updater: (prev: EditorDocument) => EditorDocument) {
    setDoc(updater);
    setDirty(true);
  }

  function handleMoveElement(id: string, x: number, y: number) {
    updateDoc((prev) => ({
      ...prev,
      elements: prev.elements.map((el) =>
        el.id === id ? { ...el, x, y } : el,
      ),
    }));
  }

  function handleChangeElement(id: string, patch: Partial<TextElement>) {
    updateDoc((prev) => ({
      ...prev,
      elements: prev.elements.map((el) =>
        el.id === id ? { ...el, ...patch } : el,
      ),
    }));
  }

  function handleDeleteElement(id: string) {
    updateDoc((prev) => ({
      ...prev,
      elements: prev.elements.filter((el) => el.id !== id),
    }));
    setSelectedId((current) => (current === id ? null : current));
  }

  function handleAddTextElement(x: number, y: number) {
    const newEl = createTextElement(x, y);
    updateDoc((prev) => ({ ...prev, elements: [...prev.elements, newEl] }));
    setSelectedId(newEl.id);
    setActiveTool("select");
  }

  function handleResize(width: number, height: number) {
    updateDoc((prev) => ({
      ...prev,
      width,
      height,
      // Keep every element reachable inside the new bounds.
      elements: prev.elements.map((el) => ({
        ...el,
        x: Math.max(0, Math.min(el.x, width - EDGE_MARGIN_MM)),
        y: Math.max(0, Math.min(el.y, height - EDGE_MARGIN_MM)),
      })),
    }));
  }

  function handleDownload() {
    downloadDocument(doc);
    setDirty(false);
  }

  async function handleUploadFile(file: File) {
    try {
      const text = await file.text();
      const loaded = parseDocument(text);
      setDoc(loaded);
      setDirty(false);
      setSelectedId(null);
      setActiveTool("select");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      window.alert(`Failed to load .dotforge file: ${message}`);
    }
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.key === "Escape") {
        setSelectedId(null);
        return;
      }
      if (e.key === "Enter" && activeTool === "text") {
        // Keyboard route for placing text: drop it at the paper center.
        e.preventDefault();
        handleAddTextElement(doc.width / 2, doc.height / 2);
        return;
      }
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        e.preventDefault();
        handleDeleteElement(selectedId);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedId, activeTool, doc.width, doc.height]);

  useEffect(() => {
    if (!dirty) return;
    function onBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      // Older Chromium/legacy browsers only show the prompt when
      // returnValue is set; the string itself is ignored.
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

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
        doc={doc}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onResize={handleResize}
        onMoveElement={handleMoveElement}
        onAddTextElement={handleAddTextElement}
        activeTool={activeTool}
      />

      <div
        class="df-float-top-center"
        style={{
          display: "flex",
          gap: "12px",
        }}
      >
        <ShapesToolbar activeTool={activeTool} onSelectTool={setActiveTool} />
        <FileToolbar
          onDownload={handleDownload}
          onUploadFile={handleUploadFile}
        />
      </div>

      {selected && (
        <PropertiesPanel
          key={selected.id}
          element={selected}
          onChange={(patch) => handleChangeElement(selected.id, patch)}
          onDelete={() => handleDeleteElement(selected.id)}
        />
      )}
    </div>
  );
}

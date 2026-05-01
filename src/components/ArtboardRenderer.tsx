import type { ArtboardDocument, TextElement } from "@dotforge/core";
import { useRef } from "preact/hooks";

export default function ArtboardRenderer({
  artboard,
  selected,
  onSelect,
}: {
  artboard: ArtboardDocument;
  selected: TextElement | null;
  onSelect: (el: TextElement | null, node?: HTMLElement | null) => void;
  revision: number;
}) {
  const canvasRef = useRef<HTMLDivElement | null>(null);

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: Canvas uses pointer-based interaction; keyboard selection is not applicable for this visual editor.
    // biome-ignore lint/a11y/noStaticElementInteractions: Canvas uses pointer-based interaction; keyboard selection is not applicable for this visual editor.
    <div
      ref={canvasRef}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        overflow: "auto",
        position: "relative",
        background: "var(--bg)",
      }}
      onClick={() => onSelect(null)} // deselect background
    >
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: Artboard paper uses pointer-based interaction for visual editing. */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: Artboard paper uses pointer-based interaction for visual editing. */}
      <div
        style={{
          position: "relative",
          margin: "auto",
          background: "white",
          border: "2px solid var(--panel-border)",
          borderRadius: "6px",
          width: `${artboard.width}mm`,
          height: `${artboard.height}mm`,
          overflow: "hidden",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "flex-start",
          boxSizing: "border-box",
        }}
        onClick={(e) => {
          // Clicking empty artboard area
          if (e.target === e.currentTarget) onSelect(null);
        }}
      >
        {artboard.elements.map((el) => (
          // biome-ignore lint/a11y/useKeyWithClickEvents: Artboard elements use pointer-based drag/click interaction for visual editing.
          // biome-ignore lint/a11y/noStaticElementInteractions: Artboard elements use pointer-based drag/click interaction for visual editing.
          <div
            key={el.id}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(el, e.currentTarget as HTMLElement);
            }}
            style={{
              position: "absolute",
              left: el.x,
              top: el.y,
              padding: "1px 2px",
              color: "black",
              background: selected === el ? "rgba(0,0,255,0.1)" : "transparent",
              border: selected === el ? "1px solid rgba(0,0,255,0.4)" : "none",
              cursor: "pointer",
              fontSize: `${el.fontSize}mm`,
              fontFamily: "sans-serif",
              userSelect: "none",
            }}
          >
            {el.text}
          </div>
        ))}
      </div>
    </div>
  );
}

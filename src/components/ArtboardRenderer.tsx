import type { DotforgeDocument, TextElement } from "@dotforge/core";
import { useRef } from "preact/hooks";
import type { Tool } from "./layout/ShapesToolbar";

const DRAG_THRESHOLD_PX = 3;

export default function ArtboardRenderer({
  doc,
  selected,
  onSelect,
  onResize,
  onMoveElement,
  onAddTextElement,
  activeTool,
}: {
  doc: DotforgeDocument;
  selected: TextElement | null;
  onSelect: (el: TextElement | null) => void;
  revision: number;
  onResize?: (width: number, height: number) => void;
  onMoveElement: (el: TextElement, x: number, y: number) => void;
  onAddTextElement: (x: number, y: number) => void;
  activeTool: Tool;
}) {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const paperRef = useRef<HTMLDivElement | null>(null);

  function pxToMm(px: number) {
    const paper = paperRef.current;
    if (!paper) return px;
    const rect = paper.getBoundingClientRect();
    if (rect.width === 0) return px;
    return (px / rect.width) * doc.width;
  }

  function clientToMm(clientX: number, clientY: number) {
    const paper = paperRef.current;
    if (!paper) return { x: 0, y: 0 };
    const rect = paper.getBoundingClientRect();
    const scaleX = rect.width === 0 ? 1 : doc.width / rect.width;
    const scaleY = rect.height === 0 ? 1 : doc.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  function handleElementPointerDown(e: PointerEvent, el: TextElement) {
    if (activeTool !== "select") return;
    e.stopPropagation();
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);

    const startClientX = e.clientX;
    const startClientY = e.clientY;
    const startX = el.x;
    const startY = el.y;
    let dragging = false;

    const handleMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startClientX;
      const dy = ev.clientY - startClientY;
      if (!dragging && Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) {
        return;
      }
      if (!dragging) {
        dragging = true;
        onSelect(el);
      }
      const nextX = startX + pxToMm(dx);
      const nextY = startY + pxToMm(dy);
      const clampedX = Math.max(0, Math.min(doc.width, nextX));
      const clampedY = Math.max(0, Math.min(doc.height, nextY));
      onMoveElement(el, clampedX, clampedY);
    };

    const handleUp = (ev: PointerEvent) => {
      target.releasePointerCapture?.(ev.pointerId);
      target.removeEventListener("pointermove", handleMove);
      target.removeEventListener("pointerup", handleUp);
      target.removeEventListener("pointercancel", handleUp);
      if (!dragging) {
        onSelect(el);
      }
    };

    target.addEventListener("pointermove", handleMove);
    target.addEventListener("pointerup", handleUp);
    target.addEventListener("pointercancel", handleUp);
  }

  function handlePaperClick(e: MouseEvent) {
    if (e.target !== e.currentTarget) return;
    if (activeTool === "text") {
      const { x, y } = clientToMm(e.clientX, e.clientY);
      onAddTextElement(x, y);
      return;
    }
    onSelect(null);
  }

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
      <div
        style={{
          margin: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px",
        }}
      >
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: Artboard paper uses pointer-based interaction for visual editing. */}
        {/* biome-ignore lint/a11y/noStaticElementInteractions: Artboard paper uses pointer-based interaction for visual editing. */}
        <div
          ref={paperRef}
          style={{
            position: "relative",
            background: "white",
            border: "2px solid var(--panel-border)",
            borderRadius: "6px",
            width: `${doc.width}mm`,
            height: `${doc.height}mm`,
            overflow: "hidden",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "flex-start",
            boxSizing: "border-box",
            cursor: activeTool === "text" ? "crosshair" : "default",
          }}
          onClick={handlePaperClick}
        >
          {doc.elements.map((el) => (
            // biome-ignore lint/a11y/useKeyWithClickEvents: Artboard elements use pointer-based drag/click interaction for visual editing.
            // biome-ignore lint/a11y/noStaticElementInteractions: Artboard elements use pointer-based drag/click interaction for visual editing.
            <div
              key={el.id}
              onPointerDown={(e) =>
                handleElementPointerDown(e as unknown as PointerEvent, el)
              }
              onClick={(e) => {
                e.stopPropagation();
              }}
              style={{
                position: "absolute",
                left: `${el.x}mm`,
                top: `${el.y}mm`,
                padding: "1px 2px",
                color: "black",
                background:
                  selected === el ? "rgba(0,0,255,0.1)" : "transparent",
                border:
                  selected === el ? "1px solid rgba(0,0,255,0.4)" : "none",
                cursor: activeTool === "select" ? "move" : "default",
                fontSize: `${el.fontSize}mm`,
                fontFamily: "sans-serif",
                userSelect: "none",
                touchAction: "none",
              }}
            >
              {el.text}
            </div>
          ))}
        </div>
        {onResize && (
          // biome-ignore lint/a11y/useKeyWithClickEvents: stopPropagation prevents canvas deselect when interacting with size inputs.
          // biome-ignore lint/a11y/noStaticElementInteractions: stopPropagation prevents canvas deselect when interacting with size inputs.
          <div
            style={{
              display: "flex",
              gap: "8px",
              alignItems: "center",
              fontSize: "12px",
              color: "var(--text)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <label
              style={{ display: "flex", alignItems: "center", gap: "4px" }}
            >
              W
              <input
                type="number"
                min={1}
                value={doc.width}
                onInput={(e) => {
                  const v = Number((e.target as HTMLInputElement).value);
                  if (Number.isFinite(v) && v > 0) {
                    onResize(v, doc.height);
                  }
                }}
                style={{ width: "60px" }}
              />
              mm
            </label>
            <label
              style={{ display: "flex", alignItems: "center", gap: "4px" }}
            >
              H
              <input
                type="number"
                min={1}
                value={doc.height}
                onInput={(e) => {
                  const v = Number((e.target as HTMLInputElement).value);
                  if (Number.isFinite(v) && v > 0) {
                    onResize(doc.width, v);
                  }
                }}
                style={{ width: "60px" }}
              />
              mm
            </label>
          </div>
        )}
      </div>
    </div>
  );
}

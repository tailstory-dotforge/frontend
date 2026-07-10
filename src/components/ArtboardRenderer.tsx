import type {
  TargetedKeyboardEvent,
  TargetedMouseEvent,
  TargetedPointerEvent,
} from "preact";
import { useRef } from "preact/hooks";
import type { EditorDocument, EditorElement } from "../lib/dotforge";
import type { Tool } from "./layout/ShapesToolbar";
import NumberField from "./NumberField";

const DRAG_THRESHOLD_PX = 3;
const NUDGE_MM = 1;
const NUDGE_LARGE_MM = 5;

export default function ArtboardRenderer({
  doc,
  selectedId,
  onSelect,
  onResize,
  onMoveElement,
  onAddTextElement,
  activeTool,
}: {
  doc: EditorDocument;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onResize?: (width: number, height: number) => void;
  onMoveElement: (id: string, x: number, y: number) => void;
  onAddTextElement: (x: number, y: number) => void;
  activeTool: Tool;
}) {
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

  /** Clamp an element's top-left so the element stays inside the paper. */
  function clampPosition(x: number, y: number, node: HTMLElement) {
    const rect = node.getBoundingClientRect();
    const maxX = Math.max(0, doc.width - pxToMm(rect.width));
    const maxY = Math.max(0, doc.height - pxToMm(rect.height));
    return {
      x: Math.max(0, Math.min(maxX, x)),
      y: Math.max(0, Math.min(maxY, y)),
    };
  }

  function handleElementPointerDown(
    e: TargetedPointerEvent<HTMLDivElement>,
    el: EditorElement,
  ) {
    if (e.button !== 0) return;
    if (activeTool !== "select") return;
    e.stopPropagation();
    onSelect(el.id);
    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);

    const startClientX = e.clientX;
    const startClientY = e.clientY;
    const startX = el.x;
    const startY = el.y;
    let dragging = false;
    let lastX = startX;
    let lastY = startY;

    const handleMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startClientX;
      const dy = ev.clientY - startClientY;
      if (!dragging && Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) {
        return;
      }
      dragging = true;
      const next = clampPosition(
        startX + pxToMm(dx),
        startY + pxToMm(dy),
        target,
      );
      lastX = next.x;
      lastY = next.y;
      // Write straight to the node during the drag; the document state is
      // committed once on pointerup, so the tree re-renders once per drag
      // instead of once per pointermove.
      target.style.left = `${lastX}mm`;
      target.style.top = `${lastY}mm`;
    };

    const handleUp = (ev: PointerEvent) => {
      target.releasePointerCapture?.(ev.pointerId);
      target.removeEventListener("pointermove", handleMove);
      target.removeEventListener("pointerup", handleUp);
      target.removeEventListener("pointercancel", handleUp);
      if (dragging) {
        onMoveElement(el.id, lastX, lastY);
      }
    };

    target.addEventListener("pointermove", handleMove);
    target.addEventListener("pointerup", handleUp);
    target.addEventListener("pointercancel", handleUp);
  }

  function handleElementKeyDown(
    e: TargetedKeyboardEvent<HTMLDivElement>,
    el: EditorElement,
  ) {
    if (activeTool !== "select") return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.stopPropagation();
      onSelect(el.id);
      return;
    }
    const step = e.shiftKey ? NUDGE_LARGE_MM : NUDGE_MM;
    const nudges: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const nudge = nudges[e.key];
    if (!nudge) return;
    e.preventDefault();
    onSelect(el.id);
    const next = clampPosition(
      el.x + nudge[0],
      el.y + nudge[1],
      e.currentTarget,
    );
    onMoveElement(el.id, next.x, next.y);
  }

  function handlePaperClick(e: TargetedMouseEvent<HTMLDivElement>) {
    // The paper owns every click that lands on it (or bubbles up from an
    // element); without this, the click would reach the canvas handler and
    // immediately deselect what was just selected or created.
    e.stopPropagation();
    if (activeTool === "text") {
      const { x, y } = clientToMm(e.clientX, e.clientY);
      onAddTextElement(x, y);
      return;
    }
    if (e.target === e.currentTarget) {
      onSelect(null);
    }
  }

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: Deselect-on-background-click is a pointer affordance; Escape provides the keyboard route (DocumentEditor).
    // biome-ignore lint/a11y/noStaticElementInteractions: Deselect-on-background-click is a pointer affordance; Escape provides the keyboard route (DocumentEditor).
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        overflow: "auto",
        position: "relative",
        background: "var(--bg)",
      }}
      onClick={(e) => {
        // deselect background
        if (e.target === e.currentTarget) onSelect(null);
      }}
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
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: Text placement by click has a keyboard route (Enter places at paper center, handled in DocumentEditor). */}
        {/* biome-ignore lint/a11y/noStaticElementInteractions: Text placement by click has a keyboard route (Enter places at paper center, handled in DocumentEditor). */}
        <div
          ref={paperRef}
          data-testid="artboard-paper"
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
            // biome-ignore lint/a11y/useSemanticElements: A native button cannot host mm-positioned, draggable artboard content; role="button" + tabIndex + key handlers provide the equivalent semantics.
            <div
              key={el.id}
              role="button"
              tabIndex={0}
              aria-label={`Text element: ${el.text}`}
              onPointerDown={(e) => handleElementPointerDown(e, el)}
              onKeyDown={(e) => handleElementKeyDown(e, el)}
              onClick={(e) => {
                // In select mode the element owns the click; in text mode it
                // falls through to the paper so text can be placed on top of
                // existing elements.
                if (activeTool === "select") e.stopPropagation();
              }}
              style={{
                position: "absolute",
                left: `${el.x}mm`,
                top: `${el.y}mm`,
                padding: "1px 2px",
                color: "black",
                background:
                  selectedId === el.id ? "rgba(0,0,255,0.1)" : "transparent",
                border:
                  selectedId === el.id ? "1px solid rgba(0,0,255,0.4)" : "none",
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
              htmlFor="df-artboard-width"
              style={{ display: "flex", alignItems: "center", gap: "4px" }}
            >
              W
              <NumberField
                id="df-artboard-width"
                value={doc.width}
                min={1}
                onCommit={(v) => onResize(v, doc.height)}
                style={{ width: "60px" }}
              />
              mm
            </label>
            <label
              htmlFor="df-artboard-height"
              style={{ display: "flex", alignItems: "center", gap: "4px" }}
            >
              H
              <NumberField
                id="df-artboard-height"
                value={doc.height}
                min={1}
                onCommit={(v) => onResize(doc.width, v)}
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

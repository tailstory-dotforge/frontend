import type {
  TargetedKeyboardEvent,
  TargetedMouseEvent,
  TargetedPointerEvent,
} from "preact";
import { useRef } from "preact/hooks";
import {
  type EditorDocument,
  type EditorElement,
  MAX_DIMENSION_MM,
} from "../lib/dotforge";
import type { Tool } from "./layout/ShapesToolbar";
import NumberField from "./NumberField";

const DRAG_THRESHOLD_PX = 3;
const NUDGE_MM = 1;
const NUDGE_LARGE_MM = 5;
const NUDGE_DIRECTIONS: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
};

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
  onResize: (width: number, height: number) => void;
  onMoveElement: (id: string, x: number, y: number) => void;
  onAddTextElement: (x: number, y: number) => void;
  activeTool: Tool;
}) {
  const paperRef = useRef<HTMLDivElement | null>(null);

  /** Millimetres per CSS pixel at the paper's rendered size. */
  function mmPerPx() {
    const width = paperRef.current?.getBoundingClientRect().width;
    return width ? doc.width / width : 1;
  }

  function clientToMm(clientX: number, clientY: number) {
    const rect = paperRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const scale = mmPerPx();
    return {
      x: (clientX - rect.left) * scale,
      y: (clientY - rect.top) * scale,
    };
  }

  /** Clamp an element's top-left so the element stays inside the paper. */
  function clampPosition(x: number, y: number, node: HTMLElement) {
    const rect = node.getBoundingClientRect();
    const scale = mmPerPx();
    return {
      x: Math.max(0, Math.min(doc.width - rect.width * scale, x)),
      y: Math.max(0, Math.min(doc.height - rect.height * scale, y)),
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
    const scale = mmPerPx();
    let dragging = false;
    let lastX = el.x;
    let lastY = el.y;

    const handleMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startClientX;
      const dy = ev.clientY - startClientY;
      if (!dragging && Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) {
        return;
      }
      dragging = true;
      const next = clampPosition(el.x + dx * scale, el.y + dy * scale, target);
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
    const direction = NUDGE_DIRECTIONS[e.key];
    if (!direction) return;
    e.preventDefault();
    onSelect(el.id);
    const step = e.shiftKey ? NUDGE_LARGE_MM : NUDGE_MM;
    const next = clampPosition(
      el.x + direction[0] * step,
      el.y + direction[1] * step,
      e.currentTarget,
    );
    onMoveElement(el.id, next.x, next.y);
  }

  function handlePaperClick(e: TargetedMouseEvent<HTMLDivElement>) {
    // The paper owns every click that lands on it; without this, the click
    // would reach the canvas handler and immediately deselect what was just
    // selected or created.
    e.stopPropagation();
    if (activeTool === "text") {
      // Clicks on elements fall through to here in text mode, so text can
      // be placed on top of existing elements.
      const { x, y } = clientToMm(e.clientX, e.clientY);
      onAddTextElement(x, y);
    } else {
      // In select mode elements keep their own clicks: this hit bare paper.
      onSelect(null);
    }
  }

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: Deselect-on-background-click is a pointer affordance; Escape provides the keyboard route (DocumentEditor).
    // biome-ignore lint/a11y/noStaticElementInteractions: Deselect-on-background-click is a pointer affordance; Escape provides the keyboard route (DocumentEditor).
    <div class="df-canvas" onClick={() => onSelect(null)}>
      <div class="df-stage">
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: stopPropagation prevents canvas deselect when interacting with size inputs. */}
        {/* biome-ignore lint/a11y/noStaticElementInteractions: stopPropagation prevents canvas deselect when interacting with size inputs. */}
        <div class="df-page-size" onClick={(e) => e.stopPropagation()}>
          <label htmlFor="df-artboard-width">
            W
            <NumberField
              id="df-artboard-width"
              class="df-input"
              value={doc.width}
              min={1}
              max={MAX_DIMENSION_MM}
              onCommit={(v) => onResize(v, doc.height)}
            />
            <span class="df-sr-only">mm</span>
          </label>
          <label htmlFor="df-artboard-height">
            H
            <NumberField
              id="df-artboard-height"
              class="df-input"
              value={doc.height}
              min={1}
              max={MAX_DIMENSION_MM}
              onCommit={(v) => onResize(doc.width, v)}
            />
            mm
          </label>
        </div>
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: Text placement by click has a keyboard route (Enter places at paper center, handled in DocumentEditor). */}
        {/* biome-ignore lint/a11y/noStaticElementInteractions: Text placement by click has a keyboard route (Enter places at paper center, handled in DocumentEditor). */}
        <div
          ref={paperRef}
          data-testid="artboard-paper"
          class="df-paper"
          style={{
            width: `${doc.width}mm`,
            height: `${doc.height}mm`,
            cursor: activeTool === "text" ? "crosshair" : undefined,
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
              class={`df-element${selectedId === el.id ? " is-selected" : ""}`}
              onPointerDown={(e) => handleElementPointerDown(e, el)}
              onKeyDown={(e) => handleElementKeyDown(e, el)}
              onClick={(e) => {
                // In select mode the element owns the click; in text mode it
                // falls through to the paper.
                if (activeTool === "select") e.stopPropagation();
              }}
              style={{
                left: `${el.x}mm`,
                top: `${el.y}mm`,
                fontSize: `${el.fontSize}mm`,
                cursor: activeTool === "select" ? "move" : undefined,
              }}
            >
              {el.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import type { TextElement } from "@dotforge/core";
import type { JSX } from "preact";
import { useEffect, useState } from "preact/hooks";

export default function InspectorBubble({
  element,
  elementNode,
  onChange,
}: {
  element: TextElement | null;
  elementNode: HTMLElement | null;
  onChange: () => void;
}) {
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!element || !elementNode) return;

    const rect = elementNode.getBoundingClientRect();

    setPos({
      top: rect.bottom + 8, // below element
      left: rect.right + 8, // right of element
    });
  }, [element, elementNode, element?.x, element?.y]);

  if (!element) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: `${pos.top}px`,
        left: `${pos.left}px`,
        background: "var(--panel)",
        color: "var(--text)",
        border: "1px solid var(--panel-border)",
        padding: "8px 12px",
        borderRadius: "8px",
        fontFamily: "sans-serif",
        fontSize: "13px",
        zIndex: 9999,
        boxShadow: "0 2px 6px rgba(0,0,0,0.35)",
        minWidth: "180px",
      }}
    >
      <div style={{ marginBottom: "8px", fontWeight: 600 }}>
        Text Properties
      </div>

      <label style={{ display: "block", marginBottom: "8px" }}>
        Text
        <br />
        <input
          type="text"
          value={element.text}
          onInput={(e: JSX.TargetedEvent<HTMLInputElement>) => {
            element.text = e.currentTarget.value;
            onChange();
          }}
          style={{
            width: "100%",
            marginTop: "4px",
          }}
        />
      </label>

      <label style={{ display: "block", marginBottom: "8px" }}>
        Font Size (mm)
        <br />
        <input
          type="number"
          value={element.fontSize}
          onInput={(e: JSX.TargetedEvent<HTMLInputElement>) => {
            element.fontSize = Number(e.currentTarget.value);
            onChange();
          }}
          style={{
            width: "100%",
            marginTop: "4px",
          }}
        />
      </label>
    </div>
  );
}

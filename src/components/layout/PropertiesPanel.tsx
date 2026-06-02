import type { TextElement } from "@dotforge/core";
import type { JSX } from "preact";

export default function PropertiesPanel({
  element,
  onChange,
  onDelete,
}: {
  element: TextElement | null;
  onChange: () => void;
  onDelete: () => void;
}) {
  if (!element) return null;

  return (
    <div
      class="df-props-panel"
      style={{
        background: "var(--panel)",
        color: "var(--text)",
        border: "1px solid var(--panel-border)",
        padding: "12px 14px",
        fontFamily: "sans-serif",
        fontSize: "13px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.35)",
      }}
    >
      <div style={{ marginBottom: "10px", fontWeight: 600 }}>
        Text Properties
      </div>

      <label style={{ display: "block", marginBottom: "10px" }}>
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
          min={0.1}
          step={0.1}
          value={element.fontSize}
          onInput={(e: JSX.TargetedEvent<HTMLInputElement>) => {
            const next = Number(e.currentTarget.value);
            if (!Number.isFinite(next) || next <= 0) return;
            element.fontSize = next;
            onChange();
          }}
          style={{
            width: "100%",
            marginTop: "4px",
          }}
        />
      </label>

      <button
        type="button"
        onClick={onDelete}
        style={{
          marginTop: "6px",
          width: "100%",
          padding: "6px 10px",
          background: "var(--danger, #c0392b)",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "13px",
        }}
      >
        Delete
      </button>
    </div>
  );
}

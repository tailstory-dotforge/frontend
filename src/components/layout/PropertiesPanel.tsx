import type { TextElement } from "@dotforge/core";
import type { JSX } from "preact";

export default function PropertiesPanel({
  element,
  onChange,
}: {
  element: TextElement | null;
  onChange: () => void;
}) {
  if (!element) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "112px",
        left: "16px",
        background: "var(--panel)",
        color: "var(--text)",
        border: "1px solid var(--panel-border)",
        padding: "20px 24px",
        borderRadius: "8px",
        fontFamily: "sans-serif",
        fontSize: "13px",
        zIndex: 9999,
        boxShadow: "0 4px 12px rgba(0,0,0,0.35)",
        width: "204px",
      }}
    >
      <div style={{ marginBottom: "20px", fontWeight: 600 }}>
        Text Properties
      </div>

      <label style={{ display: "block", marginBottom: "20px" }}>
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
            marginTop: "8px",
          }}
        />
      </label>

      <label style={{ display: "block" }}>
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
            marginTop: "8px",
          }}
        />
      </label>
    </div>
  );
}

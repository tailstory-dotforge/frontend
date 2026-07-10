import type { TextElement } from "@dotforge/core";
import type { TargetedInputEvent } from "preact";
import type { EditorElement } from "../../lib/dotforge";
import NumberField from "../NumberField";

export default function PropertiesPanel({
  element,
  onChange,
  onDelete,
}: {
  element: EditorElement;
  onChange: (patch: Partial<TextElement>) => void;
  onDelete: () => void;
}) {
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
          onInput={(e: TargetedInputEvent<HTMLInputElement>) => {
            onChange({ text: e.currentTarget.value });
          }}
          style={{
            width: "100%",
            marginTop: "4px",
          }}
        />
      </label>

      <label
        htmlFor="df-font-size"
        style={{ display: "block", marginBottom: "8px" }}
      >
        Font Size (mm)
        <br />
        <NumberField
          id="df-font-size"
          value={element.fontSize}
          min={0.1}
          step={0.1}
          onCommit={(next) => onChange({ fontSize: next })}
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

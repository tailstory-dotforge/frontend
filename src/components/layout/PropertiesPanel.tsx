import type { TextElement } from "@dotforge/core";
import { Trash2 } from "lucide-preact";
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
    <fieldset aria-label="Text properties" class="df-panel df-props-panel">
      <label class="df-field df-field-text">
        Text
        <input
          type="text"
          class="df-input"
          value={element.text}
          onInput={(e) => onChange({ text: e.currentTarget.value })}
        />
      </label>

      <label class="df-field df-field-size" htmlFor="df-font-size">
        Font size
        <span class="df-input df-input-affix">
          <NumberField
            id="df-font-size"
            value={element.fontSize}
            min={0.1}
            step={0.1}
            live
            onCommit={(next) => onChange({ fontSize: next })}
          />
          mm
        </span>
      </label>

      <hr />

      <button
        type="button"
        class="df-danger-btn"
        aria-label="Delete"
        aria-keyshortcuts="Delete Backspace"
        onClick={onDelete}
      >
        <Trash2 size={16} strokeWidth={1.5} aria-hidden="true" />
        <span class="df-danger-label">Delete</span>
        <kbd class="df-kbd">Del</kbd>
      </button>
    </fieldset>
  );
}

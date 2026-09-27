import { useEffect, useRef, useState } from "preact/hooks";

/**
 * Numeric input that keeps its in-progress text locally and only commits
 * finite positive values within [min, max]. It commits on change (blur,
 * Enter, arrow/spinner steps); `live` also commits on every valid keystroke,
 * for fields where intermediate values ("1" on the way to "120") are
 * harmless. The text is synced from `value` only while the field is not
 * focused, so external re-renders can't clobber a value being typed.
 */
export default function NumberField({
  id,
  class: className,
  value,
  min = 0,
  max = Number.POSITIVE_INFINITY,
  step,
  live = false,
  onCommit,
}: {
  id?: string;
  class?: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  live?: boolean;
  onCommit: (value: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState(String(value));

  useEffect(() => {
    if (document.activeElement !== inputRef.current) {
      setText(String(value));
    }
  }, [value]);

  function parse(raw: string) {
    const next = Number(raw);
    return raw !== "" &&
      Number.isFinite(next) &&
      next > 0 &&
      next >= min &&
      next <= max
      ? next
      : null;
  }

  return (
    <input
      ref={inputRef}
      id={id}
      class={className}
      type="number"
      min={min}
      max={Number.isFinite(max) ? max : undefined}
      step={step}
      value={text}
      onInput={(e) => {
        const raw = e.currentTarget.value;
        setText(raw);
        const next = parse(raw);
        if (live && next !== null) onCommit(next);
      }}
      onChange={(e) => {
        const next = parse(e.currentTarget.value);
        if (next === null) setText(String(value));
        else onCommit(next);
      }}
    />
  );
}

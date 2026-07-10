import type { CSSProperties } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";

/**
 * Numeric input that keeps its in-progress text locally and only commits
 * finite positive values. The text is synced from `value` only while the
 * field is not focused, so external re-renders can't clobber a value the
 * user is still typing.
 */
export default function NumberField({
  id,
  value,
  min,
  step,
  onCommit,
  style,
}: {
  id?: string;
  value: number;
  min?: number;
  step?: number;
  onCommit: (value: number) => void;
  style?: string | CSSProperties;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState(String(value));

  useEffect(() => {
    if (document.activeElement !== inputRef.current) {
      setText(String(value));
    }
  }, [value]);

  return (
    <input
      ref={inputRef}
      id={id}
      type="number"
      min={min}
      step={step}
      value={text}
      onInput={(e) => {
        const raw = e.currentTarget.value;
        setText(raw);
        const next = Number(raw);
        if (
          raw !== "" &&
          Number.isFinite(next) &&
          next > 0 &&
          (min === undefined || next >= min)
        ) {
          onCommit(next);
        }
      }}
      onBlur={() => setText(String(value))}
      style={style}
    />
  );
}

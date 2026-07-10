import type { DotforgeDocument, TextElement } from "@dotforge/core";

export const DOTFORGE_FILE_EXTENSION = ".dotforge";
export const DOTFORGE_MIME_TYPE = "application/json";

/** Largest artboard dimension (mm) accepted from uploaded files. */
export const MAX_DIMENSION_MM = 10_000;

/**
 * A TextElement with the stable identity the editor needs for list keys and
 * lookups. The id is editor-local; the .dotforge format tolerates it via its
 * index signature, so round-tripping through files preserves identity.
 */
export type EditorElement = TextElement & { id: string };

export interface EditorDocument extends DotforgeDocument {
  elements: EditorElement[];
}

export function createTextElement(x: number, y: number): EditorElement {
  return {
    id: crypto.randomUUID(),
    type: "text",
    x,
    y,
    text: "Text",
    fontSize: 3,
  };
}

function withId(el: TextElement): EditorElement {
  if (typeof el.id === "string" && el.id !== "") {
    return el as EditorElement;
  }
  return { ...el, id: crypto.randomUUID() };
}

function isValidDimension(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value > 0 &&
    value <= MAX_DIMENSION_MM
  );
}

function isValidElement(value: unknown): value is TextElement {
  if (typeof value !== "object" || value === null) return false;
  const el = value as Record<string, unknown>;
  return (
    el.type === "text" &&
    typeof el.text === "string" &&
    typeof el.x === "number" &&
    Number.isFinite(el.x) &&
    typeof el.y === "number" &&
    Number.isFinite(el.y) &&
    typeof el.fontSize === "number" &&
    Number.isFinite(el.fontSize) &&
    el.fontSize > 0
  );
}

export function serializeDocument(doc: DotforgeDocument): string {
  return JSON.stringify(doc, null, 2);
}

export function parseDocument(text: string): EditorDocument {
  const parsed: unknown = JSON.parse(text);
  if (
    !parsed ||
    typeof parsed !== "object" ||
    !isValidDimension((parsed as Record<string, unknown>).width) ||
    !isValidDimension((parsed as Record<string, unknown>).height) ||
    !Array.isArray((parsed as Record<string, unknown>).elements) ||
    !(parsed as { elements: unknown[] }).elements.every(isValidElement)
  ) {
    throw new Error("Not a valid .dotforge file");
  }
  const doc = parsed as DotforgeDocument;
  return { ...doc, elements: doc.elements.map(withId) };
}

export function downloadDocument(
  doc: DotforgeDocument,
  filename = `untitled${DOTFORGE_FILE_EXTENSION}`,
) {
  const blob = new Blob([serializeDocument(doc)], {
    type: DOTFORGE_MIME_TYPE,
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

import type { ArtboardDocument } from "@dotforge/core";

export const DOTFORGE_FILE_EXTENSION = ".dotforge";
export const DOTFORGE_MIME_TYPE = "application/json";

export function serializeArtboard(artboard: ArtboardDocument): string {
  return JSON.stringify(artboard, null, 2);
}

export function parseArtboard(text: string): ArtboardDocument {
  const parsed = JSON.parse(text);
  if (
    !parsed ||
    typeof parsed !== "object" ||
    typeof parsed.width !== "number" ||
    typeof parsed.height !== "number" ||
    !Array.isArray(parsed.elements)
  ) {
    throw new Error("Not a valid .dotforge file");
  }
  return parsed as ArtboardDocument;
}

export function downloadArtboard(
  artboard: ArtboardDocument,
  filename = `artboard${DOTFORGE_FILE_EXTENSION}`,
) {
  const blob = new Blob([serializeArtboard(artboard)], {
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

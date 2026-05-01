import type { ArtboardDocument } from "@dotforge/core";

export default function SampleArtboard(): ArtboardDocument {
  return {
    width: 100,
    height: 150,
    elements: [
      {
        type: "text",
        x: 5,
        y: 10,
        text: "Hello DotForge",
        fontSize: 3,
      },
    ],
  };
}

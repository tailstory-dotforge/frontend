import type { DotforgeDocument } from "@dotforge/core";

export default function SampleDocument(): DotforgeDocument {
  return {
    width: 100,
    height: 150,
    elements: [
      {
        type: "text",
        x: 5,
        y: 10,
        text: "Hello Dotforge",
        fontSize: 3,
      },
    ],
  };
}

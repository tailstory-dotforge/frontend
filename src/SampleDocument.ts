import type { EditorDocument } from "@/lib/dotforge";

export default function SampleDocument(): EditorDocument {
  return {
    width: 100,
    height: 150,
    elements: [
      {
        id: crypto.randomUUID(),
        type: "text",
        x: 5,
        y: 10,
        text: "Hello Dotforge",
        fontSize: 3,
      },
    ],
  };
}

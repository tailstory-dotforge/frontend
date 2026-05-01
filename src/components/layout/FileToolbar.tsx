import { Download, Upload } from "lucide-preact";
import { useRef } from "preact/hooks";
import ToolbarIcon from "../ToolbarIcon";

export default function FileToolbar({
  onDownload,
  onUploadFile,
}: {
  onDownload: () => void;
  onUploadFile: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div
      style={{
        background: "var(--panel)",
        border: "1px solid var(--panel-border)",
        borderRadius: "10px",
        padding: "8px 12px",
        display: "flex",
        gap: "12px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
      }}
    >
      <ToolbarIcon label="Download .dotforge" onClick={onDownload}>
        <Download />
      </ToolbarIcon>
      <ToolbarIcon
        label="Open .dotforge"
        onClick={() => inputRef.current?.click()}
      >
        <Upload />
      </ToolbarIcon>
      <input
        ref={inputRef}
        type="file"
        accept=".dotforge,application/json"
        style={{ display: "none" }}
        onChange={(e) => {
          const input = e.currentTarget;
          const file = input.files?.[0];
          if (file) onUploadFile(file);
          input.value = "";
        }}
      />
    </div>
  );
}

import ThemeButton from "../ThemeButton";

export default function MainMenu() {
  return (
    <div
      class="df-float-right"
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
      <ThemeButton />
    </div>
  );
}

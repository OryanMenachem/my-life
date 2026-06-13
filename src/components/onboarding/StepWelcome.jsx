export default function StepWelcome({ onNext }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center gap-8">
      <div className="text-6xl">📖</div>
      <div className="space-y-3">
        <h1 className="font-heading text-3xl font-semibold text-foreground leading-tight">
          Welcome to<br />My Life
        </h1>
        <p className="font-body text-base text-muted-foreground leading-relaxed max-w-xs">
          Speak your life.<br />
          Capture a moment in seconds, find it forever.
        </p>
      </div>
      <button
        onClick={onNext}
        className="mt-4 px-8 py-3 rounded-full font-body font-semibold text-base active:scale-95 transition-transform"
        style={{ backgroundColor: "var(--theme-accent)", color: "#fff" }}
      >
        Get started
      </button>
    </div>
  );
}
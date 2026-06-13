import { useTheme, THEMES } from "@/lib/ThemeContext";

const THEME_LIST = [
  { key: "cream",    label: "Cream" },
  { key: "sky",      label: "Sky" },
  { key: "sage",     label: "Sage" },
  { key: "blossom",  label: "Blossom" },
  { key: "lavender", label: "Lavender" },
  { key: "mint",     label: "Mint" },
  { key: "sand",     label: "Sand" },
  { key: "charcoal", label: "Charcoal" },
];

export default function ThemePickerSheet({ onClose }) {
  const { theme: current, setTheme } = useTheme();

  const handlePick = (key) => {
    setTheme(key);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Sheet */}
      <div
        className="relative z-10 bg-card rounded-t-3xl px-5 pt-5 pb-10 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-muted-foreground/25 rounded-full mx-auto mb-5" />

        <h2 className="font-heading text-base font-semibold text-foreground mb-4">Choose theme</h2>

        <div className="grid grid-cols-4 gap-3">
          {THEME_LIST.map(({ key, label }) => {
            const t = THEMES[key];
            const isActive = key === current;

            return (
              <button
                key={key}
                onClick={() => handlePick(key)}
                className="flex flex-col items-center gap-1.5 group"
                aria-label={label}
              >
                {/* Swatch */}
                <div
                  className="w-14 h-14 rounded-2xl border-2 transition-all duration-150 flex items-end justify-end p-1.5 relative overflow-hidden"
                  style={{
                    background: t.bg,
                    borderColor: isActive ? t.accent : "transparent",
                    boxShadow: isActive
                      ? `0 0 0 3px ${t.accent}55`
                      : "0 1px 4px rgba(0,0,0,0.12)",
                  }}
                >
                  {/* Mini card simulation */}
                  <div
                    className="absolute top-2 left-2 right-2 h-4 rounded-md opacity-90"
                    style={{ background: t.card }}
                  />
                  {/* Accent dot */}
                  <div
                    className="w-3.5 h-3.5 rounded-full relative z-10"
                    style={{ background: t.accent }}
                  />
                </div>
                <span
                  className="text-[10px] font-body font-semibold tracking-wide"
                  style={{ color: isActive ? t.accent : undefined }}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
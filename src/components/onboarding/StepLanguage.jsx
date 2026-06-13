import { useState } from "react";

const LANGS = [
  { code: "en", label: "English", native: "English", flag: "🇺🇸" },
  { code: "he", label: "Hebrew", native: "עברית", flag: "🇮🇱" },
];

export default function StepLanguage({ onNext, setLang }) {
  const [selected, setSelected] = useState("en");

  const handleNext = async () => {
    await setLang(selected);
    onNext();
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center gap-8">
      <div className="text-5xl">🌐</div>
      <div className="space-y-2">
        <h2 className="font-heading text-2xl font-semibold text-foreground">
          Choose your language
        </h2>
        <p className="font-body text-sm text-muted-foreground">
          You can change this later in Settings
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        {LANGS.map(({ code, label, native, flag }) => {
          const active = selected === code;
          return (
            <button
              key={code}
              onClick={() => setSelected(code)}
              className="flex items-center gap-4 px-5 py-4 rounded-2xl border-2 transition-all duration-150 active:scale-[0.98]"
              style={{
                borderColor: active ? "var(--theme-accent)" : "var(--border, #e2e8f0)",
                backgroundColor: active ? "var(--theme-accent)18" : "var(--card)",
                boxShadow: active ? `0 0 0 3px var(--theme-accent, #ccc)33` : undefined,
              }}
            >
              <span className="text-2xl">{flag}</span>
              <div className="text-left flex-1">
                <p className="font-body font-semibold text-foreground text-sm">{label}</p>
                <p className="font-body text-xs text-muted-foreground">{native}</p>
              </div>
              <span
                className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                style={{
                  borderColor: active ? "var(--theme-accent)" : "var(--border, #ccc)",
                  backgroundColor: active ? "var(--theme-accent)" : "transparent",
                }}
              >
                {active && <span className="w-2 h-2 rounded-full bg-white" />}
              </span>
            </button>
          );
        })}
      </div>

      <button
        onClick={handleNext}
        className="px-8 py-3 rounded-full font-body font-semibold text-base active:scale-95 transition-transform"
        style={{ backgroundColor: "var(--theme-accent)", color: "#fff" }}
      >
        Continue
      </button>
    </div>
  );
}
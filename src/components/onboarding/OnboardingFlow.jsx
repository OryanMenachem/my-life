import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useTheme } from "@/lib/ThemeContext";
import { useLang } from "@/lib/LanguageContext";
import StepWelcome from "./StepWelcome";
import StepLanguage from "./StepLanguage";
import StepMicrophone from "./StepMicrophone";

const TOTAL_STEPS = 3;

export default function OnboardingFlow({ onComplete }) {
  const [step, setStep] = useState(0);
  const { setTheme } = useTheme();
  const { setLang } = useLang();

  const next = () => {
    if (step < TOTAL_STEPS - 1) {
      setStep((s) => s + 1);
    } else {
      finish();
    }
  };

  const finish = async () => {
    try {
      await base44.auth.updateMe({ onboarded: true });
    } catch {}
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col">
      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 pt-12 pb-2 flex-shrink-0">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <span
            key={i}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: i === step ? 24 : 6,
              backgroundColor: i <= step ? "var(--theme-accent)" : "var(--theme-accent, #ccc)",
              opacity: i <= step ? 1 : 0.25,
            }}
          />
        ))}
      </div>

      <div className="flex-1 overflow-hidden">
        {step === 0 && <StepWelcome onNext={next} />}
        {step === 1 && <StepLanguage onNext={next} setLang={setLang} />}
        {step === 2 && <StepMicrophone onNext={next} onSkip={finish} />}
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import OnboardingFlow from "./OnboardingFlow";

/**
 * Used as a React Router layout route.
 * Shows OnboardingFlow if user.onboarded is falsy, otherwise renders <Outlet />.
 */
export default function OnboardingGate() {
  const [checked, setChecked] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    base44.auth.me().then((me) => {
      setNeedsOnboarding(!me?.onboarded);
      setChecked(true);
    }).catch(() => {
      setChecked(true);
    });
  }, []);

  if (!checked) return null;

  if (needsOnboarding) {
    return (
      <OnboardingFlow
        onComplete={() => setNeedsOnboarding(false)}
      />
    );
  }

  return <Outlet />;
}
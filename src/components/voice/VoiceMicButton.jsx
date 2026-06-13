import { Mic } from "lucide-react";

/**
 * Floating mic FAB — always solid black, white icon.
 * Sits bottom-right above all content.
 */
export default function VoiceMicButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-6 z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
      style={{ backgroundColor: "#171717", color: "#fff" }}
      aria-label="Record voice entry"
    >
      <Mic className="w-6 h-6" strokeWidth={2} />
    </button>
  );
}
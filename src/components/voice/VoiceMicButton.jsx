import { Mic } from "lucide-react";

/**
 * Floating mic FAB — always solid black, white icon.
 * Sits bottom-right above all content.
 */
export default function VoiceMicButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed z-40 rounded-full flex items-center justify-center active:scale-95 transition-transform"
      style={{
        bottom: "74px",
        right: "14px",
        width: "52px",
        height: "52px",
        backgroundColor: "#171717",
        color: "#fff",
        boxShadow: "0 6px 18px rgba(0,0,0,0.3)",
      }}
      aria-label="Record voice entry"
    >
      <Mic className="w-[22px] h-[22px]" strokeWidth={2} />
    </button>
  );
}
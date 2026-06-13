import { ChevronRight } from "lucide-react";

export default function SettingsRow({ icon, label, value, onClick, destructive, rightEl, disabled }) {
  const content = (
    <div
      className={`flex items-center gap-3 px-5 py-4 w-full text-left transition-colors ${
        onClick && !disabled ? "hover:bg-muted/40 active:bg-muted/70 cursor-pointer" : ""
      } ${disabled ? "opacity-40" : ""}`}
      onClick={disabled ? undefined : onClick}
    >
      {icon && (
        <span className={`flex-shrink-0 ${destructive ? "text-destructive" : "text-muted-foreground"}`}>
          {icon}
        </span>
      )}
      <span
        className={`flex-1 font-body text-sm font-medium ${
          destructive ? "text-destructive" : "text-foreground"
        }`}
      >
        {label}
      </span>
      {value && (
        <span className="font-body text-sm text-muted-foreground me-1">{value}</span>
      )}
      {rightEl && <span className="flex-shrink-0">{rightEl}</span>}
      {onClick && !rightEl && (
        <ChevronRight className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
      )}
    </div>
  );
  return content;
}
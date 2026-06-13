export default function SettingsSection({ title, children }) {
  return (
    <div className="mb-6">
      {title && (
        <p className="text-[11px] font-body font-semibold uppercase tracking-widest text-muted-foreground px-1 mb-2">
          {title}
        </p>
      )}
      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden divide-y divide-border/40">
        {children}
      </div>
    </div>
  );
}
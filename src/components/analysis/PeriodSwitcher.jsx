const PERIODS = [
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "year", label: "Year" },
  { key: "all", label: "All" },
];

export default function PeriodSwitcher({ period, onChange }) {
  return (
    <div className="flex gap-1.5 bg-muted/60 rounded-xl p-1">
      {PERIODS.map((p) => {
        const active = period === p.key;
        return (
          <button
            key={p.key}
            onClick={() => onChange(p.key)}
            className={`flex-1 py-2 rounded-[10px] text-[13px] font-body font-semibold transition-all duration-150 ${
              active
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}
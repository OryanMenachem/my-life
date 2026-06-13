export default function SummaryCard({ sentence, totalEntries, activeDays, avgWords }) {
  return (
    <div className="bg-white rounded-2xl border border-border/50 p-5">
      <p className="font-heading text-[17px] leading-[1.6] text-foreground mb-5">
        {sentence}
      </p>
      <div className="grid grid-cols-3 gap-3">
        <StatBlock value={totalEntries} label="entries" />
        <StatBlock value={activeDays} label="active days" />
        <StatBlock value={avgWords} label="words / entry" />
      </div>
    </div>
  );
}

function StatBlock({ value, label }) {
  return (
    <div className="text-center">
      <div className="font-heading text-[28px] font-semibold text-foreground tracking-tight">{value}</div>
      <div className="text-[10px] font-body font-semibold uppercase tracking-widest text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}
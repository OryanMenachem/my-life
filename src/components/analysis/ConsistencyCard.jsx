export default function ConsistencyCard({ streak, bestStreak, mostActiveWeekday, empty }) {
  if (empty) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl border border-border/50 p-5">
      <h3 className="font-heading text-[14px] font-semibold text-foreground mb-4">Consistency</h3>
      <div className="grid grid-cols-3 gap-3">
        <ConsistencyStat value={`${streak}d`} label="current streak" />
        <ConsistencyStat value={`${bestStreak}d`} label="best streak" />
        <ConsistencyStat value={mostActiveWeekday} label="top day" />
      </div>
    </div>
  );
}

function ConsistencyStat({ value, label }) {
  return (
    <div className="text-center">
      <div className="font-heading text-[22px] font-semibold text-foreground">{value}</div>
      <div className="text-[10px] font-body font-semibold uppercase tracking-widest text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}
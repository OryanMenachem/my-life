export default function ActiveHoursCard({ hours, empty }) {
  if (empty) {
    return null;
  }

  const maxCount = Math.max(...hours, 1);

  const labels = [
    "12a", "", "2", "", "4", "", "6", "", "8", "", "10", "",
    "12p", "", "2", "", "4", "", "6", "", "8", "", "10", "",
  ];

  return (
    <div className="bg-white rounded-2xl border border-border/50 p-5">
      <h3 className="font-heading text-[14px] font-semibold text-foreground mb-4">When you write</h3>
      <div className="flex gap-[3px] mb-2">
        {hours.map((count, i) => {
          const intensity = maxCount > 0 ? count / maxCount : 0;
          const alpha = 0.08 + intensity * 0.72;
          return (
            <div
              key={i}
              className="flex-1 rounded-[3px] transition-colors"
              style={{
                height: "36px",
                backgroundColor: `rgba(199, 154, 79, ${alpha.toFixed(2)})`,
              }}
              title={`${i}:00 — ${count} entries`}
            />
          );
        })}
      </div>
      <div className="flex justify-between px-0">
        {labels.map((l, i) =>
          l ? (
            <span key={i} className="text-[9px] font-body text-muted-foreground/60">
              {l}
            </span>
          ) : null
        )}
      </div>
    </div>
  );
}
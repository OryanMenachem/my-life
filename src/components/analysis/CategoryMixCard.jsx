import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const CAT_COLORS = {
  mood: "#c79a4f",
  life: "#876848",
  location: "#7a7a4a",
  general: "#8c867c",
};

export default function CategoryMixCard({ data, empty }) {
  if (empty) {
    return (
      <div className="bg-white rounded-2xl border border-border/50 p-5">
        <h3 className="font-heading text-[14px] font-semibold text-foreground mb-3">What you write about</h3>
        <p className="text-[13px] font-body text-muted-foreground text-center py-4">
          Add tags to see your topic mix
        </p>
      </div>
    );
  }

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="bg-white rounded-2xl border border-border/50 p-5">
      <h3 className="font-heading text-[14px] font-semibold text-foreground mb-4">What you write about</h3>
      <div className="flex items-center gap-4">
        <div className="w-[120px] h-[120px] flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={32}
                outerRadius={52}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color || CAT_COLORS[entry.key] || "#8c867c"} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-1.5">
          {data.map((item) => {
            const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
            const color = item.color || CAT_COLORS[item.key] || "#8c867c";
            return (
              <div key={item.key} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                <span className="text-[12px] font-body text-foreground flex-1">{item.name}</span>
                <span className="text-[11px] font-body font-semibold text-muted-foreground tabular-nums">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
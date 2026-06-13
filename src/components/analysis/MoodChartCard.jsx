import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

export default function MoodChartCard({ data, empty }) {
  return (
    <div className="bg-white rounded-2xl border border-border/50 p-5">
      <h3 className="font-heading text-[14px] font-semibold text-foreground mb-4">Mood over time</h3>
      {empty ? (
        <p className="text-[13px] font-body text-muted-foreground text-center py-8">
          Add mood tags to see your mood trend
        </p>
      ) : (
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#8c867c" }}
                dy={5}
              />
              <YAxis
                domain={[-3, 3]}
                ticks={[-3, -2, -1, 0, 1, 2, 3]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#8c867c" }}
                width={20}
              />
              <ReferenceLine y={0} stroke="#e5e2dc" strokeDasharray="4 4" />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #e5e2dc",
                  borderRadius: "10px",
                  fontSize: "12px",
                  fontFamily: "Inter, sans-serif",
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="hsl(33 46% 52%)"
                strokeWidth={2}
                dot={{ r: 3, fill: "hsl(33 46% 52%)", strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "hsl(33 46% 52%)", strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
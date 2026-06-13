import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, isToday, format
} from "date-fns";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MOOD_HEX = [
  "#F87171", "#FBBF24", "#86EFAC",
  "#5EEAD4", "#7DD3FC", "#C4B5FD", "#F9A8D4",
];
function moodColor(id = "") {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return MOOD_HEX[Math.abs(hash) % MOOD_HEX.length];
}

/**
 * dotsByDay: Map<string (yyyy-MM-dd), Entry[]>
 */
export default function CalendarGrid({ month, selectedDay, onSelectDay, dotsByDay }) {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  return (
    <div>
      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-body font-semibold text-muted-foreground/60 uppercase tracking-wide py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-1">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const inMonth = isSameMonth(day, month);
          const selected = selectedDay && isSameDay(day, selectedDay);
          const today = isToday(day);
          const entries = dotsByDay[key] || [];
          const hasDot = entries.length > 0;
          const dotColor = hasDot ? moodColor(entries[0].id) : null;
          const multiDot = entries.length > 1;

          return (
            <button
              key={key}
              onClick={() => inMonth && onSelectDay(day)}
              disabled={!inMonth}
              className={`relative flex flex-col items-center justify-center rounded-xl py-1.5 transition-all duration-100 ${
                inMonth ? "active:scale-95" : "cursor-default"
              } ${
                selected
                  ? "bg-foreground"
                  : today
                  ? "bg-accent"
                  : inMonth
                  ? "hover:bg-muted/60"
                  : ""
              }`}
            >
              <span
                className={`text-[14px] font-body font-medium leading-none ${
                  selected
                    ? "text-background"
                    : today
                    ? "text-accent-foreground font-semibold"
                    : inMonth
                    ? "text-foreground"
                    : "text-muted-foreground/25"
                }`}
              >
                {format(day, "d")}
              </span>

              {/* Dot indicator */}
              <div className="h-[6px] flex items-center justify-center mt-0.5">
                {hasDot && inMonth && (
                  <span
                    className="rounded-full"
                    style={{
                      backgroundColor: selected ? "#fff" : dotColor,
                      width: multiDot ? 10 : 6,
                      height: 6,
                      opacity: 0.9,
                    }}
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
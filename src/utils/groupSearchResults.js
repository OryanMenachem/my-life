import { format, isThisMonth, isThisYear, isThisWeek, isToday } from "date-fns";

export function groupSearchResults(entries) {
  const groups = [];
  const map = new Map();

  for (const entry of entries) {
    const d = new Date(entry.entry_date || entry.created_date);
    let key, label;

    if (isToday(d)) {
      key = "today"; label = "Today";
    } else if (isThisWeek(d, { weekStartsOn: 1 })) {
      key = "this-week"; label = "This week";
    } else if (isThisMonth(d)) {
      key = "this-month"; label = "This month";
    } else if (isThisYear(d)) {
      key = format(d, "MMMM"); // e.g. "April"
      // Use month key to avoid duplication
      key = format(d, "yyyy-MM");
    } else {
      key = format(d, "yyyy");
      label = format(d, "yyyy");
    }

    if (!label) label = format(d, "MMMM");

    if (!map.has(key)) {
      map.set(key, { key, label, entries: [] });
      groups.push(map.get(key));
    }
    map.get(key).entries.push(entry);
  }

  return groups;
}
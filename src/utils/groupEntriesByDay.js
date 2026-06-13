import { format, isToday, isYesterday, isThisWeek, isThisYear, parseISO } from "date-fns";

export function getEntryDate(entry) {
  return entry.entry_date ? new Date(entry.entry_date) : new Date(entry.created_date);
}

export function getDayLabel(date) {
  if (isToday(date)) {
    return `Today · ${format(date, "d MMM")}`;
  }
  if (isYesterday(date)) {
    return `Yesterday · ${format(date, "d MMM")}`;
  }
  if (isThisWeek(date, { weekStartsOn: 1 })) {
    return `${format(date, "EEEE")} · ${format(date, "d MMM")}`;
  }
  if (isThisYear(date)) {
    return format(date, "d MMM");
  }
  return format(date, "d MMM yyyy");
}

export function groupEntriesByDay(entries) {
  // entries should already be sorted newest-first
  const groups = [];
  const seen = new Map(); // dayKey -> group index

  for (const entry of entries) {
    const date = getEntryDate(entry);
    const dayKey = format(date, "yyyy-MM-dd");

    if (seen.has(dayKey)) {
      groups[seen.get(dayKey)].entries.push(entry);
    } else {
      seen.set(dayKey, groups.length);
      groups.push({ dayKey, label: getDayLabel(date), entries: [entry] });
    }
  }

  return groups;
}
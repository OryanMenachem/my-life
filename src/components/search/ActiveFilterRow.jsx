import { X } from "lucide-react";

const TIME_LABELS = {
  today: "Today",
  week: "This week",
  month: "This month",
  year: "This year",
  custom: "Custom range",
};

export default function ActiveFilterRow({ query, selectedTagIds, timeFilter, tagById, categoryByKey, onRemoveQuery, onRemoveTag, onRemoveTime, onClearAll }) {
  const hasQuery = query.trim().length > 0;
  const hasTags = selectedTagIds.length > 0;
  const hasTime = timeFilter && timeFilter !== "all";
  const hasAny = hasQuery || hasTags || hasTime;

  if (!hasAny) return null;

  return (
    <div className="flex flex-wrap gap-2 items-center py-2">
      {hasQuery && (
        <Chip label={`"${query}"`} onRemove={onRemoveQuery} />
      )}
      {selectedTagIds.map((id) => {
        const tag = tagById[id];
        if (!tag) return null;
        const cat = categoryByKey[tag.category_key];
        const color = cat?.color ?? "#888888";
        return (
          <Chip
            key={id}
            label={tag.name_en}
            color={color}
            onRemove={() => onRemoveTag(id)}
          />
        );
      })}
      {hasTime && (
        <Chip label={TIME_LABELS[timeFilter] ?? timeFilter} onRemove={onRemoveTime} />
      )}
      <button
        onClick={onClearAll}
        className="text-xs font-body font-medium text-muted-foreground underline underline-offset-2 ml-1 whitespace-nowrap"
      >
        Clear all
      </button>
    </div>
  );
}

function Chip({ label, color, onRemove }) {
  return (
    <span
      className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-0.5 rounded-full text-xs font-body font-medium border whitespace-nowrap"
      style={
        color
          ? { backgroundColor: `${color}20`, borderColor: `${color}55`, color }
          : { backgroundColor: "hsl(var(--muted))", borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))" }
      }
    >
      {label}
      <button
        onClick={onRemove}
        className="w-3.5 h-3.5 flex items-center justify-center rounded-full opacity-60 hover:opacity-100"
        aria-label="Remove filter"
      >
        <X className="w-2.5 h-2.5" />
      </button>
    </span>
  );
}
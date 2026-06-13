import { X, Image, Video, Link as LinkIcon } from "lucide-react";

const TIME_LABELS = {
  today: "Today",
  week: "This week",
  month: "This month",
  year: "This year",
  custom: "Custom range",
};

const CT_LABELS = { photo: "Photos", video: "Videos", link: "Links" };
const CT_ICONS = { photo: Image, video: Video, link: LinkIcon };

export default function ActiveFilterRow({ query, selectedTagIds, contentTypes, timeFilter, tagById, categoryByKey, onRemoveQuery, onRemoveTag, onRemoveContentType, onRemoveTime, onClearAll }) {
  const hasQuery = query.trim().length > 0;
  const hasTags = selectedTagIds.length > 0;
  const hasCT = (contentTypes || []).length > 0;
  const hasTime = timeFilter && timeFilter !== "all";
  const hasAny = hasQuery || hasTags || hasCT || hasTime;

  if (!hasAny) return null;

  return (
    <div className="flex flex-wrap gap-2 items-center py-2">
      {hasQuery && (
        <Chip label={`"${query}"`} onRemove={onRemoveQuery} />
      )}
      {(contentTypes || []).map((ct) => {
        const Icon = CT_ICONS[ct];
        return (
          <NeutralChip
            key={ct}
            label={CT_LABELS[ct] ?? ct}
            icon={Icon ? <Icon className="w-3 h-3" /> : null}
            onRemove={() => onRemoveContentType?.(ct)}
          />
        );
      })}
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

function NeutralChip({ label, icon, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-lg text-[11px] font-body font-medium border bg-muted/60 border-muted-foreground/25 text-muted-foreground whitespace-nowrap">
      {icon}
      {label}
      <button
        onClick={onRemove}
        className="w-3.5 h-3.5 flex items-center justify-center rounded-md opacity-60 hover:opacity-100 hover:bg-muted-foreground/15"
        aria-label="Remove filter"
      >
        <X className="w-2.5 h-2.5" />
      </button>
    </span>
  );
}
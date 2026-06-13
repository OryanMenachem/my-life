import { ChevronRight } from "lucide-react";

/**
 * Shows up to 3 most-used tags as dashed chips, then "All tags ›".
 */
export default function QuickTagChips({ topTags, tagById, categoryByKey, selectedTagIds, onToggleTag, onAllTags }) {
  return (
    <div className="flex flex-wrap gap-2 pt-2 pb-1">
      {topTags.map((tagId) => {
        const tag = tagById[tagId];
        if (!tag) return null;
        const cat = categoryByKey[tag.category_key];
        const color = cat?.color ?? "#888888";
        const selected = selectedTagIds.includes(tagId);
        return (
          <button
            key={tagId}
            onClick={() => onToggleTag(tagId)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-body font-medium border border-dashed whitespace-nowrap transition-all active:scale-95"
            style={
              selected
                ? { backgroundColor: color, borderColor: color, color: "#fff", borderStyle: "solid" }
                : { backgroundColor: `${color}15`, borderColor: `${color}55`, color }
            }
          >
            {tag.name_en}
          </button>
        );
      })}
      <button
        onClick={onAllTags}
        className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full text-xs font-body font-medium border border-dashed border-muted-foreground/40 text-muted-foreground whitespace-nowrap hover:border-muted-foreground/60 transition-colors active:scale-95"
      >
        All tags <ChevronRight className="w-3 h-3" />
      </button>
    </div>
  );
}
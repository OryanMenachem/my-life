import { format } from "date-fns";
import { X } from "lucide-react";
import { getEntryDate } from "@/utils/groupEntriesByDay";
import MiniTagChip from "@/components/tags/MiniTagChip";

export default function EntryDetail({ entry, onClose, tagById, categoryByKey }) {
  const date = getEntryDate(entry);
  const fullDateTime = format(date, "EEEE, d MMMM yyyy · HH:mm");

  const tagIds = entry.tag_ids || [];

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/40 flex-shrink-0">
        <span className="text-sm font-body font-semibold text-foreground">Entry</span>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-10">
        <p className="text-xs font-body text-muted-foreground mb-5 tracking-wide">
          {fullDateTime}
        </p>
        <p className="font-heading text-[18px] leading-[1.8] text-foreground whitespace-pre-wrap">
          {entry.content}
        </p>

        {/* Tags */}
        {tagIds.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-6">
            {tagIds.map((id) => {
              const tag = tagById?.[id];
              if (!tag) return null;
              const cat = categoryByKey?.[tag.category_key];
              return <MiniTagChip key={id} tag={tag} category={cat} />;
            })}
          </div>
        )}
      </div>
    </div>
  );
}
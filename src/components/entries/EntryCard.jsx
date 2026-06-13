import { format } from "date-fns";
import { getEntryDate } from "@/utils/groupEntriesByDay";
import MiniTagChip from "@/components/tags/MiniTagChip";
import EntryMenu from "./EntryMenu";
import EntryMediaPreview from "./EntryMediaPreview";

const MAX_VISIBLE_TAGS = 3;

export default function EntryCard({ entry, onClick, onEdit, onDelete, tagById, categoryByKey }) {
  const date = getEntryDate(entry);
  const timeStr = format(date, "HH:mm");

  const tagIds = entry.tag_ids || [];
  const visibleIds = tagIds.slice(0, MAX_VISIBLE_TAGS);
  const overflow = tagIds.length - MAX_VISIBLE_TAGS;

  return (
    <div className="w-full bg-card px-4 pt-3 pb-[13px] relative">
      {/* Kebab menu — absolute top-right */}
      <div className="absolute top-3 right-3 z-10">
        <EntryMenu onEdit={onEdit} onDelete={onDelete} />
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-[6px] mb-0">
        <span className="w-[6px] h-[6px] rounded-full flex-shrink-0" style={{ backgroundColor: "#c79a4f" }} />
        <span className="text-[10.5px] font-body font-semibold tabular-nums" style={{ color: "#8c867c" }}>
          {timeStr}
        </span>
      </div>

      {/* Content — tappable */}
      <button onClick={onClick} className="w-full text-left focus:outline-none pr-6">
        {entry.content ? (
          <p className="font-heading text-[13.5px] leading-[1.5] py-[5px] pb-[9px]" style={{ color: "#2c2823" }}>
            {entry.content}
          </p>
        ) : null}

        {/* Media preview */}
        <EntryMediaPreview media={entry.media} />

        {/* Tags */}
        {visibleIds.length > 0 && (
          <div className="flex flex-wrap gap-[5px] items-center">
            {visibleIds.map((id) => {
              const tag = tagById?.[id];
              if (!tag) return null;
              const cat = categoryByKey?.[tag.category_key];
              return <MiniTagChip key={id} tag={tag} category={cat} />;
            })}
            {overflow > 0 && (
              <span className="text-[10px] font-body font-semibold" style={{ color: "#8c867c" }}>+{overflow}</span>
            )}
          </div>
        )}
      </button>
    </div>
  );
}
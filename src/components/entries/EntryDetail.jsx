import { format } from "date-fns";
import { X } from "lucide-react";
import { getEntryDate } from "@/utils/groupEntriesByDay";
import MiniTagChip from "@/components/tags/MiniTagChip";
import MediaCarousel from "./MediaCarousel";
import LinkCard from "./LinkCard";

export default function EntryDetail({ entry, onClose, tagById, categoryByKey }) {
  const date = getEntryDate(entry);
  const fullDateTime = format(date, "EEEE, d MMMM yyyy · HH:mm");

  const tagIds = entry.tag_ids || [];

  return (
    <div className="fixed inset-0 z-40 bg-black/40 flex items-end">
      <div className="w-full bg-card rounded-t-2xl flex flex-col max-h-[90vh]">
      {/* Grip */}
      <div className="flex justify-center pt-2 pb-2">
        <div className="w-12 h-1 rounded-full bg-muted"></div>
      </div>

      {/* Close button */}
      <div className="flex justify-end px-5 pb-2">
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <p className="text-xs font-body text-muted-foreground mb-5 tracking-wide">
          {fullDateTime}
        </p>
        {entry.content ? (
          <p
            className="font-body text-[16px] leading-[1.85] text-foreground whitespace-pre-wrap"
            dir={/[\u0590-\u05FF\uFB1D-\uFB4F]/.test(entry.content.slice(0, 60)) ? "rtl" : "ltr"}
            style={{ textAlign: /[\u0590-\u05FF\uFB1D-\uFB4F]/.test(entry.content.slice(0, 60)) ? "right" : "left" }}
          >
            {entry.content}
          </p>
        ) : null}

        {/* Visual Media */}
        <MediaCarousel media={(entry.media || []).filter((m) => m.type !== "link")} />

        {/* Link cards */}
        {(entry.media || []).filter((m) => m.type === "link").length > 0 && (
          <div className="flex flex-col gap-2 mt-4">
            {(entry.media || []).filter((m) => m.type === "link").map((item, idx) => (
              <LinkCard key={idx} item={item} />
            ))}
          </div>
        )}

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
    </div>
  );
}
import { useState } from "react";
import {
  Search,
  Sun, Moon, Heart, Zap, Wind, Cloud,
  Briefcase, Users, User, HeartPulse, BookOpen,
  Home, TreePine, Plane, Lightbulb, Mountain, Star, Crosshair,
} from "lucide-react";

const ICON_MAP = {
  "sun": Sun, "moon": Moon, "heart": Heart, "zap": Zap, "wind": Wind, "cloud": Cloud,
  "briefcase": Briefcase, "users": Users, "user": User, "heart-pulse": HeartPulse,
  "book-open": BookOpen, "home": Home, "tree-pine": TreePine, "plane": Plane,
  "lightbulb": Lightbulb, "mountain": Mountain,
  "star": Star, "crosshair": Crosshair,
};

export default function AllTagsSheet({ categories, tags, selectedTagIds, onClose }) {
  const [localSelected, setLocalSelected] = useState(selectedTagIds);
  const [filterQ, setFilterQ] = useState("");

  const toggle = (id) =>
    setLocalSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const activeTags = tags.filter((t) => t.is_active !== false);
  const q = filterQ.trim().toLowerCase();
  const filtered = q
    ? activeTags.filter((t) => (t.name_en || "").toLowerCase().includes(q) || (t.name_he || "").toLowerCase().includes(q))
    : activeTags;

  const tagsByCategory = {};
  for (const tag of filtered) {
    const k = tag.category_key;
    if (!tagsByCategory[k]) tagsByCategory[k] = [];
    tagsByCategory[k].push(tag);
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end bg-black/30" onClick={() => onClose(localSelected)}>
      <div
        className="bg-background rounded-t-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grip */}
        <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/25" />
        </div>

        {/* Search */}
        <div className="px-4 pb-3 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={filterQ}
              onChange={(e) => setFilterQ(e.target.value)}
              placeholder="Find a tag…"
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-muted text-sm font-body outline-none placeholder:text-muted-foreground/50"
            />
          </div>
        </div>

        {/* Tag list */}
        <div className="overflow-y-auto flex-1 px-4 pb-6">
          {categories
            .filter((cat) => tagsByCategory[cat.system_key]?.length > 0)
            .map((cat) => (
              <div key={cat.system_key} className="mb-5">
                <p className="text-xs font-body font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                  {cat.name_en}
                </p>
                <div className="flex flex-wrap gap-2">
                  {tagsByCategory[cat.system_key].map((tag) => {
                    const color = cat.color ?? "#888888";
                    const selected = localSelected.includes(tag.id);
                    const IconComponent = tag.icon ? ICON_MAP[tag.icon] : null;
                    return (
                      <button
                        key={tag.id}
                        onClick={() => toggle(tag.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-body font-medium border border-dashed whitespace-nowrap transition-all active:scale-95"
                        style={
                          selected
                            ? { backgroundColor: color, borderColor: color, color: "#fff", borderStyle: "solid" }
                            : { backgroundColor: `${color}15`, borderColor: `${color}55`, color }
                        }
                      >
                        {IconComponent && <IconComponent size={10} strokeWidth={2} />}
                        {tag.name_en}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          {filtered.length === 0 && (
            <p className="text-sm font-body text-muted-foreground text-center py-6">No matching tags</p>
          )}
        </div>

        {/* Done button */}
        <div className="px-4 pb-8 pt-2 border-t border-border/40 flex-shrink-0">
          <button
            onClick={() => onClose(localSelected)}
            className="w-full h-11 rounded-full bg-foreground text-background text-sm font-body font-semibold active:scale-95 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
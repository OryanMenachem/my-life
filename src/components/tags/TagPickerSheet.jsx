import { useState, useMemo } from "react";
import {
  Sun, Moon, Heart, Zap, Wind, Cloud,
  Briefcase, Users, User, HeartPulse, BookOpen,
  Home, TreePine, Plane, Lightbulb,
} from "lucide-react";

const ICON_MAP = {
  sun: Sun, moon: Moon, heart: Heart, zap: Zap, wind: Wind, cloud: Cloud,
  briefcase: Briefcase, users: Users, user: User, "heart-pulse": HeartPulse,
  "book-open": BookOpen, home: Home, "tree-pine": TreePine, tree: TreePine,
  plane: Plane, lightbulb: Lightbulb,
};

function TagChipSelectable({ tag, category, selected, onToggle }) {
  const color = category?.color ?? "#888888";
  const Icon = tag.icon ? ICON_MAP[tag.icon] : null;

  if (selected) {
    return (
      <button
        onClick={() => onToggle(tag.id)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-body font-medium border whitespace-nowrap transition-all active:scale-95"
        style={{ backgroundColor: color, borderColor: color, color: "#fff" }}
      >
        {Icon && <Icon className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2} />}
        {tag.name_en}
      </button>
    );
  }

  return (
    <button
      onClick={() => onToggle(tag.id)}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-body font-medium border border-dashed whitespace-nowrap transition-all active:scale-95"
      style={{
        backgroundColor: `${color}18`,
        borderColor: `${color}55`,
        color,
      }}
    >
      {Icon && <Icon className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2} />}
      {tag.name_en}
    </button>
  );
}

export default function TagPickerSheet({ categories, tags, selectedIds, onClose }) {
  const [query, setQuery] = useState("");

  const categoryByKey = Object.fromEntries(categories.map((c) => [c.system_key, c]));

  const [selected, setSelected] = useState(() => new Set(selectedIds));

  const toggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filteredTags = useMemo(() => {
    if (!query.trim()) return tags;
    const q = query.toLowerCase();
    return tags.filter(
      (t) => t.name_en.toLowerCase().includes(q) || (t.name_he || "").includes(q)
    );
  }, [tags, query]);

  const tagsByCategory = useMemo(() => {
    return filteredTags.reduce((acc, tag) => {
      if (!acc[tag.category_key]) acc[tag.category_key] = [];
      acc[tag.category_key].push(tag);
      return acc;
    }, {});
  }, [filteredTags]);

  const handleDone = () => onClose(Array.from(selected));

  return (
    // Backdrop
    <div className="fixed inset-0 z-[60] flex flex-col justify-end" onClick={handleDone}>
      {/* Sheet */}
      <div
        className="bg-background rounded-t-2xl shadow-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grip */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/25" />
        </div>

        {/* Search */}
        <div className="px-4 pb-3 flex-shrink-0">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a tag…"
            className="w-full h-9 rounded-xl border border-border bg-muted px-3 text-sm font-body outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/50"
          />
        </div>

        {/* Tag list */}
        <div className="overflow-y-auto flex-1 pb-6">
          {categories.map((cat) => {
            const catTags = tagsByCategory[cat.system_key];
            if (!catTags?.length) return null;
            return (
              <div key={cat.system_key}>
                <p className="px-4 pt-4 pb-2 text-xs font-body font-semibold text-muted-foreground tracking-wide uppercase">
                  {cat.name_en}
                </p>
                <div className="px-4 flex flex-wrap gap-2">
                  {catTags.map((tag) => (
                    <TagChipSelectable
                      key={tag.id}
                      tag={tag}
                      category={cat}
                      selected={selected.has(tag.id)}
                      onToggle={toggle}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Done button */}
        <div className="px-4 pb-6 pt-2 flex-shrink-0 border-t border-border/40">
          <button
            onClick={handleDone}
            className="w-full h-10 rounded-full bg-foreground text-background text-sm font-body font-semibold active:scale-95 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
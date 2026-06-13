import {
  Sun, Moon, Heart, Zap, Wind, Cloud,
  Briefcase, Users, User, HeartPulse, BookOpen,
  Home, TreePine, Plane, Lightbulb, Mountain,
} from "lucide-react";

const ICON_MAP = {
  sun: Sun, moon: Moon, heart: Heart, zap: Zap, wind: Wind, cloud: Cloud,
  briefcase: Briefcase, users: Users, user: User, "heart-pulse": HeartPulse,
  "book-open": BookOpen, home: Home, "tree-pine": TreePine, plane: Plane,
  lightbulb: Lightbulb, mountain: Mountain,
};

const CAT_COLORS = {
  mood: "#946a2b",
  life: "#876848",
  location: "#71703e",
  general: "#6e685f",
};

export default function TopTagsCard({ items, empty }) {
  if (!items || items.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-border/50 p-5">
        <h3 className="font-heading text-[14px] font-semibold text-foreground mb-3">Your top tags</h3>
        <p className="text-[13px] font-body text-muted-foreground text-center py-4">
          Start tagging your entries to see patterns
        </p>
      </div>
    );
  }

  const maxCount = items[0]?.count || 1;

  return (
    <div className="bg-white rounded-2xl border border-border/50 p-5">
      <h3 className="font-heading text-[14px] font-semibold text-foreground mb-4">Your top tags</h3>
      <div className="space-y-3">
        {items.map((item) => {
          const IconComp = item.icon ? ICON_MAP[item.icon] : null;
          const color = CAT_COLORS[item.categoryKey] || "#6e685f";
          const pct = (item.count / maxCount) * 100;
          return (
            <div key={item.tagId} className="flex items-center gap-2.5">
              <span className="w-5 flex justify-center">
                {IconComp && <IconComp size={13} strokeWidth={2} style={{ color }} />}
              </span>
              <span className="text-[12px] font-body font-medium text-foreground flex-1 truncate">
                {item.name}
              </span>
              <div className="flex-1 h-2 bg-muted/80 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: color, opacity: 0.7 }}
                />
              </div>
              <span className="text-[11px] font-body font-semibold text-muted-foreground w-5 text-right tabular-nums">
                {item.count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
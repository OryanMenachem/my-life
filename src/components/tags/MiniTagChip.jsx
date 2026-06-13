import {
  Sun, Moon, Heart, Zap, Wind, Cloud,
  Briefcase, Users, User, HeartPulse, BookOpen,
  Home, TreePine, Plane,
  Lightbulb,
} from "lucide-react";

// Map lucide icon name strings → components
const ICON_MAP = {
  "sun": Sun,
  "moon": Moon,
  "heart": Heart,
  "zap": Zap,
  "wind": Wind,
  "cloud": Cloud,
  "briefcase": Briefcase,
  "users": Users,
  "user": User,
  "heart-pulse": HeartPulse,
  "book-open": BookOpen,
  "home": Home,
  "tree-pine": TreePine,
  "plane": Plane,
  "lightbulb": Lightbulb,
};

// Category-specific warm palette from spec
const CAT_STYLES = {
  mood:     { bg: "#f6ecd9", fg: "#946a2b", bd: "#dcc59c" },
  life:     { bg: "#efe7dc", fg: "#876848", bd: "#d9c4a6" },
  location: { bg: "#ebe9d7", fg: "#71703e", bd: "#cdc69a" },
  general:  { bg: "#f1efeb", fg: "#6e685f", bd: "#cfc8ba" },
};

export default function MiniTagChip({ tag, category }) {
  const key = category?.system_key ?? "general";
  const style = CAT_STYLES[key] ?? CAT_STYLES.general;
  const IconComponent = tag.icon ? ICON_MAP[tag.icon] : null;

  return (
    <span
      className="inline-flex items-center gap-[4px] px-[9px] rounded-full text-[10px] font-body font-medium border border-dashed whitespace-nowrap"
      style={{
        height: "22px",
        backgroundColor: style.bg,
        borderColor: style.bd,
        color: style.fg,
      }}
    >
      {IconComponent && <IconComponent size={9} strokeWidth={2} />}
      {tag.name_en}
    </span>
  );
}
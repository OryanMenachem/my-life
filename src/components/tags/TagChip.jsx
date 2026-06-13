import {
  Sun, Moon, Heart, Zap, Wind, Cloud,
  Briefcase, Users, User, HeartPulse, BookOpen,
  Home, TreePine, Plane, Lightbulb,
} from "lucide-react";

const ICON_MAP = {
  sun: Sun, moon: Moon, heart: Heart, zap: Zap, wind: Wind, cloud: Cloud,
  briefcase: Briefcase, users: Users, user: User, "heart-pulse": HeartPulse,
  "book-open": BookOpen, home: Home, "tree-pine": TreePine, plane: Plane,
  lightbulb: Lightbulb,
};

export default function TagChip({ tag, categoryColor }) {
  const Icon = tag.icon ? ICON_MAP[tag.icon] : null;

  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-body font-medium border border-dashed whitespace-nowrap"
      style={{
        backgroundColor: `${categoryColor}18`,
        borderColor: `${categoryColor}55`,
        color: categoryColor,
      }}
    >
      {Icon && <Icon className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2} />}
      {tag.name_en}
    </span>
  );
}
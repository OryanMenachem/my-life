import {
  Sun, Moon, Heart, Zap, Wind, Cloud,
  Briefcase, Users, User, HeartPulse, BookOpen,
  Home, TreePine, Plane, Lightbulb, Mountain, Star, Crosshair,
  UtensilsCrossed, GlassWater, Coffee, Waves, Umbrella, Compass,
  Sailboat, MapPin, Ticket, Leaf, Trees, ShoppingBag, Film, Music,
  Landmark, Sparkles,
} from "lucide-react";

const ICON_MAP = {
  sun: Sun, moon: Moon, heart: Heart, zap: Zap, wind: Wind, cloud: Cloud,
  briefcase: Briefcase, users: Users, user: User, "heart-pulse": HeartPulse,
  "book-open": BookOpen, home: Home, "tree-pine": TreePine, plane: Plane,
  lightbulb: Lightbulb, mountain: Mountain,
  star: Star, crosshair: Crosshair,
  "utensils-crossed": UtensilsCrossed, "glass-water": GlassWater, coffee: Coffee,
  waves: Waves, umbrella: Umbrella, compass: Compass, "sailboat": Sailboat,
  "map-pin": MapPin, ticket: Ticket, leaf: Leaf, trees: Trees,
  "shopping-bag": ShoppingBag, film: Film, music: Music, landmark: Landmark,
  sparkles: Sparkles,
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
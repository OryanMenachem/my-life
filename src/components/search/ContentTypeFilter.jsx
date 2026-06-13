import { Image, Video, Link as LinkIcon } from "lucide-react";

const FILTERS = [
  { key: "photo", label: "Photos", Icon: Image },
  { key: "video", label: "Videos", Icon: Video },
  { key: "link",  label: "Links",  Icon: LinkIcon },
];

/**
 * Content-type filter row — visually distinct from tag chips.
 * Neutral style: muted background, solid border, squarer corners.
 */
export default function ContentTypeFilter({ selected, onToggle }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] font-body font-semibold uppercase tracking-widest text-muted-foreground/60">
        Content type
      </span>
      <div className="flex gap-2">
        {FILTERS.map(({ key, label, Icon }) => {
          const active = selected.includes(key);
          return (
            <button
              key={key}
              onClick={() => onToggle(key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11.5px] font-body font-medium border transition-all active:scale-95 ${
                active
                  ? "bg-foreground text-background border-foreground"
                  : "bg-muted/60 text-muted-foreground border-muted-foreground/25 hover:border-muted-foreground/45"
              }`}
            >
              <Icon className="w-3 h-3" />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
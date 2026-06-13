/**
 * A small tag chip used on entry cards and detail views.
 * Always dashed border, soft category color tone.
 */
export default function MiniTagChip({ tag, category }) {
  const color = category?.color ?? "#888888";
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-body font-medium border border-dashed whitespace-nowrap"
      style={{
        backgroundColor: `${color}18`,
        borderColor: `${color}55`,
        color,
      }}
    >
      {tag.name_en}
    </span>
  );
}
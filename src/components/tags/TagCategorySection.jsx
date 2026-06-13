import TagChip from "./TagChip";

export default function TagCategorySection({ category, tags }) {
  const activeTags = tags.filter((t) => t.is_active);
  if (activeTags.length === 0) return null;

  return (
    <div>
      <h2 className="font-heading text-sm font-semibold text-foreground/70 tracking-wide px-5 pt-5 pb-3">
        {category.name_en}
      </h2>
      <div className="px-5 flex flex-wrap gap-2">
        {activeTags.map((tag) => (
          <TagChip key={tag.id} tag={tag} categoryColor={category.color} />
        ))}
      </div>
    </div>
  );
}
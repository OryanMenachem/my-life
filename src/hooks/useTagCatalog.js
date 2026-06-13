import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

/**
 * Loads all active tags + categories once and caches them.
 * Returns helpers to look up a tag or its category by id / key.
 */
export function useTagCatalog() {
  const { data: categories = [] } = useQuery({
    queryKey: ["tag-categories"],
    queryFn: () => base44.entities.TagCategory.filter({ is_active: true }, "sort_order"),
    staleTime: Infinity,
  });

  const { data: tags = [] } = useQuery({
    queryKey: ["tags"],
    queryFn: () => base44.entities.Tag.filter({ is_active: true }, "sort_order"),
    staleTime: Infinity,
  });

  const categoryByKey = Object.fromEntries(categories.map((c) => [c.system_key, c]));
  const tagById = Object.fromEntries(tags.map((t) => [t.id, t]));

  return { categories, tags, categoryByKey, tagById };
}
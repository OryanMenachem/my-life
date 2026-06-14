import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import TagCategorySection from "../components/tags/TagCategorySection";

export default function Tags() {
  const { data: categories = [], isLoading: loadingCats } = useQuery({
    queryKey: ["tag-categories"],
    queryFn: () => base44.entities.TagCategory.filter({ is_active: true }, "sort_order"),
  });

  const { data: tags = [], isLoading: loadingTags } = useQuery({
    queryKey: ["tags"],
    queryFn: () => base44.entities.Tag.filter({ is_active: true }, "sort_order"),
  });

  const isLoading = loadingCats || loadingTags;

  // Group tags by category_key
  const tagsByCategory = tags.reduce((acc, tag) => {
    if (!acc[tag.category_key]) acc[tag.category_key] = [];
    acc[tag.category_key].push(tag);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-3 text-center">
          <h1 className="font-heading text-[21px] font-semibold tracking-[-0.5px] text-foreground uppercase">
            TAGS
          </h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto pb-10">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {categories.map((cat) => (
              <TagCategorySection
                key={cat.id}
                category={cat}
                tags={tagsByCategory[cat.system_key] || []}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
import { base44 } from "@/api/base44Client";

/**
 * Run AI auto-tagging on entry text using only existing tags.
 * Returns an array of valid tag IDs that match the content.
 */
export async function autoTagEntry(text, tags, categoryByKey) {
  if (!text?.trim()) return [];

  const allowedList = tags.map((t) => ({
    id: t.id,
    name: t.name_en,
    name_he: t.name_he || "",
    category: categoryByKey[t.category_key]?.name_en || t.category_key,
  }));

  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `You are tagging a personal journal entry. Choose only from this exact list of allowed tags: ${JSON.stringify(allowedList)}. Return only the ids of the tags from this list that clearly match the entry's content. Do not create new tags, do not return anything not in the list, and do not return more than 5 tags. If nothing fits, return an empty list.\n\nEntry text: "${text.trim()}"`,
    response_json_schema: {
      type: "object",
      properties: {
        tag_ids: { type: "array", items: { type: "string" } },
      },
    },
  });

  const allowedIds = new Set(tags.map((t) => t.id));
  return (result?.tag_ids || []).filter((id) => allowedIds.has(id));
}
import { base44 } from "@/api/base44Client";

/**
 * Run AI auto-tagging on entry text using only existing tags.
 * Includes each tag's description so the AI matches on meaning, not just name.
 * Returns an array of valid tag IDs that match the content.
 */
export async function autoTagEntry(text, tags, categoryByKey) {
  if (!text?.trim()) return [];

  const allowedList = tags.map((t) => ({
    id: t.id,
    name: t.name_en,
    name_he: t.name_he || "",
    category: categoryByKey[t.category_key]?.name_en || t.category_key,
    description: t.description || "",
  }));

  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `You are tagging a personal journal entry. You have a list of allowed tags, each with a description that explains exactly when to use it and when NOT to use it.

Choose tags by matching the entry's content against each tag's DESCRIPTION — not just its name. Pay attention to the "Do NOT use" rules in each description. If a description says not to use the tag for something, do not apply it for that.

Only pick tags whose description clearly fits the entry. Be conservative — when in doubt, skip the tag. Return only the ids of matching tags. Never return more than 5 tags. If nothing fits, return an empty list.

Allowed tags:
${allowedList.map((t) => `- id="${t.id}" name="${t.name}" (${t.category}): ${t.description || "no description"}`).join("\n")}

Entry text: "${text.trim()}"`,
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
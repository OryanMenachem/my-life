import { useState } from "react";
import { Sparkles, RotateCcw } from "lucide-react";
import { autoTagEntry } from "@/utils/autoTag";

/**
 * AI auto-tagging button.
 * Props:
 *   text          – current entry text
 *   tags          – full list of active Tag records
 *   categoryByKey – map of category key → TagCategory record
 *   selectedIds   – currently selected tag ids (array)
 *   onTagsAdded   – callback(newIds: string[]) – merging is done here
 */
export default function AutoTagButton({ text, tags, categoryByKey, selectedIds, onTagsAdded }) {
  const [status, setStatus] = useState("idle"); // idle | loading | done | empty | error
  const [aiTagIds, setAiTagIds] = useState([]);
  const [hint, setHint] = useState("");

  const run = async () => {
    if (!text?.trim()) {
      setHint("Write something first");
      setTimeout(() => setHint(""), 2500);
      return;
    }

    setStatus("loading");
    setHint("");

    try {
      const returned = await autoTagEntry(text, tags, categoryByKey);

      // Merge with existing, no duplicates
      const existing = new Set(selectedIds);
      const newIds = returned.filter((id) => !existing.has(id));

      if (returned.length === 0) {
        setStatus("empty");
        setAiTagIds([]);
      } else {
        setStatus("done");
        setAiTagIds(returned);
        onTagsAdded(newIds);
      }
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  const redo = () => {
    setStatus("idle");
    setAiTagIds([]);
    run();
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        {/* AI button */}
        <button
          onClick={status === "done" || status === "empty" ? redo : run}
          disabled={status === "loading"}
          className="inline-flex items-center gap-[6px] px-[12px] rounded-full text-[11.5px] font-body font-semibold border border-dashed transition-all active:scale-95 disabled:opacity-50"
          style={{
            height: "27px",
            backgroundColor: "#f6ecdd",
            borderColor: "#dcc59c",
            color: "#946a2b",
          }}
        >
          {status === "loading" ? (
            <>
              <span className="w-[10px] h-[10px] border-2 rounded-full animate-spin" style={{ borderColor: "#dcc59c", borderTopColor: "#946a2b" }} />
              Reading your entry…
            </>
          ) : status === "done" || status === "empty" ? (
            <>
              <RotateCcw size={10} strokeWidth={2.5} />
              Redo
            </>
          ) : (
            <>
              <Sparkles size={10} strokeWidth={2.5} />
              Auto-tag with AI
            </>
          )}
        </button>

        {/* Status message */}
        {status === "idle" && !hint && (
          <span className="text-[11px] font-body" style={{ color: "#8c867c" }}>
            Send this to AI for auto-tagging
          </span>
        )}
        {hint && (
          <span className="text-[11px] font-body" style={{ color: "#b1493f" }}>
            {hint}
          </span>
        )}
        {status === "empty" && (
          <span className="text-[11px] font-body" style={{ color: "#8c867c" }}>
            No matching tags found
          </span>
        )}
        {status === "error" && (
          <span className="text-[11px] font-body" style={{ color: "#b1493f" }}>
            Couldn't reach AI, try again
          </span>
        )}
        {status === "done" && aiTagIds.length > 0 && (
          <span className="text-[11px] font-body font-semibold" style={{ color: "#946a2b" }}>
            ✦ AI suggested {aiTagIds.length} tag{aiTagIds.length > 1 ? "s" : ""}
          </span>
        )}
      </div>
    </div>
  );
}
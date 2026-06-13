import { useRef } from "react";
import { Plus } from "lucide-react";

const ACCEPT = "image/jpeg,image/png,image/webp,video/mp4,video/quicktime";

/**
 * Dashed "ADD" tile — the single entry point for attaching media.
 * Renders a hidden file input; tapping the tile clicks it.
 */
export default function MediaAddTile({ onFiles }) {
  const inputRef = useRef(null);

  const handleChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) onFiles(files);
    // reset so the same file can be re-selected
    e.target.value = "";
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        className="hidden"
        onChange={handleChange}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-20 h-20 rounded-xl flex-shrink-0 border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-muted-foreground/50 transition-colors active:scale-95"
        aria-label="Add photo or video"
      >
        <Plus className="w-5 h-5" />
        <span className="text-[10px] font-body">Add</span>
      </button>
    </>
  );
}
import { useEffect, useRef } from "react";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";

export default function EntryMenu({ onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (!menuRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [open]);

  return (
    <div ref={menuRef} className="relative flex-shrink-0">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className="w-7 h-7 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition-colors"
        aria-label="Entry options"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-30 bg-card border border-border rounded-xl shadow-lg overflow-hidden min-w-[130px]">
          <button
            onClick={(e) => { e.stopPropagation(); setOpen(false); onEdit(); }}
            className="w-full text-left px-4 py-3 text-sm font-body text-foreground hover:bg-muted transition-colors"
          >
            Edit
          </button>
          <div className="h-px bg-border/60 mx-3" />
          <button
            onClick={(e) => { e.stopPropagation(); setOpen(false); onDelete(); }}
            className="w-full text-left px-4 py-3 text-sm font-body text-destructive hover:bg-destructive/5 transition-colors"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
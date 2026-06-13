import { useEffect, useRef, useState } from "react";

const KebabIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18">
    <circle cx="12" cy="5" r="1.6" fill="currentColor" />
    <circle cx="12" cy="12" r="1.6" fill="currentColor" />
    <circle cx="12" cy="19" r="1.6" fill="currentColor" />
  </svg>
);

const EditIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>
  </svg>
);

export default function EntryMenu({ onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

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
    <>
      {/* dim backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-20"
          style={{ background: "rgba(20,18,16,0.08)" }}
          onMouseDown={() => setOpen(false)}
        />
      )}
      <div ref={menuRef} className="relative flex-shrink-0 z-30">
        <button
          onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
          className="w-[22px] h-[22px] flex items-center justify-center"
          style={{ color: "#8c867c" }}
          aria-label="Entry options"
        >
          <KebabIcon />
        </button>

        {open && (
          <div
            className="absolute right-0 z-30 overflow-hidden"
            style={{
              top: "28px",
              width: "150px",
              background: "#fff",
              borderRadius: "14px",
              boxShadow: "0 12px 34px rgba(0,0,0,0.18)",
              border: "1px solid #efeeeb",
            }}
          >
            <button
              onClick={(e) => { e.stopPropagation(); setOpen(false); onEdit(); }}
              className="w-full text-left flex items-center gap-[10px] px-[14px] py-3 text-[13px] font-body font-medium transition-colors hover:bg-muted"
              style={{ color: "#211f1b" }}
            >
              <span style={{ color: "#6e685f" }}><EditIcon /></span>
              Edit
            </button>
            <div className="h-px" style={{ background: "#efeeeb" }} />
            <button
              onClick={(e) => { e.stopPropagation(); setOpen(false); onDelete(); }}
              className="w-full text-left flex items-center gap-[10px] px-[14px] py-3 text-[13px] font-body font-medium transition-colors hover:bg-red-50"
              style={{ color: "#b1493f" }}
            >
              <span style={{ color: "#b1493f" }}><TrashIcon /></span>
              Delete
            </button>
          </div>
        )}
      </div>
    </>
  );
}
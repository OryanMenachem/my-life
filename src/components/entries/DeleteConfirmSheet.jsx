export default function DeleteConfirmSheet({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end" onClick={onCancel}>
      <div
        className="bg-background rounded-t-2xl shadow-2xl pb-safe"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grip */}
        <div className="flex justify-center pt-3 pb-4 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/25" />
        </div>

        <div className="px-5 pb-6">
          <h2 className="text-base font-body font-semibold text-foreground mb-1">
            Delete this entry?
          </h2>
          <p className="text-sm font-body text-muted-foreground mb-6">
            This will permanently remove the entry.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={onConfirm}
              className="w-full h-11 rounded-full bg-destructive text-destructive-foreground text-sm font-body font-semibold active:scale-95 transition-all"
            >
              Delete entry
            </button>
            <button
              onClick={onCancel}
              className="w-full h-11 rounded-full bg-muted text-foreground text-sm font-body font-semibold active:scale-95 transition-all"
            >
              Keep
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";

const DURATION = 5000;

export default function UndoSnackbar({ onUndo, onExpire }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setTimeout(() => {
      setVisible(false);
      onExpire();
    }, DURATION);
    return () => clearTimeout(id);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[70] flex items-center gap-3 bg-foreground text-background text-sm font-body font-medium px-4 py-3 rounded-full shadow-lg">
      <span>Entry deleted</span>
      <button
        onClick={() => { setVisible(false); onUndo(); }}
        className="text-primary font-semibold underline-offset-2 hover:underline"
      >
        Undo
      </button>
    </div>
  );
}
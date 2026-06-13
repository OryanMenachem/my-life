import { BookOpen } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-5">
        <BookOpen className="w-7 h-7 text-accent-foreground/60" />
      </div>
      <p className="text-muted-foreground text-base font-medium">
        No entries yet.
      </p>
    </div>
  );
}
import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

/**
 * Triggers a callback when the user scrolls near the bottom of the list.
 * Uses IntersectionObserver with 300px rootMargin for early triggering.
 */
export default function InfiniteScrollSentinel({ onIntersect, loading, hasMore }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loading) {
          onIntersect();
        }
      },
      { rootMargin: "300px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [onIntersect, loading, hasMore]);

  if (!hasMore) return null;

  return (
    <div
      ref={ref}
      className="flex items-center justify-center py-6"
      aria-hidden="true"
    >
      {loading && <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />}
    </div>
  );
}
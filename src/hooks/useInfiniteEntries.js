import { useState, useCallback, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";

const PAGE_SIZE = 25;

/**
 * Cursor-based infinite pagination for entries.
 * Fetches newest-first using created_date as cursor.
 */
export function useInfiniteEntries() {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const cursorRef = useRef(null);
  const hasFetchedOnce = useRef(false);

  const fetchFirstPage = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await base44.entities.Entry.filter({}, "-created_date", PAGE_SIZE);
      setEntries(result);
      setHasMore(result.length === PAGE_SIZE);
      cursorRef.current = result.length > 0 ? result[result.length - 1].created_date : null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchNextPage = useCallback(async () => {
    if (!cursorRef.current || !hasMore || isFetchingMore) return;
    setIsFetchingMore(true);
    try {
      const result = await base44.entities.Entry.filter(
        { created_date: { $lt: cursorRef.current } },
        "-created_date",
        PAGE_SIZE
      );
      setEntries((prev) => [...prev, ...result]);
      setHasMore(result.length === PAGE_SIZE);
      if (result.length > 0) {
        cursorRef.current = result[result.length - 1].created_date;
      }
    } finally {
      setIsFetchingMore(false);
    }
  }, [hasMore, isFetchingMore]);

  useEffect(() => {
    if (!hasFetchedOnce.current) {
      hasFetchedOnce.current = true;
      fetchFirstPage();
    }
  }, [fetchFirstPage]);

  // ── Optimistic update helpers ──
  const prependEntry = useCallback((entry) => {
    setEntries((prev) => [entry, ...prev]);
  }, []);

  const updateEntry = useCallback((updatedEntry) => {
    setEntries((prev) => prev.map((e) => (e.id === updatedEntry.id ? updatedEntry : e)));
  }, []);

  const removeEntry = useCallback((entryId) => {
    setEntries((prev) => prev.filter((e) => e.id !== entryId));
  }, []);

  const restoreEntry = useCallback((entry) => {
    setEntries((prev) => {
      const sorted = [entry, ...prev].sort(
        (a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime()
      );
      return sorted;
    });
  }, []);

  return {
    entries,
    isLoading,
    isFetchingMore,
    hasMore,
    fetchNextPage,
    prependEntry,
    updateEntry,
    removeEntry,
    restoreEntry,
  };
}
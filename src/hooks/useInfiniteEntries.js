import { useMemo, useCallback } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const PAGE_SIZE = 10;
const QUERY_KEY = ["entries-feed"];

/**
 * Cursor-based infinite pagination for entries using react-query.
 * Sorted by entry_date (newest first), matching the display grouping.
 * Cached across navigation — switching tabs doesn't re-fetch.
 */
export function useInfiniteEntries() {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: QUERY_KEY,
    queryFn: async ({ pageParam }) => {
      if (pageParam) {
        return base44.entities.Entry.filter(
          { entry_date: { $lt: pageParam } },
          "-entry_date",
          PAGE_SIZE
        );
      }
      return base44.entities.Entry.filter({}, "-entry_date", PAGE_SIZE);
    },
    getNextPageParam: (lastPage) =>
      lastPage.length === PAGE_SIZE
        ? lastPage[lastPage.length - 1].entry_date
        : undefined,
    initialPageParam: null,
  });

  const entries = useMemo(
    () => (data?.pages ?? []).flat(),
    [data?.pages]
  );

  // ── Optimistic update helpers via react-query cache ──

  const prependEntry = useCallback((entry) => {
    queryClient.setQueryData(QUERY_KEY, (old) => {
      if (!old) return { pages: [[entry]], pageParams: [null] };
      const pages = old.pages.map((page, i) => (i === 0 ? [entry, ...page] : page));
      return { ...old, pages };
    });
  }, [queryClient]);

  const updateEntry = useCallback((updatedEntry) => {
    queryClient.setQueryData(QUERY_KEY, (old) => {
      if (!old) return old;
      const pages = old.pages.map((page) =>
        page.map((e) => (e.id === updatedEntry.id ? updatedEntry : e))
      );
      return { ...old, pages };
    });
  }, [queryClient]);

  const removeEntry = useCallback((entryId) => {
    queryClient.setQueryData(QUERY_KEY, (old) => {
      if (!old) return old;
      const pages = old.pages.map((page) =>
        page.filter((e) => e.id !== entryId)
      );
      return { ...old, pages };
    });
  }, [queryClient]);

  const restoreEntry = useCallback((entry) => {
    queryClient.setQueryData(QUERY_KEY, (old) => {
      if (!old) return { pages: [[entry]], pageParams: [null] };
      const all = old.pages.flat();
      const sorted = [entry, ...all].sort(
        (a, b) =>
          new Date(b.entry_date || b.created_date).getTime() -
          new Date(a.entry_date || a.created_date).getTime()
      );
      const pages = [];
      for (let i = 0; i < sorted.length; i += PAGE_SIZE) {
        pages.push(sorted.slice(i, i + PAGE_SIZE));
      }
      const pageParams = pages.map((_, i) =>
        i === 0
          ? null
          : pages[i - 1]?.[PAGE_SIZE - 1]?.entry_date || pages[i - 1]?.[PAGE_SIZE - 1]?.created_date
      );
      return { pages, pageParams };
    });
  }, [queryClient]);

  return {
    entries,
    isLoading,
    isFetchingMore: isFetchingNextPage,
    hasMore: hasNextPage ?? false,
    fetchNextPage,
    prependEntry,
    updateEntry,
    removeEntry,
    restoreEntry,
  };
}
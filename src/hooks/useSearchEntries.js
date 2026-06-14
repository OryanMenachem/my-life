import { useMemo, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  startOfDay, endOfDay, startOfWeek, endOfWeek,
  startOfMonth, endOfMonth, startOfYear, endOfYear,
} from "date-fns";

const PAGE_SIZE = 25;

function getTimeRange(filter, custom) {
  const now = new Date();
  switch (filter) {
    case "today":    return [startOfDay(now), endOfDay(now)];
    case "week":     return [startOfWeek(now, { weekStartsOn: 1 }), endOfWeek(now, { weekStartsOn: 1 })];
    case "month":    return [startOfMonth(now), endOfMonth(now)];
    case "year":     return [startOfYear(now), endOfYear(now)];
    case "custom":   return custom?.start && custom?.end ? [custom.start, custom.end] : null;
    default:         return null;
  }
}

/**
 * Filter entries in memory by content type, tags, and text query.
 * Runs over the full dataset fetched server-side with time filtering.
 */
function filterEntries({ entries, query, selectedTagIds, contentTypes, timeFilter, customRange, tagById }) {
  let result = entries;

  // Time filter (already applied server-side for efficiency, double-check here)
  const range = getTimeRange(timeFilter, customRange);
  if (range) {
    const [start, end] = range;
    result = result.filter((e) => {
      const d = new Date(e.entry_date || e.created_date);
      return d >= start && d <= end;
    });
  }

  // Content type filter: OR between selected types
  if (contentTypes.length > 0) {
    result = result.filter((e) => {
      const media = e.media || [];
      return contentTypes.some((ct) => media.some((m) => m.type === ct));
    });
  }

  // Tag filter: OR within same category, AND across categories
  if (selectedTagIds.length > 0) {
    const catGroups = {};
    for (const tid of selectedTagIds) {
      const tag = tagById[tid];
      const cat = tag?.category_key ?? "__unknown__";
      if (!catGroups[cat]) catGroups[cat] = [];
      catGroups[cat].push(tid);
    }
    const catEntries = Object.values(catGroups);
    result = result.filter((e) => {
      const entryTags = new Set(e.tag_ids || []);
      return catEntries.every((group) => group.some((tid) => entryTags.has(tid)));
    });
  }

  // Text filter
  const q = query.trim().toLowerCase();
  if (q) {
    result = result.filter((e) => (e.content || "").toLowerCase().includes(q));
  }

  return result;
}

/**
 * Search-specific hook that fetches ALL entries for the current time range,
 * applies client-side filters (content type, tags, text), and virtual-paginates
 * the filtered results.
 */
export function useFilteredSearchEntries({
  query = "",
  selectedTagIds = [],
  contentTypes = [],
  timeFilter = "all",
  customRange = null,
  tagById = {},
}) {
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);

  // Fetch all entries for the time range (server-side time filter)
  const { data: allEntries = [], isLoading, refetch } = useQuery({
    queryKey: ["search-entries", timeFilter, customRange?.start?.toISOString?.(), customRange?.end?.toISOString?.()],
    queryFn: async () => {
      const range = getTimeRange(timeFilter, customRange);
      if (range) {
        const [start, end] = range;
        return base44.entities.Entry.filter(
          { entry_date: { $gte: start.toISOString(), $lte: end.toISOString() } },
          "-created_date",
          5000
        );
      }
      return base44.entities.Entry.filter({}, "-created_date", 5000);
    },
    staleTime: 30_000,
  });

  // Reset display count when filters change
  const filterKey = useMemo(
    () => JSON.stringify([query, selectedTagIds, contentTypes, timeFilter, customRange]),
    [query, selectedTagIds, contentTypes, timeFilter, customRange]
  );

  // Apply in-memory filters
  const filtered = useMemo(() => {
    return filterEntries({
      entries: allEntries,
      query,
      selectedTagIds,
      contentTypes,
      timeFilter,
      customRange,
      tagById,
    });
  }, [allEntries, query, selectedTagIds, contentTypes, timeFilter, customRange, tagById]);

  // Reset display count when filter changes
  useMemo(() => { setDisplayCount(PAGE_SIZE); }, [filterKey]);

  // Virtual pagination
  const displayEntries = filtered.slice(0, displayCount);
  const hasMore = displayCount < filtered.length;

  const fetchNextPage = useCallback(() => {
    setDisplayCount((prev) => prev + PAGE_SIZE);
  }, []);

  return {
    entries: displayEntries,
    allEntries,
    filtered,
    isLoading,
    isFetchingMore: false,
    hasMore,
    fetchNextPage,
    refetch,
  };
}

/**
 * Compute top tags and time-range counts from the full entry set.
 */
export function useSearchStats({ allEntries = [] }) {
  const topTags = useMemo(() => {
    const counts = {};
    for (const e of allEntries) {
      for (const id of (e.tag_ids || [])) {
        counts[id] = (counts[id] || 0) + 1;
      }
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id]) => id);
  }, [allEntries]);

  const entryCounts = useMemo(() => {
    const now = new Date();
    const ranges = {
      today: [startOfDay(now), endOfDay(now)],
      week: [startOfWeek(now, { weekStartsOn: 1 }), endOfWeek(now, { weekStartsOn: 1 })],
      month: [startOfMonth(now), endOfMonth(now)],
      year: [startOfYear(now), endOfYear(now)],
    };
    const counts = { all: allEntries.length };
    for (const [key, [start, end]] of Object.entries(ranges)) {
      counts[key] = allEntries.filter((e) => {
        const d = new Date(e.entry_date || e.created_date);
        return d >= start && d <= end;
      }).length;
    }
    return counts;
  }, [allEntries]);

  return { topTags, entryCounts };
}
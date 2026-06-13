import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  startOfDay, endOfDay, startOfWeek, endOfWeek,
  startOfMonth, endOfMonth, startOfYear, endOfYear,
} from "date-fns";

export function useAllEntries() {
  return useQuery({
    queryKey: ["entries-search"],
    queryFn: () => base44.entities.Entry.list("-created_date", 500),
    staleTime: 30_000,
  });
}

function getTimeRange(filter, custom) {
  const now = new Date();
  switch (filter) {
    case "today":    return [startOfDay(now), endOfDay(now)];
    case "week":     return [startOfWeek(now, { weekStartsOn: 1 }), endOfWeek(now, { weekStartsOn: 1 })];
    case "month":   return [startOfMonth(now), endOfMonth(now)];
    case "year":     return [startOfYear(now), endOfYear(now)];
    case "custom":   return custom?.start && custom?.end ? [custom.start, custom.end] : null;
    default:         return null;
  }
}

export function useFilteredEntries({ entries = [], query = "", tagIds = [], timeFilter = "all", customRange = null }) {
  return useMemo(() => {
    let result = entries;

    // Time filter
    const range = getTimeRange(timeFilter, customRange);
    if (range) {
      const [start, end] = range;
      result = result.filter((e) => {
        const d = new Date(e.entry_date || e.created_date);
        return d >= start && d <= end;
      });
    }

    // Tag filter: OR within same category, AND across categories
    if (tagIds.length > 0) {
      // Group selected tags by category_key
      result = result.filter((e) => {
        // We'll check per-category below
        return true;
      });
    }

    // Text filter
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter((e) =>
        (e.content || "").toLowerCase().includes(q)
      );
    }

    return result;
  }, [entries, query, tagIds, timeFilter, customRange]);
}

export function useFilteredEntriesWithTags({
  entries = [],
  query = "",
  selectedTagIds = [],
  contentTypes = [],
  timeFilter = "all",
  customRange = null,
  tagById = {},
}) {
  return useMemo(() => {
    let result = entries;

    // Time filter
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
      // Group selected tag IDs by category
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
  }, [entries, query, selectedTagIds, contentTypes, timeFilter, customRange, tagById]);
}
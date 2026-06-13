import { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  format, subDays, startOfMonth, startOfYear, differenceInCalendarDays,
} from "date-fns";
import { useTagCatalog } from "@/hooks/useTagCatalog";
import PeriodSwitcher from "@/components/analysis/PeriodSwitcher";
import SummaryCard from "@/components/analysis/SummaryCard";
import MoodChartCard from "@/components/analysis/MoodChartCard";
import TopTagsCard from "@/components/analysis/TopTagsCard";
import CategoryMixCard from "@/components/analysis/CategoryMixCard";
import OnThisDayCard from "@/components/analysis/OnThisDayCard";
import ActiveHoursCard from "@/components/analysis/ActiveHoursCard";
import ConsistencyCard from "@/components/analysis/ConsistencyCard";
import EntryDetail from "@/components/entries/EntryDetail";

// ─── Mood keyword → score map ───
const MOOD_KEYWORDS = {
  happy: 3, excited: 3, grateful: 3, wonderful: 3, amazing: 3, joyful: 3,
  energetic: 3, fantastic: 3, blessed: 3, thrilled: 3, loved: 3, ecstatic: 3,
  good: 2, positive: 2, optimistic: 2, hopeful: 2, motivated: 2,
  inspired: 2, proud: 2, confident: 2, cheerful: 2, playful: 2,
  calm: 1, peaceful: 1, content: 1, relaxed: 1, balanced: 1,
  comfortable: 1, satisfied: 1, curious: 1, thoughtful: 1, reflective: 1,
  neutral: 0, okay: 0, fine: 0, meh: 0, indifferent: 0,
  tired: -1, bored: -1, restless: -1, lazy: -1, distracted: -1, nostalgic: -1,
  stressed: -2, anxious: -2, worried: -2, overwhelmed: -2,
  nervous: -2, confused: -2, insecure: -2, guilty: -2,
  sad: -3, angry: -3, frustrated: -3, lonely: -3, disappointed: -3,
  upset: -3, depressed: -3, hopeless: -3, heartbroken: -3, scared: -3,
};

const getMoodScore = (tagName) => {
  const name = (tagName || "").toLowerCase();
  for (const [kw, score] of Object.entries(MOOD_KEYWORDS)) {
    if (name.includes(kw)) return score;
  }
  return null;
};

// ─── Helpers ───
const wordCount = (text) => (text || "").trim().split(/\s+/).filter(Boolean).length;

const getPeriodRange = (period) => {
  const now = new Date();
  switch (period) {
    case "week": return { start: subDays(now, 7), end: now };
    case "month": return { start: startOfMonth(now), end: now };
    case "year": return { start: startOfYear(now), end: now };
    default: return { start: null, end: now };
  }
};

const filterByRange = (entries, range) => {
  if (!range.start) return entries;
  return entries.filter((e) => new Date(e.entry_date) >= range.start);
};

const distinctDays = (entries) => {
  const s = new Set();
  entries.forEach((e) => s.add(format(new Date(e.entry_date), "yyyy-MM-dd")));
  return s.size;
};

const countTagUsage = (entries) => {
  const counts = {};
  entries.forEach((e) => {
    (e.tag_ids || []).forEach((id) => {
      counts[id] = (counts[id] || 0) + 1;
    });
  });
  return counts;
};

const getMostCommon = (counts) => {
  let bestId = null, bestCount = 0;
  Object.entries(counts).forEach(([id, c]) => {
    if (c > bestCount) { bestId = id; bestCount = c; }
  });
  return bestId;
};

// ─── Streaks ───
const computeStreaks = (entries) => {
  const daySet = new Set();
  entries.forEach((e) => daySet.add(format(new Date(e.entry_date), "yyyy-MM-dd")));
  const sorted = [...daySet].sort();

  // Best streak
  let best = 0, cur = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (differenceInCalendarDays(new Date(sorted[i]), new Date(sorted[i - 1])) === 1) {
      cur++;
    } else {
      best = Math.max(best, cur);
      cur = 1;
    }
  }
  best = Math.max(best, cur);

  // Current streak (consecutive days ending today)
  const today = format(new Date(), "yyyy-MM-dd");
  let currentStreak = 0;
  const check = new Date();
  while (true) {
    const d = format(check, "yyyy-MM-dd");
    if (daySet.has(d)) {
      currentStreak++;
      check.setDate(check.getDate() - 1);
    } else break;
  }

  // Most active weekday
  const wd = {};
  entries.forEach((e) => {
    const day = format(new Date(e.entry_date), "EEEE");
    wd[day] = (wd[day] || 0) + 1;
  });
  let topDay = "", topCount = 0;
  Object.entries(wd).forEach(([k, v]) => {
    if (v > topCount) { topDay = k; topCount = v; }
  });

  return { currentStreak, bestStreak: best, mostActiveWeekday: topDay };
};

// ─── Hour distribution ───
const computeHours = (entries) => {
  const h = Array(24).fill(0);
  entries.forEach((e) => {
    const hr = new Date(e.entry_date).getHours();
    h[hr] = (h[hr] || 0) + 1;
  });
  return h;
};

// ─── Mood over time ───
const computeMoodData = (entries, tags, period) => {
  const moodTags = tags.filter((t) => t.category_key === "mood");
  if (!moodTags.length) return { data: [], empty: true };

  const moodTagIds = new Set(moodTags.map((t) => t.id));
  const moodScores = {};
  moodTags.forEach((t) => { moodScores[t.id] = getMoodScore(t.name_en); });

  const buckets = {};
  entries.forEach((e) => {
    let key;
    const d = new Date(e.entry_date);
    if (period === "week") key = format(d, "EEE d");
    else if (period === "month") key = `W${Math.ceil(d.getDate() / 7)}`;
    else key = format(d, "MMM");

    if (!buckets[key]) buckets[key] = [];
    const scores = (e.tag_ids || [])
      .filter((id) => moodTagIds.has(id) && moodScores[id] != null)
      .map((id) => moodScores[id]);
    if (scores.length > 0) {
      buckets[key].push(scores.reduce((a, b) => a + b, 0) / scores.length);
    }
  });

  const data = Object.entries(buckets)
    .map(([label, scores]) => ({
      label,
      score: scores.length > 0
        ? +(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)
        : null,
    }))
    .filter((d) => d.score != null);

  return { data, empty: data.length === 0 };
};

// ─── Main Page ───
export default function Analysis() {
  const [period, setPeriod] = useState("month");
  const [detailEntry, setDetailEntry] = useState(null);

  const { tags, tagById, categoryByKey } = useTagCatalog();

  // Fetch all entries (RLS ensures only current user's entries)
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["analysis-entries"],
    queryFn: () => base44.entities.Entry.filter({}, "-entry_date", 3000),
    staleTime: 60_000,
  });

  // Filter by period
  const range = useMemo(() => getPeriodRange(period), [period]);
  const periodEntries = useMemo(() => filterByRange(entries, range), [entries, range]);

  // ─── Compute all metrics ───
  const metrics = useMemo(() => {
    if (!periodEntries.length) return null;

    const tagCounts = countTagUsage(periodEntries);
    const totalEntries = periodEntries.length;
    const activeDays = distinctDays(periodEntries);
    const totalWords = periodEntries.reduce((s, e) => s + wordCount(e.content), 0);
    const avgWords = Math.round(totalWords / totalEntries);

    // Most common mood tag
    const moodTags = tags.filter((t) => t.category_key === "mood");
    const moodTagIds = new Set(moodTags.map((t) => t.id));
    const moodCounts = {};
    Object.entries(tagCounts).forEach(([id, c]) => {
      if (moodTagIds.has(id)) moodCounts[id] = c;
    });
    const topMoodId = getMostCommon(moodCounts);
    const topMoodName = topMoodId ? (tagById[topMoodId]?.name_en || "unknown") : null;

    // Most common tag overall
    const topTagId = getMostCommon(tagCounts);
    const topTagName = topTagId ? (tagById[topTagId]?.name_en || "unknown") : null;

    // Sentence
    const rangeLabel = period === "week" ? "this week"
      : period === "month" ? format(new Date(), "MMMM")
      : period === "year" ? format(new Date(), "yyyy")
      : "your journal";

    let sentence = `In ${rangeLabel} you wrote ${totalEntries} ${totalEntries === 1 ? "entry" : "entries"} across ${activeDays} ${activeDays === 1 ? "day" : "days"}.`;
    if (topMoodName) {
      sentence += ` Your most common feeling was ${topMoodName}.`;
    }
    if (topTagName && topTagName !== topMoodName) {
      sentence += ` ${topTagName} filled most of your notes.`;
    } else if (topTagName) {
      sentence += ` It showed up most across your notes.`;
    }

    // Top tags list
    const topTags = Object.entries(tagCounts)
      .map(([id, count]) => {
        const tag = tagById[id];
        return {
          tagId: id,
          name: tag?.name_en || "unknown",
          icon: tag?.icon || null,
          categoryKey: tag?.category_key || "general",
          count,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Category mix
    const catCounts = {};
    Object.entries(tagCounts).forEach(([id, count]) => {
      const tag = tagById[id];
      const cat = tag?.category_key || "general";
      catCounts[cat] = (catCounts[cat] || 0) + count;
    });
    const categoryData = Object.entries(catCounts)
      .map(([key, value]) => ({
        key,
        name: (categoryByKey[key]?.name_en || key),
        value,
      }))
      .sort((a, b) => b.value - a.value);

    // Mood chart data
    const moodData = computeMoodData(periodEntries, tags, period);

    // Hours
    const hours = computeHours(periodEntries);

    // Streaks (from all entries, not just period)
    const streakData = computeStreaks(entries);

    // On this day entries (same month+day, previous years)
    const today = new Date();
    const thisMonth = today.getMonth();
    const thisDay = today.getDate();
    const onThisDay = entries.filter((e) => {
      const d = new Date(e.entry_date);
      return d.getMonth() === thisMonth && d.getDate() === thisDay && d.getFullYear() !== today.getFullYear();
    }).sort((a, b) => new Date(b.entry_date) - new Date(a.entry_date)).slice(0, 5);

    return {
      sentence,
      totalEntries,
      activeDays,
      avgWords,
      topTags,
      categoryData,
      moodData,
      hours,
      streakData,
      onThisDay,
      isEmpty: false,
    };
  }, [periodEntries, entries, tags, tagById, categoryByKey, period]);

  const isEmpty = !isLoading && (!entries.length || !periodEntries.length);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-3 text-center">
          <h1 className="font-heading text-[21px] font-semibold tracking-[-0.5px] text-foreground uppercase">
            Analysis
          </h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4 pb-24">
        {/* Period switcher */}
        <div className="mb-5">
          <PeriodSwitcher period={period} onChange={setPeriod} />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-400 rounded-full animate-spin" />
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-4xl mb-4">📝</span>
            <p className="font-heading text-[15px] text-foreground font-medium mb-1">
              Not enough entries yet
            </p>
            <p className="text-[13px] font-body text-muted-foreground max-w-[260px]">
              Keep journaling and your insights will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Card 1 — Period Summary */}
            <SummaryCard
              sentence={metrics.sentence}
              totalEntries={metrics.totalEntries}
              activeDays={metrics.activeDays}
              avgWords={metrics.avgWords}
            />

            {/* Card 2 — Mood over time */}
            <MoodChartCard
              data={metrics.moodData.data}
              empty={metrics.moodData.empty}
            />

            {/* Card 3 — Top tags */}
            <TopTagsCard items={metrics.topTags} />

            {/* Card 4 — Category mix */}
            <CategoryMixCard
              data={metrics.categoryData}
              empty={metrics.categoryData.length === 0}
            />

            {/* Card 5 — On this day */}
            <OnThisDayCard
              entries={metrics.onThisDay}
              onEntryClick={setDetailEntry}
            />

            {/* Card 6 — Active hours */}
            <ActiveHoursCard
              hours={metrics.hours}
              empty={metrics.hours.every((h) => h === 0)}
            />

            {/* Card 7 — Consistency */}
            <ConsistencyCard
              streak={metrics.streakData.currentStreak}
              bestStreak={metrics.streakData.bestStreak}
              mostActiveWeekday={metrics.streakData.mostActiveWeekday}
              empty={false}
            />
          </div>
        )}
      </main>

      {/* Entry detail modal */}
      {detailEntry && (
        <EntryDetail
          entry={detailEntry}
          onClose={() => setDetailEntry(null)}
          tagById={tagById}
          categoryByKey={categoryByKey}
        />
      )}
    </div>
  );
}
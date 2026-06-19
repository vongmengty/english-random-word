import type { Difficulty, StudyStats } from "./types";

export interface StatCardVM {
  label: string;
  big: string;
  unit: string;
  accent: string;
  soft: string;
}

export interface BarVM {
  count: string;
  label: string;
  height: number;
  color: string;
  labelColor: string;
  isMax: boolean;
}

export interface LevelVM {
  name: string;
  count: number;
  color: string;
  pct: number;
}

export interface RecentVM {
  word: string;
  when: string;
  color: string;
}

const ACCENT = "#F0611C";
const MUTED_BAR = "#F1EBE3";
const DOW = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];
const TIER_COLOR: Record<Difficulty, string> = {
  easy: "#0F9D6B",
  medium: "#F0611C",
  hard: "#7A4FF0"
};

/** Parse a `YYYY-MM-DD` string as a local date (avoids UTC shift). */
function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function statCards(stats: StudyStats): StatCardVM[] {
  const mins = stats.minutesStudied;
  let timeBig: string;
  let timeUnit: string;
  if (mins < 60) {
    timeBig = String(mins);
    timeUnit = "min";
  } else {
    timeBig = (mins / 60).toFixed(mins % 60 === 0 ? 0 : 1);
    timeUnit = "hrs";
  }

  return [
    { label: "Words studied", big: String(stats.uniqueWords), unit: "unique", accent: "#F0611C", soft: "#FFE3CE" },
    { label: "Time studying", big: timeBig, unit: timeUnit, accent: "#7A4FF0", soft: "#E6DAFF" },
    {
      label: "Current streak",
      big: String(stats.streakDays),
      unit: stats.streakDays === 1 ? "day" : "days",
      accent: "#0F9D6B",
      soft: "#C9F0DE"
    },
    { label: "Saved words", big: String(stats.savedCount), unit: "favorites", accent: "#1F7BE8", soft: "#D2E5FF" }
  ];
}

export function bars(stats: StudyStats): BarVM[] {
  const max = Math.max(1, ...stats.dailyCounts.map((d) => d.count));
  return stats.dailyCounts.map((d) => {
    const isMax = d.count === max && d.count > 0;
    return {
      count: d.count === 0 ? "" : String(d.count),
      label: DOW[parseLocalDate(d.date).getDay()],
      height: d.count === 0 ? 4 : Math.round(14 + (d.count / max) * 96),
      color: d.count === 0 ? MUTED_BAR : ACCENT,
      labelColor: isMax ? ACCENT : "rgba(36,29,24,.35)",
      isMax
    };
  });
}

export function levels(stats: StudyStats): LevelVM[] {
  const { easy, medium, hard } = stats.byDifficulty;
  const max = Math.max(1, easy, medium, hard);
  const pct = (n: number) => Math.round((n / max) * 100);
  return [
    { name: "Everyday", count: easy, color: TIER_COLOR.easy, pct: pct(easy) },
    { name: "Uncommon", count: medium, color: TIER_COLOR.medium, pct: pct(medium) },
    { name: "Rare gems", count: hard, color: TIER_COLOR.hard, pct: pct(hard) }
  ];
}

export function recents(stats: StudyStats, now = Date.now()): RecentVM[] {
  return stats.recents.map((r) => ({
    word: r.word,
    when: relativeTime(r.ts, now),
    color: TIER_COLOR[r.difficulty] ?? ACCENT
  }));
}

export function rangeLabel(stats: StudyStats): string {
  if (!stats.hasData || !stats.since) return "Track every word you explore";
  const first = new Date(stats.since);
  return `${stats.uniqueWords} unique words • since ${MONTHS[first.getMonth()]} ${first.getDate()}`;
}

export function chartNote(stats: StudyStats): string {
  return `${stats.totalLookups} look-ups total`;
}

export function relativeTime(ts: number, now = Date.now()): string {
  const s = Math.floor((now - ts) / 1000);
  if (s < 45) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  const d = Math.floor(s / 86400);
  if (d === 1) return "yesterday";
  if (d < 7) return `${d}d ago`;
  return `${Math.floor(d / 7)}w ago`;
}

import { Difficulty } from "../words/word.types";

export interface DailyCount {
  /** Local date as `YYYY-MM-DD`. */
  date: string;
  count: number;
}

export interface RecentStudy {
  word: string;
  ts: number;
  difficulty: Difficulty;
}

/**
 * Aggregated study statistics. Raw aggregation (counts, streak, time estimate)
 * happens here where the events live; the frontend turns these numbers into
 * cards, bar heights, colours and relative-time labels.
 */
export interface StudyStats {
  hasData: boolean;
  uniqueWords: number;
  totalLookups: number;
  minutesStudied: number;
  streakDays: number;
  savedCount: number;
  /** ISO timestamp of the first recorded look-up, or null when there's none. */
  since: string | null;
  byDifficulty: Record<Difficulty, number>;
  /** Exactly 14 entries, oldest → newest. */
  dailyCounts: DailyCount[];
  /** Unique words, most recently studied first (max 8). */
  recents: RecentStudy[];
}

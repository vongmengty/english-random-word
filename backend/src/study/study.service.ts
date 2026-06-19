import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import { Difficulty } from "../words/word.types";
import { DailyCount, RecentStudy, StudyStats } from "./study.types";

interface EventRow {
  word: string;
  difficulty: Difficulty;
  ts: number;
}

const DEDUPE_MS = 3000;
const GAP_MS = 5 * 60 * 1000;
const DWELL_MS = 30 * 1000;
const TIERS: Difficulty[] = ["easy", "medium", "hard"];

@Injectable()
export class StudyService {
  constructor(private readonly database: DatabaseService) {}

  private get db() {
    return this.database.db;
  }

  /** Record that a word was looked up. Difficulty is resolved from the
   *  dictionary; rapid duplicate logs of the same word are ignored. */
  log(word: string): void {
    const trimmed = word.trim();
    if (!trimmed) return;

    const dictWord = this.db
      .prepare("SELECT word, difficulty FROM words WHERE word = ? COLLATE NOCASE")
      .get(trimmed) as { word: string; difficulty: Difficulty } | undefined;

    const canonical = dictWord?.word ?? trimmed;
    const difficulty = dictWord?.difficulty ?? "medium";
    const now = Date.now();

    const last = this.db
      .prepare("SELECT word, ts FROM study_events ORDER BY ts DESC LIMIT 1")
      .get() as { word: string; ts: number } | undefined;
    if (last && last.word.toLowerCase() === canonical.toLowerCase() && now - last.ts < DEDUPE_MS) {
      return;
    }

    this.db
      .prepare("INSERT INTO study_events (word, difficulty, ts) VALUES (?, ?, ?)")
      .run(canonical, difficulty, now);
  }

  getStats(): StudyStats {
    const events = this.db
      .prepare("SELECT word, difficulty, ts FROM study_events ORDER BY ts ASC")
      .all() as EventRow[];
    const savedCount = (
      this.db.prepare("SELECT COUNT(*) AS n FROM favorites").get() as { n: number }
    ).n;

    const empty: StudyStats = {
      hasData: false,
      uniqueWords: 0,
      totalLookups: 0,
      minutesStudied: 0,
      streakDays: 0,
      savedCount,
      since: null,
      byDifficulty: { easy: 0, medium: 0, hard: 0 },
      dailyCounts: this.last14Days(new Map()),
      recents: []
    };
    if (!events.length) return empty;

    // Latest tier seen per word → unique-word set.
    const tierByWord = new Map<string, Difficulty>();
    for (const e of events) tierByWord.set(e.word, e.difficulty);

    return {
      hasData: true,
      uniqueWords: tierByWord.size,
      totalLookups: events.length,
      minutesStudied: this.estimateMinutes(events),
      streakDays: this.computeStreak(events),
      savedCount,
      since: new Date(events[0].ts).toISOString(),
      byDifficulty: this.byDifficulty(tierByWord),
      dailyCounts: this.last14Days(this.dailyTotals(events)),
      recents: this.recents(events)
    };
  }

  private estimateMinutes(events: EventRow[]): number {
    let ms = DWELL_MS;
    for (let i = 1; i < events.length; i++) {
      const gap = events[i].ts - events[i - 1].ts;
      ms += gap <= GAP_MS ? gap : DWELL_MS;
    }
    return Math.max(1, Math.round(ms / 60000));
  }

  private computeStreak(events: EventRow[]): number {
    const days = new Set(events.map((e) => isoDay(new Date(e.ts))));
    const probe = new Date();
    // A streak may legitimately end yesterday if today has no look-ups yet.
    if (!days.has(isoDay(probe))) probe.setDate(probe.getDate() - 1);
    let streak = 0;
    while (days.has(isoDay(probe))) {
      streak++;
      probe.setDate(probe.getDate() - 1);
    }
    return streak;
  }

  private byDifficulty(tierByWord: Map<string, Difficulty>): Record<Difficulty, number> {
    const counts: Record<Difficulty, number> = { easy: 0, medium: 0, hard: 0 };
    for (const tier of tierByWord.values()) {
      if (TIERS.includes(tier)) counts[tier]++;
    }
    return counts;
  }

  private dailyTotals(events: EventRow[]): Map<string, number> {
    const counts = new Map<string, number>();
    for (const e of events) {
      const key = isoDay(new Date(e.ts));
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return counts;
  }

  private last14Days(counts: Map<string, number>): DailyCount[] {
    const out: DailyCount[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const date = isoDay(d);
      out.push({ date, count: counts.get(date) ?? 0 });
    }
    return out;
  }

  private recents(events: EventRow[]): RecentStudy[] {
    const seen = new Set<string>();
    const out: RecentStudy[] = [];
    for (let i = events.length - 1; i >= 0 && out.length < 8; i--) {
      const e = events[i];
      if (seen.has(e.word)) continue;
      seen.add(e.word);
      out.push({ word: e.word, ts: e.ts, difficulty: e.difficulty });
    }
    return out;
  }
}

function isoDay(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

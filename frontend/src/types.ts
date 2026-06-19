export type Difficulty = "easy" | "medium" | "hard";
export type LengthBucket = "short" | "medium" | "long";
export type DifficultyFilter = "any" | Difficulty;
export type LengthFilter = "any" | LengthBucket;

export interface WordDefinition {
  definition: string;
  example: string | null;
}

export interface WordMeaning {
  partOfSpeech: string;
  definitions: WordDefinition[];
}

export interface WordEntry {
  word: string;
  phonetic: string;
  audio: string | null;
  difficulty: Difficulty;
  rarityLabel: string;
  rarityScore: number;
  meanings: WordMeaning[];
  synonyms: string[];
  antonyms: string[];
  origin: string | null;
}

export interface Favorite {
  word: string;
  savedAt: string;
}

export interface DailyCount {
  date: string;
  count: number;
}

export interface RecentStudy {
  word: string;
  ts: number;
  difficulty: Difficulty;
}

export interface StudyStats {
  hasData: boolean;
  uniqueWords: number;
  totalLookups: number;
  minutesStudied: number;
  streakDays: number;
  savedCount: number;
  since: string | null;
  byDifficulty: Record<Difficulty, number>;
  dailyCounts: DailyCount[];
  recents: RecentStudy[];
}

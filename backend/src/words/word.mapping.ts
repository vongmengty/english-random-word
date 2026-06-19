import { Difficulty, EnglishLevel, LengthBucket } from "./word.types";

/**
 * The WordWander UI offers three difficulty tiers; the curated dataset is keyed
 * by CEFR level (A1–C2). These helpers bridge the two so the database can be
 * queried directly by the tier/length the UI exposes.
 */
export function difficultyForLevel(level: EnglishLevel): Difficulty {
  if (level === "A1" || level === "A2") return "easy";
  if (level === "B1" || level === "B2") return "medium";
  return "hard";
}

export function lengthBucketForWord(word: string): LengthBucket {
  const n = word.length;
  if (n <= 5) return "short";
  if (n <= 8) return "medium";
  return "long";
}

export const RARITY_LABELS: Record<Difficulty, string> = {
  easy: "Everyday",
  medium: "Uncommon",
  hard: "Rare gem"
};

export const RARITY_SCORES: Record<Difficulty, number> = {
  easy: 2,
  medium: 3,
  hard: 5
};

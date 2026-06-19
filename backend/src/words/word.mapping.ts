import { Difficulty, LengthBucket } from "./word.types";

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

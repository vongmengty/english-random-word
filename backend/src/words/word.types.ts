/** Difficulty tiers of the built-in curated word list. */
export type Difficulty = "easy" | "medium" | "hard";

/** Word-length buckets exposed by the WordWander UI. */
export type LengthBucket = "short" | "medium" | "long";

/** A single sense of a word as rendered by the WordWander card. */
export interface WordMeaning {
  partOfSpeech: string;
  definitions: Array<{
    definition: string;
    example: string | null;
  }>;
}

/** The payload the frontend receives for one word. */
export interface WordEntry {
  word: string;
  phonetic: string;
  /** Pronunciation audio URL from the dictionary, when available. */
  audio: string | null;
  difficulty: Difficulty;
  rarityLabel: string;
  rarityScore: number;
  meanings: WordMeaning[];
  synonyms: string[];
  antonyms: string[];
  origin: string | null;
}

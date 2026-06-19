export type EnglishLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

/** Difficulty tiers exposed by the WordWander UI. */
export type Difficulty = "easy" | "medium" | "hard";

/** Word-length buckets exposed by the WordWander UI. */
export type LengthBucket = "short" | "medium" | "long";

export type WordCategory =
  | "animals"
  | "art"
  | "business"
  | "communication"
  | "daily life"
  | "descriptions"
  | "family"
  | "feelings"
  | "food"
  | "health"
  | "home"
  | "learning"
  | "people"
  | "school"
  | "society"
  | "technology"
  | "thinking"
  | "time"
  | "transport"
  | "travel"
  | "weather"
  | "work";

/** Shape of every entry in the bundled vocabulary dataset. */
export interface VocabularyWord {
  level: EnglishLevel;
  word: string;
  partOfSpeech: string;
  meaning: string;
  explanation: string;
  synonyms: string[];
  antonyms: string[];
  sentences: string[];
}

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
  level: EnglishLevel;
  difficulty: Difficulty;
  category: WordCategory;
  rarityLabel: string;
  rarityScore: number;
  meanings: WordMeaning[];
  synonyms: string[];
  antonyms: string[];
  origin: string | null;
}

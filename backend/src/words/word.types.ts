export type EnglishLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export type DifficultyFilter = "a1" | "a1-a2" | "business" | "academic";
export type WordQueryValue = string | string[] | undefined;
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

export type WordRelationshipKind = "synonyms" | "antonyms";

export interface WordRelationshipExample {
  from: string;
  to: string;
}

export interface WordRelationship {
  kind: WordRelationshipKind;
  title: string;
  description: string;
  examples: WordRelationshipExample[];
}

export interface RandomWordResponse extends VocabularyWord {
  category: WordCategory;
  phoneticSpelling: string;
  sentenceCount: number;
  totalWords: number;
}

export interface WordSelectionQuery {
  filter?: WordQueryValue;
  levels?: WordQueryValue;
  categories?: WordQueryValue;
}

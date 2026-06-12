import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { vocabularyByLevel } from "./vocabulary/index";
import { academicWords } from "./vocabulary/academic";
import { wordCategories } from "./vocabulary/categories";
import { phoneticSpellings } from "./vocabulary/phonetics";
import {
  EnglishLevel,
  RandomWordResponse,
  VocabularyWord,
  WordCategory,
  WordRelationship,
  WordQueryValue,
  WordSelectionQuery
} from "./word.types";

const allowedLevels = new Set<EnglishLevel>(
  Object.keys(vocabularyByLevel) as EnglishLevel[]
);
const allowedSentenceCounts = new Set([3, 4]);
const allVocabulary = Object.values(vocabularyByLevel).flat();
const allowedCategories = new Set<WordCategory>(
  Object.values(wordCategories) as WordCategory[]
);
const categoryOrder: WordCategory[] = [
  "animals",
  "art",
  "business",
  "communication",
  "daily life",
  "descriptions",
  "family",
  "feelings",
  "food",
  "health",
  "home",
  "learning",
  "people",
  "school",
  "society",
  "technology",
  "thinking",
  "time",
  "transport",
  "travel",
  "weather",
  "work"
];

interface NormalizedSelection {
  levels: EnglishLevel[];
  categories: WordCategory[];
  academicOnly: boolean;
}

@Injectable()
export class WordsService {
  getWordRelationships(word = ""): WordRelationship[] {
    const vocabularyWord = allVocabulary.find(
      (item) => item.word.toLowerCase() === word.toLowerCase()
    );

    return this.buildWordRelationships(
      vocabularyWord ?? {
        word,
        synonyms: [],
        antonyms: []
      }
    );
  }

  getAvailableCategories(levels?: WordQueryValue): WordCategory[] {
    const selectedLevels = this.normalizeLevels(levels);
    const words = selectedLevels.length
      ? selectedLevels.flatMap((level) => vocabularyByLevel[level])
      : allVocabulary;
    const categories = new Set<WordCategory>(
      words.map((word) => wordCategories[word.word] ?? "daily life")
    );

    return categoryOrder.filter((category) => categories.has(category));
  }

  getRandomWord(
    selection: WordSelectionQuery = {},
    sentenceCount = "3"
  ): RandomWordResponse {
    const normalizedSelection = this.normalizeSelection(selection);
    const parsedSentenceCount = this.parseSentenceCount(sentenceCount);

    const words = this.getWordsForSelection(normalizedSelection);

    if (!words.length) {
      throw new BadRequestException("No words match the selected filters.");
    }

    const randomIndex = Math.floor(Math.random() * words.length);
    const selectedWord = words[randomIndex];

    return this.buildWordResponse(selectedWord, parsedSentenceCount, words.length);
  }

  getWord(word = "", sentenceCount = "3"): RandomWordResponse {
    const parsedSentenceCount = this.parseSentenceCount(sentenceCount);
    const normalizedWord = word.trim().toLowerCase();

    if (!normalizedWord) {
      throw new BadRequestException("Word is required.");
    }

    const selectedWord = allVocabulary.find(
      (item) => item.word.toLowerCase() === normalizedWord
    );

    if (!selectedWord) {
      throw new NotFoundException(`"${word}" is not in the vocabulary list yet.`);
    }

    return this.buildWordResponse(
      selectedWord,
      parsedSentenceCount,
      allVocabulary.length
    );
  }

  private normalizeSelection(selection: WordSelectionQuery): NormalizedSelection {
    const levels = new Set<EnglishLevel>();
    const categories = new Set<WordCategory>();
    let academicOnly = false;
    const filters = this.parseQueryValues(selection.filter);
    const selectedLevels = this.parseQueryValues(selection.levels);
    const selectedCategories = this.parseQueryValues(selection.categories);

    for (const filter of filters) {
      const normalizedFilter = this.normalizeFilter(filter);

      if (!normalizedFilter) {
        throw new BadRequestException(
          "Filter must be a1, a1-a2, business, academic, or a level from A1 to C2."
        );
      }

      normalizedFilter.levels.forEach((level) => levels.add(level));
      normalizedFilter.categories.forEach((category) => categories.add(category));
      academicOnly ||= normalizedFilter.academicOnly;
    }

    for (const level of selectedLevels) {
      const normalizedLevel = this.normalizeLevel(level);

      if (!normalizedLevel) {
        throw new BadRequestException("Levels must be A1, A2, B1, B2, C1, or C2.");
      }

      levels.add(normalizedLevel);
    }

    for (const category of selectedCategories) {
      const normalizedCategory = this.normalizeCategory(category);

      if (!normalizedCategory) {
        throw new BadRequestException("Category is not available.");
      }

      categories.add(normalizedCategory);
    }

    if (!filters.length && !selectedLevels.length && !selectedCategories.length) {
      levels.add("A1");
    }

    return {
      levels: [...levels],
      categories: [...categories],
      academicOnly
    };
  }

  private normalizeFilter(value: string): NormalizedSelection | null {
    const normalizedFilter = value.toLowerCase().replace("–", "-");

    if (normalizedFilter === "a1") {
      return { levels: ["A1"], categories: [], academicOnly: false };
    }

    if (normalizedFilter === "a1-a2") {
      return { levels: ["A1", "A2"], categories: [], academicOnly: false };
    }

    if (normalizedFilter === "business") {
      return { levels: [], categories: ["business"], academicOnly: false };
    }

    if (normalizedFilter === "academic") {
      return { levels: [], categories: [], academicOnly: true };
    }

    const normalizedLevel = this.normalizeLevel(value);

    if (normalizedLevel) {
      return { levels: [normalizedLevel], categories: [], academicOnly: false };
    }

    return null;
  }

  private normalizeLevel(value: string): EnglishLevel | null {
    const normalizedLevel = value.toUpperCase() as EnglishLevel;

    return allowedLevels.has(normalizedLevel) ? normalizedLevel : null;
  }

  private normalizeLevels(value: WordQueryValue): EnglishLevel[] {
    return this.parseQueryValues(value).map((level) => {
      const normalizedLevel = this.normalizeLevel(level);

      if (!normalizedLevel) {
        throw new BadRequestException("Levels must be A1, A2, B1, B2, C1, or C2.");
      }

      return normalizedLevel;
    });
  }

  private normalizeCategory(value: string): WordCategory | null {
    const normalizedCategory = value
      .toLowerCase()
      .replace("–", "-")
      .replace(/[-_]+/g, " ") as WordCategory;

    return allowedCategories.has(normalizedCategory) ? normalizedCategory : null;
  }

  private parseQueryValues(value: string | string[] | undefined): string[] {
    const values = Array.isArray(value) ? value : [value];

    return values
      .filter((item): item is string => Boolean(item))
      .flatMap((item) => item.split(","))
      .map((item) => item.trim())
      .filter(Boolean);
  }

  private parseSentenceCount(sentenceCount = "3"): number {
    const parsedSentenceCount = Number(sentenceCount);

    if (!allowedSentenceCounts.has(parsedSentenceCount)) {
      throw new BadRequestException("Sentences must be 3 or 4.");
    }

    return parsedSentenceCount;
  }

  private getWordsForSelection(selection: NormalizedSelection): VocabularyWord[] {
    return allVocabulary.filter((word) => {
      const category = wordCategories[word.word] ?? "daily life";
      const matchesLevel =
        !selection.levels.length || selection.levels.includes(word.level);
      const matchesCategory =
        !selection.categories.length || selection.categories.includes(category);
      const matchesAcademic =
        !selection.academicOnly || academicWords.has(word.word);

      return matchesLevel && matchesCategory && matchesAcademic;
    });
  }

  private buildWordRelationships(
    word: Pick<VocabularyWord, "word" | "synonyms" | "antonyms">
  ): WordRelationship[] {
    return [
      {
        kind: "synonyms",
        title: "Synonyms",
        description: "Words with similar meaning.",
        examples: word.synonyms.map((synonym) => ({
          from: word.word,
          to: synonym
        }))
      },
      {
        kind: "antonyms",
        title: "Antonyms",
        description: "Opposite words.",
        examples: word.antonyms.map((antonym) => ({
          from: word.word,
          to: antonym
        }))
      }
    ];
  }

  private buildWordResponse(
    word: VocabularyWord,
    sentenceCount: number,
    totalWords: number
  ): RandomWordResponse {
    return {
      ...word,
      category: wordCategories[word.word] ?? "daily life",
      phoneticSpelling: phoneticSpellings[word.word] ?? "",
      sentences: word.sentences.slice(0, sentenceCount),
      sentenceCount,
      totalWords
    };
  }
}

import { Injectable, NotFoundException } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import { RARITY_LABELS, RARITY_SCORES } from "./word.mapping";
import {
  Difficulty,
  EnglishLevel,
  LengthBucket,
  WordCategory,
  WordEntry,
  WordMeaning
} from "./word.types";
import { DifficultyParam, LengthParam } from "./dto/random-word.dto";

interface WordRow {
  word: string;
  level: EnglishLevel;
  difficulty: Difficulty;
  length_bucket: LengthBucket;
  part_of_speech: string;
  meaning: string;
  explanation: string;
  phonetic: string;
  category: WordCategory;
  synonyms: string;
  antonyms: string;
  sentences: string;
}

@Injectable()
export class WordsService {
  constructor(private readonly database: DatabaseService) {}

  private get db() {
    return this.database.db;
  }

  getRandom(difficulty: DifficultyParam, length: LengthParam, exclude?: string): WordEntry {
    const where: string[] = [];
    const params: Record<string, string> = {};
    if (difficulty !== "any") {
      where.push("difficulty = @difficulty");
      params.difficulty = difficulty;
    }
    if (length !== "any") {
      where.push("length_bucket = @length");
      params.length = length;
    }
    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const poolSize = (
      this.db.prepare(`SELECT COUNT(*) AS n FROM words ${whereSql}`).get(params) as { n: number }
    ).n;

    if (poolSize === 0) {
      throw new NotFoundException("No words match the selected filters.");
    }

    // Only exclude the current word when the pool has an alternative.
    const excludeSql =
      exclude && poolSize > 1
        ? `${whereSql ? whereSql + " AND" : "WHERE"} word <> @exclude`
        : whereSql;
    const queryParams = exclude && poolSize > 1 ? { ...params, exclude } : params;

    const row = this.db
      .prepare(`SELECT * FROM words ${excludeSql} ORDER BY RANDOM() LIMIT 1`)
      .get(queryParams) as WordRow | undefined;

    if (!row) {
      throw new NotFoundException("No words match the selected filters.");
    }

    return this.toEntry(row);
  }

  lookup(word: string): WordEntry {
    const row = this.db
      .prepare("SELECT * FROM words WHERE word = ? COLLATE NOCASE")
      .get(word.trim()) as WordRow | undefined;

    if (!row) {
      throw new NotFoundException(`"${word}" is not in the vocabulary list yet.`);
    }

    return this.toEntry(row);
  }

  /** True when the word exists in the dictionary (used to validate favorites). */
  exists(word: string): boolean {
    const row = this.db
      .prepare("SELECT word FROM words WHERE word = ? COLLATE NOCASE")
      .get(word.trim()) as { word: string } | undefined;
    return Boolean(row);
  }

  private toEntry(row: WordRow): WordEntry {
    const sentences = parseList(row.sentences);
    const meaning: WordMeaning = {
      partOfSpeech: row.part_of_speech,
      definitions: [
        { definition: row.meaning, example: sentences[0] ?? null },
        ...(row.explanation && row.explanation !== row.meaning
          ? [{ definition: row.explanation, example: sentences[1] ?? null }]
          : [])
      ]
    };

    return {
      word: row.word,
      phonetic: row.phonetic,
      level: row.level,
      difficulty: row.difficulty,
      category: row.category,
      rarityLabel: RARITY_LABELS[row.difficulty],
      rarityScore: RARITY_SCORES[row.difficulty],
      meanings: [meaning],
      synonyms: parseList(row.synonyms),
      antonyms: parseList(row.antonyms),
      origin: null
    };
  }
}

function parseList(raw: string): string[] {
  try {
    const value = JSON.parse(raw);
    return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

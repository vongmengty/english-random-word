import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import Database from "better-sqlite3";
import { join } from "path";
import { vocabularyByLevel } from "../words/vocabulary";
import { wordCategories } from "../words/vocabulary/categories";
import { phoneticSpellings } from "../words/vocabulary/phonetics";
import { difficultyForLevel, lengthBucketForWord } from "../words/word.mapping";
import { VocabularyWord } from "../words/word.types";

/**
 * Owns the SQLite connection and the schema. On boot it creates the tables and
 * seeds the `words` table from the bundled vocabulary dataset (idempotent), so a
 * fresh checkout comes up with a fully populated dictionary and an empty
 * favorites list.
 */
@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  readonly db: Database.Database;

  constructor() {
    const file = process.env.DATABASE_FILE || join(process.cwd(), "wordwander.sqlite");
    this.db = new Database(file);
    this.db.pragma("journal_mode = WAL");
    this.db.pragma("foreign_keys = ON");
  }

  onModuleInit(): void {
    this.migrate();
    this.seed();
  }

  onModuleDestroy(): void {
    this.db.close();
  }

  private migrate(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS words (
        word           TEXT PRIMARY KEY,
        level          TEXT NOT NULL,
        difficulty     TEXT NOT NULL,
        length_bucket  TEXT NOT NULL,
        part_of_speech TEXT NOT NULL,
        meaning        TEXT NOT NULL,
        explanation    TEXT NOT NULL,
        phonetic       TEXT NOT NULL DEFAULT '',
        category       TEXT NOT NULL DEFAULT '',
        synonyms       TEXT NOT NULL DEFAULT '[]',
        antonyms       TEXT NOT NULL DEFAULT '[]',
        sentences      TEXT NOT NULL DEFAULT '[]'
      );

      CREATE INDEX IF NOT EXISTS idx_words_difficulty ON words (difficulty);
      CREATE INDEX IF NOT EXISTS idx_words_length ON words (length_bucket);

      CREATE TABLE IF NOT EXISTS favorites (
        word       TEXT PRIMARY KEY,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS study_events (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        word       TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        ts         INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_study_ts ON study_events (ts);
    `);
  }

  private seed(): void {
    const count = (this.db.prepare("SELECT COUNT(*) AS n FROM words").get() as { n: number }).n;
    const allWords: VocabularyWord[] = Object.values(vocabularyByLevel).flat();
    if (count === allWords.length) {
      this.logger.log(`Words table already seeded (${count} entries).`);
      return;
    }

    const insert = this.db.prepare(`
      INSERT INTO words
        (word, level, difficulty, length_bucket, part_of_speech, meaning,
         explanation, phonetic, category, synonyms, antonyms, sentences)
      VALUES
        (@word, @level, @difficulty, @length_bucket, @part_of_speech, @meaning,
         @explanation, @phonetic, @category, @synonyms, @antonyms, @sentences)
      ON CONFLICT(word) DO UPDATE SET
        level = excluded.level,
        difficulty = excluded.difficulty,
        length_bucket = excluded.length_bucket,
        part_of_speech = excluded.part_of_speech,
        meaning = excluded.meaning,
        explanation = excluded.explanation,
        phonetic = excluded.phonetic,
        category = excluded.category,
        synonyms = excluded.synonyms,
        antonyms = excluded.antonyms,
        sentences = excluded.sentences
    `);

    const seedAll = this.db.transaction((words: VocabularyWord[]) => {
      for (const w of words) {
        insert.run({
          word: w.word,
          level: w.level,
          difficulty: difficultyForLevel(w.level),
          length_bucket: lengthBucketForWord(w.word),
          part_of_speech: w.partOfSpeech,
          meaning: w.meaning,
          explanation: w.explanation,
          phonetic: phoneticSpellings[w.word] ?? "",
          category: wordCategories[w.word] ?? "daily life",
          synonyms: JSON.stringify(w.synonyms ?? []),
          antonyms: JSON.stringify(w.antonyms ?? []),
          sentences: JSON.stringify(w.sentences ?? [])
        });
      }
    });

    seedAll(allWords);
    this.logger.log(`Seeded ${allWords.length} vocabulary words into SQLite.`);
  }
}

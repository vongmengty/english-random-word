import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import Database from "better-sqlite3";
import { join } from "path";

/**
 * Owns the SQLite connection and schema. The `words` table is a cache of
 * dictionary entries fetched live from the Free Dictionary API — words are
 * inserted the first time they're shown, so nothing is pre-seeded.
 */
@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  readonly db: Database.Database;

  constructor() {
    const file = process.env.DATABASE_FILE || join(process.cwd(), "wordwander.sqlite");
    this.db = new Database(file);
    this.db.pragma("journal_mode = WAL");
    this.db.pragma("foreign_keys = ON");
  }

  onModuleInit(): void {
    this.migrate();
  }

  onModuleDestroy(): void {
    this.db.close();
  }

  private migrate(): void {
    // Earlier builds pre-seeded `words` with a different (CEFR) schema. The
    // table is now a dictionary cache, so drop a stale version if present.
    const cols = this.db.prepare("PRAGMA table_info(words)").all() as { name: string }[];
    if (cols.length && !cols.some((c) => c.name === "meanings")) {
      this.db.exec("DROP TABLE words");
    }

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS words (
        word          TEXT PRIMARY KEY,
        difficulty    TEXT NOT NULL,
        length_bucket TEXT NOT NULL,
        phonetic      TEXT NOT NULL DEFAULT '',
        audio         TEXT NOT NULL DEFAULT '',
        origin        TEXT NOT NULL DEFAULT '',
        meanings      TEXT NOT NULL DEFAULT '[]',
        synonyms      TEXT NOT NULL DEFAULT '[]',
        antonyms      TEXT NOT NULL DEFAULT '[]',
        created_at    TEXT NOT NULL DEFAULT (datetime('now'))
      );

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

      CREATE TABLE IF NOT EXISTS translations (
        word       TEXT NOT NULL,
        lang       TEXT NOT NULL,
        text       TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        PRIMARY KEY (word, lang)
      );
    `);
  }
}

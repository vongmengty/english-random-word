import { BadRequestException, Injectable } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import { WordsService } from "../words/words.service";

export interface Favorite {
  word: string;
  savedAt: string;
}

@Injectable()
export class FavoritesService {
  constructor(
    private readonly database: DatabaseService,
    private readonly wordsService: WordsService
  ) {}

  private get db() {
    return this.database.db;
  }

  list(): Favorite[] {
    const rows = this.db
      .prepare("SELECT word, created_at AS savedAt FROM favorites ORDER BY created_at DESC")
      .all() as Favorite[];
    return rows;
  }

  add(word: string): Favorite[] {
    const trimmed = word.trim();
    if (!this.wordsService.exists(trimmed)) {
      throw new BadRequestException(`"${word}" is not in the vocabulary list.`);
    }
    // Store the canonical casing from the dictionary so the saved list matches.
    const canonical = this.wordsService.lookup(trimmed).word;
    this.db
      .prepare("INSERT OR IGNORE INTO favorites (word) VALUES (?)")
      .run(canonical);
    return this.list();
  }

  remove(word: string): Favorite[] {
    this.db
      .prepare("DELETE FROM favorites WHERE word = ? COLLATE NOCASE")
      .run(word.trim());
    return this.list();
  }
}

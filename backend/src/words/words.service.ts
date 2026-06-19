import { BadGatewayException, Injectable, NotFoundException } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import { DictionaryEntry, DictionaryService } from "../dictionary/dictionary.service";
import { DifficultyParam, LengthParam } from "./dto/random-word.dto";
import { lengthBucketForWord, RARITY_LABELS, RARITY_SCORES } from "./word.mapping";
import { buildPool, tierOf } from "./word-pool";
import { Difficulty, WordEntry, WordMeaning } from "./word.types";

interface WordRow {
  word: string;
  difficulty: Difficulty;
  length_bucket: string;
  phonetic: string;
  audio: string;
  origin: string;
  meanings: string;
  synonyms: string;
  antonyms: string;
}

const MAX_ATTEMPTS = 8;

@Injectable()
export class WordsService {
  constructor(
    private readonly database: DatabaseService,
    private readonly dictionary: DictionaryService
  ) {}

  private get db() {
    return this.database.db;
  }

  /** Pick a random word from the curated pool and resolve it (cache or fetch).
   *  If a word's live look-up fails, another candidate is tried. */
  async getRandom(
    difficulty: DifficultyParam,
    length: LengthParam,
    exclude?: string
  ): Promise<WordEntry> {
    const pool = buildPool(difficulty, length);
    if (!pool.length) {
      throw new NotFoundException("No words match the selected filters.");
    }

    const skip = new Set<string>();
    if (exclude) skip.add(exclude.toLowerCase());

    for (let attempt = 0; attempt < Math.min(MAX_ATTEMPTS, pool.length + 1); attempt++) {
      const candidates = pool.filter((p) => !skip.has(p.word.toLowerCase()));
      const list = candidates.length ? candidates : pool;
      const pick = list[Math.floor(Math.random() * list.length)];
      const entry = await this.resolve(pick.word, pick.tier);
      if (entry) return entry;
      skip.add(pick.word.toLowerCase());
    }

    throw new BadGatewayException("The dictionary didn't answer. Try again.");
  }

  /** Resolve a specific word (e.g. a synonym the user tapped). */
  async lookup(word: string): Promise<WordEntry> {
    const trimmed = word.trim();
    const entry = await this.resolve(trimmed, tierOf(trimmed));
    if (!entry) {
      throw new NotFoundException(`No dictionary entry found for "${word}".`);
    }
    return entry;
  }

  /** True when the word is already cached (used to validate favorites). */
  existsInCache(word: string): boolean {
    return Boolean(this.getCached(word));
  }

  /** The cached canonical casing for a word, if present. */
  cachedCanonical(word: string): string | undefined {
    return this.getCached(word)?.word;
  }

  private getCached(word: string): WordRow | undefined {
    return this.db
      .prepare("SELECT * FROM words WHERE word = ? COLLATE NOCASE")
      .get(word.trim()) as WordRow | undefined;
  }

  /** Return a cached entry, or fetch it live, cache it, and return it. */
  private async resolve(word: string, tier: Difficulty): Promise<WordEntry | null> {
    const cached = this.getCached(word);
    if (cached) return this.rowToEntry(cached);

    const fetched = await this.dictionary.fetchEntry(word);
    if (!fetched) return null;

    // Insert if not already present (another concurrent request may have won).
    this.db
      .prepare(
        `INSERT OR IGNORE INTO words
           (word, difficulty, length_bucket, phonetic, audio, origin, meanings, synonyms, antonyms)
         VALUES
           (@word, @difficulty, @length_bucket, @phonetic, @audio, @origin, @meanings, @synonyms, @antonyms)`
      )
      .run({
        word: fetched.word,
        difficulty: tier,
        length_bucket: lengthBucketForWord(fetched.word),
        phonetic: fetched.phonetic,
        audio: fetched.audio,
        origin: fetched.origin,
        meanings: JSON.stringify(fetched.meanings),
        synonyms: JSON.stringify(fetched.synonyms),
        antonyms: JSON.stringify(fetched.antonyms)
      });

    const row = this.getCached(fetched.word);
    return row ? this.rowToEntry(row) : this.entryFrom(fetched, tier);
  }

  private rowToEntry(row: WordRow): WordEntry {
    return {
      word: row.word,
      phonetic: row.phonetic,
      audio: row.audio || null,
      difficulty: row.difficulty,
      rarityLabel: RARITY_LABELS[row.difficulty],
      rarityScore: RARITY_SCORES[row.difficulty],
      meanings: parseJson<WordMeaning[]>(row.meanings, []),
      synonyms: parseJson<string[]>(row.synonyms, []),
      antonyms: parseJson<string[]>(row.antonyms, []),
      origin: row.origin || null
    };
  }

  private entryFrom(fetched: DictionaryEntry, tier: Difficulty): WordEntry {
    return {
      word: fetched.word,
      phonetic: fetched.phonetic,
      audio: fetched.audio || null,
      difficulty: tier,
      rarityLabel: RARITY_LABELS[tier],
      rarityScore: RARITY_SCORES[tier],
      meanings: fetched.meanings,
      synonyms: fetched.synonyms,
      antonyms: fetched.antonyms,
      origin: fetched.origin || null
    };
  }
}

function parseJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

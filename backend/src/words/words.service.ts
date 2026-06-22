import { BadGatewayException, Injectable, NotFoundException } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import { DictionaryEntry, DictionaryService } from "../dictionary/dictionary.service";
import { DifficultyParam, LengthParam } from "./dto/random-word.dto";
import { lengthBucketForWord, RARITY_LABELS, RARITY_SCORES } from "./word.mapping";
import { allPoolWords, buildPool, isPoolWord, PoolWord, tierOf } from "./word-pool";
import { fetchCommonWords, rankTier } from "./word-source";
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
/** Polite delay between live look-ups so the free API isn't hammered. */
const SYNC_DELAY_MS = 10;

export interface SyncProgress {
  done: number;
  total: number;
  word: string;
  outcome: "cached" | "fetched" | "failed";
}

export interface SyncSummary {
  total: number;
  cached: number;
  fetched: number;
  failed: number;
  failures: string[];
}

@Injectable()
export class WordsService {
  constructor(
    private readonly database: DatabaseService,
    private readonly dictionary: DictionaryService
  ) {}

  private get db() {
    return this.database.db;
  }

  /** Pick a random word matching the filters and resolve it (cache or fetch).
   *  Candidates are the curated pool plus everything already synced into the
   *  cache, so syncing more words widens what "surprise me" can surface. */
  async getRandom(
    difficulty: DifficultyParam,
    length: LengthParam,
    exclude?: string
  ): Promise<WordEntry> {
    const candidates = this.candidateWords(difficulty, length);
    if (!candidates.length) {
      throw new NotFoundException("No words match the selected filters.");
    }

    const skip = new Set<string>();
    if (exclude) skip.add(exclude.toLowerCase());

    for (let attempt = 0; attempt < Math.min(MAX_ATTEMPTS, candidates.length + 1); attempt++) {
      const remaining = candidates.filter((c) => !skip.has(c.word.toLowerCase()));
      const list = remaining.length ? remaining : candidates;
      const pick = list[Math.floor(Math.random() * list.length)];
      const entry = await this.resolve(pick.word, pick.tier);
      if (entry) return entry;
      skip.add(pick.word.toLowerCase());
    }

    throw new BadGatewayException("The dictionary didn't answer. Try again.");
  }

  /** A batch of distinct random words drawn straight from the SQLite cache.
   *  Used by the Match game, which only needs the word strings (the picture
   *  tiles are sourced client-side), not full dictionary entries. */
  sample(count: number, difficulty: DifficultyParam, length: LengthParam): string[] {
    const where: string[] = [];
    const params: Record<string, string | number> = {};
    if (difficulty !== "any") {
      where.push("difficulty = @difficulty");
      params.difficulty = difficulty;
    }
    if (length !== "any") {
      where.push("length_bucket = @length");
      params.length = length;
    }
    params.count = count;
    const sql =
      "SELECT word FROM words" +
      (where.length ? " WHERE " + where.join(" AND ") : "") +
      " ORDER BY RANDOM() LIMIT @count";
    const rows = this.db.prepare(sql).all(params) as { word: string }[];
    return rows.map((r) => r.word);
  }

  /** The curated pool unioned with cached words, filtered to the selection. */
  private candidateWords(difficulty: DifficultyParam, length: LengthParam): PoolWord[] {
    const byWord = new Map<string, PoolWord>();
    for (const candidate of buildPool(difficulty, length)) {
      byWord.set(candidate.word.toLowerCase(), candidate);
    }
    for (const candidate of this.cachedCandidates(difficulty, length)) {
      const key = candidate.word.toLowerCase();
      if (!byWord.has(key)) byWord.set(key, candidate);
    }
    return [...byWord.values()];
  }

  private cachedCandidates(difficulty: DifficultyParam, length: LengthParam): PoolWord[] {
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
    const sql =
      "SELECT word, difficulty FROM words" +
      (where.length ? " WHERE " + where.join(" AND ") : "");
    const rows = this.db.prepare(sql).all(params) as {
      word: string;
      difficulty: Difficulty;
    }[];
    return rows.map((r) => ({ word: r.word, tier: r.difficulty }));
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

  /** Fetch every word in the curated pool into the SQLite cache. Words already
   *  cached are skipped (so re-runs are cheap and only retry past failures). */
  async syncAll(onProgress?: (progress: SyncProgress) => void): Promise<SyncSummary> {
    const pool = allPoolWords();
    const summary: SyncSummary = {
      total: pool.length,
      cached: 0,
      fetched: 0,
      failed: 0,
      failures: []
    };

    for (let i = 0; i < pool.length; i++) {
      const { word, tier } = pool[i];
      let outcome: SyncProgress["outcome"];

      if (this.existsInCache(word)) {
        summary.cached++;
        outcome = "cached";
      } else {
        const entry = await this.resolve(word, tier);
        if (entry) {
          summary.fetched++;
          outcome = "fetched";
        } else {
          summary.failed++;
          summary.failures.push(word);
          outcome = "failed";
        }
        await delay(SYNC_DELAY_MS);
      }

      onProgress?.({ done: i + 1, total: pool.length, word, outcome });
    }

    return summary;
  }

  /** Fetch up to `limit` common words not yet in the cache, pulled from a
   *  frequency-ranked list. Difficulty is taken from the pool when the word is
   *  curated, otherwise derived from its frequency rank. */
  async syncMore(
    limit: number,
    onProgress?: (progress: SyncProgress) => void
  ): Promise<SyncSummary> {
    const words = await fetchCommonWords();
    const summary: SyncSummary = {
      total: 0,
      cached: 0,
      fetched: 0,
      failed: 0,
      failures: []
    };

    for (let i = 0; i < words.length && summary.fetched < limit; i++) {
      const word = words[i];
      if (this.existsInCache(word)) continue;

      summary.total++;
      const tier = isPoolWord(word) ? tierOf(word) : rankTier(i, words.length);
      const entry = await this.resolve(word, tier);
      if (entry) {
        summary.fetched++;
        onProgress?.({ done: summary.fetched, total: limit, word, outcome: "fetched" });
      } else {
        summary.failed++;
        summary.failures.push(word);
        onProgress?.({ done: summary.fetched, total: limit, word, outcome: "failed" });
      }
      await delay(SYNC_DELAY_MS);
    }

    return summary;
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

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

import { Difficulty } from "./word.types";

/**
 * A frequency-ranked list of common English words, used to expand the cached
 * vocabulary beyond the curated pool. Most-frequent words come first, so a
 * word's rank doubles as a rough difficulty signal. Overridable for tests or
 * to point at a different list.
 */
const DEFAULT_LIST_URL =
  process.env.WORD_LIST_URL ||
  "https://raw.githubusercontent.com/first20hours/google-10000-english/master/google-10000-english-no-swears.txt";

const TIMEOUT_MS = 15000;

/** Fetch the common-words list, ordered most-frequent first, de-duplicated and
 *  filtered to plain alphabetic words of 3+ letters. */
export async function fetchCommonWords(): Promise<string[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(DEFAULT_LIST_URL, { signal: controller.signal });
    if (!res.ok) throw new Error(`word list returned HTTP ${res.status}`);
    const text = await res.text();
    const seen = new Set<string>();
    const words: string[] = [];
    for (const line of text.split(/\r?\n/)) {
      const word = line.trim().toLowerCase();
      if (!/^[a-z]{3,}$/.test(word) || seen.has(word)) continue;
      seen.add(word);
      words.push(word);
    }
    return words;
  } finally {
    clearTimeout(timer);
  }
}

/** Map a word's frequency rank onto a difficulty tier (common → easy). */
export function rankTier(index: number, total: number): Difficulty {
  const ratio = total > 0 ? index / total : 0;
  if (ratio < 1 / 3) return "easy";
  if (ratio < 2 / 3) return "medium";
  return "hard";
}

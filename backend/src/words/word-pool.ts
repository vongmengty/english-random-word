import { lengthBucketForWord } from "./word.mapping";
import { Difficulty, LengthBucket } from "./word.types";
import { DifficultyParam, LengthParam } from "./dto/random-word.dto";

/**
 * The random word is always picked from this built-in curated list, grouped by
 * difficulty tier. The real definition/pronunciation/etc. is then fetched live
 * from the Free Dictionary API and cached in SQLite.
 */
export const WORD_POOL: Record<Difficulty, string[]> = {
  easy: [
    "ocean", "garden", "river", "candle", "window", "pillow", "meadow", "bridge",
    "feather", "lantern", "blanket", "melody", "sunrise", "puzzle", "ribbon",
    "marble", "breeze", "pebble", "cottage", "harvest", "whistle", "cabin",
    "clover", "pocket", "sparkle", "bubble", "kitten", "muffin", "velvet", "cinnamon"
  ],
  medium: [
    "wander", "cherish", "glimmer", "linger", "mellow", "nimble", "ponder", "ripple",
    "savor", "tangle", "whisper", "frolic", "hollow", "nestle", "plume", "quiver",
    "radiant", "solace", "tranquil", "vivid", "beacon", "cascade", "drowsy", "elegant",
    "flourish", "gallant", "humble", "jovial", "kindle", "luscious"
  ],
  hard: [
    "ephemeral", "serendipity", "eloquent", "luminous", "mellifluous", "petrichor",
    "halcyon", "ineffable", "ethereal", "nostalgia", "panacea", "resilience",
    "sonorous", "ubiquitous", "vicarious", "zephyr", "aplomb", "effervescent",
    "gregarious", "idyllic", "labyrinth", "nefarious", "quixotic", "sublime",
    "wistful", "euphoria", "incandescent", "clandestine", "ebullient", "susurrus"
  ]
};

const TIERS: Difficulty[] = ["easy", "medium", "hard"];

export interface PoolWord {
  word: string;
  tier: Difficulty;
}

/** The candidate words for a given difficulty/length selection. */
export function buildPool(difficulty: DifficultyParam, length: LengthParam): PoolWord[] {
  const tiers = difficulty === "any" ? TIERS : [difficulty];
  let pool: PoolWord[] = tiers.flatMap((tier) =>
    WORD_POOL[tier].map((word) => ({ word, tier }))
  );
  if (length !== "any") {
    pool = pool.filter((p) => lengthBucketForWord(p.word) === (length as LengthBucket));
  }
  return pool;
}

/** Every word in the curated pool, tagged with its tier. */
export function allPoolWords(): PoolWord[] {
  return TIERS.flatMap((tier) => WORD_POOL[tier].map((word) => ({ word, tier })));
}

const POOL_SET = new Set(
  TIERS.flatMap((tier) => WORD_POOL[tier].map((w) => w.toLowerCase()))
);

/** Whether a word is part of the built-in curated pool. */
export function isPoolWord(word: string): boolean {
  return POOL_SET.has(word.toLowerCase());
}

/** Which tier a word belongs to (for words reached via synonym/antonym links). */
export function tierOf(word: string): Difficulty {
  const lower = word.toLowerCase();
  for (const tier of TIERS) {
    if (WORD_POOL[tier].some((w) => w.toLowerCase() === lower)) return tier;
  }
  return "medium";
}

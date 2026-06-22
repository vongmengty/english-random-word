/**
 * Static content for the "Match the word" mini-game. Each category bundles a
 * palette (mirrors the practice page theme shape) and a pool of picture words.
 * A round draws a handful of items from one category; the game is entirely
 * client-side, so this data lives in the frontend rather than the word API.
 */

export interface MatchItem {
  /** The word the player has to place. */
  word: string;
  /** Emoji shown on the picture tile. */
  emoji: string;
}

export interface MatchTheme {
  bg: string;
  accent: string;
  soft: string;
}

export interface MatchCategory {
  id: string;
  name: string;
  icon: string;
  theme: MatchTheme;
  items: MatchItem[];
}

/** How many cards a single round contains. */
export const ROUND_SIZE = 8;

export const CATEGORIES: MatchCategory[] = [
  {
    id: "drinks",
    name: "Drinks",
    icon: "🥤",
    theme: { bg: "#DBEDFF", accent: "#1F7BE8", soft: "#EAF3FF" },
    items: [
      { word: "water", emoji: "💧" },
      { word: "milk", emoji: "🥛" },
      { word: "tea", emoji: "🍵" },
      { word: "juice", emoji: "🧃" },
      { word: "coffee", emoji: "☕" },
      { word: "beer", emoji: "🍺" },
      { word: "wine", emoji: "🍷" },
      { word: "lemon", emoji: "🍋" },
      { word: "ice", emoji: "🧊" },
      { word: "soda", emoji: "🥤" },
      { word: "cocktail", emoji: "🍸" },
      { word: "champagne", emoji: "🍾" }
    ]
  },
  {
    id: "food",
    name: "Food",
    icon: "🍎",
    theme: { bg: "#FFEAD9", accent: "#F0611C", soft: "#FFF3EA" },
    items: [
      { word: "bread", emoji: "🍞" },
      { word: "cheese", emoji: "🧀" },
      { word: "egg", emoji: "🥚" },
      { word: "apple", emoji: "🍎" },
      { word: "banana", emoji: "🍌" },
      { word: "carrot", emoji: "🥕" },
      { word: "pizza", emoji: "🍕" },
      { word: "rice", emoji: "🍚" },
      { word: "fish", emoji: "🐟" },
      { word: "cake", emoji: "🍰" },
      { word: "burger", emoji: "🍔" },
      { word: "grapes", emoji: "🍇" }
    ]
  },
  {
    id: "animals",
    name: "Animals",
    icon: "🦁",
    theme: { bg: "#D9F4E8", accent: "#0F9D6B", soft: "#EAFBF3" },
    items: [
      { word: "dog", emoji: "🐶" },
      { word: "cat", emoji: "🐱" },
      { word: "horse", emoji: "🐴" },
      { word: "cow", emoji: "🐮" },
      { word: "pig", emoji: "🐷" },
      { word: "rabbit", emoji: "🐰" },
      { word: "elephant", emoji: "🐘" },
      { word: "lion", emoji: "🦁" },
      { word: "monkey", emoji: "🐵" },
      { word: "bear", emoji: "🐻" },
      { word: "frog", emoji: "🐸" },
      { word: "penguin", emoji: "🐧" }
    ]
  },
  {
    id: "nature",
    name: "Nature",
    icon: "🌳",
    theme: { bg: "#ECE4FF", accent: "#7A4FF0", soft: "#F5F0FF" },
    items: [
      { word: "sun", emoji: "☀️" },
      { word: "moon", emoji: "🌙" },
      { word: "star", emoji: "⭐" },
      { word: "tree", emoji: "🌳" },
      { word: "flower", emoji: "🌸" },
      { word: "rain", emoji: "🌧️" },
      { word: "snow", emoji: "❄️" },
      { word: "mountain", emoji: "⛰️" },
      { word: "ocean", emoji: "🌊" },
      { word: "fire", emoji: "🔥" },
      { word: "rainbow", emoji: "🌈" },
      { word: "leaf", emoji: "🍃" }
    ]
  },
  {
    // Round words are pulled at random from the SQLite cache, so every game is
    // tagged as this single "Surprise" set on the study page.
    id: "mix",
    name: "Surprise",
    icon: "🎲",
    theme: { bg: "#FFE2EF", accent: "#E63F88", soft: "#FFE9F2" },
    items: []
  }
];

/** A free stock photo for a word, seeded so each card keeps a stable image. */
export function imageUrlFor(word: string, seed: number): string {
  return `https://loremflickr.com/320/320/${encodeURIComponent(word)}?lock=${seed % 30}`;
}

/** A single completed round, persisted to localStorage and read by the study page. */
export interface MatchResult {
  cat: string;
  name: string;
  icon: string;
  correct: number;
  total: number;
  ts: number;
}

export const RESULTS_KEY = "wm-results";

/** Read the saved game history, tolerating absent or malformed storage. */
export function loadResults(): MatchResult[] {
  try {
    const raw = JSON.parse(localStorage.getItem(RESULTS_KEY) || "[]");
    return Array.isArray(raw) ? raw.filter((g) => g && g.total) : [];
  } catch {
    return [];
  }
}

export function saveResults(results: MatchResult[]): void {
  try {
    localStorage.setItem(RESULTS_KEY, JSON.stringify(results));
  } catch {
    /* storage unavailable — game still playable for the session */
  }
}

import { computed, ref } from "vue";
import {
  CATEGORIES,
  ROUND_SIZE,
  loadResults,
  saveResults,
  type MatchCategory,
  type MatchResult,
  type MatchTheme
} from "../match-data";

interface Card {
  id: string;
  word: string;
  emoji: string;
}

interface ScoreResult {
  correct: number;
  total: number;
  per: Record<string, boolean>;
}

const CORRECT = "#0F9D6B";
const WRONG = "#E5484D";

export interface CategoryTabVM {
  name: string;
  icon: string;
  active: boolean;
  select: () => void;
}

export interface BankWordVM {
  word: string;
  active: boolean;
  select: () => void;
  startDrag: (event: DragEvent) => void;
}

export interface MatchCardVM {
  id: string;
  emoji: string;
  border: string;
  tileBg: string;
  slotBg: string;
  slotBorder: string;
  slotColor: string;
  slotText: string;
  strike: boolean;
  markIcon: string;
  shake: boolean;
  cursor: string;
  showAnswer: boolean;
  answer: string;
  tap: () => void;
  speak: () => void;
  dragOver: (event: DragEvent) => void;
  drop: (event: DragEvent) => void;
}

export interface ScorePanelVM {
  emoji: string;
  title: string;
  correct: number;
  total: number;
  accuracy: number;
}

function shuffle<T>(input: T[]): T[] {
  const out = input.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function speakWord(word: string): void {
  try {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  } catch {
    /* speech synthesis unavailable */
  }
}

/**
 * Drag-and-drop / tap matching game. A round shuffles a slice of one category's
 * words into a bank; the player drops each word onto its picture, then submits.
 * Completed rounds are appended to localStorage so the study page can chart them.
 */
export function useWordMatch() {
  const catIdx = ref(0);
  const cards = ref<Card[]>([]);
  const bankOrder = ref<string[]>([]);
  const assign = ref<Record<string, string>>({});
  const selected = ref<string | null>(null);
  const scored = ref(false);
  const result = ref<ScoreResult | null>(null);
  const history = ref<MatchResult[]>([]);

  const category = computed<MatchCategory>(() => CATEGORIES[catIdx.value]);
  const theme = computed<MatchTheme>(() => category.value.theme);

  const total = computed(() => cards.value.length || ROUND_SIZE);
  const filled = computed(() => Object.keys(assign.value).length);
  const allFilled = computed(() => filled.value >= total.value && total.value > 0);

  function newRound(index?: number): void {
    const ci = index == null ? catIdx.value : index;
    const cat = CATEGORIES[ci];
    const picked = shuffle(cat.items).slice(0, ROUND_SIZE);
    catIdx.value = ci;
    cards.value = picked.map((item, i) => ({
      id: `c${i}_${item.word}`,
      word: item.word,
      emoji: item.emoji
    }));
    bankOrder.value = shuffle(picked.map((item) => item.word));
    assign.value = {};
    selected.value = null;
    scored.value = false;
    result.value = null;
  }

  function nextCategory(): void {
    newRound((catIdx.value + 1) % CATEGORIES.length);
  }

  function bankWords(): string[] {
    const used = new Set(Object.values(assign.value));
    return bankOrder.value.filter((word) => !used.has(word));
  }

  function selectWord(word: string): void {
    if (scored.value) return;
    selected.value = selected.value === word ? null : word;
  }

  function place(cardId: string, word: string | null): void {
    if (scored.value || !word) return;
    const next = { ...assign.value };
    // A word lives on at most one card — pull it off any previous home first.
    for (const key of Object.keys(next)) {
      if (next[key] === word) delete next[key];
    }
    next[cardId] = word;
    assign.value = next;
    selected.value = null;
  }

  function clearCard(cardId: string): void {
    if (scored.value || !assign.value[cardId]) return;
    const next = { ...assign.value };
    delete next[cardId];
    assign.value = next;
  }

  function tapCard(cardId: string): void {
    if (scored.value) return;
    if (selected.value) place(cardId, selected.value);
    else if (assign.value[cardId]) clearCard(cardId);
  }

  function submit(): void {
    if (filled.value < cards.value.length) return;
    let correct = 0;
    const per: Record<string, boolean> = {};
    for (const card of cards.value) {
      const ok = assign.value[card.id] === card.word;
      per[card.id] = ok;
      if (ok) correct++;
    }
    const cat = category.value;
    const record: MatchResult = {
      cat: cat.id,
      name: cat.name,
      icon: cat.icon,
      correct,
      total: cards.value.length,
      ts: Date.now()
    };
    const next = history.value.concat(record);
    while (next.length > 200) next.shift();
    history.value = next;
    saveResults(next);
    scored.value = true;
    result.value = { correct, total: cards.value.length, per };
  }

  const categories = computed<CategoryTabVM[]>(() =>
    CATEGORIES.map((cat, i) => ({
      name: cat.name,
      icon: cat.icon,
      active: i === catIdx.value,
      select: () => newRound(i)
    }))
  );

  const bank = computed<BankWordVM[]>(() =>
    bankWords().map((word) => ({
      word,
      active: selected.value === word,
      select: () => selectWord(word),
      startDrag: (event: DragEvent) => {
        try {
          event.dataTransfer?.setData("text/plain", word);
          if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
        } catch {
          /* dataTransfer unavailable */
        }
        selected.value = word;
      }
    }))
  );

  const matchCards = computed<MatchCardVM[]>(() =>
    cards.value.map((card) => {
      const placed = assign.value[card.id];
      const t = theme.value;
      const ok = scored.value ? result.value?.per[card.id] : null;

      let border = "transparent";
      let tileBg = "#fff";
      let slotBg = "#fff";
      let slotBorder = "rgba(36,29,24,.14)";
      let slotColor = "rgba(36,29,24,.3)";
      let slotText = "drop word";
      let strike = false;
      let markIcon = "";
      let shake = false;
      let showAnswer = false;
      let answer = "";

      if (scored.value) {
        if (ok) {
          border = CORRECT;
          tileBg = "#EAFBF3";
          slotBg = CORRECT;
          slotBorder = CORRECT;
          slotColor = "#fff";
          slotText = placed;
          markIcon = "✓";
        } else {
          border = WRONG;
          tileBg = "#FDEBEC";
          slotBg = "#FDEBEC";
          slotBorder = WRONG;
          slotColor = WRONG;
          slotText = placed || "—";
          strike = true;
          markIcon = "✗";
          shake = true;
          showAnswer = true;
          answer = card.word;
        }
      } else if (placed) {
        border = t.accent;
        tileBg = t.soft;
        slotBg = t.soft;
        slotBorder = t.accent;
        slotColor = t.accent;
        slotText = placed;
      } else if (selected.value) {
        border = t.soft;
      }

      return {
        id: card.id,
        emoji: card.emoji,
        border,
        tileBg,
        slotBg,
        slotBorder,
        slotColor,
        slotText,
        strike,
        markIcon,
        shake,
        showAnswer,
        answer,
        cursor: scored.value ? "default" : selected.value || placed ? "pointer" : "default",
        tap: () => tapCard(card.id),
        speak: () => speakWord(card.word),
        dragOver: (event: DragEvent) => {
          event.preventDefault();
          if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
        },
        drop: (event: DragEvent) => {
          event.preventDefault();
          let word: string | null = null;
          try {
            word = event.dataTransfer?.getData("text/plain") || null;
          } catch {
            /* fall back to the tap selection */
          }
          place(card.id, word || selected.value);
        }
      };
    })
  );

  const score = computed<ScorePanelVM | null>(() => {
    const res = result.value;
    if (!res) return null;
    const accuracy = res.total ? Math.round((res.correct / res.total) * 100) : 0;
    const allRight = res.correct === res.total;
    return {
      emoji: allRight ? "🏆" : accuracy >= 75 ? "🎉" : accuracy >= 50 ? "😊" : "💪",
      title: allRight
        ? "Perfect score!"
        : accuracy >= 75
          ? "Great job!"
          : accuracy >= 50
            ? "Nice try!"
            : "Keep practicing!",
      correct: res.correct,
      total: res.total,
      accuracy
    };
  });

  const hintText = computed(() =>
    scored.value
      ? "Green is correct, red shows the right answer. Try another round!"
      : "Place every word, then hit Submit to see your score."
  );

  const bankNote = computed(() => {
    if (scored.value) return "round complete";
    if (allFilled.value) return "all placed — ready to submit";
    return `${total.value - filled.value} to go`;
  });

  const bankEmptyText = computed(() =>
    scored.value ? "Round scored below." : "All words placed — hit Submit!"
  );

  const submitLabel = computed(() =>
    allFilled.value ? "Submit answers" : `Place all ${total.value} words`
  );

  function start(): void {
    history.value = loadResults();
    newRound(0);
  }

  return {
    theme,
    categories,
    bank,
    cards: matchCards,
    score,
    scored,
    filled,
    total,
    allFilled,
    bankEmpty: computed(() => bank.value.length === 0),
    bankNote,
    bankEmptyText,
    hintText,
    submitLabel,
    hasStats: computed(() => history.value.length > 0),
    start,
    submit,
    playAgain: () => newRound(),
    nextCategory,
    setSelected: (word: string) => (selected.value = word),
    place
  };
}

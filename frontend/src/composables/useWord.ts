import { computed, ref } from "vue";
import { api, ApiError } from "../api/client";
import type { DifficultyFilter, LengthFilter, WordEntry } from "../types";

export type WordStatus = "loading" | "loaded" | "error";

/**
 * Owns the currently displayed word and the network lifecycle around fetching a
 * new one. `onLoaded` fires after each successful fetch so the host can rotate
 * the theme.
 */
export function useWord(onLoaded?: () => void) {
  const entry = ref<WordEntry | null>(null);
  const status = ref<WordStatus>("loading");
  const errorMessage = ref("");

  const difficulty = ref<DifficultyFilter>("any");
  const length = ref<LengthFilter>("any");

  const isLoading = computed(() => status.value === "loading");
  const isError = computed(() => status.value === "error");
  const isLoaded = computed(() => status.value === "loaded" && entry.value !== null);

  let requestId = 0;

  // Record the look-up for the study stats; failures here must not affect the UI.
  function logStudy(word: string) {
    void api.logStudy(word).catch(() => undefined);
  }

  async function fetchRandom() {
    const id = ++requestId;
    status.value = "loading";
    try {
      const next = await api.randomWord({
        difficulty: difficulty.value,
        length: length.value,
        exclude: entry.value?.word
      });
      if (id !== requestId) return;
      entry.value = next;
      status.value = "loaded";
      logStudy(next.word);
      onLoaded?.();
    } catch (err) {
      if (id !== requestId) return;
      entry.value = null;
      status.value = "error";
      errorMessage.value =
        err instanceof ApiError ? err.message : "Something went wrong fetching a word.";
    }
  }

  async function loadSpecific(word: string) {
    const id = ++requestId;
    status.value = "loading";
    try {
      const next = await api.lookup(word);
      if (id !== requestId) return;
      entry.value = next;
      status.value = "loaded";
      logStudy(next.word);
      onLoaded?.();
    } catch (err) {
      if (id !== requestId) return;
      // A synonym/antonym that isn't in our dictionary shouldn't blow up the
      // view — fall back to a fresh random word instead.
      if (err instanceof ApiError && err.status === 404) {
        await fetchRandom();
        return;
      }
      entry.value = null;
      status.value = "error";
      errorMessage.value =
        err instanceof ApiError ? err.message : "Something went wrong looking up that word.";
    }
  }

  function setDifficulty(value: DifficultyFilter) {
    if (difficulty.value === value) return;
    difficulty.value = value;
    void fetchRandom();
  }

  function setLength(value: LengthFilter) {
    if (length.value === value) return;
    length.value = value;
    void fetchRandom();
  }

  return {
    entry,
    status,
    errorMessage,
    difficulty,
    length,
    isLoading,
    isError,
    isLoaded,
    fetchRandom,
    loadSpecific,
    setDifficulty,
    setLength
  };
}

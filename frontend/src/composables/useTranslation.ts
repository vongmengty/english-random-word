import { ref } from "vue";
import { api } from "../api/client";

export type TranslationStatus = "idle" | "loading" | "ready" | "error";

/**
 * Tracks the Khmer translation for the word currently on screen. Translating
 * the same word twice is a no-op while it's loading or already resolved, and
 * stale responses (after the user moved to another word) are discarded.
 */
export function useTranslation() {
  const status = ref<TranslationStatus>("idle");
  const text = ref("");
  let forWord = "";
  let token = 0;

  async function translate(word: string) {
    if (forWord === word && (status.value === "loading" || status.value === "ready")) {
      return;
    }
    forWord = word;
    const id = ++token;
    status.value = "loading";
    text.value = "";
    try {
      const result = await api.translate(word);
      if (id !== token) return;
      text.value = result.text;
      status.value = "ready";
    } catch {
      if (id !== token) return;
      status.value = "error";
    }
  }

  /** Clear translation state — call when the displayed word changes. */
  function reset() {
    token++;
    forWord = "";
    text.value = "";
    status.value = "idle";
  }

  return { status, text, translate, reset };
}

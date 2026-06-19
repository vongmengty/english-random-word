import { computed, ref } from "vue";
import { api } from "../api/client";
import type { Favorite } from "../types";

/** Saved words, persisted server-side in SQLite. */
export function useFavorites() {
  const favorites = ref<Favorite[]>([]);

  const words = computed(() => favorites.value.map((f) => f.word));
  const count = computed(() => favorites.value.length);
  const isEmpty = computed(() => favorites.value.length === 0);

  function isFavorite(word: string | undefined): boolean {
    if (!word) return false;
    const lower = word.toLowerCase();
    return words.value.some((w) => w.toLowerCase() === lower);
  }

  async function load() {
    try {
      favorites.value = await api.listFavorites();
    } catch {
      favorites.value = [];
    }
  }

  async function toggle(word: string) {
    const next = isFavorite(word)
      ? await api.removeFavorite(word)
      : await api.addFavorite(word);
    favorites.value = next;
  }

  async function remove(word: string) {
    favorites.value = await api.removeFavorite(word);
  }

  return { favorites, words, count, isEmpty, isFavorite, load, toggle, remove };
}

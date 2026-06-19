<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import AppHeader from "../components/AppHeader.vue";
import DecorBlobs from "../components/DecorBlobs.vue";
import ErrorState from "../components/ErrorState.vue";
import LoadingState from "../components/LoadingState.vue";
import SavedPanel from "../components/SavedPanel.vue";
import SegmentedControl from "../components/SegmentedControl.vue";
import ToastMessage from "../components/ToastMessage.vue";
import WordCard from "../components/WordCard.vue";
import { useFavorites } from "../composables/useFavorites";
import { useWord } from "../composables/useWord";
import { THEMES, themeVars } from "../theme";
import type { DifficultyFilter, LengthFilter } from "../types";

const themeIdx = ref(0);
const word = useWord(() => {
  themeIdx.value = (themeIdx.value + 1) % THEMES.length;
});
const favorites = useFavorites();

const showFaves = ref(false);
const toast = ref("");
let toastTimer: ReturnType<typeof setTimeout> | undefined;

const themeStyle = computed(() => themeVars(THEMES[themeIdx.value]));

const difficultyOptions: { label: string; value: DifficultyFilter }[] = [
  { label: "Any", value: "any" },
  { label: "Easy", value: "easy" },
  { label: "Medium", value: "medium" },
  { label: "Hard", value: "hard" }
];
const lengthOptions: { label: string; value: LengthFilter }[] = [
  { label: "Any", value: "any" },
  { label: "Short", value: "short" },
  { label: "Mid", value: "medium" },
  { label: "Long", value: "long" }
];

const isCurrentFavorite = computed(() => favorites.isFavorite(word.entry.value?.word));

function showToast(message: string) {
  toast.value = message;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toast.value = ""), 1600);
}

function speak() {
  const entry = word.entry.value;
  if (!entry) return;
  try {
    const utterance = new SpeechSynthesisUtterance(entry.word);
    utterance.lang = "en-US";
    utterance.rate = 0.92;
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  } catch {
    /* speech synthesis unavailable */
  }
}

async function copyWord() {
  const entry = word.entry.value;
  if (!entry) return;
  try {
    await navigator.clipboard.writeText(entry.word);
    showToast("Copied to clipboard");
  } catch {
    showToast("Couldn't copy");
  }
}

async function toggleFavorite() {
  const entry = word.entry.value;
  if (!entry) return;
  try {
    await favorites.toggle(entry.word);
  } catch {
    showToast("Couldn't update saved words");
  }
}

function loadFromSaved(w: string) {
  showFaves.value = false;
  void word.loadSpecific(w);
}

function onKeydown(event: KeyboardEvent) {
  const target = event.target as HTMLElement | null;
  const tag = target?.tagName ?? "";
  if (event.code === "Space" && !/INPUT|TEXTAREA|BUTTON/.test(tag)) {
    event.preventDefault();
    void word.fetchRandom();
  }
}

onMounted(async () => {
  window.addEventListener("keydown", onKeydown);
  await favorites.load();
  await word.fetchRandom();
});

onUnmounted(() => {
  window.removeEventListener("keydown", onKeydown);
  clearTimeout(toastTimer);
});
</script>

<template>
  <div class="page" :style="themeStyle">
    <DecorBlobs />

    <div class="shell">
      <AppHeader
        :fav-count="favorites.count.value"
        :faves-open="showFaves"
        @toggle-faves="showFaves = !showFaves"
      />

      <div class="filters">
        <SegmentedControl
          :model-value="word.difficulty.value"
          label="Level"
          :options="difficultyOptions"
          @update:model-value="word.setDifficulty($event)"
        />
        <SegmentedControl
          :model-value="word.length.value"
          label="Length"
          :options="lengthOptions"
          @update:model-value="word.setLength($event)"
        />
      </div>

      <main class="stage" aria-live="polite">
        <LoadingState v-if="word.isLoading.value" />
        <ErrorState
          v-else-if="word.isError.value"
          :message="word.errorMessage.value"
          @retry="word.fetchRandom()"
        />
        <WordCard
          v-else-if="word.entry.value"
          :entry="word.entry.value"
          :is-favorite="isCurrentFavorite"
          copy-label="Copy word"
          @speak="speak"
          @copy="copyWord"
          @toggle-favorite="toggleFavorite"
          @select-word="loadFromSaved"
        />
      </main>

      <div class="cta">
        <button type="button" class="cta__btn" @click="word.fetchRandom()">
          Surprise me with a new word
        </button>
        <span class="cta__hint">
          or press <kbd class="kbd">Space</kbd>
        </span>
      </div>

      <SavedPanel
        v-if="showFaves"
        :favorites="favorites.favorites.value"
        @close="showFaves = false"
        @load="loadFromSaved"
        @remove="favorites.remove($event)"
      />
    </div>

    <ToastMessage v-if="toast" :message="toast" />
  </div>
</template>

<style scoped>
.page {
  position: relative;
  overflow: hidden;
  min-height: 100vh;
  width: 100%;
  background: var(--ww-bg);
  transition: background 0.6s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 24px 72px;
  color: #241d18;
}

.shell {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 760px;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  align-items: center;
  justify-content: space-between;
}

.stage {
  background: #fff;
  border-radius: 30px;
  box-shadow:
    0 24px 60px -28px rgba(40, 30, 20, 0.4),
    0 2px 6px rgba(40, 30, 20, 0.05);
  padding: 40px;
  min-height: 340px;
  position: relative;
}

.cta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
}

.cta__btn {
  border: none;
  cursor: pointer;
  background: var(--ww-accent);
  color: #fff;
  font-family: "Bricolage Grotesque", sans-serif;
  font-weight: 700;
  font-size: 19px;
  letter-spacing: -0.01em;
  padding: 17px 40px;
  border-radius: 999px;
  box-shadow: 0 14px 30px -10px var(--ww-accent);
  transition: transform 0.15s ease;
}

.cta__btn:hover {
  transform: translateY(-3px);
}
.cta__btn:active {
  transform: translateY(0);
}

.cta__hint {
  font-size: 13px;
  color: rgba(36, 29, 24, 0.45);
  font-weight: 500;
}

.kbd {
  font-family: inherit;
  background: #fff;
  border-radius: 6px;
  padding: 2px 8px;
  box-shadow: 0 1px 2px rgba(40, 30, 20, 0.12);
  font-weight: 600;
}

@media (max-width: 560px) {
  .page {
    padding: 24px 16px 56px;
  }
  .stage {
    padding: 28px 22px;
    border-radius: 24px;
  }
  .filters {
    justify-content: flex-start;
  }
}
</style>

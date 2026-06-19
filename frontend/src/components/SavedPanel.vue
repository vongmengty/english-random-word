<script setup lang="ts">
import type { Favorite } from "../types";

defineProps<{ favorites: Favorite[] }>();
defineEmits<{ close: []; load: [word: string]; remove: [word: string] }>();
</script>

<template>
  <section id="saved-panel" class="saved" aria-labelledby="saved-heading">
    <div class="saved__head">
      <h2 id="saved-heading" class="saved__title">Saved words</h2>
      <button type="button" class="saved__close" aria-label="Close saved words" @click="$emit('close')">
        &times;
      </button>
    </div>

    <ul v-if="favorites.length" class="saved__list">
      <li v-for="fav in favorites" :key="fav.word" class="saved__item">
        <button type="button" class="saved__word" @click="$emit('load', fav.word)">
          {{ fav.word }}
        </button>
        <button
          type="button"
          class="saved__remove"
          :aria-label="`Remove ${fav.word}`"
          @click="$emit('remove', fav.word)"
        >
          &times;
        </button>
      </li>
    </ul>
    <p v-else class="saved__empty">
      No saved words yet — hit <b>Save</b> on a word you love.
    </p>
  </section>
</template>

<style scoped>
.saved {
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 16px 40px -22px rgba(40, 30, 20, 0.35);
  padding: 26px;
  margin-top: 6px;
  animation: ww-pop 0.3s ease;
}

.saved__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.saved__title {
  margin: 0;
  font-family: "Bricolage Grotesque", sans-serif;
  font-weight: 700;
  font-size: 19px;
}

.saved__close {
  border: none;
  background: none;
  cursor: pointer;
  color: rgba(36, 29, 24, 0.4);
  font-size: 22px;
  line-height: 1;
}

.saved__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.saved__item {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  background: var(--ww-soft);
  border-radius: 999px;
  padding-right: 4px;
}

.saved__word {
  border: none;
  cursor: pointer;
  background: none;
  color: var(--ww-accent);
  font-family: inherit;
  font-weight: 600;
  font-size: 15px;
  padding: 8px 6px 8px 15px;
}

.saved__remove {
  border: none;
  cursor: pointer;
  background: none;
  color: rgba(36, 29, 24, 0.35);
  font-size: 17px;
  line-height: 1;
  padding: 4px 8px;
  border-radius: 50%;
}

.saved__empty {
  margin: 0;
  color: rgba(36, 29, 24, 0.5);
}
</style>

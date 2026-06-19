<script setup lang="ts">
import type { WordEntry } from "../types";
import ChipList from "./ChipList.vue";
import RarityMeter from "./RarityMeter.vue";
import WordMeaning from "./WordMeaning.vue";

defineProps<{
  entry: WordEntry;
  isFavorite: boolean;
  copyLabel: string;
}>();

defineEmits<{
  speak: [];
  copy: [];
  "toggle-favorite": [];
  "select-word": [word: string];
}>();
</script>

<template>
  <article class="card">
    <div class="card__top">
      <div class="card__headline">
        <h1 class="card__word">{{ entry.word }}</h1>
        <div class="card__pron">
          <span v-if="entry.phonetic" class="card__phonetic">{{ entry.phonetic }}</span>
          <button type="button" class="listen" @click="$emit('speak')">
            <span class="listen__icon" aria-hidden="true"></span>
            Listen
            <span class="sr-only">to {{ entry.word }}</span>
          </button>
        </div>
      </div>
      <RarityMeter :label="entry.rarityLabel" :score="entry.rarityScore" />
    </div>

    <hr class="card__rule" />

    <div class="card__meanings">
      <WordMeaning
        v-for="(meaning, i) in entry.meanings"
        :key="i"
        :meaning="meaning"
      />
    </div>

    <ChipList
      class="card__chips"
      title="Similar — tap to explore"
      :words="entry.synonyms"
      variant="soft"
      @select="$emit('select-word', $event)"
    />
    <ChipList
      class="card__chips"
      title="Opposite"
      :words="entry.antonyms"
      variant="outline"
      @select="$emit('select-word', $event)"
    />

    <div v-if="entry.origin" class="origin">
      <span class="origin__label">Origin</span>
      <p class="origin__text">{{ entry.origin }}</p>
    </div>

    <div class="card__actions">
      <button
        type="button"
        class="action action--save"
        :class="{ 'action--saved': isFavorite }"
        :aria-pressed="isFavorite"
        @click="$emit('toggle-favorite')"
      >
        <span class="action__dot" aria-hidden="true"></span>
        {{ isFavorite ? "Saved" : "Save" }}
      </button>
      <button type="button" class="action action--copy" @click="$emit('copy')">
        {{ copyLabel }}
      </button>
    </div>
  </article>
</template>

<style scoped>
.card {
  animation: ww-pop 0.35s ease;
}

.card__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.card__headline {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.card__word {
  margin: 0;
  font-family: "Bricolage Grotesque", sans-serif;
  font-weight: 800;
  font-size: clamp(38px, 7vw, 60px);
  line-height: 1.02;
  letter-spacing: -0.03em;
  color: var(--ww-accent);
  word-break: break-word;
}

.card__pron {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.card__phonetic {
  font-size: 18px;
  color: rgba(36, 29, 24, 0.55);
  font-style: italic;
}

.listen {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  border: none;
  cursor: pointer;
  background: var(--ww-soft);
  color: var(--ww-accent);
  font-family: inherit;
  font-weight: 600;
  font-size: 13px;
  padding: 6px 13px;
  border-radius: 999px;
}

.listen__icon {
  display: inline-block;
  width: 0;
  height: 0;
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
  border-left: 8px solid var(--ww-accent);
}

.card__rule {
  height: 1px;
  border: 0;
  background: rgba(36, 29, 24, 0.08);
  margin: 26px 0;
}

.card__meanings {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.card__chips {
  margin-top: 24px;
}
.card__chips + .card__chips {
  margin-top: 18px;
}

.origin {
  margin-top: 24px;
  background: var(--ww-soft);
  border-radius: 18px;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.origin__label {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ww-accent);
}

.origin__text {
  margin: 0;
  font-size: 15px;
  line-height: 1.5;
  color: #3a322b;
  text-wrap: pretty;
}

.card__actions {
  display: flex;
  gap: 10px;
  margin-top: 30px;
  flex-wrap: wrap;
}

.action {
  cursor: pointer;
  font-family: inherit;
  font-weight: 700;
  font-size: 14px;
  border-radius: 999px;
  transition: all 0.2s ease;
}

.action--save {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 2px solid var(--ww-accent);
  background: #fff;
  color: var(--ww-accent);
  padding: 9px 18px;
}

.action--saved {
  background: var(--ww-accent);
  color: #fff;
}

.action__dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--ww-accent);
}
.action--saved .action__dot {
  background: #fff;
}

.action--copy {
  border: 1px solid rgba(36, 29, 24, 0.16);
  background: #fff;
  color: #544a42;
  padding: 9px 18px;
}
</style>

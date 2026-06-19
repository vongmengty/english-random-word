<script setup lang="ts">
import type { WordMeaning } from "../types";

defineProps<{ meaning: WordMeaning }>();
</script>

<template>
  <div class="meaning">
    <span class="meaning__pos">{{ meaning.partOfSpeech }}</span>
    <div
      v-for="(def, i) in meaning.definitions"
      :key="i"
      class="def"
    >
      <span class="def__num" aria-hidden="true">{{ i + 1 }}.</span>
      <div class="def__body">
        <p class="def__text">{{ def.definition }}</p>
        <p v-if="def.example" class="def__example">{{ def.example }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.meaning {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.meaning__pos {
  align-self: flex-start;
  font-weight: 600;
  font-size: 13px;
  font-style: italic;
  color: #fff;
  background: var(--ww-accent);
  padding: 3px 12px;
  border-radius: 999px;
}

.def {
  display: flex;
  gap: 12px;
}

.def__num {
  font-family: "Bricolage Grotesque", sans-serif;
  font-weight: 700;
  font-size: 15px;
  color: var(--ww-accent);
  opacity: 0.6;
  flex: none;
  width: 18px;
}

.def__body {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.def__text {
  margin: 0;
  font-size: 17px;
  line-height: 1.5;
  color: #2c241e;
  text-wrap: pretty;
}

.def__example {
  margin: 0;
  font-size: 15px;
  line-height: 1.5;
  color: rgba(36, 29, 24, 0.5);
  font-style: italic;
  padding-left: 13px;
  border-left: 3px solid var(--ww-soft);
  text-wrap: pretty;
}
</style>

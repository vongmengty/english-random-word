<script setup lang="ts">
import type { BankWordVM } from "../../composables/useWordMatch";

defineProps<{
  bank: BankWordVM[];
  note: string;
  empty: boolean;
  emptyText: string;
  accent: string;
  soft: string;
}>();
</script>

<template>
  <div class="bank">
    <span class="bank__label">Word bank — {{ note }}</span>
    <div class="bank__row">
      <span v-if="empty" class="bank__empty">{{ emptyText }}</span>
      <button
        v-for="word in bank"
        :key="word.word"
        type="button"
        draggable="true"
        class="chip"
        :class="{ 'chip--active': word.active }"
        :style="
          word.active
            ? {
                background: accent,
                color: '#fff',
                borderColor: accent,
                boxShadow: `0 10px 20px -10px ${accent}`
              }
            : { background: soft, color: accent }
        "
        @click="word.select()"
        @dragstart="word.startDrag($event)"
      >
        {{ word.word }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.bank {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 10px 30px -20px rgba(40, 30, 20, 0.4);
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.bank__label {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(36, 29, 24, 0.4);
}

.bank__row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  min-height: 44px;
  align-items: center;
}

.bank__empty {
  color: rgba(36, 29, 24, 0.4);
  font-size: 15px;
  font-style: italic;
}

.chip {
  border: 2px solid transparent;
  cursor: grab;
  font-family: inherit;
  font-weight: 700;
  font-size: 16px;
  padding: 9px 18px;
  border-radius: 14px;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.chip--active {
  transform: translateY(-3px);
}

.chip:active {
  cursor: grabbing;
}
</style>

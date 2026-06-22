<script setup lang="ts">
import type { ScorePanelVM } from "../../composables/useWordMatch";

defineProps<{ score: ScorePanelVM; accent: string }>();
defineEmits<{ "play-again": []; "next-category": [] }>();
</script>

<template>
  <div class="score">
    <span class="score__emoji" aria-hidden="true">{{ score.emoji }}</span>
    <div class="score__body">
      <span class="score__title">{{ score.title }}</span>
      <span class="score__detail">
        You got <b :style="{ color: accent }">{{ score.correct }}</b> of {{ score.total }} correct —
        {{ score.accuracy }}% accuracy.
      </span>
    </div>
    <div class="score__actions">
      <button
        type="button"
        class="score__btn score__btn--solid"
        :style="{ background: accent }"
        @click="$emit('play-again')"
      >
        Play again
      </button>
      <button type="button" class="score__btn score__btn--ghost" @click="$emit('next-category')">
        Next set →
      </button>
    </div>
  </div>
</template>

<style scoped>
.score {
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 16px 44px -24px rgba(40, 30, 20, 0.5);
  padding: 26px 28px;
  display: flex;
  align-items: center;
  gap: 26px;
  flex-wrap: wrap;
  animation: wm-rise 0.35s ease;
}

.score__emoji {
  font-size: 40px;
  line-height: 1;
  flex: none;
}

.score__body {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
  min-width: 160px;
}

.score__title {
  font-family: "Bricolage Grotesque", sans-serif;
  font-weight: 800;
  font-size: 28px;
  letter-spacing: -0.02em;
}

.score__detail {
  color: rgba(36, 29, 24, 0.6);
  font-size: 15px;
}

.score__actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.score__btn {
  cursor: pointer;
  font-family: inherit;
  font-weight: 700;
  font-size: 15px;
  padding: 12px 22px;
  border-radius: 999px;
}

.score__btn--solid {
  border: none;
  color: #fff;
}

.score__btn--ghost {
  border: 1.5px solid rgba(36, 29, 24, 0.18);
  background: #fff;
  color: #3a322b;
}

@keyframes wm-rise {
  from {
    transform: translateY(14px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>

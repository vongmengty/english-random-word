<script setup lang="ts">
import type { TranslationStatus } from "../composables/useTranslation";

defineProps<{ status: TranslationStatus; text: string }>();
defineEmits<{ retry: [] }>();
</script>

<template>
  <div class="khmer" role="status" aria-live="polite">
    <div class="khmer__tag">
      <span class="khmer__script">ខ្មែរ</span>
      <span class="khmer__label">Khmer</span>
    </div>
    <div class="khmer__body">
      <span v-if="status === 'loading'" class="dots" aria-label="Translating…">
        <span class="dots__dot"></span>
        <span class="dots__dot"></span>
        <span class="dots__dot"></span>
      </span>
      <span v-else-if="status === 'ready'" class="khmer__text">{{ text }}</span>
      <span v-else-if="status === 'error'" class="khmer__error">
        <span>Couldn't translate.</span>
        <button type="button" class="khmer__retry" @click="$emit('retry')">Retry</button>
      </span>
    </div>
  </div>
</template>

<style scoped>
.khmer {
  margin-top: 10px;
  align-self: flex-start;
  position: relative;
  display: flex;
  align-items: stretch;
  background: #fff;
  border: 2px solid var(--ww-soft);
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 8px 22px -14px var(--ww-accent);
  animation: ww-pop 0.3s ease;
}

.khmer__tag {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  background: var(--ww-accent);
  padding: 0 14px;
  flex: none;
}

.khmer__script {
  font-family: "Noto Sans Khmer", sans-serif;
  font-weight: 700;
  font-size: 18px;
  color: #fff;
  line-height: 1;
}

.khmer__label {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.8);
}

.khmer__body {
  display: flex;
  align-items: center;
  padding: 10px 18px;
  min-height: 54px;
}

.khmer__text {
  font-size: 30px;
  font-weight: 600;
  color: #241d18;
  font-family: "Noto Sans Khmer", "DM Sans", sans-serif;
  line-height: 1.1;
}

.khmer__error {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.khmer__error > span {
  font-size: 14px;
  color: rgba(36, 29, 24, 0.55);
}

.khmer__retry {
  border: none;
  cursor: pointer;
  background: var(--ww-soft);
  color: var(--ww-accent);
  font-family: inherit;
  font-weight: 700;
  font-size: 13px;
  padding: 5px 12px;
  border-radius: 999px;
}

.dots {
  display: inline-flex;
  gap: 5px;
  align-items: center;
}

.dots__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--ww-accent);
  opacity: 0.4;
  animation: ww-blink 1s ease-in-out infinite;
}
.dots__dot:nth-child(2) {
  animation-delay: 0.2s;
}
.dots__dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes ww-blink {
  0%,
  100% {
    opacity: 0.25;
    transform: translateY(0);
  }
  50% {
    opacity: 1;
    transform: translateY(-3px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .khmer,
  .dots__dot {
    animation: none;
  }
}
</style>

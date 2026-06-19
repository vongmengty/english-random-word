<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ label: string; score: number; max?: number }>();

const dots = computed(() => {
  const max = props.max ?? 5;
  return Array.from({ length: max }, (_, i) => i < props.score);
});
</script>

<template>
  <div class="rarity">
    <span class="rarity__label">{{ label }}</span>
    <div
      class="rarity__dots"
      role="img"
      :aria-label="`Rarity: ${label}, ${score} out of ${dots.length}`"
    >
      <span
        v-for="(filled, i) in dots"
        :key="i"
        class="rarity__dot"
        :class="{ 'rarity__dot--filled': filled }"
      ></span>
    </div>
  </div>
</template>

<style scoped>
.rarity {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 7px;
}

.rarity__label {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ww-accent);
}

.rarity__dots {
  display: flex;
  gap: 5px;
}

.rarity__dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--ww-soft);
}

.rarity__dot--filled {
  background: var(--ww-accent);
}
</style>

<script setup lang="ts">
import type { CategoryTabVM } from "../../composables/useWordMatch";

defineProps<{ categories: CategoryTabVM[]; accent: string }>();
</script>

<template>
  <div class="tabs">
    <button
      v-for="cat in categories"
      :key="cat.name"
      type="button"
      class="tab"
      :class="{ 'tab--active': cat.active }"
      :aria-pressed="cat.active"
      :style="cat.active ? { background: accent, color: '#fff' } : {}"
      @click="cat.select()"
    >
      <span class="tab__icon" aria-hidden="true">{{ cat.icon }}</span>
      {{ cat.name }}
    </button>
  </div>
</template>

<style scoped>
.tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  background: rgba(255, 255, 255, 0.55);
  padding: 5px;
  border-radius: 999px;
  align-self: flex-start;
}

.tab {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-weight: 600;
  font-size: 14px;
  padding: 8px 16px;
  border-radius: 999px;
  transition: all 0.2s ease;
  background: transparent;
  color: rgba(36, 29, 24, 0.6);
}

.tab__icon {
  font-size: 16px;
}
</style>

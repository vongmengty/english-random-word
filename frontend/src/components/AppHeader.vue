<script setup lang="ts">
import { RouterLink } from "vue-router";

defineProps<{ favCount: number; favesOpen: boolean }>();
defineEmits<{ "toggle-faves": [] }>();
</script>

<template>
  <header class="header">
    <div class="brand">
      <span class="brand__dot" aria-hidden="true"></span>
      <span class="brand__name">WordWander</span>
    </div>
    <div class="header__actions">
      <RouterLink to="/match" class="pill pill--link">
        <span aria-hidden="true">🎮</span>
        Play
      </RouterLink>
      <RouterLink to="/study" class="pill pill--link">
        <span class="bars" aria-hidden="true">
          <span class="bars__bar" style="height: 8px"></span>
          <span class="bars__bar" style="height: 13px"></span>
          <span class="bars__bar" style="height: 6px"></span>
        </span>
        My study
      </RouterLink>
      <button
        type="button"
        class="pill saved-btn"
        :aria-expanded="favesOpen"
        aria-controls="saved-panel"
        @click="$emit('toggle-faves')"
      >
        Saved
        <span class="saved-btn__count" aria-hidden="true">{{ favCount }}</span>
        <span class="sr-only">{{ favCount }} saved words</span>
      </button>
    </div>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 11px;
}

.brand__dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--ww-accent);
  transition: background 0.6s ease;
}

.brand__name {
  font-family: "Bricolage Grotesque", sans-serif;
  font-weight: 800;
  font-size: 21px;
  letter-spacing: -0.02em;
}

.header__actions {
  display: flex;
  align-items: center;
  gap: 9px;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: none;
  cursor: pointer;
  background: #fff;
  color: #241d18;
  font-family: inherit;
  font-weight: 600;
  font-size: 14px;
  padding: 9px 15px;
  border-radius: 999px;
  box-shadow: 0 2px 8px rgba(40, 30, 20, 0.08);
  text-decoration: none;
}

.bars {
  display: inline-flex;
  align-items: flex-end;
  gap: 2px;
}

.bars__bar {
  width: 3px;
  border-radius: 2px;
  background: var(--ww-accent);
}

.saved-btn__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: 999px;
  background: var(--ww-accent);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
}
</style>

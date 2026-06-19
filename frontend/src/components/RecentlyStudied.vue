<script setup lang="ts">
import type { RecentVM } from "../study-format";

defineProps<{ recents: RecentVM[] }>();
</script>

<template>
  <section class="panel">
    <h2 class="panel__title">Recently studied</h2>
    <ul class="recents">
      <li v-for="(recent, i) in recents" :key="i" class="recent">
        <span class="recent__dot" :style="{ background: recent.color }" aria-hidden="true"></span>
        <span class="recent__word">{{ recent.word }}</span>
        <span class="recent__when">{{ recent.when }}</span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.panel {
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 16px 44px -28px rgba(40, 30, 20, 0.3);
  padding: 26px;
}

.panel__title {
  margin: 0 0 20px;
  font-family: "Bricolage Grotesque", sans-serif;
  font-weight: 700;
  font-size: 19px;
}

.recents {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.recent {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 9px 0;
  border-bottom: 1px solid rgba(36, 29, 24, 0.06);
}

.recent__dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex: none;
}

.recent__word {
  font-weight: 600;
  font-size: 16px;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recent__when {
  font-size: 13px;
  color: rgba(36, 29, 24, 0.45);
  flex: none;
}
</style>

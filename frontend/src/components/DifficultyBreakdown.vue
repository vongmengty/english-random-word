<script setup lang="ts">
import type { LevelVM } from "../study-format";

defineProps<{ levels: LevelVM[] }>();
</script>

<template>
  <section class="panel">
    <h2 class="panel__title">By difficulty</h2>
    <div class="levels">
      <div v-for="level in levels" :key="level.name" class="level">
        <div class="level__head">
          <span class="level__name">{{ level.name }}</span>
          <span class="level__count" :style="{ color: level.color }">{{ level.count }}</span>
        </div>
        <div
          class="level__track"
          role="progressbar"
          :aria-valuenow="level.count"
          :aria-label="`${level.name}: ${level.count} words`"
        >
          <div
            class="level__fill"
            :style="{ width: `${level.pct}%`, background: level.color }"
          ></div>
        </div>
      </div>
    </div>
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

.levels {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.level {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.level__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.level__name {
  font-size: 14px;
  font-weight: 600;
  color: #3a322b;
}

.level__count {
  font-size: 14px;
  font-weight: 700;
}

.level__track {
  width: 100%;
  height: 10px;
  border-radius: 999px;
  background: #f1ebe3;
  overflow: hidden;
}

.level__fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.5s ease;
}
</style>

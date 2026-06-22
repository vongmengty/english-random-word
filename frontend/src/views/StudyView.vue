<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import DifficultyBreakdown from "../components/DifficultyBreakdown.vue";
import GameStatsSection from "../components/match/GameStatsSection.vue";
import LoadingState from "../components/LoadingState.vue";
import RecentlyStudied from "../components/RecentlyStudied.vue";
import StatCard from "../components/StatCard.vue";
import StudyBarChart from "../components/StudyBarChart.vue";
import StudyEmptyState from "../components/StudyEmptyState.vue";
import { api, ApiError } from "../api/client";
import {
  bars,
  chartNote,
  levels,
  rangeLabel,
  recents,
  statCards
} from "../study-format";
import type { StudyStats } from "../types";

const stats = ref<StudyStats | null>(null);
const status = ref<"loading" | "ready" | "error">("loading");
const errorMessage = ref("");

const cards = computed(() => (stats.value ? statCards(stats.value) : []));
const chartBars = computed(() => (stats.value ? bars(stats.value) : []));
const levelBars = computed(() => (stats.value ? levels(stats.value) : []));
const recentList = computed(() => (stats.value ? recents(stats.value) : []));
const subtitle = computed(() =>
  stats.value ? rangeLabel(stats.value) : "Track every word you explore"
);
const note = computed(() => (stats.value ? chartNote(stats.value) : ""));

onMounted(async () => {
  try {
    stats.value = await api.studyStats();
    status.value = "ready";
  } catch (err) {
    status.value = "error";
    errorMessage.value =
      err instanceof ApiError ? err.message : "Couldn't load your study stats.";
  }
});
</script>

<template>
  <div class="study">
    <span class="study__blob study__blob--a" aria-hidden="true"></span>
    <span class="study__blob study__blob--b" aria-hidden="true"></span>

    <div class="study__shell">
      <header class="study__header">
        <div class="brand">
          <span class="brand__dot" aria-hidden="true"></span>
          <span class="brand__name">WordWander</span>
        </div>
        <RouterLink to="/" class="back">← Back to practice</RouterLink>
      </header>

      <div class="study__intro">
        <h1 class="study__title">Your study, by the numbers</h1>
        <p class="study__subtitle">{{ subtitle }}</p>
      </div>

      <LoadingState v-if="status === 'loading'" />

      <div v-else-if="status === 'error'" class="study__error" role="alert">
        {{ errorMessage }}
      </div>

      <template v-else>
        <StudyEmptyState v-if="!stats?.hasData" />

        <div v-else class="study__data">
          <div class="study__stats">
            <StatCard v-for="card in cards" :key="card.label" :stat="card" />
          </div>

          <StudyBarChart :bars="chartBars" :note="note" />

          <div class="study__split">
            <DifficultyBreakdown :levels="levelBars" />
            <RecentlyStudied :recents="recentList" />
          </div>
        </div>

        <!-- Self-hides when no match-game history is saved locally. -->
        <GameStatsSection />
      </template>
    </div>
  </div>
</template>

<style scoped>
.study {
  /* Shared components (LoadingState) read these; the study page palette is fixed. */
  --ww-accent: #f0611c;
  --ww-soft: #ffe3ce;
  position: relative;
  overflow: hidden;
  min-height: 100vh;
  width: 100%;
  background: #fff6ec;
  font-family: "DM Sans", system-ui, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 24px 80px;
  color: #241d18;
}

.study__blob {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}
.study__blob--a {
  top: -130px;
  left: -90px;
  width: 320px;
  height: 320px;
  background: #f0611c;
  opacity: 0.08;
}
.study__blob--b {
  bottom: -150px;
  right: -100px;
  width: 340px;
  height: 340px;
  background: #7a4ff0;
  opacity: 0.07;
}

.study__shell {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 820px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.study__header {
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
  background: #f0611c;
}
.brand__name {
  font-family: "Bricolage Grotesque", sans-serif;
  font-weight: 800;
  font-size: 21px;
  letter-spacing: -0.02em;
}

.back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  background: #f0611c;
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  padding: 10px 18px;
  border-radius: 999px;
  box-shadow: 0 8px 18px -8px #f0611c;
}

.study__intro {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.study__title {
  margin: 0;
  font-family: "Bricolage Grotesque", sans-serif;
  font-weight: 800;
  font-size: clamp(30px, 5vw, 44px);
  letter-spacing: -0.03em;
  line-height: 1.05;
}
.study__subtitle {
  margin: 0;
  color: rgba(36, 29, 24, 0.55);
  font-size: 16px;
}

.study__error {
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 16px 44px -28px rgba(40, 30, 20, 0.3);
  padding: 32px;
  text-align: center;
  color: #b00020;
  font-weight: 600;
}

.study__data {
  display: flex;
  flex-direction: column;
  gap: 24px;
  animation: wa-pop 0.4s ease;
}

.study__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 16px;
}

.study__split {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

@keyframes wa-pop {
  from {
    transform: translateY(10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@media (max-width: 560px) {
  .study {
    padding: 24px 16px 56px;
  }
}
</style>

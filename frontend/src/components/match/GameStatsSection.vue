<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { RouterLink } from "vue-router";
import StatCard from "../StatCard.vue";
import { loadResults, saveResults, type MatchResult } from "../../match-data";
import { gameStats } from "../../match-format";

const history = ref<MatchResult[]>([]);
const stats = computed(() => gameStats(history.value));

function refresh() {
  history.value = loadResults();
}

function reset() {
  saveResults([]);
  history.value = [];
}

// The game writes to localStorage from another route/tab; refresh when the
// study page regains focus so its numbers stay current.
onMounted(() => {
  refresh();
  window.addEventListener("focus", refresh);
  document.addEventListener("visibilitychange", refresh);
});
onUnmounted(() => {
  window.removeEventListener("focus", refresh);
  document.removeEventListener("visibilitychange", refresh);
});
</script>

<template>
  <section v-if="stats.has" class="games">
    <div class="games__head">
      <span class="games__emoji" aria-hidden="true">🎮</span>
      <h2 class="games__title">Word match game</h2>
      <RouterLink to="/match" class="games__play">Play →</RouterLink>
    </div>

    <div class="games__stats">
      <StatCard v-for="card in stats.cards" :key="card.label" :stat="card" />
    </div>

    <div class="games__split">
      <div class="panel">
        <div class="panel__head">
          <h3 class="panel__title">Accuracy by set</h3>
          <button type="button" class="reset" @click="reset">Reset</button>
        </div>
        <div class="levels">
          <div v-for="cat in stats.cats" :key="cat.name" class="level">
            <div class="level__head">
              <span class="level__name">
                <span class="level__icon" aria-hidden="true">{{ cat.icon }}</span>{{ cat.name }}
              </span>
              <span class="level__pct" :style="{ color: cat.color }">{{ cat.pctLabel }}</span>
            </div>
            <div class="level__track">
              <div
                class="level__fill"
                :style="{ width: `${cat.pct}%`, background: cat.color }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div class="panel">
        <h3 class="panel__title panel__title--block">Recent games</h3>
        <ul class="recents">
          <li v-for="(game, i) in stats.recent" :key="i" class="recent">
            <span class="recent__icon" aria-hidden="true">{{ game.icon }}</span>
            <span class="recent__name">{{ game.name }}</span>
            <span class="recent__score" :style="{ color: game.color }">{{ game.score }}</span>
            <span class="recent__when">{{ game.when }}</span>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped>
.games {
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: wa-pop 0.4s ease;
  margin-top: 8px;
}

.games__head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.games__emoji {
  font-size: 22px;
}

.games__title {
  margin: 0;
  font-family: "Bricolage Grotesque", sans-serif;
  font-weight: 800;
  font-size: 24px;
  letter-spacing: -0.02em;
}

.games__play {
  margin-left: auto;
  text-decoration: none;
  background: #7a4ff0;
  color: #fff;
  font-weight: 700;
  font-size: 13px;
  padding: 8px 16px;
  border-radius: 999px;
}

.games__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.games__split {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.panel {
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 16px 44px -28px rgba(40, 30, 20, 0.3);
  padding: 26px;
}

.panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.panel__title {
  margin: 0;
  font-family: "Bricolage Grotesque", sans-serif;
  font-weight: 700;
  font-size: 19px;
}

.panel__title--block {
  display: block;
  margin-bottom: 20px;
}

.reset {
  border: none;
  cursor: pointer;
  background: rgba(36, 29, 24, 0.06);
  color: rgba(36, 29, 24, 0.5);
  font-family: inherit;
  font-weight: 600;
  font-size: 12px;
  padding: 5px 12px;
  border-radius: 999px;
}

.levels {
  display: flex;
  flex-direction: column;
  gap: 16px;
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

.level__icon {
  margin-right: 6px;
}

.level__pct {
  font-size: 13px;
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

.recent__icon {
  font-size: 18px;
  flex: none;
}

.recent__name {
  font-weight: 600;
  font-size: 15px;
  flex: 1;
  min-width: 0;
}

.recent__score {
  font-weight: 700;
  font-size: 14px;
  flex: none;
}

.recent__when {
  font-size: 12px;
  color: rgba(36, 29, 24, 0.4);
  flex: none;
  width: 64px;
  text-align: right;
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
</style>

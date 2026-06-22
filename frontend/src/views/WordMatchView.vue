<script setup lang="ts">
import { computed, onMounted } from "vue";
import { RouterLink } from "vue-router";
import DecorBlobs from "../components/DecorBlobs.vue";
import ErrorState from "../components/ErrorState.vue";
import LoadingState from "../components/LoadingState.vue";
import MatchCard from "../components/match/MatchCard.vue";
import ScorePanel from "../components/match/ScorePanel.vue";
import WordBank from "../components/match/WordBank.vue";
import { useWordMatch } from "../composables/useWordMatch";
import { themeVars } from "../theme";

const game = useWordMatch();

const themeStyle = computed(() => themeVars(game.theme.value));
const accent = computed(() => game.theme.value.accent);
const soft = computed(() => game.theme.value.soft);

onMounted(() => game.start());
</script>

<template>
  <div class="page" :style="themeStyle">
    <DecorBlobs />

    <div class="shell">
      <header class="header">
        <div class="brand">
          <span class="brand__dot" aria-hidden="true"></span>
          <span class="brand__name">WordWander</span>
        </div>
        <div class="header__actions">
          <RouterLink to="/" class="pill">Practice</RouterLink>
          <RouterLink to="/study" class="pill">My study</RouterLink>
        </div>
      </header>

      <div class="intro">
        <div class="intro__text">
          <h1 class="intro__title">Match the word</h1>
          <p class="intro__hint">{{ game.hintText.value }}</p>
        </div>
        <div class="intro__count">
          <span class="intro__placed" :style="{ color: accent }">
            {{ game.filled.value }}/{{ game.total.value }}
          </span>
          <span class="intro__label">Placed</span>
        </div>
      </div>

      <ScorePanel
        v-if="game.score.value"
        :score="game.score.value"
        :accent="accent"
        @play-again="game.playAgain()"
        @next-category="game.nextCategory()"
      />

      <ErrorState
        v-if="game.error.value"
        message="Couldn't load words from the dictionary. Check that the server is running and try again."
        @retry="game.playAgain()"
      />

      <LoadingState v-else-if="game.loading.value" />

      <template v-else>
        <WordBank
          :bank="game.bank.value"
          :note="game.bankNote.value"
          :empty="game.bankEmpty.value"
          :empty-text="game.bankEmptyText.value"
          :accent="accent"
          :soft="soft"
        />

        <div class="grid">
          <MatchCard
            v-for="card in game.cards.value"
            :key="card.id"
            :card="card"
            :accent="accent"
          />
        </div>

        <div class="submit-row">
          <button
            v-if="!game.scored.value"
            type="button"
            class="submit"
            :class="{ 'submit--ready': game.allFilled.value }"
            :disabled="!game.allFilled.value"
            :style="game.allFilled.value ? { background: accent, boxShadow: `0 14px 30px -10px ${accent}` } : {}"
            @click="game.submit()"
          >
            {{ game.submitLabel.value }}
          </button>
          <button
            v-else
            type="button"
            class="submit submit--ready"
            :style="{ background: accent, boxShadow: `0 14px 30px -10px ${accent}` }"
            @click="game.playAgain()"
          >
            Play again
          </button>
        </div>
      </template>

      <RouterLink v-if="game.hasStats.value" to="/study" class="stats-link">
        📊 See your game stats on <b :style="{ color: accent }">My study</b> →
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.page {
  position: relative;
  overflow: hidden;
  min-height: 100vh;
  width: 100%;
  background: var(--ww-bg);
  transition: background 0.6s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 24px 80px;
  color: #241d18;
}

.shell {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 900px;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

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
  text-decoration: none;
  background: #fff;
  color: #241d18;
  font-family: inherit;
  font-weight: 600;
  font-size: 14px;
  padding: 9px 15px;
  border-radius: 999px;
  box-shadow: 0 2px 8px rgba(40, 30, 20, 0.08);
}

.intro {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.intro__text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.intro__title {
  margin: 0;
  font-family: "Bricolage Grotesque", sans-serif;
  font-weight: 800;
  font-size: clamp(30px, 5vw, 44px);
  letter-spacing: -0.03em;
  line-height: 1.04;
}

.intro__hint {
  margin: 0;
  color: rgba(36, 29, 24, 0.55);
  font-size: 16px;
}

.intro__count {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.intro__placed {
  font-family: "Bricolage Grotesque", sans-serif;
  font-weight: 800;
  font-size: 26px;
  line-height: 1;
}

.intro__label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(36, 29, 24, 0.45);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

.submit-row {
  display: flex;
  justify-content: center;
  margin-top: 4px;
}

.submit {
  border: none;
  cursor: not-allowed;
  background: rgba(36, 29, 24, 0.12);
  color: rgba(36, 29, 24, 0.4);
  font-family: "Bricolage Grotesque", sans-serif;
  font-weight: 700;
  font-size: 19px;
  letter-spacing: -0.01em;
  padding: 16px 44px;
  border-radius: 999px;
  transition: all 0.2s ease;
}

.submit--ready {
  cursor: pointer;
  color: #fff;
}

.stats-link {
  text-decoration: none;
  align-self: center;
  margin-top: 6px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  color: #3a322b;
  font-family: inherit;
  font-weight: 600;
  font-size: 14px;
  padding: 11px 20px;
  border-radius: 999px;
  box-shadow: 0 6px 18px -10px rgba(40, 30, 20, 0.4);
}

@media (max-width: 560px) {
  .page {
    padding: 24px 16px 56px;
  }
}
</style>

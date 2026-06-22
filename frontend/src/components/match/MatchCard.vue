<script setup lang="ts">
import type { MatchCardVM } from "../../composables/useWordMatch";

defineProps<{ card: MatchCardVM; accent: string }>();
</script>

<template>
  <div
    class="card"
    :class="{ 'card--shake': card.shake }"
    :style="{ borderColor: card.border, cursor: card.cursor }"
    @click="card.tap()"
    @dragover="card.dragOver($event)"
    @drop="card.drop($event)"
  >
    <div class="card__tile" :style="{ background: card.tileBg }">
      <div
        class="card__photo"
        :style="{ backgroundImage: `url('${card.imgUrl}')` }"
        aria-hidden="true"
      ></div>
      <button
        type="button"
        class="card__speak"
        title="Listen"
        aria-label="Listen"
        @click.stop="card.speak()"
      >
        <span class="card__play" :style="{ borderLeftColor: accent }" aria-hidden="true"></span>
      </button>
      <span class="card__mark" aria-hidden="true">{{ card.markIcon }}</span>
    </div>
    <div class="card__slot" :style="{ background: card.slotBg, borderTopColor: card.slotBorder }">
      <span
        class="card__word"
        :style="{ color: card.slotColor, textDecoration: card.strike ? 'line-through' : 'none' }"
      >
        {{ card.slotText }}
      </span>
      <span v-if="card.showAnswer" class="card__answer">✓ {{ card.answer }}</span>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: #fff;
  border-radius: 20px;
  border: 3px solid transparent;
  overflow: hidden;
  box-shadow: 0 8px 24px -18px rgba(40, 30, 20, 0.5);
  transition: border-color 0.25s ease;
}

.card--shake {
  animation: wm-shake 0.45s ease;
}

.card__tile {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 128px;
  overflow: hidden;
}

.card__photo {
  position: absolute;
  inset: 0;
  z-index: 1;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.card__speak {
  position: absolute;
  z-index: 2;
  left: 10px;
  bottom: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 9px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.card__play {
  display: inline-block;
  width: 0;
  height: 0;
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
  border-left: 8px solid;
}

.card__mark {
  position: absolute;
  z-index: 2;
  right: 10px;
  top: 10px;
  font-size: 18px;
  line-height: 1;
}

.card__slot {
  min-height: 54px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 8px 10px;
  border-top: 2px dashed transparent;
}

.card__word {
  font-family: inherit;
  font-weight: 700;
  font-size: 17px;
}

.card__answer {
  font-size: 13px;
  font-weight: 700;
  color: #0f9d6b;
}

@keyframes wm-shake {
  0%,
  100% {
    transform: translateX(0);
  }
  20% {
    transform: translateX(-7px);
  }
  40% {
    transform: translateX(7px);
  }
  60% {
    transform: translateX(-5px);
  }
  80% {
    transform: translateX(5px);
  }
}
</style>

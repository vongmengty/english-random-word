<script setup lang="ts">
import type { BarVM } from "../study-format";

defineProps<{ bars: BarVM[]; note: string }>();
</script>

<template>
  <section class="chart">
    <div class="chart__head">
      <h2 class="chart__title">Last 14 days</h2>
      <span class="chart__note">{{ note }}</span>
    </div>
    <div class="chart__bars" role="list">
      <div
        v-for="(bar, i) in bars"
        :key="i"
        class="bar"
        role="listitem"
        :aria-label="`${bar.label}: ${bar.count || 0} look-ups`"
      >
        <span class="bar__count" :style="{ color: bar.labelColor }">{{ bar.count }}</span>
        <div
          class="bar__fill"
          :style="{ height: `${bar.height}px`, background: bar.color }"
        ></div>
        <span class="bar__label">{{ bar.label }}</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.chart {
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 16px 44px -28px rgba(40, 30, 20, 0.3);
  padding: 26px 26px 20px;
}

.chart__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 22px;
}

.chart__title {
  margin: 0;
  font-family: "Bricolage Grotesque", sans-serif;
  font-weight: 700;
  font-size: 19px;
}

.chart__note {
  font-size: 13px;
  color: rgba(36, 29, 24, 0.5);
  font-weight: 500;
}

.chart__bars {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 6px;
  height: 150px;
}

.bar {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  height: 100%;
  justify-content: flex-end;
}

.bar__count {
  font-size: 11px;
  font-weight: 700;
  height: 14px;
}

.bar__fill {
  width: 100%;
  max-width: 26px;
  border-radius: 6px;
  transform-origin: bottom;
  animation: wa-grow 0.5s ease;
}

.bar__label {
  font-size: 11px;
  color: rgba(36, 29, 24, 0.4);
  font-weight: 600;
}

@keyframes wa-grow {
  from {
    transform: scaleY(0);
  }
  to {
    transform: scaleY(1);
  }
}
</style>

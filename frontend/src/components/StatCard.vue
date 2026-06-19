<script setup lang="ts">
import type { StatCardVM } from "../study-format";

defineProps<{ stat: StatCardVM }>();
</script>

<template>
  <div class="stat" :style="{ background: stat.soft }">
    <span class="stat__label" :style="{ color: stat.accent }">{{ stat.label }}</span>
    <div class="stat__value">
      <span class="stat__big">{{ stat.big }}</span>
      <span class="stat__unit">{{ stat.unit }}</span>
    </div>
  </div>
</template>

<style scoped>
.stat {
  border-radius: 22px;
  padding: 22px 22px 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 140px;
  justify-content: space-between;
}

.stat__label {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.stat__value {
  display: flex;
  align-items: baseline;
  gap: 7px;
}

.stat__big {
  font-family: "Bricolage Grotesque", sans-serif;
  font-weight: 800;
  font-size: 46px;
  line-height: 0.9;
  color: #241d18;
}

.stat__unit {
  font-size: 14px;
  font-weight: 600;
  color: rgba(36, 29, 24, 0.5);
}
</style>

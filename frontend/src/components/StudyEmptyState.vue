<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>

<template>
  <div class="empty">
    <div class="empty__bars" aria-hidden="true">
      <span class="empty__bar" style="height: 22px; background: #ffe3ce"></span>
      <span class="empty__bar" style="height: 40px; background: #ffd0b0"></span>
      <span class="empty__bar" style="height: 30px; background: #ffe3ce"></span>
    </div>
    <h2 class="empty__title">No words studied yet</h2>
    <p class="empty__body">
      Head back to practice and explore a few words — your stats will start
      filling in right away.
    </p>
    <RouterLink to="/" class="empty__cta">Start studying</RouterLink>
  </div>
</template>

<style scoped>
.empty {
  background: #fff;
  border-radius: 28px;
  box-shadow: 0 24px 60px -30px rgba(40, 30, 20, 0.35);
  padding: 56px 40px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
}

.empty__bars {
  display: flex;
  gap: 6px;
  align-items: flex-end;
  height: 50px;
}

.empty__bar {
  width: 12px;
  border-radius: 4px;
}

.empty__title {
  margin: 0;
  font-family: "Bricolage Grotesque", sans-serif;
  font-weight: 700;
  font-size: 24px;
}

.empty__body {
  margin: 0;
  color: rgba(36, 29, 24, 0.55);
  max-width: 380px;
}

.empty__cta {
  text-decoration: none;
  background: #f0611c;
  color: #fff;
  font-weight: 700;
  font-size: 15px;
  padding: 13px 28px;
  border-radius: 999px;
  margin-top: 4px;
}
</style>

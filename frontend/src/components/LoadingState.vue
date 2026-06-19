<script setup lang="ts"></script>

<template>
  <div class="loading" role="status" aria-live="polite">
    <div class="loading__spinner" aria-hidden="true"></div>
    <span class="loading__text">Finding a word…</span>
  </div>
</template>

<style scoped>
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  min-height: 260px;
}

.loading__spinner {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 4px solid var(--ww-soft);
  border-top-color: var(--ww-accent);
  animation: ww-spin 0.8s linear infinite;
}

.loading__text {
  color: rgba(36, 29, 24, 0.5);
  font-weight: 500;
}
</style>

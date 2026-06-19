<script setup lang="ts">
defineProps<{ message?: string }>();
defineEmits<{ retry: [] }>();
</script>

<template>
  <div class="error" role="alert">
    <span class="error__title">Hmm, that didn't work.</span>
    <span class="error__body">
      {{ message || "Check your connection or try again — we'll grab a different word." }}
    </span>
    <button type="button" class="error__retry" @click="$emit('retry')">Try again</button>
  </div>
</template>

<style scoped>
.error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  min-height: 260px;
  text-align: center;
}

.error__title {
  font-family: "Bricolage Grotesque", sans-serif;
  font-weight: 700;
  font-size: 22px;
}

.error__body {
  color: rgba(36, 29, 24, 0.55);
  max-width: 380px;
}

.error__retry {
  border: none;
  cursor: pointer;
  background: var(--ww-accent);
  color: #fff;
  font-family: inherit;
  font-weight: 700;
  font-size: 15px;
  padding: 12px 26px;
  border-radius: 999px;
}
</style>

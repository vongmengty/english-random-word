<script setup lang="ts">
defineProps<{ message: string }>();
</script>

<template>
  <div class="toast" role="status" aria-live="polite">{{ message }}</div>
</template>

<style scoped>
.toast {
  position: fixed;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  background: #241d18;
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  padding: 11px 22px;
  border-radius: 999px;
  z-index: 50;
  animation: ww-toast 1.6s ease forwards;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
}
</style>

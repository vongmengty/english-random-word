<script setup lang="ts"></script>

<template>
  <div class="blobs" aria-hidden="true">
    <span class="blob blob--a"></span>
    <span class="blob blob--b"></span>
  </div>
</template>

<style scoped>
.blobs {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.blob {
  position: absolute;
  border-radius: 50%;
  background: var(--ww-accent);
}

.blob--a {
  top: -120px;
  right: -80px;
  width: 340px;
  height: 340px;
  opacity: 0.13;
  animation: ww-float 9s ease-in-out infinite;
}

.blob--b {
  bottom: -140px;
  left: -90px;
  width: 300px;
  height: 300px;
  opacity: 0.1;
  animation: ww-float 11s ease-in-out infinite;
}
</style>

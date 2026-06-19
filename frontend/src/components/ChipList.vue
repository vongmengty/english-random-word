<script setup lang="ts">
defineProps<{
  title: string;
  words: string[];
  variant?: "soft" | "outline";
}>();

defineEmits<{ select: [word: string] }>();
</script>

<template>
  <section v-if="words.length" class="chips">
    <h3 class="chips__title">{{ title }}</h3>
    <ul class="chips__list">
      <li v-for="word in words" :key="word">
        <button
          type="button"
          class="chip"
          :class="variant === 'outline' ? 'chip--outline' : 'chip--soft'"
          @click="$emit('select', word)"
        >
          {{ word }}
        </button>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.chips {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.chips__title {
  margin: 0;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(36, 29, 24, 0.45);
}

.chips__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-weight: 600;
  font-size: 14px;
  padding: 7px 14px;
  border-radius: 999px;
  transition: transform 0.15s ease;
}

.chip:hover {
  transform: translateY(-2px);
}

.chip--soft {
  background: var(--ww-soft);
  color: var(--ww-accent);
}

.chip--outline {
  border: 1px solid rgba(36, 29, 24, 0.14);
  background: #fff;
  color: #544a42;
  padding: 6px 13px;
}
</style>

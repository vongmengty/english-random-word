<script setup lang="ts" generic="T extends string">
import { ref } from "vue";

interface Option {
  label: string;
  value: T;
}

const props = defineProps<{
  label: string;
  modelValue: T;
  options: Option[];
}>();

const emit = defineEmits<{ "update:modelValue": [value: T] }>();

const buttons = ref<HTMLButtonElement[]>([]);

function select(value: T) {
  if (value !== props.modelValue) emit("update:modelValue", value);
}

/** Arrow-key roving focus, matching native radiogroup behaviour. */
function onKeydown(event: KeyboardEvent, index: number) {
  const last = props.options.length - 1;
  let next = index;
  if (event.key === "ArrowRight" || event.key === "ArrowDown") next = index === last ? 0 : index + 1;
  else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = index === 0 ? last : index - 1;
  else return;

  event.preventDefault();
  const option = props.options[next];
  select(option.value);
  buttons.value[next]?.focus();
}
</script>

<template>
  <div class="segmented">
    <span :id="`seg-${label}`" class="segmented__label">{{ label }}</span>
    <div
      class="segmented__track"
      role="radiogroup"
      :aria-labelledby="`seg-${label}`"
    >
      <button
        v-for="(option, index) in options"
        :key="option.value"
        :ref="(el) => { if (el) buttons[index] = el as HTMLButtonElement; }"
        type="button"
        role="radio"
        :aria-checked="option.value === modelValue"
        :tabindex="option.value === modelValue ? 0 : -1"
        class="segmented__option"
        :class="{ 'segmented__option--active': option.value === modelValue }"
        @click="select(option.value)"
        @keydown="onKeydown($event, index)"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.segmented {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.segmented__label {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(36, 29, 24, 0.5);
}

.segmented__track {
  display: flex;
  gap: 6px;
  background: rgba(255, 255, 255, 0.55);
  padding: 4px;
  border-radius: 999px;
}

.segmented__option {
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-weight: 600;
  font-size: 13px;
  padding: 7px 14px;
  border-radius: 999px;
  transition: all 0.2s ease;
  background: transparent;
  color: rgba(36, 29, 24, 0.6);
}

.segmented__option--active {
  background: var(--ww-accent);
  color: #fff;
}
</style>

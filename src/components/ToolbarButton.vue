<template>
  <button type="button" class="toolbar-button" :title="tooltip" @click="$emit('insert', insert)">
    <slot>{{ label }}</slot>
  </button>
</template>

<script setup>
import { defineProps } from 'vue'
const props = defineProps({
  label: String,
  insert: String,
  tooltip: String,
})
</script>

<style scoped>
.toolbar-button {
  background-color: var(--btn-bg);
  border: 1px solid var(--btn-border);
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  cursor: pointer;
  user-select: none;
  font-weight: bold;
  transition: background-color 0.2s;
}
.toolbar-button:hover {
  background-color: var(--btn-hover);
}
</style>

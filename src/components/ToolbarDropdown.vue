<template>
  <div class="dropdown" @mouseleave="close">
    <button type="button" class="toolbar-button" :title="tooltip" @click="toggle">
      {{ label }} ▼
    </button>
    <ul v-show="open" class="dropdown-menu">
      <li
        v-for="item in items"
        :key="item.label"
        class="dropdown-item"
        :title="item.tooltip"
        @click="select(item.insert)"
      >
        {{ item.label }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  label: String,
  tooltip: String,
  items: Array,
})
const emit = defineEmits(['insert'])

const open = ref(false)
function toggle() {
  open.value = !open.value
}
function close() {
  open.value = false
}
function select(text) {
  emit('insert', text)
  close()
}
</script>

<style scoped>
.dropdown {
  position: relative;
}
.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background: var(--dropdown-bg);
  border: 1px solid var(--dropdown-border);
  border-radius: 4px;
  padding: 0.3rem 0;
  min-width: 150px;
  z-index: 100;
  box-shadow: 0 3px 5px rgb(0 0 0 / 0.1);
}
.dropdown-menu li {
  list-style: none;
  padding: 0.3rem 0.8rem;
  cursor: pointer;
  white-space: nowrap;
}
.dropdown-menu li:hover {
  background-color: var(--dropdown-hover);
}
</style>

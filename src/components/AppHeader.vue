<template>
  <header class="app-header">
    <h1 class="title">Markdown Editor</h1>
    <label
      class="switch"
      :aria-checked="isDarkMode"
      role="switch"
      tabindex="0"
      @keydown.space.prevent="toggle()"
      @keydown.enter.prevent="toggle()"
    >
      <input type="checkbox" v-model="checked" @change="toggle" />
      <span class="slider"></span>
      <span class="label-text">Dark Mode</span>
    </label>
  </header>
</template>

<script setup>
import { watch, ref } from 'vue'

const props = defineProps({
  isDarkMode: Boolean,
})
const emit = defineEmits(['toggle-dark-mode'])

const checked = ref(props.isDarkMode)

watch(
  () => props.isDarkMode,
  (val) => {
    checked.value = val
  },
)

function toggle() {
  checked.value = !checked.value
  emit('toggle-dark-mode')
}
</script>

<style scoped>
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: #252532;
  color: #d4d4d4;
  box-shadow: 0 2px 8px rgb(0 0 0 / 0.6);
  user-select: none;
  font-family: 'Inter', sans-serif;
}

.title {
  font-weight: 600;
  font-size: 1.5rem;
  letter-spacing: 0.05em;
}

.switch {
  position: relative;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
}

.slider {
  position: relative;
  width: 52px;
  height: 28px;
  background-color: #ccc;
  border-radius: 14px;
  transition: background-color 0.3s;
  flex-shrink: 0;
}

.slider::before {
  position: absolute;
  content: '';
  height: 24px;
  width: 24px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.4);
}

input:checked + .slider {
  background-color: #4a90e2;
}

input:checked + .slider::before {
  transform: translateX(24px);
}

.label-text {
  margin-left: 0.75rem;
  color: #d4d4d4;
  font-weight: 500;
  font-size: 1rem;
  user-select: none;
}

/* Accessibility focus style */
.switch:focus-visible .slider {
  box-shadow: 0 0 0 3px #4a90e2aa;
  outline: none;
}
</style>

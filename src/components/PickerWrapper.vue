<template>
  <div class="picker-wrapper" :style="{ top: position.top + 'px', left: position.left + 'px' }">
    <div class="picker-header" @mousedown="startDrag">
      <span>😊 Emoji Picker</span>
      <button @click="close" class="close-btn">×</button>
    </div>

    <div class="picker-body" @mousedown.stop>
      <EmojiPicker :theme="theme" @select="onSelect" :disable-sticky-group-header="true" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import EmojiPicker from 'vue3-emoji-picker'
import 'vue3-emoji-picker/css'

const emit = defineEmits(['close', 'select'])
const props = defineProps<{ theme?: string }>()

const position = ref({ top: 100, left: 100 })
let dragging = false
const offset = { x: 0, y: 0 }

const startDrag = (e: MouseEvent) => {
  dragging = true
  offset.x = e.clientX - position.value.left
  offset.y = e.clientY - position.value.top

  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
}

const onDrag = (e: MouseEvent) => {
  if (!dragging) return
  position.value.left = e.clientX - offset.x
  position.value.top = e.clientY - offset.y
}

const stopDrag = () => {
  dragging = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}

const onSelect = (emoji: any) => {
  emit('select', emoji)
}

const close = () => {
  emit('close')
}
</script>

<style scoped>
.picker-wrapper {
  position: absolute;
  z-index: 2000;
  background: var(--vp-bg, white);
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.2);
  width: 340px;
}

.picker-header {
  cursor: move;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #0078d4;
  color: white;
  padding: 0.5rem 1rem;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  font-weight: bold;
  font-size: 0.9rem;
}

.close-btn {
  background: transparent;
  color: white;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
}

.picker-body {
  padding: 0.5rem;
}
</style>

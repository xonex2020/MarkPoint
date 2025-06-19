<template>
  <button class="convert-button" @click="$emit('convert')">
    <span class="button-content">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M8 16V8H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        <path d="M8 8L16 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
      Convert & Copy
    </span>
  </button>
</template>

<script setup>
defineProps({
  markdown: {
    type: String,
    default: '',
  },
  htmlPreview: {
    type: String,
    default: '',
  },
})

defineEmits(['convert'])
</script>

<style scoped>
.convert-button {
  background-color: #0078d4;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-family: inherit;
  transition:
    background-color 0.2s ease,
    transform 0.1s ease;
  display: inline-flex;
  align-items: center;
}

.convert-button:hover {
  background-color: #106ebe;
  transform: translateY(-1px);
}

.convert-button:active {
  transform: translateY(0);
}

.button-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.button-content svg {
  transition: transform 0.2s ease;
}

.convert-button:hover .button-content svg {
  transform: translateX(2px);
}

.dark .convert-button {
  background-color: #1a86e0;
}
</style>

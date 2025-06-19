<template>
  <header class="header">
    <h1>MarkPoint – Markdown to SharePoint HTML</h1>
    <label class="toggle-darkmode" title="Dark Mode ein/aus">
      <input type="checkbox" v-model="darkMode" />
      Dark Mode
    </label>
  </header>
</template>

<script setup>
import { defineProps } from 'vue'
const props = defineProps({ darkMode: Boolean })
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
</style>

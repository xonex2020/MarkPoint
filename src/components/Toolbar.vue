<template>
  <div class="toolbar">
    <button @click="insert('**', '**', 'Fett')" title="Fett"><b>B</b></button>
    <button @click="insert('*', '*', 'Kursiv')" title="Kursiv"><i>I</i></button>
    <button @click="insert('~~', '~~', 'Durchgestrichen')" title="Durchgestrichen"><s>S</s></button>
    <button @click="insert('`', '`', 'Code')" title="Code">&lt;/&gt;</button>
    <button @click="insertLink" title="Link einfügen">🔗</button>
    <button @click="insertImage" title="Bild einfügen">🖼️</button>
    <button @click="$emit('toggleEmojiPicker')" title="Emoji">😊</button>
    <button @click="openTableModal" title="Tabelle einfügen">📊</button>

    <TableInsertModal v-if="showTableModal" @insert="insertTable" @close="showTableModal = false" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import TableInsertModal from './TableInsertModal.vue'

const emit = defineEmits(['insert', 'insertRaw', 'toggleEmojiPicker'])

const showTableModal = ref(false)

function insert(before, after, placeholder) {
  emit('insert', { before, after, placeholder })
}

function openTableModal() {
  showTableModal.value = true
}

function insertTable(tableMarkdown) {
  emit('insertRaw', tableMarkdown)
  showTableModal.value = false
}

function insertLink() {
  const url = window.prompt('URL des Links eingeben:', 'https://')
  if (!url) return
  const text = window.prompt('Linktext eingeben (optional):', 'Linktext') || 'Linktext'
  const markdown = `[${text}](${url})`
  emit('insertRaw', markdown)
}

function insertImage() {
  const url = window.prompt('URL des Bildes eingeben:', 'https://')
  if (!url) return
  const alt = window.prompt('Alternativer Text für das Bild (optional):', '') || ''
  const markdown = `![${alt}](${url})`
  emit('insertRaw', markdown)
}
</script>

<style scoped>
.toolbar {
  background: var(--vp-bg-toolbar, #1e1e1e);
  padding: 0.5rem;
  display: flex;
  gap: 0.3rem;
  border-bottom: 1px solid #444;
}

button {
  background: transparent;
  border: none;
  color: var(--vp-text-toolbar, #ccc);
  font-size: 1.1rem;
  cursor: pointer;
  padding: 0.3rem 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

button:hover {
  background-color: #0078d4;
  color: white;
}
</style>

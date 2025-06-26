<template>
  <div class="toolbar">
    <select v-model="selectedHeading" @change="insertHeading">
      <option disabled value="">Überschrift</option>
      <option value="# ">H1</option>
      <option value="## ">H2</option>
      <option value="### ">H3</option>
      <option value="#### ">H4</option>
      <option value="##### ">H5</option>
      <option value="###### ">H6</option>
    </select>

    <button @click="emitInsertList('unordered')" title="Ungeordnete Liste">• List</button>
    <button @click="emitInsertList('ordered')" title="Geordnete Liste">1. List</button>
    <button @click="emitInsertRaw(prefixLines('> '))" title="Zitat">❝</button>
    <button @click="emitInsertRaw(wrapCodeBlock())" title="Code Block">&lt;/&gt;</button>

    <button @click="emitInsert('**', '**', 'Fett')" title="Fett"><b>B</b></button>
    <button @click="emitInsert('*', '*', 'Kursiv')" title="Kursiv"><i>I</i></button>
    <button @click="emitInsert('~~', '~~', 'Durchgestrichen')" title="Durchgestrichen">
      <s>S</s>
    </button>
    <button @click="$emit('toggleEmojiPicker')" title="Emoji">😊</button>

    <button @click="insertLink" title="Link einfügen">🔗</button>
    <button @click="insertImage" title="Bild einfügen">🖼️</button>
    <button @click="openTableModal" title="Tabelle einfügen">📊</button>

    <TableInsertModal v-if="showTableModal" @insert="insertTable" @close="showTableModal = false" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TableInsertModal from './TableInsertModal.vue'

type InsertPayload = { before: string; after: string; placeholder: string }
type InsertListPayload = { type: string }

const emit = defineEmits<{
  (e: 'insert', payload: InsertPayload): void
  (e: 'insertRaw', content: string): void
  (e: 'insertList', payload: InsertListPayload): void
  (e: 'toggleEmojiPicker'): void
}>()

const showTableModal = ref(false)
const selectedHeading = ref('')

function emitInsert(before: string, after: string, placeholder: string) {
  emit('insert', { before, after, placeholder })
}

function emitInsertRaw(content: string) {
  emit('insertRaw', content)
}

function emitInsertList(type: string) {
  emit('insertList', { type })
}

function openTableModal() {
  showTableModal.value = true
}

function insertTable(tableMarkdown: string) {
  emit('insertRaw', tableMarkdown)
  showTableModal.value = false
}

function insertLink() {
  const url = window.prompt('URL des Links eingeben:', 'https://')
  if (!url) return
  const text = window.prompt('Linktext eingeben (optional):', 'Linktext') || 'Linktext'
  const markdown = `[${text}](${url})`
  emitInsertRaw(markdown)
}

function insertImage() {
  const url = window.prompt('URL des Bildes eingeben:', 'https://')
  if (!url) return
  const alt = window.prompt('Alternativer Text für das Bild (optional):', '') || ''
  const markdown = `![${alt}](${url})`
  emitInsertRaw(markdown)
}

function insertHeading() {
  if (!selectedHeading.value) return
  emitInsertRaw(selectedHeading.value)
  selectedHeading.value = ''
}

function prefixLines(prefix: string) {
  return prefix + '<<selected text>>'
}

function wrapCodeBlock() {
  return '```\n<<selected text>>\n```'
}
</script>

<style scoped>
.toolbar {
  background: var(--vp-bg-toolbar, #1e1e1e);
  padding: 0.5rem;
  display: flex;
  gap: 0.3rem;
  align-items: center;
  border-bottom: 1px solid #444;
}

select {
  background: var(--vp-bg-toolbar, #111);
  color: var(--vp-text-toolbar, #ccc);
  border: none;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  font-weight: bold;
  cursor: pointer;
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

button:hover,
select:hover {
  background-color: #0078d4;
  color: white;
}
</style>

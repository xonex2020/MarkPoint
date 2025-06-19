<template>
  <div class="app">
    <Toolbar
      @insert="handleInsert"
      @insertRaw="handleInsertRaw"
      @insertList="handleInsertList"
      @toggleEmojiPicker="showEmojiPicker = !showEmojiPicker"
    />

    <EmojiPickerWrapper
      v-if="showEmojiPicker"
      @select="onEmojiSelect"
      @close="showEmojiPicker = false"
      :theme="theme"
    />

    <div class="editor-container">
      <textarea
        ref="textarea"
        v-model="markdown"
        @scroll="syncScroll"
        :style="{ width: editorWidth + 'px' }"
        placeholder="Markdown hier eingeben..."
      ></textarea>

      <div class="resizer" @mousedown.prevent="startResize"></div>

      <div
        class="preview"
        ref="preview"
        v-html="renderedMarkdown"
        @scroll="syncScrollPreview"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import { marked } from 'marked'
import Toolbar from './components/Toolbar.vue'
import EmojiPickerWrapper from './components/EmojiPicker.vue'

const markdown = ref('')
const textarea = ref(null)
const preview = ref(null)
const showEmojiPicker = ref(false)
const editorWidth = ref(600)
const theme = ref('light')

let resizing = false
let startX = 0
let startWidth = 0

const renderedMarkdown = computed(() => {
  return marked.parse(markdown.value)
})

function syncScroll() {
  if (!textarea.value || !preview.value) return
  const ratio =
    textarea.value.scrollTop / (textarea.value.scrollHeight - textarea.value.clientHeight)
  preview.value.scrollTop = ratio * (preview.value.scrollHeight - preview.value.clientHeight)
}

function syncScrollPreview() {
  if (!textarea.value || !preview.value) return
  const ratio = preview.value.scrollTop / (preview.value.scrollHeight - preview.value.clientHeight)
  textarea.value.scrollTop = ratio * (textarea.value.scrollHeight - textarea.value.clientHeight)
}

// Basisfunktion für Einfügen mit before/after und Platzhalter
function handleInsert({ before, after, placeholder }) {
  const el = textarea.value
  if (!el) return
  const start = el.selectionStart
  const end = el.selectionEnd
  const selectedText = markdown.value.slice(start, end)
  const textToInsert = selectedText || placeholder || ''
  const newText = before + textToInsert + after

  markdown.value = markdown.value.slice(0, start) + newText + markdown.value.slice(end)

  setTimeout(() => {
    el.focus()
    const cursorPos = start + before.length + textToInsert.length + after.length
    el.setSelectionRange(cursorPos, cursorPos)
  }, 0)
}

// Raw-Inhalt einfügen (z.B. Tabelle, Links, Bilder, Zitat etc.)
function handleInsertRaw(content) {
  const el = textarea.value
  if (!el) return

  const start = el.selectionStart
  const end = el.selectionEnd

  // Falls Toolbar Platzhalter schickt, ersetze durch echten selektierten Text
  if (typeof content === 'string' && content.includes('<<selected text>>')) {
    const selectedText = markdown.value.slice(start, end)
    content = content.replace(/<<selected text>>/g, selectedText || '')
  }

  markdown.value = markdown.value.slice(0, start) + content + markdown.value.slice(end)

  setTimeout(() => {
    el.focus()
    const cursorPos = start + content.length
    el.setSelectionRange(cursorPos, cursorPos)
  }, 0)
}

// Listen einfügen, die über mehrere Zeilen gehen
function handleInsertList({ type }) {
  const el = textarea.value
  if (!el) return

  const start = el.selectionStart
  const end = el.selectionEnd
  const selectedText = markdown.value.slice(start, end)
  const lines = selectedText.split('\n')

  let newText = ''
  if (type === 'unordered') {
    newText = lines.map((line) => (line.trim() ? `- ${line}` : line)).join('\n')
  } else if (type === 'ordered') {
    let count = 1
    newText = lines.map((line) => (line.trim() ? `${count++}. ${line}` : line)).join('\n')
  }

  markdown.value = markdown.value.slice(0, start) + newText + markdown.value.slice(end)

  setTimeout(() => {
    el.focus()
    el.setSelectionRange(start, start + newText.length)
  }, 0)
}

function onEmojiSelect(emoji) {
  handleInsertRaw(emoji.native || emoji.colons || emoji.unified || '')
  showEmojiPicker.value = false
}

// Resizer-Logik
function startResize(e) {
  resizing = true
  startX = e.clientX
  startWidth = editorWidth.value

  window.addEventListener('mousemove', onResize)
  window.addEventListener('mouseup', stopResize)
}

function onResize(e) {
  if (!resizing) return
  const diff = e.clientX - startX
  editorWidth.value = Math.max(300, startWidth + diff)
}

function stopResize() {
  resizing = false
  window.removeEventListener('mousemove', onResize)
  window.removeEventListener('mouseup', stopResize)
}

onBeforeUnmount(() => {
  stopResize()
})
</script>

<style scoped>
.app {
  font-family: Arial, sans-serif;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.editor-container {
  flex-grow: 1;
  display: flex;
  overflow: hidden;
  border-top: 1px solid #444;
}

textarea {
  height: 100%;
  resize: none;
  border: none;
  outline: none;
  padding: 1rem;
  font-size: 1rem;
  font-family: 'Courier New', monospace;
  background-color: #1e1e1e;
  color: #ddd;
  flex-shrink: 0;
}

.resizer {
  width: 5px;
  cursor: ew-resize;
  background-color: #444;
  user-select: none;
}

.preview {
  flex-grow: 1;
  overflow-y: auto;
  padding: 1rem;
  background-color: #252526;
  color: white;
  font-family: Arial, sans-serif;
  border-left: 1px solid #444;
}
</style>

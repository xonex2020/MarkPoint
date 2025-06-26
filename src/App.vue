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

      <div class="preview-panel">
        <button @click="copyHtml" class="copy-html-btn" :disabled="!markdown">
          <svg height="20" width="20" viewBox="0 0 16 16" style="vertical-align:middle;margin-right:5px;fill:#adbac7">
            <path d="M10 1.75A.75.75 0 0 0 9.25 1h-7.5A.75.75 0 0 0 1 1.75v9.5c0 .414.336.75.75.75h7.5a.75.75 0 0 0 .75-.75V1.75Zm-1.5.75v8h-6v-8h6Zm2.5 2a.75.75 0 0 1 1.5 0v9.5A2.25 2.25 0 0 1 10.25 16h-7.5A2.25 2.25 0 0 1 .5 13.25v-9.5a.75.75 0 0 1 1.5 0v9.5c0 .414.336.75.75.75h7.5a.75.75 0 0 0 .75-.75v-9.5Z"></path>
          </svg>
          HTML kopieren
        </button>
        <span v-if="copied" class="copied-hint">✔ Kopiert!</span>
        <div
          class="preview"
          ref="preview"
          v-html="renderedMarkdown"
          @scroll="syncScrollPreview"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue'
import { marked } from 'marked'
import Toolbar from './components/Toolbar.vue'
import EmojiPickerWrapper from './components/EmojiPicker.vue'

const markdown = ref('')
const textarea = ref<HTMLTextAreaElement | null>(null)
const preview = ref<HTMLElement | null>(null)
const showEmojiPicker = ref(false)
const editorWidth = ref(600)
const theme = ref<'light' | 'dark'>('light')

let resizing = false
let startX = 0
let startWidth = 0

const copied = ref(false)

const renderedMarkdown = computed<string | Promise<string>>(() => {
  return marked.parse(markdown.value)
})

function isPromise<T>(val: unknown): val is Promise<T> {
  return !!val && typeof (val as { then?: unknown }).then === 'function'
}

async function copyHtml() {
  let htmlContent = renderedMarkdown.value
  if (isPromise<string>(htmlContent)) {
    htmlContent = await htmlContent
  }
  await navigator.clipboard.writeText(htmlContent)
  copied.value = true
  setTimeout(() => (copied.value = false), 1300)
}

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

function handleInsert({ before, after, placeholder }: { before: string; after: string; placeholder?: string }) {
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

function handleInsertRaw(content: string) {
  const el = textarea.value
  if (!el) return

  const start = el.selectionStart
  const end = el.selectionEnd

  markdown.value = markdown.value.slice(0, start) + content + markdown.value.slice(end)

  setTimeout(() => {
    el.focus()
    const cursorPos = start + content.length
    el.setSelectionRange(cursorPos, cursorPos)
  }, 0)
}

function handleInsertList({ type }: { type: 'ordered' | 'unordered' }) {
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

// ---------------
// Emoji-Insert jetzt mit Property `i` als Priorität:
function onEmojiSelect(
  emoji: { i?: string; native?: string; emoji?: string; colons?: string; unified?: string }
) {
  const symbol = emoji.i || emoji.native || emoji.emoji || emoji.colons || emoji.unified || ''
  if (symbol) {
    handleInsertRaw(symbol)
  } else {
    console.warn('Kein Emoji gefunden:', emoji)
  }
  showEmojiPicker.value = false
}
// ---------------

function startResize(e: MouseEvent) {
  resizing = true
  startX = e.clientX
  startWidth = editorWidth.value

  window.addEventListener('mousemove', onResize)
  window.addEventListener('mouseup', stopResize)
}

function onResize(e: MouseEvent) {
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

.preview-panel {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  background-color: #252526;
  border-left: 1px solid #444;
}

.copy-html-btn {
  align-self: flex-end;
  margin: 1rem 1.5rem 0 0;
  background: #373e47;
  color: #adbac7;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1.1rem 0.5rem 1rem;
  cursor: pointer;
  font-size: 1rem;
  font-family: inherit;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 2px 6px #2226;
  transition: background 0.18s, box-shadow 0.16s;
}
.copy-html-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.copy-html-btn:hover:enabled {
  background: #444c56;
  box-shadow: 0 2px 12px #2229;
}
.copied-hint {
  color: #6cb6ff;
  margin-right: 1.5rem;
  align-self: flex-end;
  font-size: 0.95rem;
  transition: opacity 0.18s;
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

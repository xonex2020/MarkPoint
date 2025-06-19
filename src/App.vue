<template>
  <div class="app-container" ref="container">
    <!-- Editor -->
    <section class="editor" ref="editor">
      <div class="toolbar">
        <button @click="insert('**', '**', 'Fett')" title="Fett"><b>B</b></button>
        <button @click="insert('*', '*', 'Kursiv')" title="Kursiv"><i>I</i></button>
        <button @click="insert('~~', '~~', 'Durchgestrichen')" title="Durchgestrichen">
          <s>S</s>
        </button>
        <button @click="insert('`', '`', 'Code')" title="Code">&lt;/&gt;</button>
        <button @click="toggleEmojiPicker" title="Emoji">😊</button>
      </div>
      <textarea
        ref="textarea"
        v-model="markdown"
        @scroll="syncScroll"
        placeholder="Schreibe Markdown..."
      ></textarea>

      <!-- Emoji Picker (draggable) -->
      <EmojiPickerWrapper
        v-if="showEmojiPicker"
        :theme="'dark'"
        @select="onEmojiSelect"
        @close="showEmojiPicker = false"
      />
    </section>

    <!-- Resizer -->
    <div class="resizer" @mousedown="startResize" />

    <!-- Vorschau -->
    <section class="preview" ref="preview" v-html="renderedMarkdown"></section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { marked } from 'marked'
import EmojiPickerWrapper from '@/components/EmojiPicker.vue'

const markdown = ref(`# Willkommen bei MarkPoint\n\nMarkdown + Emojis 😄`)
const textarea = ref(null)
const preview = ref(null)
const container = ref(null)
const editor = ref(null)

// Scroll Sync
function syncScroll() {
  const t = textarea.value
  const p = preview.value
  const ratio = t.scrollTop / (t.scrollHeight - t.clientHeight)
  p.scrollTop = ratio * (p.scrollHeight - p.clientHeight)
}

// Insert Markdown format
function insert(before, after, placeholder) {
  const el = textarea.value
  const start = el.selectionStart
  const end = el.selectionEnd
  const selected = markdown.value.slice(start, end) || placeholder
  const beforeText = markdown.value.slice(0, start)
  const afterText = markdown.value.slice(end)
  markdown.value = beforeText + before + selected + after + afterText
  setTimeout(() => {
    el.focus()
    el.setSelectionRange(start + before.length, start + before.length + selected.length)
  }, 0)
}

// Emoji Picker
const showEmojiPicker = ref(false)
function toggleEmojiPicker() {
  showEmojiPicker.value = !showEmojiPicker.value
}

function onEmojiSelect(emoji) {
  const el = textarea.value
  const start = el.selectionStart
  const end = el.selectionEnd
  const before = markdown.value.slice(0, start)
  const after = markdown.value.slice(end)
  markdown.value = before + emoji.i + after
  setTimeout(() => {
    el.focus()
    el.setSelectionRange(start + emoji.i.length, start + emoji.i.length)
  }, 0)
}

// Markdown Parser
const renderedMarkdown = computed(() => marked.parse(markdown.value))

// Resizer
let startX = 0
let startWidth = 0

function startResize(e) {
  startX = e.clientX
  startWidth = editor.value.offsetWidth
  document.addEventListener('mousemove', resize)
  document.addEventListener('mouseup', stopResize)
}

function resize(e) {
  const dx = e.clientX - startX
  const newWidth = startWidth + dx
  const total = container.value.clientWidth
  const percent = Math.max(10, Math.min(90, (newWidth / total) * 100))
  editor.value.style.flex = `0 0 ${percent}%`
}

function stopResize() {
  document.removeEventListener('mousemove', resize)
  document.removeEventListener('mouseup', stopResize)
}
</script>

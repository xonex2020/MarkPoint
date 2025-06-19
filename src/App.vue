<template>
  <div :class="['app', { dark: isDarkMode }]">
    <AppHeader @toggle-dark-mode="toggleDarkMode" :isDarkMode="isDarkMode" />

    <main class="main-content">
      <InfoText />

      <Toolbar @format="handleFormat" @toggle-emoji-picker="toggleEmojiPicker" />

      <div class="editor-preview-container">
        <div class="editor-box" style="position: relative">
          <Editor v-model="markdownText" ref="editorRef" />

          <!-- Beweglicher Emoji Picker -->
          <PickerWrapper
            v-if="showEmojiPicker"
            :theme="isDarkMode ? 'dark' : 'light'"
            @close="showEmojiPicker = false"
            @select="insertEmoji"
          />
        </div>

        <div class="preview-box">
          <div class="preview" v-html="htmlPreview"></div>
        </div>
      </div>

      <div class="action-bar">
        <ConvertButton
          @convert="convertAndCopy"
          :markdown="markdownText"
          :htmlPreview="htmlPreview"
        />
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import html from 'highlight.js/lib/languages/xml'
import css from 'highlight.js/lib/languages/css'
import { marked } from 'marked'

// Importiere den beweglichen Emoji Picker Wrapper
import PickerWrapper from './components/PickerWrapper.vue'

import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import InfoText from './components/InfoText.vue'
import Toolbar from './components/Toolbar.vue'
import Editor from './components/Editor.vue'
import ConvertButton from './components/ConvertButton.vue'

// Highlight.js Setup
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('html', html)
hljs.registerLanguage('css', css)

// Reactive state
const isDarkMode = ref(false)
const markdownText = ref('')
const editorRef = ref(null)

// Emoji Picker sichtbar
const showEmojiPicker = ref(false)

// Emoji Picker togglen
const toggleEmojiPicker = () => {
  showEmojiPicker.value = !showEmojiPicker.value
}

// Emoji in Editor einfügen
const insertEmoji = (emoji) => {
  const view = editorRef.value?.editorView
  if (!view) {
    console.error('EditorView nicht verfügbar')
    return
  }

  // emoji object hat ein property 'native' mit dem Emoji Zeichen
  const emojiChar = emoji.native ?? ''

  const state = view.state
  const { from, to } = state.selection.main

  view.dispatch({
    changes: { from, to, insert: emojiChar },
    selection: { anchor: from + emojiChar.length },
  })
  view.focus()

  // Picker schließen nach Einfügen
  showEmojiPicker.value = false
}

// MARKED RENDERER ANPASSUNGEN

const renderer = new marked.Renderer()

// Codeblock mit Syntax-Highlighting
renderer.code = (code, lang) => {
  const validLang = hljs.getLanguage(lang) ? lang : 'plaintext'
  const highlighted = hljs.highlight(code, { language: validLang })
  return `
    <div class="code-container" data-language="${validLang}">
      <pre><code class="hljs language-${validLang}">${highlighted.value}</code></pre>
    </div>
  `
}

// Tabellen sauber und SharePoint-kompatibel rendern
renderer.table = (header, body) => {
  return `
    <table>
      <thead>${header}</thead>
      <tbody>${body}</tbody>
    </table>
  `
}

renderer.tablerow = (content) => {
  return `<tr>${content}</tr>`
}

renderer.tablecell = (content, flags) => {
  const tag = flags.header ? 'th' : 'td'
  const align = flags.align ? ` style="text-align:${flags.align}"` : ''
  return `<${tag}${align}>${content}</${tag}>`
}

// Optional: Link-Renderer für SharePoint optimieren (z.B. target _blank)
renderer.link = (href, title, text) => {
  const titleAttr = title ? ` title="${title}"` : ''
  return `<a href="${href}"${titleAttr} target="_blank" rel="noopener noreferrer">${text}</a>`
}

marked.setOptions({
  breaks: true,
  gfm: true,
  renderer,
})

// Dark Mode Toggle
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
}

// Formatierung anwenden (Toolbar Callback)
const handleFormat = (format) => {
  try {
    if (format.isBlock) {
      insertContent(format.prefix + (format.suffix || ''))
    } else {
      wrapSelection({
        before: format.prefix,
        after: format.suffix || format.prefix,
      })
    }
  } catch (error) {
    console.error('Formatierungsfehler:', error)
  }
}

// Umschließen oder Entfernen von Präfix/Suffix in Auswahl
const wrapSelection = ({ before, after }) => {
  try {
    const view = editorRef.value?.editorView
    if (!view) return console.error('EditorView nicht verfügbar')

    const state = view.state
    const { from, to } = state.selection.main
    const selectedText = state.doc.sliceString(from, to)

    const isWrapped = selectedText.startsWith(before) && selectedText.endsWith(after)
    const newText = isWrapped
      ? selectedText.slice(before.length, selectedText.length - after.length)
      : before + selectedText + after

    view.dispatch({
      changes: { from, to, insert: newText },
      selection: {
        anchor: from + (isWrapped ? -before.length : before.length),
        head: from + newText.length,
      },
    })

    view.focus()
  } catch (error) {
    console.error('Fehler beim Formatieren:', error)
  }
}

// Inhalt mit Platzhalter $SELECTION einfügen
const insertContent = (content) => {
  try {
    const view = editorRef.value?.editorView
    if (!view) return console.error('EditorView nicht verfügbar')

    const state = view.state
    const { from, to } = state.selection.main
    const selectedText = state.doc.sliceString(from, to)

    const result = content.replace('$SELECTION', selectedText)

    view.dispatch({
      changes: { from, to, insert: result },
      selection: {
        anchor: from + result.length,
        head: from + result.length,
      },
    })

    view.focus()
  } catch (error) {
    console.error('Fehler beim Einfügen:', error)
  }
}

// Computed: Vorschau-HTML
const htmlPreview = computed(() => {
  try {
    return marked.parse(markdownText.value)
  } catch (error) {
    console.error('Markdown-Parsing-Fehler:', error)
    return '<p>Fehler beim Rendern des Markdowns</p>'
  }
})

// HTML aus Vorschau kopieren (für SharePoint Export optimiert)
const convertAndCopy = () => {
  try {
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = htmlPreview.value

    // Codeblöcke für SharePoint anpassen: Keine extra Einrückungen, Tabs erhalten
    tempDiv.querySelectorAll('pre code').forEach((block) => {
      // Entferne überflüssige Einrückungen, Zeilenumbrüche beibehalten
      let codeText = block.textContent || ''
      // Ersetze HTML Entities, da SharePoint oft Plaintext erwartet
      codeText = codeText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      block.innerHTML = codeText
    })

    // Für Tabellen und andere Elemente keine Änderungen (sauber lassen)

    const htmlToCopy = tempDiv.innerHTML

    navigator.clipboard
      .writeText(htmlToCopy)
      .then(() => alert('HTML erfolgreich kopiert!'))
      .catch((err) => console.error('Kopierfehler:', err))
      .finally(() => tempDiv.remove())
  } catch (error) {
    console.error('Fehler beim Kopieren des Inhalts', error)
    alert('Fehler beim Kopieren des Inhalts')
  }
}
</script>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.editor-preview-container {
  display: flex;
  gap: 1.5rem;
  flex: 1;
  min-height: 400px;
}

.editor-box,
.preview-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
}

.action-bar {
  display: flex;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

@media (max-width: 768px) {
  .editor-preview-container {
    flex-direction: column;
    min-height: auto;
  }

  .editor-box,
  .preview-box {
    min-height: 300px;
  }

  .main-content {
    padding: 1rem;
  }
}
</style>

<style>
.preview {
  height: 100%;
  padding: 1.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  overflow-y: auto;
  background: white;
  color: #333;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans',
    'Helvetica Neue', sans-serif;
}

.dark .preview {
  background: #1e1e1e;
  border-color: #444;
  color: #e0e0e0;
}

.code-container {
  position: relative;
  margin: 1rem 0;
  background: #f5f5f5;
  border-radius: 6px;
  overflow: hidden;
  font-family: 'Fira Code', monospace;
  font-size: 14px;
  line-height: 1.4;
}

.dark .code-container {
  background: #252526;
}

.code-container pre {
  margin: 0 !important;
  padding: 1rem !important;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
  word-wrap: break-word;
}

.code-container pre code {
  white-space: inherit !important;
  display: block !important;
  padding: 0 !important;
  background: transparent !important;
}

.code-container::before {
  content: attr(data-language);
  position: absolute;
  top: 0;
  right: 0;
  background: #0078d4;
  color: white;
  padding: 0.2rem 0.8rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  border-bottom-left-radius: 4px;
  font-family: 'Fira Code', monospace;
}

.preview::-webkit-scrollbar {
  width: 10px;
}

.preview::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 5px;
}

.dark .preview::-webkit-scrollbar-thumb {
  background: #555;
}

.preview table {
  border-collapse: collapse;
  width: 100%;
  margin: 1rem 0;
}

.preview th,
.preview td {
  border: 1px solid #ddd;
  padding: 8px;
  vertical-align: top;
}

.dark .preview th,
.dark .preview td {
  border-color: #444;
}

.preview th {
  background-color: #f2f2f2;
  font-weight: 600;
}

.dark .preview th {
  background-color: #333;
}
</style>

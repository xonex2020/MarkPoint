<template>
  <div class="markdown-converter">
    <textarea
      v-model="markdown"
      rows="10"
      cols="60"
      placeholder="Markdown hier eingeben..."
      class="editor"
    ></textarea>
    <button @click="convert" class="convert-btn">In HTML umwandeln</button>
    <button @click="copyHtml" class="copy-btn">HTML kopieren</button>
    <div class="output" v-html="html"></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { marked } from 'marked'

const markdown = ref('')
const html = ref('')

async function convert() {
  html.value = await marked.parse(markdown.value)
}

function copyHtml() {
  navigator.clipboard.writeText(html.value)
}
</script>

<style scoped>
.markdown-converter {
  background: #22272e;
  color: #adbac7;
  padding: 2rem;
  border-radius: 8px;
  max-width: 700px;
  margin: 2rem auto;
  box-shadow: 0 0 24px #1a1a1a88;
}
.editor {
  width: 100%;
  background: #2d333b;
  color: #adbac7;
  border: none;
  border-radius: 4px;
  padding: 1rem;
  font-size: 1.1rem;
  font-family: 'Fira Mono', 'Consolas', 'Menlo', monospace;
  margin-bottom: 1rem;
}
.convert-btn, .copy-btn {
  background: #373e47;
  color: #adbac7;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1.2rem;
  margin-right: 1rem;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.15s;
}
.convert-btn:hover, .copy-btn:hover {
  background: #444c56;
}
.output {
  background: #22272e;
  color: #adbac7;
  border: 1px solid #444c56;
  border-radius: 4px;
  padding: 1rem;
  margin-top: 1.5rem;
  min-height: 100px;
  font-size: 1.08rem;
  overflow-x: auto;
}
</style>

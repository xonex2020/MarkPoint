<template>
  <div class="toolbar">
    <!-- Textformatierung -->
    <button @click="formatInline('bold')" title="Fett (Strg+B)"><b>B</b></button>
    <button @click="formatInline('italic')" title="Kursiv (Strg+I)"><i>I</i></button>
    <button @click="formatInline('underline')" title="Unterstrichen">
      <span style="text-decoration: underline">U</span>
    </button>
    <button @click="formatInline('strikethrough')" title="Durchgestrichen"><s>S</s></button>
    <button @click="formatInline('code')" title="Inline-Code"><code>C</code></button>

    <!-- Emoji Button -->
    <button @click="$emit('toggle-emoji-picker')" title="Emoji einfügen">😊</button>

    <button @click="insertLink()" title="Link einfügen">🔗</button>
    <button @click="insertImage()" title="Bild einfügen">🖼️</button>

    <!-- Überschriften Dropdown -->
    <div class="dropdown" @mouseleave="activeDropdown !== 'heading' && (activeDropdown = null)">
      <button @click="toggleDropdown('heading')">Überschrift ▼</button>
      <div v-if="activeDropdown === 'heading'" class="dropdown-menu">
        <button @click="formatBlock('heading', 1)">H1</button>
        <button @click="formatBlock('heading', 2)">H2</button>
        <button @click="formatBlock('heading', 3)">H3</button>
      </div>
    </div>

    <!-- Listen Dropdown -->
    <div class="dropdown" @mouseleave="activeDropdown !== 'list' && (activeDropdown = null)">
      <button @click="toggleDropdown('list')">Liste ▼</button>
      <div v-if="activeDropdown === 'list'" class="dropdown-menu">
        <button @click="formatBlock('ul')">• Ungeordnet</button>
        <button @click="formatBlock('ol')">1. Geordnet</button>
        <button @click="formatBlock('task')">- [ ] Aufgabe</button>
      </div>
    </div>

    <!-- Blöcke -->
    <button @click="formatBlock('quote')" title="Zitat">❝</button>
    <button @click="formatBlock('code')" title="Codeblock">{"{}"}</button>
    <button @click="formatBlock('table')" title="Tabelle">╳</button>
    <button @click="formatBlock('hr')" title="Horizontale Linie">―</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['format', 'toggle-emoji-picker'])
const activeDropdown = ref(null)

const toggleDropdown = (name) => {
  activeDropdown.value = activeDropdown.value === name ? null : name
}

const formatInline = (type) => {
  const formats = {
    bold: { prefix: '**', suffix: '**', isBlock: false },
    italic: { prefix: '_', suffix: '_', isBlock: false },
    underline: { prefix: '<u>', suffix: '</u>', isBlock: false },
    strikethrough: { prefix: '~~', suffix: '~~', isBlock: false },
    code: { prefix: '`', suffix: '`', isBlock: false },
  }
  emit('format', formats[type])
}

const formatBlock = (type, level = 1) => {
  const blocks = {
    heading: { prefix: '#'.repeat(level) + ' ', newline: true, isBlock: true },
    ul: { prefix: '- ', newline: true, isBlock: true },
    ol: { prefix: '1. ', newline: true, isBlock: true },
    task: { prefix: '- [ ] ', newline: true, isBlock: true },
    quote: { prefix: '> ', newline: true, isBlock: true },
    code: { prefix: '```\n', suffix: '\n```', newline: true, isBlock: true },
    table: {
      prefix: '| Spalte 1 | Spalte 2 |\n|----------|----------|\n| Inhalt   | Inhalt   |',
      newline: true,
      isBlock: true,
    },
    hr: { prefix: '\n---\n', newline: true, isBlock: true },
  }
  emit('format', blocks[type])
  activeDropdown.value = null
}

const insertLink = () => {
  const url = prompt('Link-URL eingeben:')
  if (url) {
    emit('format', {
      prefix: '[',
      suffix: `](${url})`,
      isBlock: false,
    })
  }
}

const insertImage = () => {
  const url = prompt('Bild-URL eingeben:')
  if (url) {
    emit('format', {
      prefix: '![',
      suffix: `](${url})`,
      isBlock: false,
    })
  }
}
</script>

<style scoped>
.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 16px;
  border: 1px solid #e1e4e8;
}

.toolbar button {
  min-width: 36px;
  padding: 6px 10px;
  border: 1px solid #d1d5da;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.toolbar button:hover {
  background: #f3f4f6;
  border-color: #c9ccd1;
}

.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
  min-width: 120px;
  margin-top: 4px;
}

.dropdown-menu button {
  width: 100%;
  text-align: left;
  border: none;
  border-radius: 0;
  border-bottom: 1px solid #f0f2f4;
}

.dropdown-menu button:hover {
  background: #f6f8fa;
}

/* Dark Mode Styles */
.dark .toolbar {
  background: #24292e;
  border-color: #444d56;
}

.dark .toolbar button {
  background: #2d333b;
  border-color: #444d56;
  color: #c9d1d9;
}

.dark .toolbar button:hover {
  background: #373e47;
}

.dark .dropdown-menu {
  background: #2d333b;
  border-color: #444d56;
}

.dark .dropdown-menu button {
  background: #2d333b;
  color: #c9d1d9;
  border-bottom-color: #444d56;
}

.dark .dropdown-menu button:hover {
  background: #373e47;
}
</style>

<template>
  <div class="modal-backdrop" @click.self="close">
    <div class="modal">
      <h3>Tabelle einfügen</h3>
      <form @submit.prevent="insertTable">
        <label>
          Spalten:
          <input type="number" v-model.number="columns" min="1" max="20" required />
        </label>
        <label>
          Zeilen:
          <input type="number" v-model.number="rows" min="1" max="50" required />
        </label>
        <div class="buttons">
          <button type="submit">Einfügen</button>
          <button type="button" @click="close">Abbrechen</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'insert', markdown: string): void
  (e: 'close'): void
}>()

const rows = ref<number>(3)
const columns = ref<number>(3)

function insertTable() {
  let header = '|'
  let separator = '|'
  for (let i = 0; i < columns.value; i++) {
    header += ` Spalte${i + 1} |`
    separator += '---------|'
  }
  let body = ''
  for (let j = 0; j < rows.value; j++) {
    let row = '|'
    for (let i = 0; i < columns.value; i++) {
      row += '         |'
    }
    body += row + '\n'
  }
  const tableMarkdown = `${header}\n${separator}\n${body}`
  emit('insert', tableMarkdown)
  emit('close')
}

function close() {
  emit('close')
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3000;
}

.modal {
  background: var(--vp-bg, #222);
  padding: 1.5rem;
  border-radius: 8px;
  color: var(--vp-text, #eee);
  width: 320px;
}

form label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

input[type='number'] {
  width: 60px;
  padding: 0.25rem;
  border-radius: 4px;
  border: 1px solid #666;
  background: var(--vp-bg, #222);
  color: var(--vp-text, #eee);
}

.buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button[type='submit'] {
  background-color: #0078d4;
  color: white;
}

button[type='button'] {
  background-color: #555;
  color: white;
}
</style>

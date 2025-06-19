<template>
  <div ref="editorContainer" class="code-editor"></div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { EditorView, keymap } from '@codemirror/view' // lineWrapping nicht importieren
import { EditorState } from '@codemirror/state'
import { markdown } from '@codemirror/lang-markdown'
import { indentWithTab } from '@codemirror/commands'

const props = defineProps({
  modelValue: String,
})

const emit = defineEmits(['update:modelValue'])

const editorContainer = ref(null)
const editorView = ref(null)

// Editor initialisieren
onMounted(() => {
  const state = EditorState.create({
    doc: props.modelValue,
    extensions: [
      markdown(),
      EditorView.lineWrapping, // lineWrapping so verwenden
      keymap.of([indentWithTab]),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          emit('update:modelValue', update.state.doc.toString())
        }
      }),
    ],
  })

  editorView.value = new EditorView({
    state,
    parent: editorContainer.value,
  })
})

// Externe Änderungen synchronisieren
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== editorView.value?.state.doc.toString()) {
      editorView.value?.dispatch({
        changes: {
          from: 0,
          to: editorView.value.state.doc.length,
          insert: newValue,
        },
      })
    }
  },
)

// EditorView nach außen freigeben
defineExpose({ editorView })
</script>

<style>
.code-editor {
  height: 100%;
  border: 1px solid #ddd;
  border-radius: 6px;
  overflow: hidden;
}

.cm-editor {
  height: 100%;
  font-family: 'Fira Code', monospace;
  font-size: 14px;
  overflow-wrap: break-word; /* Optional: bessere Behandlung langer Wörter */
}

.cm-content {
  padding: 10px;
}

.dark .cm-editor {
  background: #1e1e1e;
  color: #e0e0e0;
}
</style>

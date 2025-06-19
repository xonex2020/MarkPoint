// src/utils/markdownUtils.js

/**
 * Toggle Inline Markdown (z.B. **bold**):
 * Fügt vor und nach der Auswahl die Marker ein,
 * oder entfernt sie, wenn sie schon da sind.
 *
 * @param {string} text - Gesamter Text
 * @param {number} selectionStart - Startindex der Auswahl
 * @param {number} selectionEnd - Endindex der Auswahl
 * @param {string} before - Markdown-Start-Tag (z.B. "**")
 * @param {string} after - Markdown-End-Tag (optional, Standard = before)
 * @returns {object} updatedText, newSelectionStart, newSelectionEnd
 */
export function toggleInlineMarkdown(text, selectionStart, selectionEnd, before, after = before) {
  const selected = text.slice(selectionStart, selectionEnd)
  const hasBefore = selected.startsWith(before)
  const hasAfter = selected.endsWith(after)

  if (hasBefore && hasAfter) {
    // Entferne Marker
    const newText =
      text.slice(0, selectionStart) +
      selected.slice(before.length, selected.length - after.length) +
      text.slice(selectionEnd)
    const newStart = selectionStart
    const newEnd = selectionEnd - before.length - after.length
    return { updatedText: newText, newSelectionStart: newStart, newSelectionEnd: newEnd }
  } else {
    // Füge Marker hinzu
    const newText =
      text.slice(0, selectionStart) + before + selected + after + text.slice(selectionEnd)
    const newStart = selectionStart + before.length
    const newEnd = selectionEnd + before.length
    return { updatedText: newText, newSelectionStart: newStart, newSelectionEnd: newEnd }
  }
}

/**
 * Toggle Block Markdown (z.B. Listen, Blockquote):
 * Fügt vor jede Zeile den Prefix ein oder entfernt ihn, wenn er da ist.
 *
 * @param {string} text - Gesamter Text
 * @param {number} selectionStart - Startindex der Auswahl
 * @param {number} selectionEnd - Endindex der Auswahl
 * @param {string} prefix - z.B. "- ", "> ", "1. "
 * @returns {object} updatedText, newSelectionStart, newSelectionEnd
 */
export function toggleBlockMarkdown(text, selectionStart, selectionEnd, prefix) {
  const before = text.slice(0, selectionStart)
  const selection = text.slice(selectionStart, selectionEnd)
  const after = text.slice(selectionEnd)

  const lines = selection.split('\n')
  const allHavePrefix = lines.every((line) => line.startsWith(prefix))

  let updatedLines
  if (allHavePrefix) {
    // Entferne Prefix
    updatedLines = lines.map((line) => (line.startsWith(prefix) ? line.slice(prefix.length) : line))
  } else {
    // Füge Prefix hinzu
    updatedLines = lines.map((line) => prefix + line)
  }

  const updatedSelection = updatedLines.join('\n')
  const newText = before + updatedSelection + after

  const lengthDiff = updatedSelection.length - selection.length

  return {
    updatedText: newText,
    newSelectionStart: selectionStart,
    newSelectionEnd: selectionEnd + lengthDiff,
  }
}

import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Note } from '../types/note'
import { loadState, saveState } from '../composables/noteStorage'

export const useNotesStore = defineStore('notes', () => {
    const notes = ref<Note[]>([])
    const initialized = ref(false)

    const init = () => {
        if (initialized.value) return
        notes.value = loadState().notes
        initialized.value = true
    }

    const createNote = (title: string): Note => {
        const note: Note = {
            id: crypto.randomUUID(),
            title,
            todos: [],
            updatedAt: Date.now(),
        }
        notes.value.push(note)
        persist()
        return note
    }

    const updateNote = (id: string, patch: Partial<Pick<Note, 'title' | 'todos'>>) => {
        const note = notes.value.find(n => n.id === id)
        if (!note) return
        Object.assign(note, patch, { updatedAt: Date.now() })
        persist()
    }

    const deleteNote = (id: string) => {
        notes.value = notes.value.filter(n => n.id !== id)
        persist()
    }

    const persist = () => {
        saveState({ schemaVersion: 1, notes: notes.value })
    }

    return {
        notes,
        initialized,
        init,
        createNote,
        updateNote,
        deleteNote,
        persist,
    }
})
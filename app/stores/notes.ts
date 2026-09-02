import { defineStore } from "pinia"
import { ref } from "vue"
import type { Note, TodoItem } from "~/types/note.ts"
import { SCHEMA_VERSION } from "~/types/note.ts"
import * as storage from "~/composables/useNoteStorage.ts"
import { useDebounceFn } from "~/utils/debounce.ts"

export const useNotesStore = defineStore("notes", () => {
    const notes = ref<Note[]>([])
    const initialized = ref(false)

    const init = () => {
        if (initialized.value) return
        notes.value = storage.loadState().notes
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
        persistImmediately()
        return note
    }

    const updateNote = (id: string, patch: Partial<Pick<Note, "title" | "todos">>) => {
        const note = notes.value.find(n => n.id === id)
        if (!note) return
        Object.assign(note, patch, { updatedAt: Date.now() })
        persist()
    }

    const deleteNote = (id: string) => {
        notes.value = notes.value.filter(n => n.id !== id)
        persist()
    }

    const getNoteById = (id: string): Note | undefined => {
        return notes.value.find(n => n.id === id)
    }

    const persistImmediately = () => {
        storage.saveState({ schemaVersion: SCHEMA_VERSION, notes: notes.value })
    }

    const persist = useDebounceFn(persistImmediately, 500)

    const addTodo = (noteId: string, text: string): TodoItem | undefined => {
        const note = notes.value.find(n => n.id === noteId)
        if (!note) return
        const todo: TodoItem = { id: crypto.randomUUID(), text, checked: false }
        note.todos.push(todo)
        note.updatedAt = Date.now()
        persist()
        return todo
    }

    const removeTodo = (noteId: string, todoId: string) => {
        const note = notes.value.find(n => n.id === noteId)
        if (!note) return
        note.todos = note.todos.filter(t => t.id !== todoId)
        note.updatedAt = Date.now()
        persist()
    }

    const toggleTodo = (noteId: string, todoId: string) => {
        const note = notes.value.find(n => n.id === noteId)
        const todo = note?.todos.find(t => t.id === todoId)
        if (!todo) return
        todo.checked = !todo.checked
        note!.updatedAt = Date.now()
        persist()
    }

    const editTodoText = (noteId: string, todoId: string, text: string) => {
        const note = notes.value.find(n => n.id === noteId)
        const todo = note?.todos.find(t => t.id === todoId)
        if (!todo) return
        todo.text = text
        note!.updatedAt = Date.now()
        persist()
    }

    const reload = () => {
        notes.value = storage.loadState().notes
    }

    return {
        notes,
        initialized,
        init,
        createNote,
        updateNote,
        deleteNote,
        getNoteById,
        persist,
        persistImmediately,
        addTodo,
        removeTodo,
        toggleTodo,
        editTodoText,
        reload
    }
})
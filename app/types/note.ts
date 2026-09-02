export const SCHEMA_VERSION = 1

export interface Note {
    id: string
    title: string
    todos: TodoItem[]
    updatedAt: number
}

export interface TodoItem {
    id: string
    text: string
    checked: boolean
}

export interface PersistedState {
    schemaVersion: number
    notes: Note[]
}
import type { PersistedState, Note } from '../types/note'
import { SCHEMA_VERSION } from '../types/note'

const STORAGE_KEY = 'notes-app:data'

export const loadState = (): PersistedState => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { schemaVersion: SCHEMA_VERSION, notes: [] }

    try {
        const parsed = JSON.parse(raw) as PersistedState
        return migrateIfNeeded(parsed)
    } catch {
        return { schemaVersion: SCHEMA_VERSION, notes: [] }
    }
}

const migrateIfNeeded = (state: PersistedState): PersistedState => {
    if (state.schemaVersion !== SCHEMA_VERSION) {
        // to do
    }
    return state
}

export const saveState = (state: PersistedState): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}
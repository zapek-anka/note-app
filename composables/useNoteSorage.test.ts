import { describe, it, expect, beforeEach } from 'vitest'
import { loadState, saveState } from './useNoteStorage'

describe('notesStorage', () => {
    beforeEach(() => localStorage.clear())

    it('вернул пустой стейт', () => {
        expect(loadState()).toEqual({ schemaVersion: 1, notes: [] })
    })

    it('синхронизировался', () => {
        saveState({ schemaVersion: 1, notes: [{ id: '1', title: 'Test', todos: [], updatedAt: 0 }] })
        expect(loadState().notes).toHaveLength(1)
    })
})
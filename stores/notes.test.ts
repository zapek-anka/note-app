import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useNotesStore } from './notes'

describe('useNotesStore', () => {
    beforeEach(() => {
        localStorage.clear()
        setActivePinia(createPinia())
    })

    describe('init', () => {
        it('в начале пустой стейт', () => {
            const store = useNotesStore()
            store.init()
            expect(store.notes).toEqual([])
        })

        it('загрузили из LocalStorage', () => {
            localStorage.setItem('notes-app:data', JSON.stringify({
                schemaVersion: 1,
                notes: [{ id: '1', title: 'kono dio da', todos: [], createdAt: 0, updatedAt: 0 }],
            }))

            const store = useNotesStore()
            store.init()

            expect(store.notes).toHaveLength(1)
            expect(store.notes[0].title).toBe('kono dio da')
        })

        it('и более не затираем', () => {
            const store = useNotesStore()
            store.init()
            store.createNote('First')

            store.init()
            expect(store.notes).toHaveLength(1)
        })
    })

    describe('createNote', () => {
        it('создали заметочку', () => {
            const store = useNotesStore()
            store.init()
            const note = store.createNote('jojo')

            expect(store.notes).toHaveLength(1)
            expect(note.title).toBe('jojo')
            expect(note.todos).toEqual([])
        })

        it('добавили идентификатор', () => {
            const store = useNotesStore()
            store.init()
            const a = store.createNote('jojo')
            const b = store.createNote('giogio')
            expect(a.id).not.toBe(b.id)
        })

        it('синхронизировали с localStorage', () => {
            const store = useNotesStore()
            store.init()
            store.createNote('star')

            const raw = localStorage.getItem('notes-app:data')
            const parsed = JSON.parse(raw!)
            expect(parsed.notes).toHaveLength(1)
            expect(parsed.notes[0].title).toBe('star')
        })
    })

    describe('updateNote', () => {
        it('сменили заголовок', () => {
            const store = useNotesStore()
            store.init()
            const note = store.createNote('Old title')

            store.updateNote(note.id, { title: 'New title' })
            expect(store.getNoteById(note.id)?.title).toBe('New title')
        })
    })

    describe('deleteNote', () => {
        it('удалили замтеку', () => {
            const store = useNotesStore()
            store.init()
            const note = store.createNote('caesar')

            store.deleteNote(note.id)
            expect(store.getNoteById(note.id)).toBeUndefined()
            expect(store.notes).toHaveLength(0)
        })
    })

    describe('действия с todo', () => {
        it('добавили todo', () => {
            const store = useNotesStore()
            store.init()
            const note = store.createNote('N')

            const todo = store.addTodo(note.id, 'get real')
            expect(todo).toBeDefined()
            expect(store.getNoteById(note.id)?.todos).toHaveLength(1)
            expect(store.getNoteById(note.id)?.todos[0].checked).toBe(false)
        })

        it('сменили статус todo', () => {
            const store = useNotesStore()
            store.init()
            const note = store.createNote('N')
            const todo = store.addTodo(note.id, 'Task')!

            store.toggleTodo(note.id, todo.id)
            expect(store.getNoteById(note.id)?.todos[0].checked).toBe(true)

            store.toggleTodo(note.id, todo.id)
            expect(store.getNoteById(note.id)?.todos[0].checked).toBe(false)
        })

        it('удалили и ничего не сломали', () => {
            const store = useNotesStore()
            store.init()
            const note = store.createNote('N')
            const a = store.addTodo(note.id, 'A')!
            const b = store.addTodo(note.id, 'B')!

            store.removeTodo(note.id, a.id)
            const remaining = store.getNoteById(note.id)?.todos
            expect(remaining).toHaveLength(1)
            expect(remaining?.[0].id).toBe(b.id)
        })
    })

    describe('пережили перезагрузку', () => {
        it('считали старый стейт', () => {
            const storeA = useNotesStore()
            storeA.init()
            storeA.createNote("i'll be back")

            setActivePinia(createPinia())
            const storeB = useNotesStore()
            storeB.init()

            expect(storeB.notes).toHaveLength(1)
            expect(storeB.notes[0].title).toBe("i'll be back")
        })
    })
})
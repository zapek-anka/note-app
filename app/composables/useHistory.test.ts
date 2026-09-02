import { describe, it, expect, vi } from 'vitest'
import { useHistory } from './useHistory.ts'
import type { Command } from '~/types/history.ts'

function makeCommand(overrides: Partial<Command> = {}): Command {
    return {
        type: 'test-command',
        undo: vi.fn(),
        redo: vi.fn(),
        ...overrides,
    }
}

describe('useHistory', () => {
    describe('начальное состояние', () => {
        it('начинаем без команд к обработке', () => {
            const history = useHistory()
            expect(history.canUndo.value).toBe(false)
            expect(history.canRedo.value).toBe(false)
        })

        it('undo на чистой истории ничего не ломает', () => {
            const history = useHistory()
            expect(() => history.undo()).not.toThrow()
        })

        it('redo на чистой истории ничего не ломает', () => {
            const history = useHistory()
            expect(() => history.redo()).not.toThrow()
        })
    })

    describe('push', () => {
        it('позволяет canUndo после', () => {
            const history = useHistory()
            history.push(makeCommand())
            expect(history.canUndo.value).toBe(true)
        })

        it('не трогает canRedo', () => {
            const history = useHistory()
            history.push(makeCommand())
            expect(history.canRedo.value).toBe(false)
        })
    })

    describe('undo', () => {
        it('вызывает undo', () => {
            const history = useHistory()
            const command = makeCommand()
            history.push(command)

            history.undo()
            expect(command.undo).toHaveBeenCalledOnce()
        })

        it('отменяет в нужном порядке', () => {
            const history = useHistory()
            const order: string[] = []
            history.push(makeCommand({ type: 'first', undo: () => order.push('first') }))
            history.push(makeCommand({ type: 'second', undo: () => order.push('second') }))

            history.undo()
            history.undo()

            expect(order).toEqual(['second', 'first'])
        })
    })

    describe('redo', () => {
        it('вызывает redo', () => {
            const history = useHistory()
            const command = makeCommand()
            history.push(command)
            history.undo()

            history.redo()
            expect(command.redo).toHaveBeenCalledOnce()
        })

        it('добавляет к возможности отмены', () => {
            const history = useHistory()
            history.push(makeCommand())
            history.undo()

            history.redo()
            expect(history.canUndo.value).toBe(true)
            expect(history.canRedo.value).toBe(false)
        })
    })

    describe('лимит истории', () => {
        it('undo следует лимиту', () => {
            const limit = 5
            const history = useHistory(limit)

            for (let i = 0; i < limit + 3; i++) {
                history.push(makeCommand({ type: `step-${i}` }))
            }

            let undoCount = 0
            while (history.canUndo.value) {
                history.undo()
                undoCount++
            }

            expect(undoCount).toBe(limit)
        })

        it('вытесняет старшую команду при превышении лимита', () => {
            const history = useHistory(2)
            const first = makeCommand({ type: 'first' })
            const second = makeCommand({ type: 'second' })
            const third = makeCommand({ type: 'third' })

            history.push(first)
            history.push(second)
            history.push(third)

            history.undo()
            history.undo()
            expect(history.canUndo.value).toBe(false)

            expect(first.undo).not.toHaveBeenCalled()
            expect(second.undo).toHaveBeenCalledOnce()
            expect(third.undo).toHaveBeenCalledOnce()
        })
    })
})
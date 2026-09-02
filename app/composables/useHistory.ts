import { ref, computed } from 'vue'
import type { Command } from "~/types/history.ts"

export const useHistory = (limit = 50)=> {
    const past = ref<Command[]>([])
    const future = ref<Command[]>([])

    const push = (command: Command) => {
        past.value.push(command)
        if (past.value.length > limit) past.value.shift()
        future.value = []
    }

    const undo = () => {
        const command = past.value.pop()
        if (!command) return
        command.undo()
        future.value.push(command)
    }

    const redo = () => {
        const command = future.value.pop()
        if (!command) return
        command.redo()
        past.value.push(command)
    }

    const reset = () => {
        past.value = []
        future.value = []
    }

    const canUndo = computed(() => past.value.length > 0)
    const canRedo = computed(() => future.value.length > 0)

    return {
        push,
        undo,
        redo,
        reset,
        canUndo,
        canRedo
    }
}
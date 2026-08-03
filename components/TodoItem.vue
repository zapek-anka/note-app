<script setup lang="ts">
import type { TodoItem } from "../types/note"

const props = defineProps<{ todo: TodoItem }>()
const emit = defineEmits<{
    commitText: [before: string, after: string]
    toggle: []
    remove: []
}>()

let beforeValue = ''

const onFocus = () => {
    beforeValue = props.todo.text
}

const onBlur = (e: FocusEvent) => {
    const after = (e.target as HTMLInputElement).value
    emit('commitText', beforeValue, after)
}

const onToggle = () => {
    emit('toggle')
}

const onRemove = () => {
    emit('remove')
}
</script>

<template>
    <li class="todo-item">
        <input
            type="checkbox"
            :checked="todo.checked"
            @change="onToggle"
            :aria-label="`Отметить «${todo.text}» как выполненное`"
        />
        <input
            type="text"
            :value="todo.text"
            @focus="onFocus"
            @blur="onBlur"
        />
        <button type="button" @click="onRemove" aria-label="Удалить задачу">
            ✕
        </button>
    </li>
</template>

<style scoped>

</style>
<script setup lang="ts">
import { useNotesStore } from "~~/stores/notes.ts"
import { useHistory } from "~~/composables/useHistory.ts"
import { useDebounceFn } from "~~/utils/debounce.ts"
import { loadDraft, clearDraft, saveDraft } from "~~/composables/useNoteStorage.ts"
import { computed } from "vue"
import { useRoute } from "nuxt/app"
import TodoItem from "~~/components/TodoItem.vue"
import AddTodoForm from "~~/components/AddTodoForm.vue";
import { useDeleteNoteConfirm } from "~~/composables/useDeleteNoteConfirm.ts";
import ConfirmDialog from "~~/components/ConfirmDialog.vue"

const route = useRoute()
const store = useNotesStore()
const history = useHistory()

store.init()

const note = computed(() => store.getNoteById(route.params.id as string))
const noteExists = computed(() => note.value !== undefined)

const debouncedSaveDraft = useDebounceFn(() => {
    if (!note.value) return
    saveDraft(note.value.id, note.value)
}, 800)

watch(note, () => {
    debouncedSaveDraft()
}, { deep: true })

const showRestoreBanner = ref(false)
const pendingDraft = ref<Note | null>(null)

const toggleTodoWithHistory = (todoId: string) => {
    if (!note.value) return
    store.toggleTodo(note.value.id, todoId)
    history.push({
        type: 'toggle-todo',
        undo: () => store.toggleTodo(note.value!.id, todoId),
        redo: () => store.toggleTodo(note.value!.id, todoId),
    })
}

const restoreDraft = () => {
    if (!pendingDraft.value || !note.value) return
    store.updateNote(note.value.id, { title: pendingDraft.value.title, todos: pendingDraft.value.todos })
    showRestoreBanner.value = false
}

const dismissDraft = () => {
    clearDraft(route.params.id as string)
    showRestoreBanner.value = false
}

const saveNote = () => {
    if (!note.value) return
    const title = note.value.title.trim() || 'Без названия'
    store.updateNote(note.value.id, { title })
    clearDraft(note.value.id)
    history.reset()
    navigateTo('/')
}

const cancelEditing = () => {
    clearDraft(note.value!.id)
    history.reset()
    navigateTo('/')
}

const handleKeydown = (evt: KeyboardEvent) => {
    const isCtrlZ = (evt.ctrlKey || evt.metaKey) && evt.key === 'z'
    if (!isCtrlZ) return

    const target = evt.target as HTMLElement
    const isTextInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA'

    if (isTextInput) return

    evt.preventDefault()
    if (evt.shiftKey) history.redo()
    else history.undo()
}

const addTodo = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || !note.value) return
    const todo = store.addTodo(note.value.id, trimmed)
    if (!todo) return
    history.push({
        type: 'add-todo',
        undo: () => store.removeTodo(note.value!.id, todo.id),
        redo: () => { note.value!.todos.push(todo); store.persist() },
    })
}

const commitTodoTextChange = (todoId: string, before: string, after: string) => {
    const trimmed = after.trim()
    if (!trimmed) {
        const todo = note.value!.todos.find(t => t.id === todoId)
        if (todo) todo.text = before
        return
    }
    if (trimmed === before) return
    store.editTodoText(note.value!.id, todoId, trimmed)
    history.push({ /* ... */ })
}

const handleStorageChange = (evt: StorageEvent) => {
    if (evt.key !== 'notes-app:data') return
    if (!evt.newValue) return

    store.reload()

    if (!store.getNoteById(route.params.id as string)) {
        showDeletedElsewhereNotice.value = true
    }
}

let titleBeforeEdit = ''

const onTitleFocus = () => {
    titleBeforeEdit = note.value!.title
}

const onTitleBlur = () => {
    const after = note.value!.title.trim()

    if (!after) {
        note.value!.title = titleBeforeEdit || 'Без названия'
        return
    }

    if (after === titleBeforeEdit) return

    store.updateNote(note.value!.id, { title: after })
    history.push({
        type: 'edit-title',
        undo: () => store.updateNote(note.value!.id, { title: titleBeforeEdit }),
        redo: () => store.updateNote(note.value!.id, { title: after }),
    })
}

const removeTodo = (todoId: string) => {
    if (!note.value) return
    const index = note.value.todos.findIndex(t => t.id === todoId)
    if (index === -1) return

    const removedTodo = note.value.todos[index]

    store.removeTodo(note.value.id, todoId)

    history.push({
        type: 'remove-todo',
        undo: () => {
            note.value!.todos.splice(index, 0, removedTodo)
            store.persist()
        },
        redo: () => store.removeTodo(note.value!.id, todoId),
    })
}

const { isModalOpen, requestDelete, confirmDelete, cancelDelete } = useDeleteNoteConfirm()

const onConfirmDelete = () => {
    confirmDelete()
    navigateTo('/')
}

onMounted(() => {
    const draft = loadDraft(route.params.id as string)
    if (draft && JSON.stringify(draft) !== JSON.stringify(note.value)) {
        pendingDraft.value = draft
        showRestoreBanner.value = true
    }

    window.addEventListener('keydown', handleKeydown)
    window.addEventListener('storage', handleStorageChange)
})

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
    window.removeEventListener('storage', handleStorageChange)
})
</script>

<template>
    <NuxtLink to="/">Вернуться к списку</NuxtLink>
    <div v-if="!noteExists">
        <p>Заметка не найдена — возможно, она была удалена.</p>
    </div>
    <div v-else>
        <label>
            <span>Название: </span>
            <input
                v-model="note.title"
                type="text"
                class="note-title-input"
                placeholder="Название заметки"
                @focus="onTitleFocus"
                @blur="onTitleBlur"
            />
        </label>
        <ul v-if="note.todos.length">
            <TodoItem
                v-for="todo in note.todos"
                :key="todo.id"
                :todo="todo"
                @commit-text="(before, after) => commitTodoTextChange(todo.id, before, after)"
                @toggle="toggleTodoWithHistory(todo.id)"
                @remove="removeTodo(todo.id)"
            />
        </ul>
        <p v-else class="empty-state">Пока нет задач</p>
        <AddTodoForm @add="addTodo" />
    </div>

    <button type="button" @click="requestDelete(note!.id)">Удалить заметку</button>

    <ConfirmDialog
        :open="isModalOpen"
        message="Удалить эту заметку? Это действие необратимо."
        @confirm="onConfirmDelete"
        @cancel="cancelDelete"
    />
</template>
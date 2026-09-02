<script setup lang="ts">
import { useNotesStore } from "~/stores/notes.ts"
import { useHistory } from "~/composables/useHistory.ts"
import { useDebounceFn } from "~/utils/debounce.ts"
import { loadDraft, clearDraft, saveDraft } from "~/composables/useNoteStorage.ts"
import { computed } from "vue"
import { useRoute } from "nuxt/app"
import TodoItem from "~/components/TodoItem.vue"
import AddTodoForm from "~/components/AddTodoForm.vue"
import { useDeleteNoteConfirm } from "~/composables/useDeleteNoteConfirm.ts"
import ConfirmDialog from "~/components/ConfirmDialog.vue"
import BaseButton from "~/components/BaseButton.vue"

const route = useRoute()
const store = useNotesStore()
const history = useHistory()

store.init()

const note = computed(() => store.getNoteById(route.params.id as string))
const noteExists = computed(() => note.value !== undefined)

const showRestoreBanner = ref(false)
const pendingDraft = ref<Note | null>(null)

let noteSnapshotOnMount: Note | null = null
const isRestoringOrDismissing = ref(false)

watch(note, () => {
    if (isRestoringOrDismissing.value) return
    debouncedSaveDraft()
}, { deep: true })

const debouncedSaveDraft = useDebounceFn(() => {
    if (!note.value) return
    saveDraft(note.value.id, note.value)
}, 800)

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
    store.persistImmediately()
    clearDraft(note.value.id)
    history.reset()
    navigateTo('/')
}

const handleKeydown = (evt: KeyboardEvent) => {
    const isCtrlZ = (evt.ctrlKey || evt.metaKey) && evt.key.toLowerCase() === 'z'
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
    history.push({
        type: 'edit-todo-text',
        undo: () => store.editTodoText(note.value!.id, todoId, before),
        redo: () => store.editTodoText(note.value!.id, todoId, trimmed),
    })
}
const showDeletedElsewhereNotice = ref(false)

const handleStorageChange = (evt: StorageEvent) => {
    if (evt.key !== 'notes-app:data') return
    if (!evt.newValue) return

    store.reload()

    if (!store.getNoteById(route.params.id as string)) {
        showDeletedElsewhereNotice.value = true
    }
}

let titleBeforeEdit = ""

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

const {
    isDeleteModalOpen,
    isCancelModalOpen,
    requestDelete,
    requestCancel,
    confirmDelete,
    cancelDelete
} = useDeleteNoteConfirm()


const onConfirmCancelEditing = () => {
    if (!note.value || !noteSnapshotOnMount) return

    store.updateNote(note.value.id, {
        title: noteSnapshotOnMount.title,
        todos: noteSnapshotOnMount.todos,
    })
    store.persistImmediately()

    clearDraft(note.value.id)
    history.reset()
    isCancelModalOpen.value = false
    navigateTo('/')
}

const hasDraftDiverged = (draft: Note, saved: Note) : boolean => {
    return draft?.title !== saved?.title || JSON.stringify(draft?.todos) !== JSON.stringify(saved?.todos)
}

onMounted(() => {
    if (!note.value) return

    noteSnapshotOnMount = JSON.parse(JSON.stringify(note.value))

    const draft = loadDraft(note.value.id)

    if (draft && hasDraftDiverged(draft, note.value)) {
        pendingDraft.value = draft
        showRestoreBanner.value = true
    }

    window.addEventListener('beforeunload', store.persistImmediately)
    window.addEventListener('keydown', handleKeydown)
    window.addEventListener('storage', handleStorageChange)
})

onUnmounted(() => {
    window.removeEventListener('beforeunload', store.persistImmediately)
    window.removeEventListener('keydown', handleKeydown)
    window.removeEventListener('storage', handleStorageChange)
})
</script>

<template>
    <div class="content">
        <div v-if="!noteExists">
            <p>Заметка не найдена — возможно, она была удалена.</p>
            <NuxtLink to="/">Вернуться к списку</NuxtLink>
        </div>

        <div v-else class="note-edit-page">
            <header class="note-edit-page__header">
                <NuxtLink to="/" class="note-edit-page__back">← Назад</NuxtLink>

                <div class="note-edit-page__history-controls">
                    <BaseButton variant="secondary" :disabled="!history.canUndo.value" @click="history.undo">
                        Отменить
                    </BaseButton>
                    <BaseButton variant="secondary" :disabled="!history.canRedo.value" @click="history.redo">
                        Повторить
                    </BaseButton>
                </div>

                <BaseButton variant="danger" @click="requestDelete(note.id)">Удалить</BaseButton>
            </header>

            <div
                v-if="showRestoreBanner"
                class="draft-banner"
                role="status"
                aria-live="polite"
            >
                <span>У вас есть несохранённые изменения из прошлой сессии.</span>
                <div class="draft-banner__actions">
                    <BaseButton variant="primary" @click="restoreDraft">Восстановить</BaseButton>
                    <BaseButton variant="secondary" @click="dismissDraft">Не сейчас</BaseButton>
                </div>
            </div>

            <main>
                <input
                    v-model="note.title"
                    type="text"
                    class="note-title-input"
                    placeholder="Название заметки"
                    @focus="onTitleFocus"
                    @blur="onTitleBlur"
                />

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
            </main>

            <footer class="note-edit-page__footer">
                <BaseButton variant="secondary" @click="requestCancel">Отменить</BaseButton>
                <BaseButton variant="primary" @click="saveNote">Сохранить</BaseButton>
            </footer>
        </div>

        <ConfirmDialog
            :open="isDeleteModalOpen"
            message="Удалить эту заметку? Это действие необратимо."
            @confirm="confirmDelete"
            @cancel="cancelDelete"
        />
        <ConfirmDialog
            :open="isCancelModalOpen"
            message="Отменить редактирование? Несохранённые изменения будут потеряны."
            @confirm="onConfirmCancelEditing"
            @cancel="() => (isCancelModalOpen = false)"
        />
    </div>
</template>

<style lang="scss" scoped>
@use "@/assets/scss/variables" as v;
@use "sass:color";

.note-title-input {
    padding: v.$spacing-xs 0;
    width: 100%;
    margin: v.$spacing-lg 0 v.$spacing-xs;
    font-size: 1.75rem;
    border: none;
    border-bottom: 2px solid transparent;
    background: transparent;

    &:focus-visible {
        outline: none;
        border-bottom-color: v.$color-primary;
    }
}

.note-edit-page {
    &__header {
        position: sticky;
        top: 0;
        background: white;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: v.$spacing-md;
        border-bottom: 1px solid v.$color-border;
    }

    &__footer {
        position: sticky;
        bottom: 0;
        background: white;
        display: flex;
        justify-content: flex-end;
        gap: v.$spacing-sm;
        padding: v.$spacing-md;
        border-top: 1px solid v.$color-border;
    }

    &__content {
        padding: v.$spacing-md;
        max-width: 640px;
        margin: 0 auto;
    }

    &__history-controls {
        display: flex;
        gap: v.$spacing-md;
    }
}

.draft-banner {
    margin: v.$spacing-md;
    padding: v.$spacing-md;
    background: color.adjust(v.$color-primary, $lightness: 45%);
    border: 1px solid v.$color-primary;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: v.$spacing-sm;
    flex-wrap: wrap;

    &__actions {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: v.$spacing-md;
        padding: v.$spacing-md 0 0;
    }
}
</style>
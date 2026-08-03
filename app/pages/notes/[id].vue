<script setup lang="ts">
import { useNotesStore } from "~~/stores/notes.ts"
import { useHistory } from "~~/composables/useHistory.ts"
import { useDebounceFn } from "~~/utils/debounce.ts"
import { loadDraft, clearDraft } from "~~/composables/useNoteStorage.ts";
import { computed } from "vue"
import { useRoute } from "nuxt/app"

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
    clearDraft(note.value!.id)
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

onMounted(() => {
    const draft = loadDraft(route.params.id as string)
    if (draft && JSON.stringify(draft) !== JSON.stringify(note.value)) {
        pendingDraft.value = draft
        showRestoreBanner.value = true
    }

    window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
</script>

<template>
    <NuxtLink to="/">Вернуться к списку</NuxtLink>
    <div v-if="!noteExists">
        <p>Заметка не найдена — возможно, она была удалена.</p>
    </div>
    <div v-else>
        <p>{{ note.title }}</p>
        <ul></ul>
    </div>
</template>
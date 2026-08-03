import { ref } from "vue"
import { useNotesStore } from "../stores/notes"

export function useDeleteNoteConfirm() {
    const store = useNotesStore()
    const isModalOpen = ref(false)
    const noteToDelete = ref<string | null>(null)

    const requestDelete = (noteId: string) => {
        noteToDelete.value = noteId
        isModalOpen.value = true
    }

    const confirmDelete = () => {
        if (!noteToDelete.value) return
        store.deleteNote(noteToDelete.value)
        isModalOpen.value = false
        noteToDelete.value = null
    }

    const cancelDelete = () => {
        isModalOpen.value = false
        noteToDelete.value = null
    }

    return { isModalOpen, requestDelete, confirmDelete, cancelDelete }
}
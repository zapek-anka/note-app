import { ref } from "vue"
import { useNotesStore } from "../stores/notes"

export function useDeleteNoteConfirm() {
    const store = useNotesStore()
    const isDeleteModalOpen = ref(false)
    const isCancelModalOpen = ref(false)
    const noteToDelete = ref<string | null>(null)

    const requestDelete = (noteId: string) => {
        noteToDelete.value = noteId
        isDeleteModalOpen.value = true
    }

    const requestCancel = () => {
        isCancelModalOpen.value = true
    }

    const cancelDelete = () => {
        isDeleteModalOpen.value = false
        noteToDelete.value = null
    }

    const confirmDelete = () => {
        if (!noteToDelete.value) return
        store.deleteNote(noteToDelete.value)
        cancelDelete()
    }

    return {
        isCancelModalOpen,
        isDeleteModalOpen,
        requestDelete,
        requestCancel,
        confirmDelete,
        cancelDelete
    }
}
<script setup lang="ts">
import { useNotesStore } from "../../stores/notes.ts"
import { useDeleteNoteConfirm } from "~~/composables/useDeleteNoteConfirm.ts"
import ConfirmDialog from "~~/components/ConfirmDialog.vue"
import NoteCard from "~~/components/NoteCard.vue"

const store = useNotesStore()
store.init()

const { isDeleteModalOpen, requestDelete, confirmDelete, cancelDelete } = useDeleteNoteConfirm()
</script>

<template>
    <div class="wrapper">
        <div class="content">
            <div class="content-header">
                <h3>Мои заметки:</h3>
                <NuxtLink v-if="store.notes.length" to="/notes/new" class="content-header__btn">Добавить</NuxtLink>
            </div>
            <div v-if="!store.notes.length">
                <p class="empty-state">Заметок пока нет</p>
                <NuxtLink to="/notes/new" class="content-header__btn">
                    Создать первую заметку
                </NuxtLink>
            </div>
            <div v-else class="cards-wrapper">
                <NoteCard
                    v-for="note in store.notes"
                    :key="note.id"
                    :note="note"
                    @delete="requestDelete(note.id)" />
            </div>
        </div>
        <ConfirmDialog
            :open="isDeleteModalOpen"
            message="Удалить эту заметку? Это действие необратимо."
            @confirm="confirmDelete"
            @cancel="cancelDelete"
        />
    </div>
</template>

<style lang="scss" scoped>
@use "../../assets/scss/variables" as *;

.wrapper {
    display: flex;
    align-items: center;
}

.content-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    &__btn {
        padding: $spacing-sm $spacing-md;
        background-color: $color-primary;
        color: $color-bg;
        border-radius: $border-radius-sm;
        font-weight: 500;
    }
}

.empty-state {
    padding: $spacing-sm $spacing-xs;
}

.cards-wrapper {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: $spacing-md;
}
</style>
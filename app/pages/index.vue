<script setup lang="ts">
import { useNotesStore } from "../../stores/notes.ts"
import { useDeleteNoteConfirm } from "~~/composables/useDeleteNoteConfirm.ts"
import ConfirmDialog from "~~/components/ConfirmDialog.vue"
import BaseButton from "~~/components/BaseButton.vue"

const store = useNotesStore()
store.init()

const { isModalOpen, requestDelete, confirmDelete, cancelDelete } = useDeleteNoteConfirm()
</script>

<template>
    <div class="wrapper">
        <div class="content">
            <NuxtLink to="/notes/new">Новая заметка</NuxtLink>
            <h3>Список заметок:</h3>
            <ul>
                <li v-for="note in store.notes" :key="note.id">
                    <NuxtLink :to="`/notes/${note.id}`">{{ note.title }}</NuxtLink>
                    <ul v-if="note.todos.length">
                        <li v-for="todo in note.todos.slice(0, 3)">
                            {{ todo.text }} {{ todo.checked }}
                        </li>
                    </ul>
                    <p v-else>Задач пока нет</p>
                    <BaseButton variant="danger" @click="requestDelete(note.id)">Удалить</BaseButton>
                </li>
            </ul>

            <ConfirmDialog
                :open="isModalOpen"
                message="Удалить эту заметку? Это действие необратимо."
                @confirm="confirmDelete"
                @cancel="cancelDelete"
            />
        </div>
    </div>
</template>

<style lang="scss" scoped>
.wrapper {
    display: flex;
    align-items: center;
}

.content {
    width: 100%;
    max-width: 640px;
    margin: 0 auto;
    padding: 20px;
    border-radius: 40px;
    background-color: #2e4c8c;
}
</style>
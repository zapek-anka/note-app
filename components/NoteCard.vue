<script setup lang="ts">
import type { Note } from "~~/types/note"
import BaseButton from "~~/components/BaseButton.vue"

const props = defineProps<{ note: Note }>()
const emit = defineEmits<{ delete: [] }>()

const PREVIEW_LIMIT = 3

const previewTodos = computed(() => props.note.todos.slice(0, PREVIEW_LIMIT))
const remainingCount = computed(() => Math.max(0, props.note.todos.length - PREVIEW_LIMIT))

const onDeleteClick = (evt: MouseEvent) => {
    evt.preventDefault()
    evt.stopPropagation()
    emit("delete")
}
</script>

<template>
    <NuxtLink :to="`/notes/${note.id}`" class="note-card">
        <h3 class="note-card__title">{{ note.title || 'Без названия' }}</h3>

        <ul class="note-card__preview">
            <li v-for="todo in previewTodos" :key="todo.id" class="note-card__preview-item">
                <span :class="{ 'note-card__done': todo.checked }">{{ todo.text }}</span>
            </li>
            <li v-if="remainingCount > 0" class="note-card__more">
                +{{ remainingCount }} ещё…
            </li>
            <li v-if="!note.todos.length" class="note-card__empty">
                Нет задач
            </li>
        </ul>

        <BaseButton
            class="note-card__delete"
            variant="danger"
            @click="onDeleteClick"
        >Удалить</BaseButton>
    </NuxtLink>
</template>

<style lang="scss" scoped>
@use "../assets/scss/variables" as *;

.note-card {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 10px;
    border-radius: $border-radius-md;
    border: 1px solid $color-border;
    background-color: $color-card;
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    transition: transform 0.15s ease, box-shadow 0.15s ease;

    &__preview {
        flex: 1;
    }

    &__preview-item {
        padding: $spacing-sm $spacing-xs;
        border-bottom: 1px solid $color-border;
    }

    &__done {
        text-decoration: line-through;
        color: $color-primary;
    }

    &__delete {
        margin-top: $spacing-md;
        align-self: flex-end;
    }

    &:hover {
        transform: translateY(-2px) rotate(-0.5deg);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    &:focus-visible {
        outline: 2px solid $color-primary;
        outline-offset: 2px;
    }
}
</style>
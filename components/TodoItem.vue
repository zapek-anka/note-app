<script setup lang="ts">
import type { TodoItem } from "../types/note"
import BaseButton from "~~/components/BaseButton.vue"

const props = defineProps<{ todo: TodoItem }>()
const emit = defineEmits<{
    commitText: [before: string, after: string]
    toggle: []
    remove: []
}>()

let beforeValue = ""

const onFocus = () => {
    beforeValue = props.todo.text
}

const onBlur = (e: FocusEvent) => {
    const after = (e.target as HTMLInputElement).value
    emit("commitText", beforeValue, after)
}

const onToggle = () => {
    emit("toggle")
}

const onRemove = () => {
    emit("remove")
}
</script>

<template>
    <li class="todo-item">
        <label class="todo-checkbox-wrapper">
            <input
                type="checkbox"
                class="todo-checkbox-wrapper__input"
                :checked="todo.checked"
                @change="onToggle"
            />
            <span class="todo-checkbox-wrapper__box" aria-hidden="true"/>
        </label>
        <input
            class="todo-item__input"
            type="text"
            :value="todo.text"
            @focus="onFocus"
            @blur="onBlur"
        />
        <BaseButton
            type="button"
            aria-label="Удалить задачу"
            @click="onRemove"
        >
            ✕
        </BaseButton>
    </li>
</template>

<style lang="scss" scoped>
@use "../assets/scss/variables" as *;

.todo-item {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-sm $spacing-xs;
    border-bottom: 1px solid $color-border;
}

.todo-item__input {
    border: none;
    background: transparent;
    font: inherit;
    width: 100%;
    padding: 2px 4px;
    border-radius: 4px;

    &:hover {
        background: $color-bg;
    }

    &:focus-visible {
        outline: none;
        background: white;
        box-shadow: 0 0 0 2px $color-primary;
    }
}

.todo-checkbox-wrapper {
    position: relative;
    display: inline-flex;
    cursor: pointer;

    &__input {
        position: absolute;
        opacity: 0;
        width: 100%;
        height: 100%;
        margin: 0;
        cursor: pointer;
    }

    &__box {
        width: 20px;
        height: 20px;
        border: 2px solid $color-border;
        border-radius: 4px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: background 0.15s ease, border-color 0.15s ease;
    }

    &__input:checked + &__box {
        background: $color-primary;
        border-color: $color-primary;

        &::after {
            content: '';
            width: 6px;
            height: 10px;
            border: solid white;
            border-width: 0 2px 2px 0;
            transform: rotate(45deg) translate(-1px, -1px);
        }
    }

    &__input:focus-visible + &__box {
        outline: 2px solid $color-primary;
        outline-offset: 2px;
    }
}
</style>
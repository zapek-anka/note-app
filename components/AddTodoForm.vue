<script setup lang="ts">
import { ref } from "vue"
import BaseButton from "~~/components/BaseButton.vue"

const emit = defineEmits<{ add: [text: string] }>()
const text = ref("")

const submit = () => {
    const trimmed = text.value.trim()
    if (!trimmed) return
    emit("add", trimmed)
    text.value = ""
}
</script>

<template>
    <form class="todo-add-form" @submit.prevent="submit">
        <input
            v-model="text"
            type="text"
            placeholder="Новая задача"
            aria-label="Текст новой задачи"
        />
        <BaseButton type="submit" :disabled="!text.trim()">Добавить</BaseButton>
    </form>
</template>
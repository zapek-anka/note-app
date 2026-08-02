<script setup lang="ts">
import { useNotesStore } from "../../../stores/notes.ts"
import { computed } from "vue"
import { useRoute } from "nuxt/app"

const route = useRoute()
const store = useNotesStore()
store.init()

console.log('kiki', store.notes)

const note = computed(() => store.getNoteById(route.params.id as string))
</script>

<template>
    <div v-if="note">{{ note.title }}</div>
    <div v-else>Заметка не найдена</div>
</template>
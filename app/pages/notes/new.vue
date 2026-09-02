<script setup lang="ts">
import { useNotesStore } from "~/stores/notes.ts"

const store = useNotesStore()
const newNote = store.createNote('Без названия')

await navigateTo(`/notes/${newNote.id}`)
</script>
<template>
    <div/>
</template>
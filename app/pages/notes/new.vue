<script setup lang="ts">
import { useNotesStore } from "~~/stores/notes.ts"

let store = useNotesStore()

let newNote = store.createNote('')
await navigateTo(`/notes/${newNote.id}`)
</script>
<template></template>
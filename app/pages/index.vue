<script setup lang="ts">
import { useNotesStore } from "../../stores/notes.ts"

const store = useNotesStore()
store.init()
</script>

<template>
    <div>
        <NuxtLink to="/notes/new">Новая заметка</NuxtLink>
        <h3>Список заметок:</h3>
        <ul>
            <li v-for="note in store.notes" :key="note.id">
                <NuxtLink :to="`/notes/${note.id}`">{{ note.title }}</NuxtLink>
            </li>
        </ul>
    </div>
</template>
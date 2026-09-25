<script setup lang="ts">
const { user, clear } = useUserSession()

const onLogout = async () => {
    await clear()
    navigateTo('/login')
}
</script>

<template>
    <div>
        <header>
            <BaseButton variant="secondary" @click="onLogout">Выйти</BaseButton>
        </header>

        <slot/>
    </div>
</template>
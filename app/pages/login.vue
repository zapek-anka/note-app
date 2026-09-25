<script setup lang="ts">

definePageMeta({ layout: 'auth' })

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const isSubmitting = ref(false)
const { fetch: refreshSession } = useUserSession()

const onSubmit = async () => {
    errorMessage.value = ''
    isSubmitting.value = true

    try {
        await $fetch('/api/auth/login', {
            method: 'POST',
            body: { email: email.value, password: password.value },
        })
        await refreshSession()
        // const { loggedIn } = useUserSession() // TODO: login cookie refresh
        await navigateTo( '/')

    } catch (err: any) {
        console.error('login failed:', err)
        errorMessage.value = err?.data?.message || 'Неверный логин или пароль'
    } finally {
        isSubmitting.value = false
    }
}
</script>

<template>
    <form class="auth-form" @submit.prevent="onSubmit">
        <h1>Логин</h1>

        <input v-model="email" type="email" placeholder="Email" required />
        <input v-model="password" type="password" placeholder="Пароль" required minlength="8" />

        <p v-if="errorMessage" class="auth-form__error" role="alert">{{ errorMessage }}</p>

        <BaseButton type="submit" variant="primary" :disabled="isSubmitting">
            {{ isSubmitting ? 'Вход...' : 'Войти' }}
        </BaseButton>

        <NuxtLink to="/register">Зарегистрироваться</NuxtLink>
    </form>
</template>
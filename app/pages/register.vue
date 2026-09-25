<script setup lang="ts">

definePageMeta({ layout: 'auth' })

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const isSubmitting = ref(false)

const onSubmit = async () => {
    errorMessage.value = ''
    isSubmitting.value = true

    try {
        await $fetch('/api/auth/register', {
            method: 'POST',
            body: { email: email.value, password: password.value },
        })
        await navigateTo('/')
    } catch (err: any) {
        errorMessage.value = err?.data?.message || 'Не удалось зарегистрироваться'
    } finally {
        isSubmitting.value = false
    }
}
</script>

<template>
    <form class="auth-form" @submit.prevent="onSubmit">
        <h1>Регистрация</h1>

        <input v-model="email" type="email" placeholder="Email" required />
        <input v-model="password" type="password" placeholder="Пароль" required minlength="8" />

        <p v-if="errorMessage" class="auth-form__error" role="alert">{{ errorMessage }}</p>

        <BaseButton type="submit" variant="primary" :disabled="isSubmitting">
            {{ isSubmitting ? 'Регистрация...' : 'Зарегистрироваться' }}
        </BaseButton>

        <NuxtLink to="/login">Уже есть аккаунт? Войти</NuxtLink>
    </form>
</template>
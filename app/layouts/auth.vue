<template>
    <div class="auth-layout">
        <div class="auth-layout__card">
            <slot />
        </div>
    </div>
</template>

<style lang="scss" scoped>
@use '~/assets/scss/variables' as v;

.auth-layout {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: v.$color-bg;

    &__card {
        background: white;
        border-radius: 12px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        padding: v.$spacing-lg;
        width: 100%;
        max-width: 400px;
    }
}
</style>
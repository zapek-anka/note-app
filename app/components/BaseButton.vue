<script setup lang="ts">
withDefaults(
    defineProps<{
        variant?: "primary" | "danger" | "secondary"
        type?: "button" | "submit"
        disabled?: boolean
    }>(),
    {
        variant: "primary",
        type: "button",
        disabled: false,
    }
)
</script>

<template>
    <button
        :type="type"
        :disabled="disabled"
        :class="['btn', `btn--${variant}`]"
    >
        <slot />
    </button>
</template>

<style lang="scss" scoped>
@use "@/assets/scss/variables" as v;
@use "sass:color";

.btn {
    padding: v.$spacing-sm v.$spacing-md;
    border: none;
    border-radius: v.$border-radius-sm;
    font-size: 1rem;
    cursor: pointer;

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    &:focus-visible {
        outline: 2px solid v.$color-primary;
        outline-offset: 2px;
    }
}

.btn--primary {
    background: v.$color-primary;
    color: white;

    &:hover:not(:disabled) {
        background: color.adjust(v.$color-primary, $lightness: -10%);
    }
}

.btn--danger {
    background: v.$color-danger;
    color: white;

    &:hover:not(:disabled) {
        background: color.adjust(v.$color-danger, $lightness: -10%);
    }
}

.btn--secondary {
    background: transparent;
    border: 1px solid v.$color-border;
    color: v.$color-text;

    &:hover:not(:disabled) {
        background: v.$color-bg;
    }
}
</style>
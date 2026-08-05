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
@use "../assets/scss/variables" as *;
@use "sass:color";

.btn {
    padding: $spacing-sm $spacing-md;
    border: none;
    border-radius: $border-radius-sm;
    font-size: 1rem;
    cursor: pointer;

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    &:focus-visible {
        outline: 2px solid $color-primary;
        outline-offset: 2px;
    }
}

.btn--primary {
    background: $color-primary;
    color: white;

    &:hover:not(:disabled) {
        background: color.adjust($color-danger, $lightness: -10%);
    }
}

.btn--danger {
    background: $color-danger;
    color: white;

    &:hover:not(:disabled) {
        background: color.adjust($color-danger, $lightness: -10%);
    }
}

.btn--secondary {
    background: transparent;
    border: 1px solid $color-border;
    color: $color-text;

    &:hover:not(:disabled) {
        background: $color-bg;
    }
}
</style>
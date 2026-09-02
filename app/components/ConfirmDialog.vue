<script setup lang="ts">
import BaseModal from "./BaseModal.vue"
import BaseButton from "./BaseButton.vue"

defineProps<{ open: boolean; message: string }>()
const emit = defineEmits<{ confirm: []; cancel: [] }>()
</script>

<template>
    <BaseModal :open="open" @close="emit('cancel')">
        <p>{{ message }}</p>
        <div class="confirm-dialog__actions">
            <BaseButton variant="secondary" @click="emit('cancel')">Отмена</BaseButton>
            <BaseButton variant="danger" @click="emit('confirm')">Удалить</BaseButton>
        </div>
    </BaseModal>
</template>

<style lang="scss" scoped>
@use "@/assets/scss/variables" as v;

.confirm-dialog {
    &__actions {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: v.$spacing-md;
    }
}
</style>
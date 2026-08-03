<script setup lang="ts">
import {ref, nextTick, watch} from "vue"
const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const modalRef = ref<HTMLElement | null>(null)

const getFocusableElements = (): HTMLElement[] => {
    if (!modalRef.value) return []
    const selector = 'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
    return Array.from(modalRef.value.querySelectorAll<HTMLElement>(selector))
        .filter(el => !el.hasAttribute("disabled"))
}

const trapFocusOnTab = (evt: KeyboardEvent) => {
    const focusable = getFocusableElements()
    if (focusable.length === 0) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    const active = document.activeElement

    if (evt.shiftKey) {
        if (active === first) {
            evt.preventDefault()
            last?.focus()
        }
    } else {
        if (active === last) {
            evt.preventDefault()
            first?.focus()
        }
    }
}

const handleKeydown = (evt: KeyboardEvent) => {
    if (evt.key === 'Escape') emit('close')
    if (evt.key === 'Tab') trapFocusOnTab(evt)
}

const trapFocus = () => {
    const focusable = getFocusableElements()
    focusable[0]?.focus()
}

watch(() => props.open, async (isOpen) => {
    if (isOpen) {
        await nextTick()
        trapFocus()
    }
})
</script>

<template>
    <div v-if="open" class="modal-overlay" @keydown="handleKeydown">
        <div ref="modalRef" class="modal" role="dialog" aria-modal="true" tabindex="-1">
            <slot />
        </div>
    </div>
</template>

<style lang="scss" scoped>
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.3s ease-in-out;
}

.modal {
    background: #ffffff;
    padding: 24px;
    border-radius: 16px;
    max-width: 400px;
    width: 90%;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    transform: translateY(0);
    animation: scaleIn 0.3s ease;
}
</style>
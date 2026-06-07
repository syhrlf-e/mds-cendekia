<script setup lang="ts">
import { computed, ref, useId } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: boolean
  title?: string
  ariaLabel?: string
  ariaDescribedby?: string
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
}>(), {
  modelValue: false,
  closeOnBackdrop: true,
  closeOnEscape: true
})

const emit = defineEmits(['update:modelValue', 'close'])
const dialogRef = ref<HTMLElement | null>(null)
const titleId = `bottom-sheet-title-${useId()}`
const isOpen = computed(() => props.modelValue)

const close = () => {
  emit('update:modelValue', false)
  emit('close')
}

useAccessibleDialog({
  isOpen,
  dialogRef,
  close,
  closeOnEscape: () => props.closeOnEscape
})
</script>

<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex flex-col justify-end">
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/50 transition-opacity"
          aria-hidden="true"
          @click="closeOnBackdrop && close()"
        ></div>

        <div
          ref="dialogRef"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="title ? titleId : undefined"
          :aria-label="title ? undefined : (ariaLabel || 'Panel')"
          :aria-describedby="ariaDescribedby"
          tabindex="-1"
          class="relative flex h-[85vh] w-full flex-col rounded-t-3xl bg-bg-surface"
        >
          <h2 v-if="title" :id="titleId" class="sr-only">
            {{ title }}
          </h2>
          <div class="w-full flex justify-center pt-3 pb-2 shrink-0">
            <div class="w-12 h-1.5 bg-border rounded-full"></div>
          </div>

          <div class="px-4 pb-6 overflow-y-auto grow flex flex-col">
            <slot></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.sheet-enter-active,
.sheet-leave-active {
  transition: all 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}

.sheet-enter-from .bg-black\/50,
.sheet-leave-to .bg-black\/50 {
  opacity: 0;
}

.sheet-enter-from .bg-bg-surface {
  transform: translateY(100%);
}

.sheet-leave-to .bg-bg-surface {
  transform: translateY(100%);
}
</style>

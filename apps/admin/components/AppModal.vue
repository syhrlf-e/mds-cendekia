<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { computed, ref, useId } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: boolean
  title?: string
  ariaLabel?: string
  ariaDescribedby?: string
  width?: string
  zIndex?: string | number
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
  showCloseButton?: boolean
  showHeader?: boolean
}>(), {
  modelValue: false,
  width: 'max-w-lg',
  zIndex: 50,
  closeOnBackdrop: true,
  closeOnEscape: true,
  showCloseButton: true,
  showHeader: true
})

const emit = defineEmits(['update:modelValue', 'close'])
const dialogRef = ref<HTMLElement | null>(null)
const titleId = `modal-title-${useId()}`
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
    <Transition name="fade">
      <div v-if="modelValue" class="fixed inset-0 flex items-center justify-center p-4 sm:p-6" :style="{ zIndex: zIndex }">
        <div
          class="absolute inset-0 bg-black/40 transition-opacity"
          aria-hidden="true"
          @click="closeOnBackdrop && close()"
        ></div>

        <div
          ref="dialogRef"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="title ? titleId : undefined"
          :aria-label="title ? undefined : (ariaLabel || 'Dialog')"
          :aria-describedby="ariaDescribedby"
          tabindex="-1"
          :class="[
            'relative flex max-h-[90vh] w-full flex-col rounded-2xl bg-bg-surface',
            width
          ]"
        >
          <div v-if="showHeader" class="flex shrink-0 items-center justify-between border-b border-border px-6 py-5">
            <h3 v-if="title" :id="titleId" class="text-[17px] font-semibold leading-[1.24] tracking-[-0.2px] text-text-primary">
              {{ title }}
            </h3>
            <slot name="header" v-else></slot>

            <button
              v-if="showCloseButton"
              type="button"
              aria-label="Tutup dialog"
              class="-mr-2 rounded-full p-2 text-text-secondary transition-colors hover:bg-bg-base hover:text-text-primary"
              @click="close"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <div class="grow overflow-y-auto p-6">
            <slot></slot>
          </div>

          <div v-if="$slots.footer" class="flex shrink-0 items-center justify-end gap-3 rounded-b-2xl border-t border-border bg-bg-surface px-6 py-4">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-active .bg-bg-surface {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-enter-from .bg-bg-surface {
  opacity: 0;
  transform: scale(0.95);
}

.fade-leave-active .bg-bg-surface {
  transition: all 0.2s ease-in;
}

.fade-leave-to .bg-bg-surface {
  opacity: 0;
  transform: scale(0.95);
}
</style>

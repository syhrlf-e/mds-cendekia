<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { onMounted, onUnmounted, watch } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: boolean
  title?: string
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

const close = () => {
  emit('update:modelValue', false)
  emit('close')
}

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

onMounted(() => {
  if (props.modelValue) document.body.style.overflow = 'hidden'

  // Close on Escape key
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && props.modelValue && props.closeOnEscape) close()
  }
  document.addEventListener('keydown', handleEscape)

  onUnmounted(() => {
    document.body.style.overflow = ''
    document.removeEventListener('keydown', handleEscape)
  })
})
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modelValue" class="fixed inset-0 flex items-center justify-center p-4 sm:p-6" :style="{ zIndex: zIndex }">
        <div
          class="absolute inset-0 bg-black/40 transition-opacity"
          @click="closeOnBackdrop && close()"
        ></div>

        <div
          :class="[
            'relative flex max-h-[90vh] w-full flex-col rounded-2xl bg-bg-surface shadow-[rgba(0,0,0,0.22)_3px_5px_30px_0]',
            width
          ]"
        >
          <div v-if="showHeader" class="flex shrink-0 items-center justify-between border-b border-border px-6 py-5">
            <h3 v-if="title" class="text-[17px] font-semibold leading-[1.24] tracking-[-0.2px] text-text-primary">
              {{ title }}
            </h3>
            <slot name="header" v-else></slot>

            <button
              v-if="showCloseButton"
              @click="close"
              class="-mr-2 rounded-full p-2 text-text-secondary transition-colors hover:bg-bg-base hover:text-text-primary"
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

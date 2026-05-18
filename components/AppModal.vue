<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { onMounted, onUnmounted, watch } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: boolean
  title?: string
  width?: string
  zIndex?: string | number
}>(), {
  modelValue: false,
  width: 'max-w-lg',
  zIndex: 50
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
    if (e.key === 'Escape' && props.modelValue) close()
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
        <div class="absolute inset-0 bg-black/50 transition-opacity" @click="close"></div>

        <div
          :class="[
            'relative bg-bg-surface rounded-2xl shadow-xl w-full max-h-[90vh] flex flex-col',
            width
          ]"
        >
          <div class="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
            <h3 v-if="title" class="text-lg font-heading font-semibold text-text-primary">
              {{ title }}
            </h3>
            <slot name="header" v-else></slot>

            <button
              @click="close"
              class="p-2 -mr-2 text-text-secondary hover:text-text-primary hover:bg-bg-base rounded-full transition-colors"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <div class="p-6 overflow-y-auto grow">
            <slot></slot>
          </div>

          <div v-if="$slots.footer" class="px-6 py-4 border-t border-border shrink-0 bg-bg-base/50 rounded-b-2xl flex items-center justify-end gap-3">
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

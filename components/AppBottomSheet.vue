<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: boolean
}>(), {
  modelValue: false
})

const emit = defineEmits(['update:modelValue', 'close'])

const close = () => {
  emit('update:modelValue', false)
  emit('close')
}

// Prevent body scroll when bottom sheet is open
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

onMounted(() => {
  if (props.modelValue) document.body.style.overflow = 'hidden'
  
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
    <Transition name="sheet">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex flex-col justify-end">
        <!-- Backdrop -->
        <div 
          class="absolute inset-0 bg-black/50 transition-opacity" 
          @click="close"
        ></div>
        
        <!-- Sheet Panel -->
        <div class="relative bg-bg-surface w-full h-[85vh] rounded-t-3xl shadow-2xl flex flex-col">
          <!-- Drag Handle (Decorative) -->
          <div class="w-full flex justify-center pt-3 pb-2 shrink-0">
            <div class="w-12 h-1.5 bg-border rounded-full"></div>
          </div>
          
          <!-- Content Area -->
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

/* Backdrop Animation */
.sheet-enter-from .bg-black\/50,
.sheet-leave-to .bg-black\/50 {
  opacity: 0;
}

/* Panel Animation */
.sheet-enter-from .bg-bg-surface {
  transform: translateY(100%);
}

.sheet-leave-to .bg-bg-surface {
  transform: translateY(100%);
}
</style>
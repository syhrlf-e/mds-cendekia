<script setup lang="ts">
import { useToast } from '~/composables/useToast'
import { CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-vue-next'

const { toasts } = useToast()

const getIcon = (type: string) => {
  switch (type) {
    case 'success': return CheckCircle2
    case 'error': return AlertCircle
    case 'warning': return AlertTriangle
    default: return Info
  }
}

const getToastClass = (type: string) => {
  switch (type) {
    case 'success': return 'bg-success text-white'
    case 'error': return 'bg-error text-white'
    case 'warning': return 'bg-warning text-white'
    default: return 'bg-bg-surface text-text-primary border border-border'
  }
}
</script>

<template>
  <div class="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'flex items-center gap-2 px-4 py-2 rounded-full shadow-lg pointer-events-auto',
          getToastClass(toast.type)
        ]"
      >
        <component :is="getIcon(toast.type)" class="w-5 h-5" />
        <span class="text-sm font-medium">{{ toast.message }}</span>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}
.toast-leave-to {
  opacity: 0;
}
</style>

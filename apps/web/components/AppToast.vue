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
  <div class="fixed top-4 left-1/2 z-[100] flex w-full max-w-[min(calc(100vw-32px),460px)] -translate-x-1/2 flex-col items-center gap-2.5 px-4 pointer-events-none">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'flex min-h-14 w-full items-center gap-3 rounded-full px-3.5 py-2.5 shadow-[rgba(0,0,0,0.16)_0_10px_28px_0] pointer-events-auto',
          getToastClass(toast.type)
        ]"
      >
        <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/22">
          <component :is="getIcon(toast.type)" class="h-5 w-5" />
        </span>
        <span class="min-w-0 pr-2 text-sm font-medium leading-snug">{{ toast.message }}</span>
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

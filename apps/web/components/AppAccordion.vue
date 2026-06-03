<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Lock, CheckCircle2, ChevronDown } from 'lucide-vue-next'

type AccordionStatus = 'locked' | 'incomplete' | 'complete'

const props = withDefaults(defineProps<{
  title: string
  isOpen?: boolean
  isLocked?: boolean
  isCompleted?: boolean
  status?: AccordionStatus
  showStatusText?: boolean
}>(), {
  isOpen: false,
  isLocked: false,
  isCompleted: false,
  status: undefined,
  showStatusText: false
})

const emit = defineEmits(['toggle'])

const handleToggle = () => {
  if (!props.isLocked) {
    emit('toggle')
  }
}

const isTransitioning = ref(false)
let timeoutId: number | null = null

watch(() => props.isOpen, () => {
  isTransitioning.value = true
  if (timeoutId) clearTimeout(timeoutId)
  timeoutId = window.setTimeout(() => {
    isTransitioning.value = false
  }, 300)
})

const effectiveStatus = computed<AccordionStatus>(() => {
  if (props.status) return props.status
  if (props.isLocked) return 'locked'
  if (props.isCompleted) return 'complete'
  return 'incomplete'
})

const statusIcon = computed(() => {
  if (effectiveStatus.value === 'locked') return Lock
  if (effectiveStatus.value === 'complete') return CheckCircle2
  return ChevronDown
})

const iconClass = computed(() => {
  if (effectiveStatus.value === 'locked') return 'text-text-secondary w-5 h-5'
  if (effectiveStatus.value === 'complete') return 'text-success w-5 h-5'
  return `text-text-secondary w-5 h-5 transition-transform duration-300 ${props.isOpen ? 'rotate-180' : ''}`
})

const statusText = computed(() => {
  if (effectiveStatus.value === 'locked') return ''
  if (effectiveStatus.value === 'complete') return 'Lengkap'
  return 'Belum lengkap'
})

const statusTextClass = computed(() => {
  if (effectiveStatus.value === 'complete') return 'text-success'
  return 'text-text-secondary'
})

const headerClass = computed(() => {
  return [
    'flex items-center justify-between w-full p-4 md:p-6 text-left transition-colors select-none relative z-10',
    props.isLocked ? 'cursor-not-allowed bg-bg-base text-text-secondary' : 'cursor-pointer bg-bg-surface hover:bg-primary-50 rounded-t-2xl',
    props.isOpen ? 'border-b border-border rounded-t-2xl' : 'rounded-2xl'
  ]
})
</script>

<template>
  <div
    class="w-full bg-bg-surface border border-border rounded-2xl transition-all duration-300 relative"
    :class="[
      isOpen && !isLocked ? 'z-20' : 'z-10',
      isTransitioning || (!isOpen || isLocked) ? 'overflow-hidden' : ''
    ]"
  >
    <button
      type="button"
      :class="headerClass"
      :disabled="isLocked"
      @click="handleToggle"
      :aria-expanded="isOpen"
    >
      <span class="font-heading font-semibold text-text-primary text-base md:text-lg">
        {{ title }}
      </span>
      <span class="flex items-center gap-2">
        <span
          v-if="showStatusText && statusText"
          class="hidden sm:inline text-sm font-medium"
          :class="statusTextClass"
        >
          {{ statusText }}
        </span>
        <component :is="statusIcon" :class="iconClass" />
      </span>
    </button>

    <div
      class="grid transition-all duration-300 ease-in-out relative"
      :style="{
        gridTemplateRows: (isOpen && !isLocked) ? '1fr' : '0fr',
        opacity: (isOpen && !isLocked) ? '1' : '0',
        visibility: (isOpen && !isLocked) ? 'visible' : 'hidden'
      }"
    >
      <div :class="isTransitioning || (!isOpen || isLocked) ? 'overflow-hidden' : ''">
        <div class="p-4 md:p-6">
          <slot></slot>
        </div>
      </div>
    </div>
  </div>
</template>

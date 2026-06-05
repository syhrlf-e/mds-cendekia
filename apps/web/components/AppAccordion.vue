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
  lockedText?: string
}>(), {
  isOpen: false,
  isLocked: false,
  isCompleted: false,
  status: undefined,
  showStatusText: false,
  lockedText: 'Lengkapi tahap sebelumnya'
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
  }, 500)
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
  if (effectiveStatus.value === 'locked') return 'text-text-secondary h-4 w-4 md:h-5 md:w-5'
  if (effectiveStatus.value === 'complete') return 'text-success h-4 w-4 md:h-5 md:w-5'
  return `text-text-secondary h-4 w-4 md:h-5 md:w-5 transition-transform duration-500 ${props.isOpen ? 'rotate-180' : ''}`
})

const statusText = computed(() => {
  if (effectiveStatus.value === 'locked') return props.lockedText
  if (effectiveStatus.value === 'complete') return 'Lengkap'
  return 'Belum lengkap'
})

const statusTextClass = computed(() => {
  if (effectiveStatus.value === 'locked') return 'text-text-secondary'
  if (effectiveStatus.value === 'complete') return 'text-success'
  return 'text-text-secondary'
})

const headerClass = computed(() => {
  return [
    'flex items-center justify-between w-full gap-3 p-3.5 md:p-5 xl:p-6 text-left transition-colors duration-300 select-none relative z-10',
    props.isLocked ? 'cursor-not-allowed bg-bg-base text-text-secondary' : 'cursor-pointer bg-bg-surface hover:bg-bg-base rounded-t-2xl',
    props.isOpen ? 'border-b border-border rounded-t-2xl' : 'rounded-2xl'
  ]
})
</script>

<template>
  <div
    class="relative w-full rounded-2xl border border-border bg-bg-surface transition-all duration-500"
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
      <span
        class="min-w-0 font-heading text-sm font-semibold leading-snug md:text-lg"
        :class="effectiveStatus === 'locked' ? 'text-text-secondary' : 'text-text-primary'"
      >
        {{ title }}
      </span>
      <span class="flex shrink-0 items-center gap-2">
        <span
          v-if="showStatusText && statusText"
          class="hidden text-sm font-medium sm:inline"
          :class="statusTextClass"
        >
          {{ statusText }}
        </span>
        <component :is="statusIcon" :class="iconClass" />
      </span>
    </button>

    <div
      class="relative grid transition-all duration-500 ease-in-out"
      :class="isOpen && !isLocked ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'"
    >
      <div class="min-h-0" :class="isTransitioning || (!isOpen || isLocked) ? 'overflow-hidden' : ''">
        <div class="p-3.5 md:p-5 xl:p-6">
          <slot></slot>
        </div>
      </div>
    </div>
  </div>
</template>

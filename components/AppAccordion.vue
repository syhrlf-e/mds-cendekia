<script setup lang="ts">
import { computed } from 'vue'
import { Lock, CheckCircle2, ChevronDown } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  title: string
  isOpen?: boolean
  isLocked?: boolean
  isCompleted?: boolean
}>(), {
  isOpen: false,
  isLocked: false,
  isCompleted: false
})

const emit = defineEmits(['toggle'])

const handleToggle = () => {
  if (!props.isLocked) {
    emit('toggle')
  }
}

const statusIcon = computed(() => {
  if (props.isLocked) return Lock
  if (props.isCompleted) return CheckCircle2
  return ChevronDown
})

const iconClass = computed(() => {
  if (props.isLocked) return 'text-text-secondary w-5 h-5'
  if (props.isCompleted) return 'text-success w-5 h-5'
  return `text-text-secondary w-5 h-5 transition-transform duration-300 ${props.isOpen ? 'rotate-180' : ''}`
})

const headerClass = computed(() => {
  return [
    'flex items-center justify-between w-full p-4 md:p-6 text-left transition-colors select-none',
    props.isLocked ? 'cursor-not-allowed bg-bg-base opacity-75' : 'cursor-pointer hover:bg-bg-base/50',
    props.isOpen ? 'border-b border-border' : ''
  ]
})
</script>

<template>
  <div 
    class="w-full bg-bg-surface border border-border rounded-2xl overflow-hidden transition-all duration-300"
    :class="{ 'ring-1 ring-border shadow-sm': isOpen && !isLocked }"
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
      <component :is="statusIcon" :class="iconClass" />
    </button>

    <div
      v-show="isOpen && !isLocked"
      class="p-4 md:p-6"
    >
      <slot></slot>
    </div>
  </div>
</template>
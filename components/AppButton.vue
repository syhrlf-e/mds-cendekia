<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'danger'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
}>(), {
  variant: 'primary',
  type: 'button',
  disabled: false,
  loading: false
})

defineEmits(['click'])

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'primary':
      return 'bg-cta hover:bg-cta-hover text-cta-text focus:ring-cta'
    case 'secondary':
      return 'border border-border bg-transparent text-text-primary hover:bg-bg-base focus:ring-border'
    case 'danger':
      return 'border border-error bg-transparent text-error hover:bg-error hover:text-white focus:ring-error'
    default:
      return ''
  }
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
      'h-12 px-6',
      variantClasses,
      (disabled || loading) ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''
    ]"
    @click="$emit('click', $event)"
  >
    <div v-if="loading" class="dot-wave mr-2">
      <span class="bg-current"></span>
      <span class="bg-current"></span>
      <span class="bg-current"></span>
    </div>
    <slot />
  </button>
</template>
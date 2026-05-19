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
      return 'bg-brand hover:bg-brand-hover text-white focus:ring-brand'
    case 'secondary':
      return 'border border-brand bg-transparent text-brand hover:bg-primary-50 focus:ring-brand'
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
      'inline-flex items-center justify-center rounded-full font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.97]',
      'min-h-11 px-[22px] py-[11px] text-[15px] leading-none',
      variantClasses,
      (disabled || loading) ? 'opacity-40 cursor-not-allowed pointer-events-none active:scale-100' : ''
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

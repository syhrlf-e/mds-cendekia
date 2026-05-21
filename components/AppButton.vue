<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
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
      return 'rounded-full bg-brand px-[22px] py-[11px] text-[15px] text-white hover:bg-brand-hover focus:ring-brand'
    case 'secondary':
      return 'rounded-full border-[1.5px] border-brand bg-transparent px-[22px] py-[11px] text-[15px] text-brand hover:bg-primary-50 focus:ring-brand'
    case 'ghost':
      return 'rounded-lg border border-border-soft bg-[#fafafc] px-4 py-2 text-[13px] text-text-primary hover:bg-bg-parchment focus:ring-brand'
    case 'danger':
      return 'rounded-full bg-error px-[22px] py-[11px] text-[15px] text-white hover:bg-red-700 focus:ring-error'
    case 'success':
      return 'rounded-lg bg-success px-4 py-2 text-[14px] text-white hover:bg-green-700 focus:ring-success'
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
      'inline-flex min-h-11 items-center justify-center font-medium leading-none transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.97]',
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

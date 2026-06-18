<script setup lang="ts">
import { computed } from 'vue'

type BadgeStatus = 'pending' | 'approved' | 'rejected'
type BadgeVariant = BadgeStatus | 'success' | 'warning' | 'danger' | 'brand' | 'neutral' | 'info'
type BadgeAppearance = 'soft' | 'outline' | 'solid'
type BadgeSize = 'sm' | 'md'

const props = withDefaults(defineProps<{
  status?: BadgeStatus
  variant?: BadgeVariant
  appearance?: BadgeAppearance
  size?: BadgeSize
  text?: string
}>(), {
  status: undefined,
  variant: undefined,
  appearance: 'soft',
  size: 'sm',
  text: ''
})

const statusConfig = computed(() => {
  const variant = props.variant || props.status || 'neutral'

  switch (variant) {
    case 'pending':
    case 'warning':
      return {
        soft: 'bg-status-pending-bg text-status-pending-text',
        outline: 'border border-status-pending-text/25 bg-status-pending-bg/70 text-status-pending-text',
        solid: 'bg-status-pending-text text-white',
        defaultText: 'Menunggu'
      }
    case 'approved':
    case 'success':
      return {
        soft: 'bg-status-approved-bg text-status-approved-text',
        outline: 'border border-status-approved-text/25 bg-status-approved-bg/60 text-status-approved-text',
        solid: 'bg-status-approved-text text-white',
        defaultText: 'Diterima'
      }
    case 'rejected':
    case 'danger':
      return {
        soft: 'bg-status-rejected-bg text-status-rejected-text',
        outline: 'border border-status-rejected-text/25 bg-status-rejected-bg/60 text-status-rejected-text',
        solid: 'bg-status-rejected-text text-white',
        defaultText: 'Ditolak'
      }
    case 'brand':
      return {
        soft: 'bg-primary-50 text-brand',
        outline: 'border border-brand/25 bg-primary-50/60 text-brand',
        solid: 'bg-brand text-white',
        defaultText: ''
      }
    case 'info':
      return {
        soft: 'bg-blue-50 text-blue-600',
        outline: 'border border-blue-600/25 bg-blue-50/60 text-blue-600',
        solid: 'bg-blue-600 text-white',
        defaultText: ''
      }
    case 'neutral':
    default:
      return {
        soft: 'bg-bg-base text-text-secondary',
        outline: 'border border-border-soft bg-bg-surface text-text-secondary',
        solid: 'bg-text-secondary text-white',
        defaultText: ''
      }
  }
})

const sizeClass = computed(() => {
  if (props.size === 'md') return 'px-3 py-1 text-xs'
  return 'px-2.5 py-0.5 text-xs'
})

const badgeClass = computed(() => statusConfig.value[props.appearance])
</script>

<template>
  <span
    :class="[
      'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-medium leading-none',
      sizeClass,
      badgeClass
    ]"
  >
    <slot>{{ text || statusConfig.defaultText }}</slot>
  </span>
</template>

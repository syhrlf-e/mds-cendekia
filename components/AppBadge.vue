<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  status: 'pending' | 'approved' | 'rejected'
  text?: string
}>()

const statusConfig = computed(() => {
  switch (props.status) {
    case 'pending':
      return {
        class: 'bg-status-pending-bg text-status-pending-text',
        defaultText: 'Menunggu'
      }
    case 'approved':
      return {
        class: 'bg-status-approved-bg text-status-approved-text',
        defaultText: 'Diterima'
      }
    case 'rejected':
      return {
        class: 'bg-status-rejected-bg text-status-rejected-text',
        defaultText: 'Ditolak'
      }
    default:
      return {
        class: 'bg-bg-surface text-text-primary border border-border',
        defaultText: ''
      }
  }
})
</script>

<template>
  <span
    :class="[
      'inline-flex items-center rounded-full px-2.5 py-0.75 text-xs font-semibold',
      statusConfig.class
    ]"
  >
    {{ text || statusConfig.defaultText }}
  </span>
</template>

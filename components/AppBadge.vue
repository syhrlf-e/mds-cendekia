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
        class: 'bg-status-pending text-text-primary',
        defaultText: 'Menunggu Persetujuan'
      }
    case 'approved':
      return {
        class: 'bg-status-approved text-white',
        defaultText: 'Pendaftaran Diterima'
      }
    case 'rejected':
      return {
        class: 'bg-status-rejected text-white',
        defaultText: 'Pendaftaran Ditolak'
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
      'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
      statusConfig.class
    ]"
  >
    {{ text || statusConfig.defaultText }}
  </span>
</template>

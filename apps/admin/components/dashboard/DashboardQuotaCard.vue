<script setup lang="ts">
import type { DashboardQuotaItem } from '~/composables/useDashboardViewModel'

defineProps<{
  items: DashboardQuotaItem[]
}>()
</script>

<template>
  <DashboardPanel
    title="Kuota Pendaftaran"
    class="h-[309px]"
  >
    <div v-if="items.length" class="space-y-5 px-2 pt-5">
      <div
        v-for="item in items"
        :key="item.label"
        class="flex items-center justify-between gap-4 font-heading text-base font-semibold text-[#323232]"
      >
        <span>{{ item.label }}</span>
        <span>
          <span>{{ item.used }}</span>/{{ item.quota || '-' }}
        </span>
      </div>
    </div>
    <p v-else class="px-2 pt-5 text-[13px] text-text-muted">Belum ada gelombang.</p>
  </DashboardPanel>
</template>

<script setup lang="ts">
import type { DashboardQuotaItem } from '~/composables/useDashboardViewModel'

defineProps<{
  items: DashboardQuotaItem[]
}>()
</script>

<template>
  <DashboardPanel
    title="Kuota Pendaftaran"
    class="admin-dashboard-compact-panel h-[236px]"
  >
    <div v-if="items.length" class="space-y-4 px-2 pt-4">
      <div
        v-for="item in items"
        :key="item.label"
        class="flex items-center justify-between gap-4 font-heading text-sm font-semibold text-[#323232]"
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

<style scoped>
@media (max-height: 820px) {
  .admin-dashboard-compact-panel {
    height: 204px;
  }
}
</style>

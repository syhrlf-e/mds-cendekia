<script setup lang="ts">
import type { DashboardWave } from '~/types/adminDashboard'

defineProps<{
  waves: DashboardWave[]
}>()
</script>

<template>
  <DashboardPanel
    title="Gelombang Berjalan"
    class="admin-dashboard-compact-panel h-[236px]"
  >
    <div v-if="waves.length" class="space-y-4 px-2 pt-4">
      <div
        v-for="item in waves"
        :key="item.order"
        class="grid grid-cols-[120px_1fr_auto] items-center gap-6 font-heading font-semibold text-[#323232]"
      >
        <span class="text-sm">Gelombang {{ item.order || '-' }}</span>
        <span class="text-sm">
          {{ item.total_pendaftar }}/{{ item.kuota }}
        </span>
        <span class="text-xs">
          {{ item.status ? 'Sedang Berlangsung' : 'Tidak Aktif' }}
        </span>
      </div>
    </div>
    <p v-else class="px-2 pt-5 text-[13px] text-text-muted">Belum ada gelombang berjalan.</p>
  </DashboardPanel>
</template>

<style scoped>
@media (max-height: 820px) {
  .admin-dashboard-compact-panel {
    height: 204px;
  }
}
</style>

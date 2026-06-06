<script setup lang="ts">
import type { DashboardWave } from '~/types/adminDashboard'

defineProps<{
  waves: DashboardWave[]
}>()
</script>

<template>
  <DashboardPanel
    title="Gelombang Berjalan"
    class="h-[309px]"
  >
    <div v-if="waves.length" class="space-y-5 px-2 pt-5">
      <div
        v-for="item in waves"
        :key="item.order"
        class="grid grid-cols-[140px_1fr_auto] items-center gap-8 font-heading font-semibold text-[#323232]"
      >
        <span class="text-base">Gelombang {{ item.order || '-' }}</span>
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

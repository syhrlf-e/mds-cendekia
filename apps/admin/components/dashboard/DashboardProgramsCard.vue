<script setup lang="ts">
import type { DashboardProgramPackage } from '~/types/adminDashboard'

defineProps<{
  programs: DashboardProgramPackage[]
}>()
</script>

<template>
  <DashboardPanel
    title="Program Tersedia"
    class="h-[236px]"
  >
    <div class="space-y-3 px-1 pt-3">
      <div
        v-for="(program, index) in programs.slice(0, 3)"
        :key="program.nama"
        class="flex h-12 items-center justify-between rounded-[16px] px-3 text-[13px] font-medium"
        :class="index === 0 ? 'bg-brand text-white' : 'bg-transparent text-brand'"
      >
        <span>{{ program.nama }}</span>
        <span
          v-if="index === 0 && program.status"
          class="rounded-lg bg-white px-2 py-1 text-[11px] leading-none text-success"
        >
          Aktif
        </span>
      </div>
      <p v-if="!programs.length" class="px-2 text-[13px] text-text-muted">Belum ada program aktif.</p>
    </div>
  </DashboardPanel>
</template>

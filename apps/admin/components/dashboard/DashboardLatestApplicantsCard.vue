<script setup lang="ts">
import type { DashboardLatestApplicant } from '~/types/adminDashboard'

defineProps<{
  applicants: DashboardLatestApplicant[]
  applicantStatusLabel: (status: boolean) => string
  applicantStatusClass: (status: boolean) => string
}>()
</script>

<template>
  <DashboardPanel
    title="Data Calon Siswa Terbaru"
    class="min-h-0 overflow-hidden"
    title-class="px-4 pt-2"
  >
    <div class="min-h-0 overflow-auto px-4 pt-5">
      <div
        v-if="applicants.length"
        class="space-y-3"
      >
        <div
          v-for="(item, index) in applicants"
          :key="`${item.nama}-${index}`"
          class="grid h-[70px] grid-cols-[32px_180px_1fr_160px_1.2fr_112px] items-center gap-4 rounded-[14px] bg-[#f9f9f9] px-5 text-[13px] font-medium text-[#6e6e6e]"
        >
          <span>{{ index + 1 }}</span>
          <span class="truncate">{{ item.kode_pendaftaran || '-' }}</span>
          <span class="truncate">{{ item.nama || '-' }}</span>
          <span class="truncate">{{ item.nisn || '-' }}</span>
          <span class="truncate">{{ item.nama_sekolah_asal || '-' }}</span>
          <span
            class="justify-self-end rounded-full px-4 py-2 text-[12px] font-medium"
            :class="applicantStatusClass(item.status)"
          >
            {{ applicantStatusLabel(item.status) }}
          </span>
        </div>
      </div>
      <p v-else class="py-10 text-center text-sm text-text-muted">Belum ada data calon siswa terbaru.</p>
    </div>
  </DashboardPanel>
</template>

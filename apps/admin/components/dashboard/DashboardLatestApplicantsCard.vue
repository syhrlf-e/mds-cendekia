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
    <div class="admin-latest-applicants min-h-0 overflow-hidden px-4 pt-4">
      <div
        v-if="applicants.length"
        class="space-y-2.5"
      >
        <div
          v-for="(item, index) in applicants.slice(0, 3)"
          :key="`${item.nama}-${index}`"
          class="admin-latest-applicant-row grid h-14 grid-cols-[32px_180px_1fr_160px_1.2fr_112px] items-center gap-4 rounded-[14px] bg-[#f9f9f9] px-5 text-[13px] font-medium text-[#6e6e6e]"
        >
          <span>{{ index + 1 }}</span>
          <span class="truncate">{{ item.kode_pendaftaran || '-' }}</span>
          <span class="truncate">{{ item.nama || '-' }}</span>
          <span class="truncate">{{ item.nisn || '-' }}</span>
          <span class="truncate">{{ item.nama_sekolah_asal || '-' }}</span>
          <span
            class="justify-self-end rounded-full px-4 py-1.5 text-[12px] font-medium"
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

<style scoped>
@media (max-width: 1439px) {
  .admin-latest-applicant-row {
    grid-template-columns: 28px minmax(116px, 0.8fr) minmax(120px, 1fr) minmax(88px, 0.7fr) minmax(140px, 1fr) 98px;
    gap: 10px;
    padding-left: 14px;
    padding-right: 14px;
  }
}

@media (max-height: 820px) {
  .admin-latest-applicants {
    padding-top: 12px;
  }

  .admin-latest-applicant-row {
    height: 48px;
  }
}
</style>

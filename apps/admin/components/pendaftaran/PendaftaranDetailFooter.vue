<script setup lang="ts">
import type { RegistrationStatus } from '~/types/adminPendaftaran'

defineProps<{
  status: RegistrationStatus
  isBerkasVerified: boolean
  isBerkasRejected: boolean
  isBerkasFinal: boolean
}>()

const emit = defineEmits<{
  close: []
  reject: []
  approve: []
  reviewBerkas: []
}>()
</script>

<template>
  <footer
    class="shrink-0 border-t-2 px-8 py-4 transition-colors"
    :class="{
      'border-border bg-bg-surface': status === 'pending' && !isBerkasFinal && !isBerkasRejected,
      'border-error/25 bg-status-rejected-bg': status === 'pending' && isBerkasRejected,
      'border-success/30 bg-status-approved-bg': status === 'pending' && isBerkasVerified,
      'border-border bg-bg-base': status !== 'pending'
    }"
  >
    <div class="mx-auto flex max-w-4xl items-center justify-between gap-6">
      <div>
        <template v-if="status !== 'pending'">
          <p class="text-sm font-semibold text-text-primary">
            Pendaftaran sudah {{ status === 'approved' ? 'diterima ✓' : 'ditolak ✕' }}
          </p>
          <p class="mt-0.5 text-xs leading-[1.5] text-text-secondary">
            Tindakan lanjutan tidak tersedia untuk pendaftaran yang sudah diputuskan.
          </p>
        </template>

        <template v-else-if="isBerkasVerified">
          <p class="text-sm font-semibold text-status-approved-text">
            Berkas sudah lengkap dan sesuai — ambil keputusan final
          </p>
          <p class="mt-0.5 text-xs leading-[1.5] text-status-approved-text/70">
            Terima atau tolak pendaftar ini sekarang.
          </p>
        </template>

        <template v-else-if="isBerkasRejected">
          <p class="text-sm font-semibold text-status-rejected-text">
            Berkas perlu ditindaklanjuti
          </p>
          <p class="mt-0.5 text-xs leading-[1.5] text-status-rejected-text/70">
            Catatan berkas sudah dikirim. Keputusan final belum bisa diambil sebelum berkas lengkap dan sesuai.
          </p>
        </template>

        <template v-else>
          <p class="text-sm font-semibold text-text-primary">
            Menunggu verifikasi berkas
          </p>
          <p class="mt-0.5 text-xs leading-[1.5] text-text-secondary">
            Tandai berkas sebagai sesuai atau ajukan tindak lanjut di tab Berkas sebelum keputusan final.
          </p>
        </template>
      </div>

      <div class="flex shrink-0 items-center gap-3">
        <template v-if="status === 'pending' && isBerkasVerified">
          <AppButton variant="ghost" @click="emit('close')">Tutup</AppButton>
          <AppButton variant="danger" @click="emit('reject')">Tolak Pendaftar</AppButton>
          <AppButton variant="success" @click="emit('approve')">Terima Pendaftar</AppButton>
        </template>
        <template v-else-if="status === 'pending' && isBerkasRejected">
          <AppButton variant="ghost" @click="emit('close')">Tutup</AppButton>
          <AppButton variant="secondary" @click="emit('reviewBerkas')">Review Berkas</AppButton>
        </template>
        <template v-else>
          <AppButton variant="ghost" @click="emit('close')">Tutup</AppButton>
        </template>
      </div>
    </div>
  </footer>
</template>

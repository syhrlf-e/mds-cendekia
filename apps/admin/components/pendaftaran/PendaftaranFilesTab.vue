<script setup lang="ts">
import { FileText, MoreHorizontal } from 'lucide-vue-next'
import type { RegistrationFile } from '~/types/adminPendaftaran'

defineProps<{
  statusBerkas: string
  files: RegistrationFile[]
  viewedFileIds: Set<string>
  isBerkasVerified: boolean
  isProcessingVerifyBerkas: boolean
  isBerkasActionMenuOpen: boolean
  getBerkasStatusClass: (status: string) => string
}>()

const emit = defineEmits<{
  'update:isBerkasActionMenuOpen': [value: boolean]
  requestRevision: []
  verifyValid: []
  requestReject: []
  openFile: [file: RegistrationFile]
}>()
</script>

<template>
  <div class="admin-registration-files space-y-4">
    <div class="admin-registration-files-card overflow-hidden rounded-2xl border border-border bg-bg-surface">
      <div class="admin-registration-files-header flex items-center justify-between gap-4 border-b border-border bg-bg-base px-6 py-3">
        <h3 class="text-[11px] font-bold uppercase tracking-widest text-text-muted">
          Status saat ini
        </h3>
        <AppBadge
          class="shrink-0"
          :class="getBerkasStatusClass(statusBerkas)"
        >
          {{ statusBerkas }}
        </AppBadge>
      </div>

      <div class="admin-registration-files-actions flex items-center justify-between gap-6 border-b border-border-soft px-6 py-4">
        <div>
          <p class="text-sm font-medium text-text-primary">Validasi paket berkas</p>
        </div>
        <div class="flex shrink-0 flex-wrap items-center justify-end gap-2">
          <AppButton
            variant="secondary"
            :disabled="isBerkasVerified || isProcessingVerifyBerkas"
            class="!min-h-8 !px-3 !py-1.5 !text-xs"
            @click="emit('requestRevision')"
          >
            Ajukan Perbaikan
          </AppButton>
          <AppButton
            variant="success"
            :loading="isProcessingVerifyBerkas"
            :disabled="isBerkasVerified || isProcessingVerifyBerkas"
            class="!min-h-8 !px-3 !py-1.5 !text-xs"
            @click="emit('verifyValid')"
          >
            Berkas Sesuai
          </AppButton>
          <div class="relative">
            <button
              type="button"
              class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border-soft bg-bg-surface text-text-secondary transition-colors hover:bg-bg-base hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:pointer-events-none disabled:opacity-40"
              :disabled="isBerkasVerified || isProcessingVerifyBerkas"
              aria-label="Aksi berkas lainnya"
              @click="emit('update:isBerkasActionMenuOpen', !isBerkasActionMenuOpen)"
            >
              <MoreHorizontal class="h-4 w-4" />
            </button>

            <div
              v-if="isBerkasActionMenuOpen"
              class="absolute right-0 top-10 z-20 w-44 overflow-hidden rounded-xl border border-border bg-bg-surface p-1"
            >
              <button
                type="button"
                class="flex w-full items-center rounded-lg px-3 py-2 text-left text-xs font-medium text-error transition-colors hover:bg-status-rejected-bg"
                @click="emit('requestReject')"
              >
                Tolak berkas
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="divide-y divide-border-soft">
        <div
          v-for="file in files"
          :key="file.id"
          class="admin-registration-file-row group flex items-center gap-4 px-6 py-3.5 transition-colors hover:bg-bg-base"
        >
          <div
            class="admin-registration-file-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            :class="file.url ? 'bg-primary-50' : 'bg-bg-base'"
          >
            <FileText class="h-5 w-5" :class="file.url ? 'text-brand' : 'text-text-muted'" />
          </div>

          <div class="min-w-0 grow">
            <p class="truncate text-sm font-medium leading-[1.43] tracking-[-0.1px] text-text-primary">
              {{ file.name }}
            </p>
            <p class="text-xs leading-[1.5] text-text-secondary">
              {{ file.url ? 'Dokumen tersedia' : 'Belum diunggah' }}
            </p>
          </div>

          <div class="w-2 shrink-0">
            <span
              v-if="viewedFileIds.has(file.id)"
              class="inline-flex h-2 w-2 rounded-full bg-success"
              title="Sudah dilihat"
            />
          </div>

          <AppButton
            variant="ghost"
            :disabled="!file.url"
            @click="emit('openFile', file)"
          >
            {{ file.url ? 'Lihat' : 'Belum Ada' }}
          </AppButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media (max-width: 1439px) {
  .admin-registration-files-card {
    border-radius: 14px;
  }

  .admin-registration-files-actions {
    gap: 18px;
    padding: 14px 20px;
  }

  .admin-registration-file-row {
    gap: 14px;
    padding: 12px 20px;
  }
}

@media (max-height: 820px) {
  .admin-registration-files {
    row-gap: 12px;
  }

  .admin-registration-files-card {
    border-radius: 12px;
  }

  .admin-registration-files-header {
    padding: 10px 18px;
  }

  .admin-registration-files-actions {
    gap: 14px;
    padding: 12px 18px;
  }

  .admin-registration-file-row {
    gap: 12px;
    padding: 10px 18px;
  }

  .admin-registration-file-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
  }
}
</style>

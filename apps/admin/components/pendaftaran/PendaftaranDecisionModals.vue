<script setup lang="ts">
import { XCircle } from 'lucide-vue-next'

type BerkasDecisionMode = 'reject' | 'revision'

type BerkasDecisionCopy = {
  title: string
  description: string
}

defineProps<{
  approveOpen: boolean
  rejectOpen: boolean
  rejectGuardOpen: boolean
  rejectBerkasOpen: boolean
  rejectReason: string
  rejectBerkasReason: string
  rejectionReasons: string[]
  berkasRejectionReasons: string[]
  berkasDecisionCopy: BerkasDecisionCopy
  berkasDecisionMode: BerkasDecisionMode
  isProcessingApprove: boolean
  isProcessingReject: boolean
  isProcessingVerifyBerkas: boolean
}>()

const emit = defineEmits<{
  'update:approveOpen': [value: boolean]
  'update:rejectOpen': [value?: boolean]
  'update:rejectGuardOpen': [value: boolean]
  'update:rejectBerkasOpen': [value: boolean]
  'update:rejectReason': [value: string]
  'update:rejectBerkasReason': [value: string]
  approve: []
  reject: []
  confirmCancelReject: []
  verifyBerkas: [mode: BerkasDecisionMode]
}>()
</script>

<template>
  <AppModal
    :model-value="approveOpen"
    title="Terima Pendaftar Ini?"
    width="max-w-[400px]"
    :z-index="60"
    @update:model-value="emit('update:approveOpen', $event)"
  >
    <p class="text-sm leading-[1.43] tracking-[-0.15px] text-text-primary">
      Status pendaftar akan diubah menjadi diterima. Sistem juga akan mengirimkan email notifikasi kepada pendaftar.
    </p>

    <template #footer>
      <AppButton variant="ghost" :disabled="isProcessingApprove" @click="emit('update:approveOpen', false)">Batal</AppButton>
      <AppButton variant="success" :loading="isProcessingApprove" @click="emit('approve')">Ya, Terima</AppButton>
    </template>
  </AppModal>

  <AppModal
    :model-value="rejectOpen"
    title="Alasan Penolakan Pendaftar"
    width="max-w-[480px]"
    :z-index="60"
    @update:model-value="emit('update:rejectOpen', $event)"
  >
    <div class="space-y-4">
      <p class="text-sm leading-[1.43] tracking-[-0.15px] text-text-secondary">
        Pilih alasan keputusan akhir yang akan dikirim sebagai catatan ke sistem.
      </p>

      <div class="flex flex-wrap gap-2">
        <button
          v-for="reason in rejectionReasons"
          :key="reason"
          type="button"
          :disabled="isProcessingReject"
          class="rounded-full border px-4 py-2 text-sm font-medium leading-none transition-colors disabled:pointer-events-none disabled:opacity-50"
          :class="rejectReason === reason ? 'border-error bg-status-rejected-bg text-error' : 'border-border-soft bg-bg-base text-text-secondary hover:border-error/40 hover:bg-status-rejected-bg hover:text-error'"
          @click="emit('update:rejectReason', reason)"
        >
          {{ reason }}
        </button>
      </div>
    </div>

    <template #footer>
      <AppButton variant="ghost" :disabled="isProcessingReject" @click="emit('update:rejectOpen', false)">Batal</AppButton>
      <AppButton variant="danger" :disabled="!rejectReason.trim() || isProcessingReject" :loading="isProcessingReject" @click="emit('reject')">Kirim</AppButton>
    </template>
  </AppModal>

  <AppModal
    :model-value="rejectGuardOpen"
    title="Kamu berubah pikiran?"
    width="max-w-[360px]"
    :z-index="70"
    @update:model-value="emit('update:rejectGuardOpen', $event)"
  >
    <p class="text-sm leading-[1.43] tracking-[-0.15px] text-text-primary">
      Alasan yang sudah ditulis akan hilang.
    </p>

    <template #footer>
      <AppButton variant="ghost" @click="emit('update:rejectGuardOpen', false)">Tidak</AppButton>
      <AppButton variant="danger" @click="emit('confirmCancelReject')">
        <XCircle class="mr-2 h-4 w-4" />
        Ya, Keluar
      </AppButton>
    </template>
  </AppModal>

  <AppModal
    :model-value="rejectBerkasOpen"
    :title="berkasDecisionCopy.title"
    width="max-w-[480px]"
    :z-index="60"
    @update:model-value="emit('update:rejectBerkasOpen', $event)"
  >
    <div class="space-y-4">
      <p class="text-sm leading-[1.43] tracking-[-0.15px] text-text-secondary">
        {{ berkasDecisionCopy.description }}
      </p>

      <div class="flex flex-wrap gap-2">
        <button
          v-for="reason in berkasRejectionReasons"
          :key="reason"
          type="button"
          :disabled="isProcessingVerifyBerkas"
          class="rounded-full border px-4 py-2 text-sm font-medium leading-none transition-colors disabled:pointer-events-none disabled:opacity-50"
          :class="rejectBerkasReason === reason ? 'border-error bg-status-rejected-bg text-error' : 'border-border-soft bg-bg-base text-text-secondary hover:border-error/40 hover:bg-status-rejected-bg hover:text-error'"
          @click="emit('update:rejectBerkasReason', reason)"
        >
          {{ reason }}
        </button>
      </div>
    </div>

    <template #footer>
      <AppButton
        variant="ghost"
        :disabled="isProcessingVerifyBerkas"
        @click="emit('update:rejectBerkasOpen', false)"
      >
        Batal
      </AppButton>
      <AppButton
        variant="danger"
        :disabled="!rejectBerkasReason.trim() || isProcessingVerifyBerkas"
        :loading="isProcessingVerifyBerkas"
        @click="emit('verifyBerkas', berkasDecisionMode)"
      >
        Kirim
      </AppButton>
    </template>
  </AppModal>
</template>

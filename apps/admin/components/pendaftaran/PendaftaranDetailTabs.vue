<script setup lang="ts">
import type { Registration, RegistrationFile } from '~/types/adminPendaftaran'

type TabKey = 'diri' | 'ortu' | 'berkas'
type InfoField = Array<string | null | undefined>
type InfoSection = {
  title: string
  fields: InfoField[]
}

defineProps<{
  activeTab: TabKey
  item: Registration
  fieldSections: InfoSection[]
  parentSections: InfoSection[]
  selectedBerkasFiles: RegistrationFile[]
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
  <PendaftaranDataTab
    v-if="activeTab === 'diri'"
    :sections="fieldSections"
  />

  <PendaftaranParentsTab
    v-else-if="activeTab === 'ortu'"
    :sections="parentSections"
  />

  <PendaftaranFilesTab
    v-else-if="activeTab === 'berkas'"
    :status-berkas="item.statusBerkas"
    :files="selectedBerkasFiles"
    :viewed-file-ids="viewedFileIds"
    :is-berkas-verified="isBerkasVerified"
    :is-processing-verify-berkas="isProcessingVerifyBerkas"
    :is-berkas-action-menu-open="isBerkasActionMenuOpen"
    :get-berkas-status-class="getBerkasStatusClass"
    @update:is-berkas-action-menu-open="emit('update:isBerkasActionMenuOpen', $event)"
    @request-revision="emit('requestRevision')"
    @verify-valid="emit('verifyValid')"
    @request-reject="emit('requestReject')"
    @open-file="emit('openFile', $event)"
  />
</template>

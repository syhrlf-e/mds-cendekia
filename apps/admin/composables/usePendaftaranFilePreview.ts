import { ref } from 'vue'
import type { RegistrationFile } from '~/types/adminPendaftaran'

export const usePendaftaranFilePreview = () => {
  const isFilePreviewOpen = ref(false)
  const previewFile = ref<RegistrationFile | null>(null)
  const viewedFileIds = ref<Set<string>>(new Set())

  const closeFilePreview = () => {
    isFilePreviewOpen.value = false
    previewFile.value = null
  }

  const handleFilePreviewVisibilityChange = (isOpen: boolean) => {
    isFilePreviewOpen.value = isOpen
    if (!isOpen) previewFile.value = null
  }

  const openFile = (file: RegistrationFile) => {
    if (!import.meta.client) return
    const url = file.url

    if (!url || url === '#') {
      useToast().addToast('File berkas belum tersedia dari server.', 'error')
      return
    }

    viewedFileIds.value = new Set([...viewedFileIds.value, file.id])
    previewFile.value = file
    isFilePreviewOpen.value = true
  }

  return {
    isFilePreviewOpen,
    previewFile,
    viewedFileIds,
    closeFilePreview,
    handleFilePreviewVisibilityChange,
    openFile
  }
}

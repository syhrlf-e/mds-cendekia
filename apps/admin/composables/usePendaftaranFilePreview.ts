import { ref } from 'vue'
import type { RegistrationFile } from '~/types/adminPendaftaran'
import { resolveAllowedAdminAssetUrl } from '~/utils/adminAssetUrl'

export const usePendaftaranFilePreview = () => {
  const config = useRuntimeConfig()
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
    const url = resolveAllowedAdminAssetUrl(file.url, {
      apiBaseUrl: String(config.public.apiBaseUrl || ''),
      allowedOrigins: String(config.public.assetAllowedOrigins || '')
    })

    if (!url) {
      useToast().addToast('File berkas tidak tersedia atau sumber file tidak diizinkan.', 'error')
      return
    }

    viewedFileIds.value = new Set([...viewedFileIds.value, file.id])
    previewFile.value = { ...file, url }
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

import type { Ref } from 'vue'
import type { ToastType } from '~/composables/useToast'
import type { GalleryFormState, GalleryItem } from '~/types/adminGallery'
import { validateAdminImageUpload } from '~/utils/adminImageUpload'

type UseAdminGalleryImageFilesOptions = {
  form: Ref<GalleryFormState>
  imagePreview: Ref<string>
  isEdit: Ref<boolean>
  editingId: Ref<string>
  addToast: (message: string, type?: ToastType, duration?: number) => void
}

const getFileExtensionFromType = (type: string) => {
  if (type.includes('png')) return 'png'
  if (type.includes('webp')) return 'webp'
  if (type.includes('gif')) return 'gif'
  return 'jpg'
}

export const useAdminGalleryImageFiles = ({
  form,
  imagePreview,
  isEdit,
  editingId,
  addToast
}: UseAdminGalleryImageFilesOptions) => {
  const revokeImagePreview = () => {
    if (imagePreview.value.startsWith('blob:')) URL.revokeObjectURL(imagePreview.value)
  }

  const handleFileSelect = async (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]

    if (!file) return

    const validation = await validateAdminImageUpload(file)
    target.value = ''

    if (!validation.valid) {
      addToast(validation.message, 'warning')
      return
    }

    revokeImagePreview()
    form.value.gambar = file
    imagePreview.value = URL.createObjectURL(file)
  }

  const removeImage = () => {
    revokeImagePreview()
    imagePreview.value = ''
    form.value.gambar = null
  }

  const createFileFromCurrentImage = async () => {
    if (!import.meta.client || !isEdit.value || form.value.gambar || !imagePreview.value || imagePreview.value.startsWith('blob:')) {
      return null
    }

    const response = await fetch(imagePreview.value, {
      credentials: 'include'
    })

    if (!response.ok) return null

    const blob = await response.blob()
    const extension = getFileExtensionFromType(blob.type)

    return new File([blob], `galeri-${editingId.value}.${extension}`, {
      type: blob.type || 'image/jpeg'
    })
  }

  const createFileFromGalleryItem = async (item: GalleryItem) => {
    if (!import.meta.client || !item.gambar) return null

    const response = await fetch(item.gambar, {
      credentials: 'include'
    })

    if (!response.ok) return null

    const blob = await response.blob()
    const extension = getFileExtensionFromType(blob.type)

    return new File([blob], `galeri-${item.id}.${extension}`, {
      type: blob.type || 'image/jpeg'
    })
  }

  return {
    handleFileSelect,
    removeImage,
    createFileFromCurrentImage,
    createFileFromGalleryItem,
    revokeImagePreview
  }
}

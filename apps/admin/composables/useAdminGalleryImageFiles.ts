import type { Ref } from 'vue'
import type { ToastType } from '~/composables/useToast'
import type { GalleryFormState } from '~/types/adminGallery'
import { validateAdminImageUpload } from '~/utils/adminImageUpload'

type UseAdminGalleryImageFilesOptions = {
  form: Ref<GalleryFormState>
  imagePreview: Ref<string>
  addToast: (message: string, type?: ToastType, duration?: number) => void
}

export const useAdminGalleryImageFiles = ({
  form,
  imagePreview,
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

  return {
    handleFileSelect,
    removeImage,
    revokeImagePreview
  }
}

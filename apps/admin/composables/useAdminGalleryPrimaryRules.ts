import type { ComputedRef, Ref } from 'vue'
import type { ToastType } from '~/composables/useToast'
import {
  buildGalleryFormData,
  getAdminGalleryErrorMessage,
  readGalleryId
} from '~/services/useAdminGalleryService'
import type { GalleryFormState, GalleryItem } from '~/types/adminGallery'

type GalleryUpdateResult = {
  error?: any
}

type PrimaryTarget = {
  id: string
  nama: string
  deskripsi: string
}

type UseAdminGalleryPrimaryRulesOptions = {
  items: Ref<GalleryItem[]>
  form: Ref<GalleryFormState>
  isEdit: Ref<boolean>
  editingId: Ref<string>
  primaryGalleryItem: ComputedRef<GalleryItem | null>
  addToast: (message: string, type?: ToastType, duration?: number) => void
  updateGallery: (id: string, formData: FormData) => Promise<GalleryUpdateResult>
  createFileFromGalleryItem: (item: GalleryItem) => Promise<File | null>
}

export const useAdminGalleryPrimaryRules = ({
  items,
  form,
  isEdit,
  editingId,
  primaryGalleryItem,
  addToast,
  updateGallery,
  createFileFromGalleryItem
}: UseAdminGalleryPrimaryRulesOptions) => {
  const updateGalleryPrimaryFlag = async (item: GalleryItem, isUtama: boolean) => {
    const imageFile = await createFileFromGalleryItem(item)

    if (!imageFile) {
      return {
        error: new Error('Gambar lama belum bisa diproses.')
      }
    }

    const formData = buildGalleryFormData({
      nama: item.nama,
      deskripsi: item.deskripsi,
      gambar: imageFile,
      isUtama,
      urutan: item.urutan
    })

    return await updateGallery(item.id, formData)
  }

  const getTargetGalleryName = () => form.value.nama.trim() || 'galeri baru'

  const confirmPrimaryReplacement = () => {
    if (!import.meta.client || !form.value.isUtama) return true

    const currentPrimary = primaryGalleryItem.value
    if (!currentPrimary || currentPrimary.id === editingId.value) return true

    return window.confirm(`Gambar utama saat ini adalah "${currentPrimary.nama}". Jadikan "${getTargetGalleryName()}" sebagai gambar utama baru?`)
  }

  const handlePrimaryToggleChange = () => {
    const existingItem = items.value.find(item => item.id === editingId.value)

    if (isEdit.value && existingItem?.isUtama && !form.value.isUtama) {
      form.value.isUtama = true
      addToast('Gambar utama aktif tidak bisa dinonaktifkan langsung. Pilih gambar lain sebagai gambar utama untuk menggantinya.', 'warning')
      return
    }

    if (form.value.isUtama && !confirmPrimaryReplacement()) {
      form.value.isUtama = false
    }
  }

  const demotePreviousPrimaryIfNeeded = async () => {
    if (!form.value.isUtama) return true

    const currentPrimary = primaryGalleryItem.value
    if (!currentPrimary || currentPrimary.id === editingId.value) return true

    const { error: updateError } = await updateGalleryPrimaryFlag(currentPrimary, false)
    if (updateError) {
      addToast(getAdminGalleryErrorMessage(updateError, 'Gambar utama lama belum berhasil diperbarui.'), 'error')
      return false
    }

    return true
  }

  const findSubmittedPrimaryId = (submitData: any, target: PrimaryTarget) => {
    const responseId = readGalleryId(submitData)
    if (target.id || responseId) return target.id || responseId

    return items.value.find(item => item.nama === target.nama && item.deskripsi === target.deskripsi)?.id || ''
  }

  const verifyPrimaryFromBackend = (primaryId: string) => {
    const confirmedPrimary = items.value.find(item => item.id === primaryId && item.isUtama)

    if (confirmedPrimary) return

    addToast('Backend belum mengembalikan is_utama untuk gambar utama. Data di web publik belum bisa sinkron sampai BE menyimpan dan mengirim field itu.', 'warning')
  }

  return {
    handlePrimaryToggleChange,
    demotePreviousPrimaryIfNeeded,
    findSubmittedPrimaryId,
    verifyPrimaryFromBackend
  }
}

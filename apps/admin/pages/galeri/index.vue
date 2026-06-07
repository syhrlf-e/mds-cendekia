<script setup lang="ts">
import AdminGalleryTable from '~/components/galeri/AdminGalleryTable.vue'
import AdminGalleryToolbar from '~/components/galeri/AdminGalleryToolbar.vue'
import {
  applyGalleryDisplayOrder,
  buildGalleryFormData,
  buildPrimaryFirstGalleryRows,
  getAdminGalleryErrorMessage,
  useAdminGalleryService
} from '~/services/useAdminGalleryService'
import type { GalleryFormState, GalleryItem } from '~/types/adminGallery'

definePageMeta({
  layout: 'admin',
  middleware: ['admin-auth']
})

useHead({ title: 'Galeri | MDS Cendekia' })

const { addToast } = useToast()
const { createGallery, updateGallery, deleteGallery } = useAdminGalleryService()
const {
  galleryItems: items,
  galleryLoading: loading,
  galleryError: error,
  loadGallery: loadCachedGallery,
  refreshGallery
} = useAdminDataCache()

const saving = ref(false)
const savingOrder = ref(false)
const isFormOpen = ref(false)
const hasLoadedFormModal = ref(false)
const isEdit = ref(false)
const editingId = ref('')
const imagePreview = ref('')

const form = ref<GalleryFormState>({
  nama: '',
  deskripsi: '',
  gambar: null,
  isUtama: false
})

const {
  searchQuery,
  currentPage,
  draggedItemId,
  orderChanged,
  filteredItems,
  lastPage,
  from,
  pagedItems,
  primaryGalleryItem,
  applyDisplayOrderToItems,
  handleDragStart,
  handleDrop,
  handleDragEnd
} = useAdminGalleryListState({
  items,
  savingOrder
})

const resetForm = () => {
  revokeImagePreview()

  isEdit.value = false
  editingId.value = ''
  imagePreview.value = ''
  form.value = {
    nama: '',
    deskripsi: '',
    gambar: null,
    isUtama: false
  }
}

const fetchGallery = async () => {
  await loadCachedGallery()
  applyDisplayOrderToItems()
}

const refreshGalleryList = async () => {
  await refreshGallery()
  applyDisplayOrderToItems()
}

const openCreate = () => {
  resetForm()
  form.value.isUtama = !primaryGalleryItem.value
  hasLoadedFormModal.value = true
  isFormOpen.value = true
}

const openEdit = (item: GalleryItem) => {
  resetForm()
  isEdit.value = true
  editingId.value = item.id
  imagePreview.value = item.gambar
  form.value = {
    nama: item.nama,
    deskripsi: item.deskripsi,
    gambar: null,
    urutan: item.urutan,
    isUtama: item.isUtama
  }
  hasLoadedFormModal.value = true
  isFormOpen.value = true
}

const closeForm = () => {
  isFormOpen.value = false
  resetForm()
}

const {
  handleFileSelect,
  removeImage,
  createFileFromCurrentImage,
  createFileFromGalleryItem,
  revokeImagePreview
} = useAdminGalleryImageFiles({
  form,
  imagePreview,
  isEdit,
  editingId,
  addToast
})

const {
  handlePrimaryToggleChange,
  demotePreviousPrimaryIfNeeded,
  findSubmittedPrimaryId,
  verifyPrimaryFromBackend
} = useAdminGalleryPrimaryRules({
  items,
  form,
  isEdit,
  editingId,
  primaryGalleryItem,
  addToast,
  updateGallery,
  createFileFromGalleryItem
})

const persistGalleryOrder = async (rows: GalleryItem[], fallbackMessage: string) => {
  for (const [index, item] of rows.entries()) {
    const imageFile = await createFileFromGalleryItem(item)

    if (!imageFile) {
      addToast('Urutan belum bisa disimpan karena ada gambar lama yang tidak bisa diproses.', 'error')
      return false
    }

    const formData = buildGalleryFormData({
      nama: item.nama,
      deskripsi: item.deskripsi,
      gambar: imageFile,
      isUtama: item.isUtama,
      urutan: index + 1
    })

    const { error: updateError } = await updateGallery(item.id, formData)

    if (updateError) {
      addToast(getAdminGalleryErrorMessage(updateError, fallbackMessage), 'error')
      return false
    }
  }

  return true
}

const submitForm = async () => {
  if (!form.value.nama.trim() || !form.value.deskripsi.trim()) {
    addToast('Lengkapi nama dan deskripsi galeri.', 'warning')
    return
  }

  if (!isEdit.value && !form.value.gambar) {
    addToast('Lengkapi gambar galeri.', 'warning')
    return
  }

  const existingItem = items.value.find(item => item.id === editingId.value)

  if (isEdit.value && existingItem?.isUtama && !form.value.isUtama) {
    addToast('Pilih gambar lain sebagai gambar utama sebelum menonaktifkan gambar utama saat ini.', 'warning')
    return
  }

  const currentImageFile = await createFileFromCurrentImage()
  const primaryTarget = form.value.isUtama
    ? {
        id: editingId.value,
        nama: form.value.nama.trim(),
        deskripsi: form.value.deskripsi.trim()
      }
    : null
  const formData = buildGalleryFormData({
    ...form.value,
    urutan: isEdit.value ? existingItem?.urutan : items.value.length + 1,
    gambar: form.value.gambar || currentImageFile
  })

  if (isEdit.value && !formData.has('gambar')) {
    addToast('Gambar lama belum bisa diproses. Pilih gambar baru untuk memperbarui galeri.', 'warning')
    return
  }

  saving.value = true

  const { data: submitData, error: submitError } = isEdit.value
    ? await updateGallery(editingId.value, formData)
    : await createGallery(formData)

  if (submitError) {
    saving.value = false
    addToast(getAdminGalleryErrorMessage(submitError, 'Galeri belum berhasil disimpan.'), 'error')
    return
  }

  const isPrimaryDemoted = await demotePreviousPrimaryIfNeeded()
  if (!isPrimaryDemoted) {
    saving.value = false
    return
  }

  addToast(isEdit.value ? 'Galeri berhasil diperbarui.' : 'Galeri berhasil ditambahkan.', 'success')
  closeForm()
  await refreshGalleryList()

  if (primaryTarget) {
    const primaryId = findSubmittedPrimaryId(submitData, primaryTarget)

    if (primaryId) {
      const isOrderPersisted = await persistGalleryOrder(buildPrimaryFirstGalleryRows(items.value, primaryId), 'Urutan gambar utama belum berhasil disimpan.')
      if (!isOrderPersisted) {
        saving.value = false
        return
      }
    }

    await refreshGalleryList()
    if (primaryId) verifyPrimaryFromBackend(primaryId)
  }

  saving.value = false
}

const confirmDelete = async (item: GalleryItem) => {
  if (!import.meta.client) return

  const confirmed = window.confirm(`Hapus galeri "${item.nama}"?`)
  if (!confirmed) return

  const { error: deleteError } = await deleteGallery(item.id)

  if (deleteError) {
    addToast(getAdminGalleryErrorMessage(deleteError, 'Galeri belum berhasil dihapus.'), 'error')
    return
  }

  addToast('Galeri berhasil dihapus.', 'success')
  await refreshGalleryList()
}

const saveGalleryOrder = async () => {
  if (!orderChanged.value || savingOrder.value) return

  savingOrder.value = true
  const isOrderPersisted = await persistGalleryOrder(items.value, 'Urutan galeri belum berhasil disimpan.')

  if (!isOrderPersisted) {
    savingOrder.value = false
    return
  }

  savingOrder.value = false
  orderChanged.value = false
  addToast('Urutan galeri berhasil disimpan.', 'success')
  await refreshGalleryList()
}

onMounted(fetchGallery)

onBeforeUnmount(() => {
  revokeImagePreview()
})
</script>

<template>
  <div class="flex h-full min-h-0 flex-col gap-4">
    <AdminGalleryToolbar
      v-model:search-query="searchQuery"
      :order-changed="orderChanged"
      :saving-order="savingOrder"
      :loading="loading"
      @save-order="saveGalleryOrder"
      @refresh="refreshGalleryList"
      @create="openCreate"
    />

    <AdminGalleryTable
      :loading="loading"
      :error="error"
      :filtered-count="filteredItems.length"
      :paged-items="pagedItems"
      :from="from"
      :search-query="searchQuery"
      :saving-order="savingOrder"
      :dragged-item-id="draggedItemId"
      @refresh="refreshGalleryList"
      @create="openCreate"
      @edit="openEdit"
      @delete="confirmDelete"
      @drag-start="handleDragStart"
      @drop="handleDrop"
      @drag-end="handleDragEnd"
    />

    <AppPaginationBar
      :current-page="currentPage"
      :last-page="lastPage"
      :total="filteredItems.length"
      :disabled="loading || !!error || filteredItems.length === 0"
      @page-change="currentPage = $event"
    />

    <LazyAdminGalleryFormModal
      v-if="hasLoadedFormModal"
      v-model="isFormOpen"
      v-model:form="form"
      :is-edit="isEdit"
      :saving="saving"
      :image-preview="imagePreview"
      :primary-gallery-item="primaryGalleryItem"
      :editing-id="editingId"
      @close="closeForm"
      @submit="submitForm"
      @file-select="handleFileSelect"
      @remove-image="removeImage"
      @primary-toggle="handlePrimaryToggleChange"
    />
  </div>
</template>

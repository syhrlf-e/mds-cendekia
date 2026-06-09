<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import AdminGalleryTable from '~/components/galeri/AdminGalleryTable.vue'
import AdminGalleryToolbar from '~/components/galeri/AdminGalleryToolbar.vue'
import {
  buildGalleryFormData,
  getAdminGalleryErrorMessage,
  useAdminGalleryService
} from '~/services/useAdminGalleryService'
import type { GalleryFormState, GalleryItem } from '~/types/adminGallery'

const AdminGalleryFormModal = defineAsyncComponent(
  () => import('~/components/galeri/AdminGalleryFormModal.vue')
)

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
const isFormOpen = ref(false)
const hasLoadedFormModal = ref(false)
const isEdit = ref(false)
const editingId = ref('')
const imagePreview = ref('')

const form = ref<GalleryFormState>({
  nama: '',
  deskripsi: '',
  gambar: null
})

const {
  searchQuery,
  currentPage,
  filteredItems,
  lastPage,
  pagedItems
} = useAdminGalleryListState({
  items
})

const resetForm = () => {
  revokeImagePreview()

  isEdit.value = false
  editingId.value = ''
  imagePreview.value = ''
  form.value = {
    nama: '',
    deskripsi: '',
    gambar: null
  }
}

const fetchGallery = async () => {
  await loadCachedGallery()
}

const refreshGalleryList = async () => {
  await refreshGallery()
}

const openCreate = () => {
  resetForm()
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
    gambar: null
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
  revokeImagePreview
} = useAdminGalleryImageFiles({
  form,
  imagePreview,
  addToast
})

const submitForm = async () => {
  if (!form.value.nama.trim() || !form.value.deskripsi.trim()) {
    addToast('Lengkapi nama dan deskripsi galeri.', 'warning')
    return
  }

  if (!isEdit.value && !form.value.gambar) {
    addToast('Lengkapi gambar galeri.', 'warning')
    return
  }

  const formData = buildGalleryFormData(form.value)

  saving.value = true

  const { error: submitError } = isEdit.value
    ? await updateGallery(editingId.value, formData)
    : await createGallery(formData)

  if (submitError) {
    saving.value = false
    addToast(getAdminGalleryErrorMessage(submitError, 'Galeri belum berhasil disimpan.'), 'error')
    return
  }

  addToast(isEdit.value ? 'Galeri berhasil diperbarui.' : 'Galeri berhasil ditambahkan.', 'success')
  closeForm()
  await refreshGalleryList()

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

onMounted(fetchGallery)

onBeforeUnmount(() => {
  revokeImagePreview()
})
</script>

<template>
  <div class="flex h-full min-h-0 flex-col gap-4">
    <AdminGalleryToolbar
      v-model:search-query="searchQuery"
      :loading="loading"
      @refresh="refreshGalleryList"
      @create="openCreate"
    />

    <AdminGalleryTable
      :loading="loading"
      :error="error"
      :filtered-count="filteredItems.length"
      :paged-items="pagedItems"
      @refresh="refreshGalleryList"
      @create="openCreate"
      @edit="openEdit"
      @delete="confirmDelete"
    />

    <AppPaginationBar
      :current-page="currentPage"
      :last-page="lastPage"
      :total="filteredItems.length"
      :disabled="loading || !!error || filteredItems.length === 0"
      @page-change="currentPage = $event"
    />

    <AdminGalleryFormModal
      v-if="hasLoadedFormModal"
      v-model="isFormOpen"
      v-model:form="form"
      :is-edit="isEdit"
      :saving="saving"
      :image-preview="imagePreview"
      @close="closeForm"
      @submit="submitForm"
      @file-select="handleFileSelect"
      @remove-image="removeImage"
    />
  </div>
</template>

<script setup lang="ts">
import { Edit2, GripVertical, Image as ImageIcon, Images, Plus, RefreshCw, Save, Search, Trash2, Upload, X } from 'lucide-vue-next'
import { buildGalleryFormData, getAdminGalleryErrorMessage, useAdminGalleryService } from '~/services/useAdminGalleryService'
import type { GalleryFormState, GalleryItem } from '~/types/adminGallery'

definePageMeta({
  layout: 'admin',
  middleware: ['admin-auth']
})

useHead({ title: 'Galeri | MDS Cendekia' })

const { addToast } = useToast()
const { listGallery, createGallery, updateGallery, deleteGallery } = useAdminGalleryService()

const items = ref<GalleryItem[]>([])
const loading = ref(false)
const saving = ref(false)
const savingOrder = ref(false)
const error = ref('')
const searchQuery = ref('')
const currentPage = ref(1)
const perPage = ref(10)
const isFormOpen = ref(false)
const isEdit = ref(false)
const editingId = ref('')
const imagePreview = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const draggedItemId = ref('')
const orderChanged = ref(false)

const form = ref<GalleryFormState>({
  nama: '',
  deskripsi: '',
  gambar: null
})

const filteredItems = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return items.value

  return items.value.filter(item => [
    item.nama,
    item.deskripsi,
    item.createdAt
  ].some(value => value.toLowerCase().includes(query)))
})

const lastPage = computed(() => Math.max(1, Math.ceil(filteredItems.value.length / perPage.value)))
const from = computed(() => filteredItems.value.length ? (currentPage.value - 1) * perPage.value + 1 : 0)
const to = computed(() => Math.min(currentPage.value * perPage.value, filteredItems.value.length))
const pagedItems = computed(() => filteredItems.value.slice(from.value - 1, to.value))
const canDragRows = computed(() => !searchQuery.value.trim() && !savingOrder.value)

const formatDate = (dateString: string) => {
  if (!dateString) return '-'

  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return '-'

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const resetForm = () => {
  if (imagePreview.value.startsWith('blob:')) URL.revokeObjectURL(imagePreview.value)

  isEdit.value = false
  editingId.value = ''
  imagePreview.value = ''
  form.value = {
    nama: '',
    deskripsi: '',
    gambar: null
  }
}

const applyDisplayOrder = (rows: GalleryItem[]) => {
  const hasPrimary = rows.some(item => item.isUtama)

  return rows.map((item, index) => ({
    ...item,
    urutan: item.urutan || index + 1,
    isUtama: hasPrimary ? item.isUtama : index === 0
  }))
}

const normalizeCurrentOrder = () => {
  items.value = items.value.map((item, index) => ({
    ...item,
    urutan: index + 1,
    isUtama: index === 0
  }))
}

const fetchGallery = async () => {
  loading.value = true
  error.value = ''

  const { data, error: fetchError } = await listGallery(100)

  if (fetchError) {
    error.value = 'Gagal memuat data galeri.'
    loading.value = false
    return
  }

  items.value = applyDisplayOrder(data)
  orderChanged.value = false
  loading.value = false
}

const openCreate = () => {
  resetForm()
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
    urutan: item.urutan
  }
  isFormOpen.value = true
}

const closeForm = () => {
  isFormOpen.value = false
  resetForm()
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  if (!file.type.startsWith('image/')) {
    addToast('Pilih file gambar yang valid.', 'warning')
    return
  }

  if (file.size > 4 * 1024 * 1024) {
    addToast('Ukuran file maksimal 4MB.', 'warning')
    return
  }

  if (imagePreview.value.startsWith('blob:')) URL.revokeObjectURL(imagePreview.value)

  form.value.gambar = file
  imagePreview.value = URL.createObjectURL(file)
  target.value = ''
}

const removeImage = () => {
  if (imagePreview.value.startsWith('blob:')) URL.revokeObjectURL(imagePreview.value)

  imagePreview.value = ''
  form.value.gambar = null
}

const getFileExtensionFromType = (type: string) => {
  if (type.includes('png')) return 'png'
  if (type.includes('webp')) return 'webp'
  if (type.includes('gif')) return 'gif'
  return 'jpg'
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

const submitForm = async () => {
  if (!form.value.nama.trim() || !form.value.deskripsi.trim()) {
    addToast('Lengkapi nama dan deskripsi galeri.', 'warning')
    return
  }

  if (!isEdit.value && !form.value.gambar) {
    addToast('Lengkapi gambar galeri.', 'warning')
    return
  }

  const currentImageFile = await createFileFromCurrentImage()
  const existingItem = items.value.find(item => item.id === editingId.value)
  const formData = buildGalleryFormData({
    ...form.value,
    isUtama: isEdit.value ? existingItem?.isUtama : items.value.length === 0,
    urutan: isEdit.value ? existingItem?.urutan : items.value.length + 1,
    gambar: form.value.gambar || currentImageFile
  })

  if (isEdit.value && !formData.has('gambar')) {
    addToast('Gambar lama belum bisa diproses. Pilih gambar baru untuk memperbarui galeri.', 'warning')
    return
  }

  saving.value = true

  const { error: submitError } = isEdit.value
    ? await updateGallery(editingId.value, formData)
    : await createGallery(formData)

  saving.value = false

  if (submitError) {
    addToast(getAdminGalleryErrorMessage(submitError, 'Galeri belum berhasil disimpan.'), 'error')
    return
  }

  addToast(isEdit.value ? 'Galeri berhasil diperbarui.' : 'Galeri berhasil ditambahkan.', 'success')
  closeForm()
  await fetchGallery()
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
  await fetchGallery()
}

const handleDragStart = (item: GalleryItem, event: DragEvent) => {
  if (!canDragRows.value) return

  draggedItemId.value = item.id
  event.dataTransfer?.setData('text/plain', item.id)
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
}

const handleDrop = (targetItem: GalleryItem) => {
  if (!canDragRows.value || !draggedItemId.value || draggedItemId.value === targetItem.id) {
    draggedItemId.value = ''
    return
  }

  const currentIndex = items.value.findIndex(item => item.id === draggedItemId.value)
  const targetIndex = items.value.findIndex(item => item.id === targetItem.id)

  if (currentIndex < 0 || targetIndex < 0) {
    draggedItemId.value = ''
    return
  }

  const nextItems = [...items.value]
  const [movedItem] = nextItems.splice(currentIndex, 1)
  if (!movedItem) {
    draggedItemId.value = ''
    return
  }
  nextItems.splice(targetIndex, 0, movedItem)
  items.value = nextItems
  normalizeCurrentOrder()
  orderChanged.value = true
  draggedItemId.value = ''
  currentPage.value = 1
}

const handleDragEnd = () => {
  draggedItemId.value = ''
}

const saveGalleryOrder = async () => {
  if (!orderChanged.value || savingOrder.value) return

  savingOrder.value = true

  for (const [index, item] of items.value.entries()) {
    const imageFile = await createFileFromGalleryItem(item)

    if (!imageFile) {
      savingOrder.value = false
      addToast('Urutan belum bisa disimpan karena ada gambar lama yang tidak bisa diproses.', 'error')
      return
    }

    const formData = buildGalleryFormData({
      nama: item.nama,
      deskripsi: item.deskripsi,
      gambar: imageFile,
      isUtama: index === 0,
      urutan: index + 1
    })

    const { error: updateError } = await updateGallery(item.id, formData)

    if (updateError) {
      savingOrder.value = false
      addToast(getAdminGalleryErrorMessage(updateError, 'Urutan galeri belum berhasil disimpan.'), 'error')
      return
    }
  }

  savingOrder.value = false
  orderChanged.value = false
  addToast('Urutan galeri berhasil disimpan.', 'success')
  await fetchGallery()
}

watch(searchQuery, () => {
  currentPage.value = 1
})

watch(filteredItems, () => {
  if (currentPage.value > lastPage.value) currentPage.value = lastPage.value
})

onMounted(fetchGallery)

onBeforeUnmount(() => {
  if (imagePreview.value.startsWith('blob:')) URL.revokeObjectURL(imagePreview.value)
})
</script>

<template>
  <div class="flex h-full min-h-0 flex-col gap-4">
    <section class="shrink-0 rounded-2xl border border-border bg-bg-surface p-4">
      <div class="grid items-center gap-4 lg:grid-cols-[minmax(320px,1fr)_auto_auto_auto]">
        <div class="relative">
          <Search class="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-text-muted" />
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Cari nama atau deskripsi galeri..."
            class="h-11 w-full rounded-xl border border-border-soft bg-bg-base py-2.5 pl-10 pr-4 text-sm leading-none text-text-primary outline-none transition-colors placeholder:text-text-muted hover:bg-bg-surface focus:border-brand focus:bg-bg-surface focus:ring-[3px] focus:ring-brand/12"
          >
        </div>

        <AppButton
          variant="secondary"
          :disabled="!orderChanged || savingOrder || loading || !!searchQuery.trim()"
          :loading="savingOrder"
          @click="saveGalleryOrder"
        >
          <Save class="mr-2 h-4 w-4" />
          Simpan Urutan
        </AppButton>

        <AppButton
          variant="ghost"
          :disabled="loading"
          @click="fetchGallery"
        >
          <RefreshCw class="mr-2 h-4 w-4" />
          Muat Ulang
        </AppButton>

        <AppButton
          variant="primary"
          @click="openCreate"
        >
          <Plus class="mr-2 h-4 w-4" />
          Tambah Galeri
        </AppButton>
      </div>
    </section>

    <section class="min-h-0 flex-1 overflow-auto rounded-2xl border border-border bg-bg-surface p-4">
      <div
        v-if="loading"
        class="flex min-h-[420px] items-center justify-center"
      >
        <AppEmptyState
          title="Memuat data galeri"
          description="Sebentar, data galeri sedang diambil dari server."
        >
          <template #icon>
            <Images />
          </template>
        </AppEmptyState>
      </div>

      <div
        v-else-if="error"
        class="flex min-h-[420px] items-center justify-center"
      >
        <AppEmptyState
          title="Data galeri belum bisa dimuat"
          :description="error"
        >
          <template #icon>
            <Images />
          </template>
          <template #action>
            <AppButton
              variant="primary"
              @click="fetchGallery"
            >
              Coba Lagi
            </AppButton>
          </template>
        </AppEmptyState>
      </div>

      <div
        v-else-if="filteredItems.length === 0"
        class="flex min-h-[420px] items-center justify-center"
      >
        <AppEmptyState
          title="Belum ada galeri"
          description="Foto dan dokumentasi sekolah yang ditambahkan akan muncul di sini."
        >
          <template #icon>
            <Images />
          </template>
          <template #action>
            <AppButton
              variant="primary"
              @click="openCreate"
            >
              Tambah Galeri
            </AppButton>
          </template>
        </AppEmptyState>
      </div>

      <div
        v-else
        class="overflow-hidden rounded-xl border border-border-soft"
      >
        <div
          v-if="searchQuery.trim()"
          class="border-b border-border-soft bg-status-pending-bg px-4 py-3 text-sm text-status-pending-text"
        >
          Drag & drop aktif saat pencarian kosong, supaya urutan yang disimpan tetap sesuai seluruh data.
        </div>

        <table class="w-full border-collapse text-left">
          <thead class="bg-bg-base">
            <tr class="h-12 text-xs font-semibold uppercase tracking-wider text-text-secondary">
              <th class="w-14 px-4"></th>
              <th class="w-20 px-4">Urutan</th>
              <th class="min-w-80 px-4">Galeri</th>
              <th class="w-40 px-4">Tipe</th>
              <th class="w-40 px-4">Tanggal</th>
              <th class="w-36 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border-soft">
            <tr
              v-for="(item, index) in pagedItems"
              :key="item.id"
              :draggable="canDragRows"
              class="h-[76px] text-sm text-text-primary transition-colors hover:bg-bg-base"
              :class="draggedItemId === item.id ? 'bg-primary-50 opacity-60' : ''"
              @dragstart="handleDragStart(item, $event)"
              @dragover.prevent
              @drop.prevent="handleDrop(item)"
              @dragend="handleDragEnd"
            >
              <td class="px-4">
                <button
                  type="button"
                  :disabled="!canDragRows"
                  class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border-soft bg-bg-base text-text-muted transition-colors hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
                  title="Geser urutan"
                >
                  <GripVertical class="h-4 w-4" />
                </button>
              </td>
              <td class="px-4 font-medium text-text-secondary">
                {{ from + index }}
              </td>
              <td class="px-4">
                <div class="flex min-w-0 items-center gap-3">
                  <div class="flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border-soft bg-bg-parchment">
                    <img
                      v-if="item.gambar"
                      :src="item.gambar"
                      :alt="item.nama"
                      class="h-full w-full object-cover"
                    >
                    <ImageIcon
                      v-else
                      class="h-6 w-6 text-text-muted"
                    />
                  </div>
                  <div class="min-w-0">
                    <p class="truncate font-medium text-text-primary">
                      {{ item.nama }}
                    </p>
                    <p class="mt-1 line-clamp-1 text-xs text-text-secondary">
                      {{ item.deskripsi || 'Tanpa deskripsi.' }}
                    </p>
                  </div>
                </div>
              </td>
              <td class="px-4">
                <span
                  class="inline-flex rounded-full px-3 py-1 text-xs font-medium"
                  :class="item.isUtama ? 'bg-primary-50 text-brand' : 'bg-bg-base text-text-secondary'"
                >
                  {{ item.isUtama ? 'Gambar Utama' : 'Carousel' }}
                </span>
              </td>
              <td class="px-4 text-text-secondary">
                {{ formatDate(item.createdAt) }}
              </td>
              <td class="px-4 text-center">
                <div class="flex items-center justify-center gap-1.5">
                  <button
                    type="button"
                    class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border-soft bg-bg-base text-text-secondary transition-colors hover:bg-bg-surface hover:text-brand"
                    title="Edit galeri"
                    @click="openEdit(item)"
                  >
                    <Edit2 class="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border-soft bg-bg-base text-text-secondary transition-colors hover:bg-status-rejected-bg hover:text-error"
                    title="Hapus galeri"
                    @click="confirmDelete(item)"
                  >
                    <Trash2 class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <AppPaginationBar
      :current-page="currentPage"
      :last-page="lastPage"
      :total="filteredItems.length"
      :disabled="loading || !!error || filteredItems.length === 0"
      @page-change="currentPage = $event"
    />

    <AppModal
      v-model="isFormOpen"
      :title="isEdit ? 'Edit Galeri' : 'Tambah Galeri'"
      width="max-w-2xl"
      @close="closeForm"
    >
      <form
        class="space-y-5"
        @submit.prevent="submitForm"
      >
        <AppInput
          v-model="form.nama"
          label="Nama Galeri"
          placeholder="Contoh: Kegiatan belajar mandiri"
          required
          :disabled="saving"
        />

        <AppTextarea
          v-model="form.deskripsi"
          label="Deskripsi"
          placeholder="Tuliskan deskripsi singkat dokumentasi ini..."
          required
          :rows="4"
          :disabled="saving"
        />

        <div>
          <label class="mb-2 block text-sm font-medium text-text-primary">
            Gambar <span v-if="!isEdit" class="text-error">*</span>
          </label>

          <div
            v-if="imagePreview"
            class="group relative overflow-hidden rounded-xl border border-border"
          >
            <img
              :src="imagePreview"
              alt="Preview galeri"
              class="h-72 w-full object-cover"
            >
            <div class="absolute inset-0 flex items-center justify-center gap-3 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-lg bg-bg-surface/95 px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-white"
                @click="triggerFileInput"
              >
                <Upload class="h-4 w-4" />
                Ganti
              </button>
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-lg bg-error px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-status-rejected-text"
                @click="removeImage"
              >
                <Trash2 class="h-4 w-4" />
                Hapus
              </button>
            </div>
          </div>

          <button
            v-else
            type="button"
            class="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-8 text-center transition-colors hover:border-brand hover:bg-bg-base"
            @click="triggerFileInput"
          >
            <Upload class="mb-3 h-12 w-12 text-text-muted" />
            <span class="text-sm font-medium text-text-primary">Klik untuk upload gambar</span>
            <span class="mt-1 text-xs text-text-secondary">PNG, JPG, WEBP maksimal 4MB.</span>
          </button>

          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleFileSelect"
          >
        </div>
      </form>

      <template #footer>
        <AppButton
          variant="secondary"
          :disabled="saving"
          @click="closeForm"
        >
          <X class="mr-2 h-4 w-4" />
          Batal
        </AppButton>
        <AppButton
          variant="primary"
          :loading="saving"
          @click="submitForm"
        >
          <Save class="mr-2 h-4 w-4" />
          {{ isEdit ? 'Update Galeri' : 'Simpan Galeri' }}
        </AppButton>
      </template>
    </AppModal>
  </div>
</template>

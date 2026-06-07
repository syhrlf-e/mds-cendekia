<script setup lang="ts">
import {
  ChevronLeft,
  ChevronRight,
  Edit2,
  Eye,
  Image as ImageIcon,
  Plus,
  Save,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-vue-next'
import { adminApiEndpoints } from '~/services/adminApiEndpoints'
import { generateAdminNewsSlug, getAdminNewsErrorMessage } from '~/services/useAdminNewsService'
import type { AdminNewsForm, AdminNewsItem } from '~/types/adminNews'
import { ADMIN_IMAGE_ACCEPT, validateAdminImageUpload } from '~/utils/adminImageUpload'

definePageMeta({
  layout: 'admin',
  middleware: ['admin-auth'],
})

useHead({
  title: 'Berita | MDS Cendekia',
})

const { addToast } = useToast()
const { post, patch, delete: deleteRequest } = useApi()
const adminId = useState<number | null>('admin-auth:id', () => null)
const {
  news: items,
  newsLoading: loading,
  newsError: error,
  loadNews: loadCachedNews,
  refreshNews
} = useAdminDataCache()

const saving = ref(false)
const pageMode = ref<'list' | 'form'>('list')
const isEdit = ref(false)
const editingId = ref('')
const searchQuery = ref('')
const filterCategory = ref('')
const filterStatus = ref('')
const currentPage = ref(1)
const perPage = ref(10)
const isPreviewExpanded = ref(false)
const imagePreview = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

let previousBodyOverflow = ''
let previousHtmlOverflow = ''

const form = ref<AdminNewsForm>({
  title: '',
  content: '',
  category: 'other',
  tags: '',
  image: null,
})

const statusFilterOptions = [
  { label: 'Semua Status', value: '' },
  { label: 'Terpublikasi', value: 'published' },
  { label: 'Draf', value: 'draft' },
]

const filteredItems = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return items.value.filter((item) => {
    const matchesSearch = !query || [
      item.title,
      item.slug,
      item.excerpt,
      item.content,
      item.category,
      item.tags,
      item.author,
    ].some(value => value.toLowerCase().includes(query))
    const matchesCategory = !filterCategory.value || item.category === filterCategory.value
    const matchesStatus = !filterStatus.value || (filterStatus.value === 'published' ? item.published : !item.published)

    return matchesSearch && matchesCategory && matchesStatus
  })
})

const lastPage = computed(() => Math.max(1, Math.ceil(filteredItems.value.length / perPage.value)))
const from = computed(() => filteredItems.value.length ? (currentPage.value - 1) * perPage.value + 1 : 0)
const to = computed(() => Math.min(currentPage.value * perPage.value, filteredItems.value.length))
const pagedItems = computed(() => filteredItems.value.slice(from.value - 1, to.value))

const generateSlug = generateAdminNewsSlug

const normalizeUploadFileName = (name: string) => {
  const extension = name.includes('.') ? name.split('.').pop()?.toLowerCase() : ''
  const baseName = name
    .replace(/\.[^/.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48) || 'berita'

  return `${baseName}-${Date.now()}${extension ? `.${extension}` : ''}`
}

const getCategoryClass = (category: string) => {
  const normalized = category.toLowerCase()

  if (normalized === 'event') return 'bg-primary-50 text-brand'
  if (normalized === 'achievement') return 'bg-status-approved-bg text-status-approved-text'
  if (normalized === 'announcement') return 'bg-status-pending-bg text-status-pending-text'

  return 'bg-bg-base text-text-secondary'
}

const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    event: 'Event',
    achievement: 'Prestasi',
    announcement: 'Pengumuman',
    other: 'Lainnya',
  }

  return labels[category] || category || 'Lainnya'
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-'

  const date = new Date(dateString)

  if (Number.isNaN(date.getTime())) return '-'

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const useFallbackNewsImage = (event: Event) => {
  const image = event.currentTarget as HTMLImageElement
  if (image.dataset.fallbackApplied) return

  image.dataset.fallbackApplied = 'true'
  image.src = '/images/logo-mds-main.png'
}

const fetchNews = (force = false) => force ? refreshNews() : loadCachedNews()

const resetForm = () => {
  isEdit.value = false
  editingId.value = ''
  isPreviewExpanded.value = false
  imagePreview.value = ''
  form.value = {
    title: '',
    content: '',
    category: 'other',
    tags: '',
    image: null,
  }
}

const openCreate = () => {
  resetForm()
  pageMode.value = 'form'
}

const openEdit = (item: AdminNewsItem) => {
  isEdit.value = true
  editingId.value = item.id
  imagePreview.value = item.image
  form.value = {
    title: item.title,
    content: item.content,
    category: item.category,
    tags: item.tags,
    image: null,
  }
  pageMode.value = 'form'
}

const backToList = () => {
  resetForm()
  pageMode.value = 'list'
}

const triggerFileInput = () => {
  fileInput.value?.click()
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

  if (imagePreview.value.startsWith('blob:')) URL.revokeObjectURL(imagePreview.value)

  form.value.image = file
  imagePreview.value = URL.createObjectURL(file)
}

const removeImage = () => {
  if (imagePreview.value.startsWith('blob:')) URL.revokeObjectURL(imagePreview.value)

  imagePreview.value = ''
  form.value.image = null
}

const previewNews = (item: AdminNewsItem) => {
  navigateTo(`/berita/${item.id}`, {
    open: {
      target: '_blank',
    },
  })
}

const buildNewsFormData = (authorId?: number) => {
  const formData = new FormData()

  if (authorId) {
    formData.append('id_penulis', String(authorId))
  }
  formData.append('judul', form.value.title.trim())
  formData.append('isi', form.value.content.trim())
  formData.append('kategori', form.value.category.trim())
  formData.append('tags', form.value.tags.trim())

  if (form.value.image) {
    formData.append('gambar', form.value.image, normalizeUploadFileName(form.value.image.name))
  }

  return formData
}

const deleteNews = async (item: AdminNewsItem) => {
  if (!import.meta.client) return

  const confirmed = window.confirm(`Hapus berita "${item.title}"?`)

  if (!confirmed) return

  const { error: deleteError } = await deleteRequest(adminApiEndpoints.berita.delete(item.id), {
    showErrorToast: false,
  })

  if (deleteError) {
    addToast('Berita belum berhasil dihapus.', 'error')
    return
  }

  addToast('Berita berhasil dihapus.', 'success')
  await fetchNews(true)
}

const submitForm = async () => {
  if (!form.value.title.trim() || !form.value.content.trim() || !form.value.category.trim() || !form.value.tags.trim()) {
    addToast('Lengkapi judul, konten, kategori, dan tags berita.', 'warning')
    return
  }

  if (!isEdit.value && !form.value.image) {
    addToast('Lengkapi gambar berita.', 'warning')
    return
  }

  if (isEdit.value && !imagePreview.value) {
    addToast('Pilih gambar baru atau gunakan gambar yang sudah ada.', 'warning')
    return
  }

  if (!isEdit.value && !adminId.value) {
    addToast('Identitas penulis belum tersedia. Silakan login kembali.', 'error')
    return
  }

  const formData = buildNewsFormData(isEdit.value ? undefined : adminId.value || undefined)

  saving.value = true

  const { error: submitError } = isEdit.value
    ? await patch(adminApiEndpoints.berita.update(editingId.value), formData, { showErrorToast: false })
    : await post(adminApiEndpoints.berita.create, formData, { showErrorToast: false })

  saving.value = false

  if (submitError) {
    addToast(getAdminNewsErrorMessage(submitError, 'Berita belum berhasil disimpan.'), 'error')
    return
  }

  addToast(isEdit.value ? 'Berita berhasil diperbarui.' : 'Berita berhasil dibuat.', 'success')
  backToList()
  await fetchNews(true)
}

const setPageScrollLock = (locked: boolean) => {
  if (!import.meta.client) return

  if (locked) {
    previousBodyOverflow = document.body.style.overflow
    previousHtmlOverflow = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    document.documentElement.classList.add('admin-berita-drawer-open')
    return
  }

  document.body.style.overflow = previousBodyOverflow
  document.documentElement.style.overflow = previousHtmlOverflow
  document.documentElement.classList.remove('admin-berita-drawer-open')
}

watch([searchQuery, filterCategory, filterStatus], () => {
  currentPage.value = 1
})

watch(pageMode, value => {
  setPageScrollLock(value === 'form')
})

onMounted(fetchNews)

onBeforeUnmount(() => {
  setPageScrollLock(false)

  if (imagePreview.value.startsWith('blob:')) URL.revokeObjectURL(imagePreview.value)
})
</script>

<template>
  <div class="relative flex h-full min-h-0 flex-col overflow-hidden">
    <div class="flex min-h-0 flex-1 flex-col gap-2">
      <section class="shrink-0 rounded-2xl border border-border bg-bg-surface p-4">
        <div class="grid grid-cols-[minmax(360px,1fr)_170px_auto_auto] items-center gap-4">
          <div class="relative">
            <Search class="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-text-muted" />
            <input
              v-model="searchQuery"
              type="search"
              placeholder="Cari judul, kategori, tags, atau penulis..."
              class="h-11 w-full rounded-xl border border-border-soft bg-bg-base py-2.5 pl-10 pr-4 text-sm leading-none text-text-primary outline-none transition-colors placeholder:text-text-muted hover:bg-bg-surface focus:border-brand focus:bg-bg-surface focus:ring-[3px] focus:ring-brand/12"
            >
          </div>

          <div class="relative">
            <AppSelect
              v-model="filterStatus"
              :options="statusFilterOptions"
              placeholder="Semua Status"
            />
          </div>

          <div class="h-8 w-px bg-border-soft" />

          <AppButton
            variant="primary"
            @click="openCreate"
          >
            <Plus class="mr-2 h-4 w-4" />
            Tambah Berita
          </AppButton>
        </div>
      </section>

      <section class="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-bg-surface">
        <div class="min-h-0 flex-1 overflow-auto">
          <table class="w-full border-collapse text-left">
            <thead class="sticky top-0 z-10 bg-bg-base">
              <tr class="h-12 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                <th class="w-14 px-4">No</th>
                <th class="min-w-80 px-4">Judul</th>
                <th class="w-44 px-4">Kategori</th>
                <th class="w-40 px-4">Tanggal</th>
                <th class="w-36 px-4">Status</th>
                <th class="w-28 px-4 text-center">Views</th>
                <th class="w-44 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border-soft">
              <tr v-if="loading">
                <td colspan="7">
                  <div class="flex min-h-[420px] items-center justify-center">
                    <AppEmptyState
                      title="Memuat data berita"
                      description="Sebentar, data berita sedang diambil dari server."
                    >
                      <template #icon>
                        <ImageIcon />
                      </template>
                    </AppEmptyState>
                  </div>
                </td>
              </tr>

              <tr v-else-if="error">
                <td colspan="7">
                  <div class="flex min-h-[420px] items-center justify-center">
                    <AppEmptyState
                      title="Data berita belum bisa dimuat"
                      :description="error"
                    >
                      <template #icon>
                        <ImageIcon />
                      </template>
                      <template #action>
                        <AppButton
                          variant="primary"
                          @click="fetchNews"
                        >
                          Coba Lagi
                        </AppButton>
                      </template>
                    </AppEmptyState>
                  </div>
                </td>
              </tr>

              <tr
                v-for="(berita, index) in loading || error ? [] : pagedItems"
                :key="berita.id"
                class="h-[60px] text-sm text-text-primary transition-colors hover:bg-bg-base"
              >
                <td class="px-4 text-text-secondary">
                  {{ from + index }}
                </td>
                <td class="px-4">
                  <div class="flex items-center gap-3">
                    <img
                      :src="berita.image || '/images/placeholder-news.jpg'"
                      :alt="berita.title"
                      class="h-10 w-14 rounded-lg border border-border-soft object-cover"
                      @error="useFallbackNewsImage"
                    >
                    <div class="min-w-0">
                      <p class="truncate text-text-primary">
                        {{ berita.title }}
                      </p>
                      <p class="mt-1 truncate text-xs text-text-secondary">
                        {{ berita.slug }}
                      </p>
                    </div>
                  </div>
                </td>
                <td class="px-4">
                  <span
                    class="inline-flex items-center rounded-full px-3 py-0.5 text-xs font-normal"
                    :class="getCategoryClass(berita.category)"
                  >
                    {{ getCategoryLabel(berita.category) }}
                  </span>
                </td>
                <td class="px-4 text-text-secondary">
                  {{ formatDate(berita.created_at) }}
                </td>
                <td class="px-4">
                  <span
                    v-if="berita.published"
                    class="inline-flex items-center gap-1.5 rounded-full bg-status-approved-bg px-3 py-0.5 text-xs font-normal text-status-approved-text"
                  >
                    Published
                  </span>
                  <span
                    v-else
                    class="inline-flex items-center gap-1.5 rounded-full bg-status-pending-bg px-3 py-0.5 text-xs font-normal text-status-pending-text"
                  >
                    Draft
                  </span>
                </td>
                <td class="px-4 text-center text-text-secondary">
                  {{ berita.views }}
                </td>
                <td class="px-4 text-center">
                  <div class="flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border-soft bg-bg-base text-text-secondary transition-colors hover:bg-bg-surface hover:text-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                      title="Edit"
                      @click="openEdit(berita)"
                    >
                      <Edit2 class="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border-soft bg-bg-base text-text-secondary transition-colors hover:bg-bg-surface hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/20"
                      title="Preview"
                      @click="previewNews(berita)"
                    >
                      <Eye class="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border-soft bg-bg-base text-text-secondary transition-colors hover:bg-status-rejected-bg hover:text-error focus:outline-none focus:ring-2 focus:ring-error/20"
                      title="Hapus"
                      @click="deleteNews(berita)"
                    >
                      <Trash2 class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>

              <tr v-if="!loading && !error && filteredItems.length === 0">
                <td colspan="7">
                  <div class="flex min-h-[420px] items-center justify-center">
                    <AppEmptyState
                      title="Belum ada berita"
                      description="Berita yang sudah dibuat akan muncul di sini."
                    >
                      <template #icon>
                        <ImageIcon />
                      </template>
                    </AppEmptyState>
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
    </div>

    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity duration-300 ease-out [&>aside]:transition-transform [&>aside]:duration-300 [&>aside]:ease-out"
        enter-from-class="opacity-0 [&>aside]:translate-x-full"
        enter-to-class="opacity-100 [&>aside]:translate-x-0"
        leave-active-class="transition-opacity duration-300 ease-in [&>aside]:transition-transform [&>aside]:duration-300 [&>aside]:ease-in"
        leave-from-class="opacity-100 [&>aside]:translate-x-0"
        leave-to-class="opacity-0 [&>aside]:translate-x-full"
      >
        <div
          v-if="pageMode === 'form'"
          class="fixed left-0 top-0 z-50 h-[100dvh] w-[calc(100vw+32px)] overflow-hidden bg-black/50"
          @click.self="backToList"
        >
          <aside
            class="font-heading absolute bottom-4 right-8 top-4 z-10 flex rounded-2xl border border-border bg-bg-base transition-[width] duration-300 ease-out"
            :class="isPreviewExpanded ? 'w-[980px] max-w-[calc(100vw-64px)]' : 'w-[560px] max-w-[calc(100vw-64px)]'"
          >
            <section
              class="min-h-0 shrink-0 overflow-hidden border-r border-border bg-bg-surface transition-[width,opacity] duration-300 ease-out"
              :class="isPreviewExpanded ? 'w-[420px] opacity-100' : 'w-0 opacity-0'"
            >
              <div class="flex h-[70px] items-center border-b border-border px-6">
                <h3 class="text-[17px] font-semibold leading-[1.24] text-text-primary">
                  Preview Berita
                </h3>
              </div>

              <div class="h-[calc(100%-70px)] overflow-y-auto p-4">
                <article class="overflow-hidden rounded-2xl border border-border bg-bg-base">
                  <div class="relative h-52 bg-bg-parchment">
                    <img
                      v-if="imagePreview"
                      :src="imagePreview"
                      :alt="form.title || 'Preview'"
                      class="h-full w-full object-cover"
                      @error="useFallbackNewsImage"
                    >
                    <div
                      v-else
                      class="flex h-full items-center justify-center"
                    >
                      <Upload class="h-12 w-12 text-text-muted" />
                    </div>

                    <div class="absolute left-3 top-3">
                      <span class="rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white">
                        {{ getCategoryLabel(form.category) }}
                      </span>
                    </div>
                  </div>

                  <div class="p-4">
                    <h3 class="line-clamp-2 text-lg font-semibold leading-tight text-text-primary">
                      {{ form.title || 'Judul berita akan muncul di sini...' }}
                    </h3>
                    <p class="mt-3 line-clamp-4 text-sm leading-relaxed text-text-secondary">
                      {{ form.content.substring(0, 180) || 'Konten berita akan muncul di sini...' }}
                    </p>
                    <div class="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4 text-xs text-text-muted">
                      <span>{{ formatDate(new Date().toISOString()) }}</span>
                      <span v-if="form.tags" class="rounded-full bg-primary-50 px-2.5 py-1 text-brand">
                        {{ form.tags.split(',')[0]?.trim() }}
                      </span>
                    </div>
                  </div>
                </article>
              </div>
            </section>

            <section class="relative flex min-h-0 w-[560px] shrink-0 flex-col bg-bg-base">
              <button
                type="button"
                class="absolute left-0 top-1/2 z-20 flex h-11 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-bg-surface text-text-secondary transition-colors hover:bg-bg-base hover:text-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                :aria-label="isPreviewExpanded ? 'Sembunyikan preview berita' : 'Tampilkan preview berita'"
                @click="isPreviewExpanded = !isPreviewExpanded"
              >
                <ChevronRight
                  v-if="isPreviewExpanded"
                  class="h-5 w-5"
                />
                <ChevronLeft
                  v-else
                  class="h-5 w-5"
                />
              </button>

              <header class="flex h-[70px] shrink-0 items-center border-b border-border bg-bg-surface px-8">
                <div class="flex w-full items-center justify-between gap-6">
                  <h2 class="text-[22px] font-bold leading-[1.18] text-text-primary">
                    {{ isEdit ? 'Edit Berita' : 'Tambah Berita Baru' }}
                  </h2>

                  <button
                    type="button"
                    class="flex h-9 w-9 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-bg-base hover:text-text-primary"
                    aria-label="Tutup editor berita"
                    @click="backToList"
                  >
                    <X class="h-5 w-5" />
                  </button>
                </div>
              </header>

              <main class="min-h-0 grow overflow-y-auto p-4">
                <div
                  v-if="error"
                  class="mb-6 rounded-xl border border-error/20 bg-status-rejected-bg p-4"
                >
                  <p class="text-sm text-status-rejected-text">
                    {{ error }}
                  </p>
                </div>

                <div class="space-y-4">
                  <div class="space-y-4">
                  <form
                    class="space-y-4"
                    @submit.prevent="submitForm"
                  >
                    <div class="rounded-2xl border border-border bg-bg-surface p-4">
                      <div class="space-y-4">
                        <div>
                          <label class="mb-2 block text-sm font-semibold text-text-primary">
                            Judul Berita <span class="text-error">*</span>
                          </label>
                          <input
                            v-model="form.title"
                            type="text"
                            required
                            placeholder="Masukkan judul berita..."
                            class="w-full rounded-xl border border-border bg-bg-base px-4 py-3 text-text-primary outline-none transition-colors placeholder:text-text-muted hover:bg-bg-surface focus:border-brand focus:bg-bg-surface focus:ring-[3px] focus:ring-brand/12"
                          >
                          <p class="mt-2 text-xs text-text-secondary">
                            Slug: <span>{{ generateSlug(form.title) }}</span>
                          </p>
                        </div>

                        <div>
                          <label class="mb-2 block text-sm font-semibold text-text-primary">
                            Kategori <span class="text-error">*</span>
                          </label>
                          <select
                            v-model="form.category"
                            required
                            class="w-full rounded-xl border border-border bg-bg-base px-4 py-3 text-text-primary outline-none transition-colors hover:bg-bg-surface focus:border-brand focus:bg-bg-surface focus:ring-[3px] focus:ring-brand/12"
                          >
                            <option value="event">Event</option>
                            <option value="achievement">Prestasi</option>
                            <option value="announcement">Pengumuman</option>
                            <option value="other">Lainnya</option>
                          </select>
                        </div>

                        <div>
                          <label class="mb-2 block text-sm font-semibold text-text-primary">
                            Tags <span class="text-error">*</span>
                          </label>
                          <input
                            v-model="form.tags"
                            type="text"
                            placeholder="pengumuman,ppdb,sekolah"
                            class="w-full rounded-xl border border-border bg-bg-base px-4 py-3 text-text-primary outline-none transition-colors placeholder:text-text-muted hover:bg-bg-surface focus:border-brand focus:bg-bg-surface focus:ring-[3px] focus:ring-brand/12"
                          >
                        </div>

                        <div>
                          <label class="mb-2 block text-sm font-semibold text-text-primary">
                            Gambar Featured <span v-if="!isEdit" class="text-error">*</span>
                          </label>
                          <div
                            v-if="imagePreview"
                            class="mb-4"
                          >
                            <div class="group relative">
                              <img
                                :src="imagePreview"
                                alt="Preview"
                                class="h-64 w-full rounded-xl border border-border object-cover"
                                @error="useFallbackNewsImage"
                              >
                              <div class="absolute inset-0 flex items-center justify-center gap-3 rounded-xl bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                                <button
                                  type="button"
                                  class="flex items-center gap-2 rounded-lg bg-bg-surface/90 px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-bg-surface"
                                  @click="triggerFileInput"
                                >
                                  <ImageIcon class="h-4 w-4" />
                                  Ganti
                                </button>
                                <button
                                  type="button"
                                  class="flex items-center gap-2 rounded-lg bg-error px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-status-rejected-text"
                                  @click="removeImage"
                                >
                                  <Trash2 class="h-4 w-4" />
                                  Hapus
                                </button>
                              </div>
                            </div>
                          </div>

                          <div
                            v-if="!imagePreview"
                            class="cursor-pointer rounded-xl border-2 border-dashed border-border p-8 text-center transition-colors duration-200 hover:border-brand hover:bg-bg-surface"
                            @click="triggerFileInput"
                          >
                            <Upload class="mx-auto mb-3 h-12 w-12 text-text-muted" />
                            <p class="mb-1 text-sm font-medium text-text-primary">
                              Klik untuk upload gambar
                            </p>
                            <p class="text-xs text-text-secondary">
                              {{ isEdit ? 'Kosongkan jika tidak ingin mengganti gambar. PNG, JPG, WEBP maksimal 4MB.' : 'PNG, JPG, WEBP maksimal 4MB.' }}
                            </p>
                          </div>
                          <input
                            ref="fileInput"
                            type="file"
                            :accept="ADMIN_IMAGE_ACCEPT"
                            class="hidden"
                            @change="handleFileSelect"
                          >
                        </div>

                        <div>
                          <label class="mb-2 block text-sm font-semibold text-text-primary">
                            Konten <span class="text-error">*</span>
                          </label>
                          <textarea
                            v-model="form.content"
                            rows="12"
                            required
                            placeholder="Tulis konten berita di sini..."
                            class="w-full rounded-xl border border-border bg-bg-base px-4 py-3 text-text-primary outline-none transition-colors placeholder:text-text-muted hover:bg-bg-surface focus:border-brand focus:bg-bg-surface focus:ring-[3px] focus:ring-brand/12"
                          />
                        </div>
                      </div>
                    </div>

                    <div class="flex items-center gap-4">
                      <button
                        type="submit"
                        :disabled="saving"
                        class="flex items-center gap-2 rounded-xl bg-brand px-6 py-3 font-semibold text-white transition-colors duration-200 hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-bg-parchment disabled:text-text-muted"
                      >
                        <Save class="h-5 w-5" />
                        {{ saving ? 'Menyimpan...' : isEdit ? 'Update Berita' : 'Simpan Berita' }}
                      </button>
                      <button
                        type="button"
                        class="rounded-xl bg-bg-base px-6 py-3 font-semibold text-text-secondary transition-colors duration-200 hover:bg-bg-parchment hover:text-text-primary"
                        @click="backToList"
                      >
                        Batal
                      </button>
                    </div>
                  </form>
                </div>
              </div>
              </main>
            </section>
          </aside>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
:global(.admin-berita-drawer-open),
:global(.admin-berita-drawer-open *) {
  scrollbar-width: none;
}

:global(.admin-berita-drawer-open::-webkit-scrollbar),
:global(.admin-berita-drawer-open *::-webkit-scrollbar) {
  width: 0;
  height: 0;
}
</style>

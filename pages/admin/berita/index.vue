<script setup lang="ts">
import {
  Eye,
  FileText,
  Image as ImageIcon,
  Newspaper,
  Pencil,
  Plus,
  Search,
  Trash2,
  UploadCloud,
  XCircle
} from 'lucide-vue-next'

type NewsStatus = 'draft' | 'published' | 'archived'
type NewsItem = {
  id: string
  title: string
  slug: string
  excerpt: string
  category: string
  status: NewsStatus
  publishDate: string
  imageUrl: string
}

definePageMeta({
  layout: 'admin',
  middleware: ['admin-auth']
})

useHead({ title: 'Berita | MDS Cendekia' })

const { addToast } = useToast()

const newsItems = ref<NewsItem[]>([])
const searchQuery = ref('')
const statusFilter = ref<NewsStatus | ''>('')
const isEditorOpen = ref(false)
const editingItem = ref<NewsItem | null>(null)
const form = reactive({
  title: '',
  slug: '',
  excerpt: '',
  category: '',
  status: 'draft' as NewsStatus,
  publishDate: '',
  imageUrl: ''
})

const statusOptions = [
  { label: 'Semua Status', value: '' },
  { label: 'Dipublikasikan', value: 'published' },
  { label: 'Draft', value: 'draft' },
  { label: 'Diarsipkan', value: 'archived' }
]

const formStatusOptions = statusOptions.slice(1)

const filteredNews = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return newsItems.value.filter((item) => {
    const matchesSearch = !query || [
      item.title,
      item.excerpt,
      item.category,
      item.slug
    ].some(value => value.toLowerCase().includes(query))
    const matchesStatus = !statusFilter.value || item.status === statusFilter.value

    return matchesSearch && matchesStatus
  })
})

const statusLabel = (status: NewsStatus) => {
  if (status === 'published') return 'Dipublikasikan'
  if (status === 'archived') return 'Diarsipkan'
  return 'Draft'
}

const statusClass = (status: NewsStatus) => {
  if (status === 'published') return 'border-status-approved-text/20 bg-status-approved-bg text-status-approved-text'
  if (status === 'archived') return 'border-border-soft bg-bg-base text-text-secondary'
  return 'border-status-pending-text/20 bg-status-pending-bg text-status-pending-text'
}

const formatDate = (date: string) => {
  if (!date) return '-'
  const parsedDate = new Date(date)
  if (Number.isNaN(parsedDate.getTime())) return date

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(parsedDate)
}

const buildSlug = (value: string) => value
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '')

const resetForm = () => {
  editingItem.value = null
  Object.assign(form, {
    title: '',
    slug: '',
    excerpt: '',
    category: '',
    status: 'draft' as NewsStatus,
    publishDate: '',
    imageUrl: ''
  })
}

const openCreate = () => {
  resetForm()
  isEditorOpen.value = true
}

const openEdit = (item: NewsItem) => {
  editingItem.value = item
  Object.assign(form, {
    title: item.title,
    slug: item.slug,
    excerpt: item.excerpt,
    category: item.category,
    status: item.status,
    publishDate: item.publishDate,
    imageUrl: item.imageUrl
  })
  isEditorOpen.value = true
}

watch(() => form.title, (title) => {
  if (!editingItem.value) form.slug = buildSlug(title)
})

const submitForm = () => {
  addToast('Endpoint berita belum tersedia di API.', 'warning')
}
</script>

<template>
  <div class="flex h-full min-h-0 flex-col px-6">
    <div class="flex min-h-0 flex-1 flex-col gap-2">
      <section class="shrink-0 rounded-2xl border border-border bg-bg-surface p-4">
        <div class="grid grid-cols-[minmax(360px,1fr)_220px_170px] gap-4">
          <div class="relative">
            <Search class="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-text-muted" />
            <input
              v-model="searchQuery"
              type="search"
              placeholder="Cari judul, kategori, atau slug..."
              class="h-11 w-full rounded-xl border border-border-soft bg-bg-base py-2.5 pl-10 pr-4 text-sm leading-none text-text-primary outline-none transition-colors placeholder:text-text-muted hover:bg-bg-surface focus:border-brand focus:bg-bg-surface focus:ring-[3px] focus:ring-brand/12"
            >
          </div>

          <div class="relative">
            <AppSelect
              v-model="statusFilter"
              :options="statusOptions"
              placeholder="Semua Status"
            />
          </div>

          <AppButton variant="primary" @click="openCreate">
            <Plus class="mr-2 h-4 w-4" />
            Tambah Berita
          </AppButton>
        </div>
      </section>

      <section class="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-bg-surface">
        <div class="min-h-0 flex-1 overflow-auto">
          <table class="w-full min-w-[960px] border-collapse text-left">
            <thead class="sticky top-0 z-10 bg-bg-base">
              <tr class="h-12 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                <th class="w-18 px-4">No</th>
                <th class="min-w-80 px-4">Berita</th>
                <th class="w-44 px-4">Kategori</th>
                <th class="w-40 px-4">Status</th>
                <th class="w-40 px-4">Tanggal Terbit</th>
                <th class="w-36 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border-soft">
              <tr
                v-for="(item, index) in filteredNews"
                :key="item.id"
                class="h-18 text-sm text-text-primary transition-colors hover:bg-bg-base"
              >
                <td class="px-4 text-text-secondary">{{ index + 1 }}</td>
                <td class="px-4">
                  <div class="flex items-center gap-3">
                    <div class="flex h-11 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border-soft bg-bg-base text-text-muted">
                      <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.title" class="h-full w-full object-cover">
                      <ImageIcon v-else class="h-4 w-4" />
                    </div>
                    <div class="min-w-0">
                      <p class="truncate font-medium text-text-primary">{{ item.title }}</p>
                      <p class="mt-1 truncate text-xs text-text-secondary">{{ item.slug }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-4 text-text-secondary">{{ item.category || '-' }}</td>
                <td class="px-4">
                  <span class="inline-flex rounded-full border px-3 py-1 text-xs font-medium" :class="statusClass(item.status)">
                    {{ statusLabel(item.status) }}
                  </span>
                </td>
                <td class="px-4 text-text-secondary">{{ formatDate(item.publishDate) }}</td>
                <td class="px-4">
                  <div class="flex items-center justify-center gap-1.5">
                    <button type="button" class="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-bg-surface hover:text-text-primary" aria-label="Lihat berita">
                      <Eye class="h-4 w-4" />
                    </button>
                    <button type="button" class="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-bg-surface hover:text-brand" aria-label="Edit berita" @click="openEdit(item)">
                      <Pencil class="h-4 w-4" />
                    </button>
                    <button type="button" class="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-status-rejected-bg hover:text-error" aria-label="Hapus berita">
                      <Trash2 class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredNews.length === 0">
                <td colspan="6">
                  <div class="flex min-h-[420px] items-center justify-center">
                    <AppEmptyState
                      title="Belum ada berita"
                      description="Berita yang sudah dibuat akan tampil di tabel ini."
                    >
                      <template #icon>
                        <Newspaper />
                      </template>
                      <template #action>
                        <AppButton variant="primary" @click="openCreate">
                          <Plus class="mr-2 h-4 w-4" />
                          Tambah Berita
                        </AppButton>
                      </template>
                    </AppEmptyState>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
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
          v-if="isEditorOpen"
          class="fixed inset-0 z-50 bg-text-primary/20 backdrop-blur-[14px]"
          @click.self="isEditorOpen = false"
        >
          <aside class="ml-auto flex h-full w-[min(720px,calc(100%-320px))] flex-col overflow-hidden border-l-2 border-border bg-bg-base shadow-[rgba(0,0,0,0.08)_-12px_0_32px_0]">
            <header class="shrink-0 border-b border-border bg-bg-surface px-8 py-5">
              <div class="flex items-start justify-between gap-6">
                <div>
                  <h2 class="font-heading text-[22px] font-bold leading-[1.18] tracking-[-0.3px] text-text-primary">
                    {{ editingItem ? 'Edit Berita' : 'Tambah Berita' }}
                  </h2>
                  <p class="mt-1 text-sm leading-[1.43] text-text-secondary">
                    Siapkan konten berita sekolah sebelum dipublikasikan.
                  </p>
                </div>
                <button
                  type="button"
                  class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-bg-base hover:text-text-primary"
                  aria-label="Tutup editor berita"
                  @click="isEditorOpen = false"
                >
                  <XCircle class="h-5 w-5" />
                </button>
              </div>
            </header>

            <main class="min-h-0 grow overflow-y-auto px-8 py-6">
              <div class="space-y-5">
                <div class="rounded-2xl border border-dashed border-border bg-bg-surface p-5">
                  <div class="flex items-center gap-4">
                    <div class="flex h-20 w-28 shrink-0 items-center justify-center rounded-xl bg-bg-base text-text-muted">
                      <UploadCloud class="h-6 w-6" />
                    </div>
                    <div class="min-w-0">
                      <p class="text-sm font-semibold text-text-primary">Gambar Utama</p>
                      <p class="mt-1 text-sm leading-relaxed text-text-secondary">Upload gambar akan disambungkan setelah endpoint berita tersedia.</p>
                    </div>
                  </div>
                </div>

                <AppInput v-model="form.title" label="Judul Berita" required placeholder="Contoh: Pendaftaran Tahun Ajaran Baru Dibuka" />
                <AppInput v-model="form.slug" label="Slug" required placeholder="pendaftaran-tahun-ajaran-baru-dibuka" />
                <AppTextarea v-model="form.excerpt" label="Ringkasan" required :rows="3" :maxlength="220" placeholder="Tulis ringkasan singkat berita..." />
                <div class="grid grid-cols-2 gap-4">
                  <AppInput v-model="form.category" label="Kategori" placeholder="Pengumuman" />
                  <AppInput v-model="form.publishDate" label="Tanggal Terbit" type="date" />
                </div>
                <AppSelect v-model="form.status" label="Status" required :options="formStatusOptions" />
                <AppTextarea v-model="form.imageUrl" label="URL Gambar" :rows="2" placeholder="https://..." />
                <div class="rounded-2xl border border-border-soft bg-bg-surface p-5">
                  <div class="mb-3 flex items-center gap-2 text-sm font-semibold text-text-primary">
                    <FileText class="h-4 w-4 text-text-muted" />
                    Konten Berita
                  </div>
                  <div class="min-h-40 rounded-xl border border-border bg-bg-base p-4 text-sm text-text-secondary">
                    Editor konten lengkap akan disambungkan saat API dan kebutuhan field konten sudah final.
                  </div>
                </div>
              </div>
            </main>

            <footer class="shrink-0 border-t border-border bg-bg-surface px-8 py-4">
              <div class="flex justify-end gap-3">
                <AppButton variant="ghost" @click="isEditorOpen = false">Batal</AppButton>
                <AppButton variant="primary" @click="submitForm">Simpan Berita</AppButton>
              </div>
            </footer>
          </aside>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

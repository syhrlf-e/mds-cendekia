<script setup lang="ts">
import {
  CalendarDays,
  CheckCircle2,
  ChevronDownCircle,
  ChevronUpCircle,
  Clock3,
  Edit3,
  Eye,
  EyeOff,
  Plus,
  XCircle
} from 'lucide-vue-next'
import { computed, onMounted, reactive, ref, watch } from 'vue'

type TimelineStatus = 'aktif' | 'nonaktif'
type TimelineComputedStatus = 'belum_mulai' | 'berjalan' | 'selesai' | 'nonaktif'

type TimelineItem = {
  id: number
  judul: string
  deskripsi: string
  tanggalMulai: string
  tanggalSelesai: string
  urutan: number
  status: TimelineStatus
  tampilPublik: boolean
}

type TimelineDto = Record<string, any>

definePageMeta({
  layout: 'admin',
  middleware: ['admin-auth']
})

useHead({ title: 'Timeline PPDB | MDS Cendekia' })

const { get, post, put } = useApi()
const { addToast } = useToast()
const isLoading = ref(true)
const isSaving = ref(false)
const loadError = ref('')
const timelineItems = ref<TimelineItem[]>([])
const isDrawerOpen = ref(false)
const editingItem = ref<TimelineItem | null>(null)

const form = reactive({
  id: 0,
  judul: '',
  deskripsi: '',
  tanggalMulai: '',
  tanggalSelesai: '',
  urutan: '',
  status: 'aktif' as TimelineStatus,
  tampilPublik: true
})

const timelineStatusOptions = [
  { label: 'Aktif', value: 'aktif' },
  { label: 'Nonaktif', value: 'nonaktif' }
]

const normalizeText = (value: unknown) => String(value || '').trim()
const normalizeNumber = (value: unknown) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const readArrayPayload = (payload: any): TimelineDto[] => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.data?.data)) return payload.data.data
  if (Array.isArray(payload?.timeline)) return payload.timeline
  if (Array.isArray(payload?.data?.timeline)) return payload.data.timeline
  return []
}

const mapTimelineItem = (item: TimelineDto): TimelineItem => ({
  id: normalizeNumber(item.id),
  judul: normalizeText(item.judul || item.title || item.nama),
  deskripsi: normalizeText(item.deskripsi || item.description),
  tanggalMulai: normalizeText(item.tanggal_mulai || item.start_date || item.tanggalMulai),
  tanggalSelesai: normalizeText(item.tanggal_selesai || item.end_date || item.tanggalSelesai),
  urutan: normalizeNumber(item.urutan || item.order),
  status: normalizeText(item.status).toLowerCase() === 'nonaktif' ? 'nonaktif' : 'aktif',
  tampilPublik: Boolean(item.tampil_publik ?? item.is_public ?? item.tampilPublik)
})

const sortedTimeline = computed(() => {
  return [...timelineItems.value].sort((a, b) => a.urutan - b.urutan)
})

const getComputedStatus = (item: TimelineItem): TimelineComputedStatus => {
  if (item.status === 'nonaktif') return 'nonaktif'

  const now = new Date()
  const start = new Date(`${item.tanggalMulai}T00:00:00`)
  const end = new Date(`${item.tanggalSelesai || item.tanggalMulai}T23:59:59`)

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 'belum_mulai'
  if (now < start) return 'belum_mulai'
  if (now > end) return 'selesai'
  return 'berjalan'
}

const statusLabel = (status: TimelineComputedStatus) => {
  if (status === 'berjalan') return 'Berjalan'
  if (status === 'selesai') return 'Selesai'
  if (status === 'nonaktif') return 'Nonaktif'
  return 'Belum Mulai'
}

const statusClass = (status: TimelineComputedStatus) => {
  if (status === 'berjalan') return 'bg-status-approved-bg text-status-approved-text'
  if (status === 'selesai') return 'bg-bg-base text-text-secondary'
  if (status === 'nonaktif') return 'bg-status-rejected-bg text-status-rejected-text'
  return 'bg-status-pending-bg text-status-pending-text'
}

const currentStage = computed(() => sortedTimeline.value.find(item => getComputedStatus(item) === 'berjalan') || null)
const nextStage = computed(() => sortedTimeline.value.find(item => getComputedStatus(item) === 'belum_mulai') || null)
const publicStages = computed(() => timelineItems.value.filter(item => item.tampilPublik && item.status === 'aktif').length)
const activeStages = computed(() => timelineItems.value.filter(item => item.status === 'aktif').length)
const hasDateWarning = computed(() => timelineItems.value.some(item => item.tanggalSelesai && item.tanggalMulai && item.tanggalSelesai < item.tanggalMulai))

const loadTimeline = async () => {
  isLoading.value = true
  loadError.value = ''

  const { data, error } = await get<any>('/api/timeline-ppdb', { showErrorToast: false })
  const rows = readArrayPayload(data)

  if (error) {
    timelineItems.value = []
    loadError.value = 'Data timeline PPDB belum bisa diambil dari server.'
    isLoading.value = false
    return
  }

  timelineItems.value = rows.map(mapTimelineItem)
  isLoading.value = false
}

const resetForm = () => {
  editingItem.value = null
  form.id = 0
  form.judul = ''
  form.deskripsi = ''
  form.tanggalMulai = ''
  form.tanggalSelesai = ''
  form.urutan = String(sortedTimeline.value.length + 1)
  form.status = 'aktif'
  form.tampilPublik = true
}

const openCreate = () => {
  resetForm()
  isDrawerOpen.value = true
}

const openEdit = (item: TimelineItem) => {
  editingItem.value = item
  form.id = item.id
  form.judul = item.judul
  form.deskripsi = item.deskripsi
  form.tanggalMulai = item.tanggalMulai
  form.tanggalSelesai = item.tanggalSelesai
  form.urutan = String(item.urutan)
  form.status = item.status
  form.tampilPublik = item.tampilPublik
  isDrawerOpen.value = true
}

const closeDrawer = () => {
  isDrawerOpen.value = false
}

const validateForm = () => {
  if (!form.judul.trim()) return 'Nama tahap wajib diisi.'
  if (!form.tanggalMulai) return 'Tanggal mulai wajib diisi.'
  if (!form.tanggalSelesai) return 'Tanggal selesai wajib diisi.'
  if (form.tanggalSelesai < form.tanggalMulai) return 'Tanggal selesai tidak boleh lebih awal dari tanggal mulai.'
  if (form.tampilPublik && !form.deskripsi.trim()) return 'Deskripsi wajib diisi jika tahap tampil di publik.'
  return ''
}

const buildPayload = () => ({
  id: form.id,
  judul: form.judul.trim(),
  deskripsi: form.deskripsi.trim(),
  tanggal_mulai: form.tanggalMulai,
  tanggal_selesai: form.tanggalSelesai,
  urutan: Number(form.urutan || sortedTimeline.value.length + 1),
  status: form.status,
  tampil_publik: form.tampilPublik
})

const handleSave = async () => {
  const errorMessage = validateForm()
  if (errorMessage) {
    addToast(errorMessage, 'error')
    return
  }

  isSaving.value = true
  const payload = buildPayload()
  const request = editingItem.value
    ? put<{ status?: boolean, success?: boolean, message?: string }>('/api/timeline-ppdb', payload, { showErrorToast: false })
    : post<{ status?: boolean, success?: boolean, message?: string }>('/api/timeline-ppdb', payload, { showErrorToast: false })
  const { data, error } = await request
  isSaving.value = false

  if (error || data?.status === false || data?.success === false) {
    addToast(error?.data?.message || error?.response?._data?.message || data?.message || 'Tahap timeline belum berhasil disimpan.', 'error')
    return
  }

  closeDrawer()
  await loadTimeline()
  addToast(data?.message || 'Tahap timeline berhasil disimpan.', 'success')
}

const updateItem = async (item: TimelineItem, overrides: Partial<TimelineItem>) => {
  isSaving.value = true
  const nextItem = { ...item, ...overrides }
  const { data, error } = await put<{ status?: boolean, success?: boolean, message?: string }>('/api/timeline-ppdb', {
    id: nextItem.id,
    judul: nextItem.judul,
    deskripsi: nextItem.deskripsi,
    tanggal_mulai: nextItem.tanggalMulai,
    tanggal_selesai: nextItem.tanggalSelesai,
    urutan: nextItem.urutan,
    status: nextItem.status,
    tampil_publik: nextItem.tampilPublik
  }, { showErrorToast: false })
  isSaving.value = false

  if (error || data?.status === false || data?.success === false) {
    addToast(error?.data?.message || error?.response?._data?.message || data?.message || 'Timeline belum berhasil diperbarui.', 'error')
    return
  }

  await loadTimeline()
}

const toggleStatus = async (item: TimelineItem) => {
  await updateItem(item, { status: item.status === 'aktif' ? 'nonaktif' : 'aktif' })
  addToast(item.status === 'aktif' ? 'Tahap dinonaktifkan.' : 'Tahap diaktifkan.', 'success')
}

const togglePublic = async (item: TimelineItem) => {
  await updateItem(item, { tampilPublik: !item.tampilPublik })
  addToast(item.tampilPublik ? 'Tahap disembunyikan dari publik.' : 'Tahap ditampilkan ke publik.', 'success')
}

const moveItem = async (item: TimelineItem, direction: 'up' | 'down') => {
  const list = sortedTimeline.value
  const index = list.findIndex(row => row.id === item.id)
  const sibling = direction === 'up' ? list[index - 1] : list[index + 1]
  if (!sibling) return

  isSaving.value = true
  await updateItem(item, { urutan: sibling.urutan })
  await updateItem(sibling, { urutan: item.urutan })
  isSaving.value = false
}

const formatDate = (date: string) => {
  if (!date) return '-'
  const parsedDate = new Date(date)
  if (Number.isNaN(parsedDate.getTime())) return date

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(parsedDate)
}

watch(isDrawerOpen, (isOpen) => {
  if (!isOpen) resetForm()
})

onMounted(loadTimeline)
</script>

<template>
  <div class="flex h-full min-h-0 flex-col gap-4">
    <section
      v-if="loadError && !isLoading"
      class="rounded-2xl border border-status-pending-text/20 bg-status-pending-bg px-5 py-4 text-sm text-status-pending-text"
    >
      {{ loadError }}
    </section>

    <div class="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_340px] gap-4">
      <section class="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-bg-surface">
        <div class="flex shrink-0 items-center justify-between gap-4 border-b border-border bg-bg-base px-5 py-4">
          <div>
            <h2 class="text-sm font-semibold text-text-primary">Tahapan PPDB</h2>
            <p class="mt-0.5 text-xs text-text-secondary">Urutan jadwal yang mengarahkan informasi publik dan kerja admin.</p>
          </div>
          <button
            type="button"
            class="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-brand px-5 text-sm font-medium text-white transition-colors hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-brand/20"
            @click="openCreate"
          >
            <Plus class="h-4 w-4" />
            Tambah Tahap
          </button>
        </div>

        <div class="min-h-0 flex-1 overflow-auto p-5">
          <div v-if="isLoading" class="flex min-h-[420px] items-center justify-center">
            <AppEmptyState title="Memuat timeline PPDB" description="Sebentar, data tahapan sedang diambil.">
              <template #icon>
                <CalendarDays />
              </template>
            </AppEmptyState>
          </div>

          <div v-else-if="!sortedTimeline.length" class="flex min-h-[420px] items-center justify-center">
            <AppEmptyState title="Belum ada timeline" description="Tambahkan tahapan PPDB pertama untuk memulai.">
              <template #icon>
                <CalendarDays />
              </template>
            </AppEmptyState>
          </div>

          <div v-else class="relative space-y-3">
            <div class="absolute bottom-6 left-6 top-6 w-px bg-border-soft" />

            <article
              v-for="(item, index) in sortedTimeline"
              :key="item.id"
              class="relative grid grid-cols-[48px_minmax(0,1fr)_auto] gap-4 rounded-2xl border border-border bg-bg-surface p-4 transition-colors hover:bg-bg-base"
            >
              <div class="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-bg-base text-sm font-semibold text-text-primary">
                {{ item.urutan }}
              </div>

              <div class="min-w-0">
                <div class="mb-2 flex flex-wrap items-center gap-2">
                  <h3 class="text-[15px] font-semibold leading-[1.4] text-text-primary">{{ item.judul }}</h3>
                  <span
                    class="inline-flex rounded-full px-3 py-0.5 text-xs font-normal"
                    :class="statusClass(getComputedStatus(item))"
                  >
                    {{ statusLabel(getComputedStatus(item)) }}
                  </span>
                  <span
                    class="inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-normal"
                    :class="item.tampilPublik ? 'bg-primary-50 text-brand' : 'bg-bg-base text-text-secondary'"
                  >
                    <Eye v-if="item.tampilPublik" class="h-3.5 w-3.5" />
                    <EyeOff v-else class="h-3.5 w-3.5" />
                    {{ item.tampilPublik ? 'Publik' : 'Internal' }}
                  </span>
                </div>
                <p class="line-clamp-2 text-sm leading-[1.5] text-text-secondary">{{ item.deskripsi || 'Belum ada deskripsi.' }}</p>
                <p class="mt-3 text-xs text-text-muted">
                  {{ formatDate(item.tanggalMulai) }} - {{ formatDate(item.tanggalSelesai) }}
                </p>
              </div>

              <div class="flex items-center gap-2">
                <button
                  type="button"
                  class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border-soft bg-bg-base text-text-secondary transition-colors hover:bg-bg-surface hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
                  :disabled="index === 0 || isSaving"
                  aria-label="Naikkan urutan"
                  @click="moveItem(item, 'up')"
                >
                  <ChevronUpCircle class="h-4 w-4" />
                </button>
                <button
                  type="button"
                  class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border-soft bg-bg-base text-text-secondary transition-colors hover:bg-bg-surface hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
                  :disabled="index === sortedTimeline.length - 1 || isSaving"
                  aria-label="Turunkan urutan"
                  @click="moveItem(item, 'down')"
                >
                  <ChevronDownCircle class="h-4 w-4" />
                </button>
                <button
                  type="button"
                  class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border-soft bg-bg-base text-text-secondary transition-colors hover:bg-bg-surface hover:text-text-primary"
                  :aria-label="item.tampilPublik ? 'Sembunyikan dari publik' : 'Tampilkan ke publik'"
                  @click="togglePublic(item)"
                >
                  <Eye v-if="!item.tampilPublik" class="h-4 w-4" />
                  <EyeOff v-else class="h-4 w-4" />
                </button>
                <button
                  type="button"
                  class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border-soft bg-bg-base text-text-secondary transition-colors hover:bg-bg-surface hover:text-text-primary"
                  :aria-label="item.status === 'aktif' ? 'Nonaktifkan tahap' : 'Aktifkan tahap'"
                  @click="toggleStatus(item)"
                >
                  <CheckCircle2 class="h-4 w-4" />
                </button>
                <button
                  type="button"
                  class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border-soft bg-bg-base text-text-secondary transition-colors hover:bg-bg-surface hover:text-text-primary"
                  aria-label="Edit tahap"
                  @click="openEdit(item)"
                >
                  <Edit3 class="h-4 w-4" />
                </button>
              </div>
            </article>
          </div>
        </div>
      </section>

      <aside class="flex min-h-0 flex-col gap-4">
        <section class="rounded-2xl border border-border bg-bg-surface p-5">
          <div class="mb-5 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-brand">
              <CalendarDays class="h-5 w-5" />
            </div>
            <div>
              <h2 class="text-sm font-semibold text-text-primary">Ringkasan Timeline</h2>
              <p class="mt-0.5 text-xs text-text-secondary">Status tahapan PPDB</p>
            </div>
          </div>

          <div class="space-y-3 text-sm">
            <div class="flex items-center justify-between gap-4">
              <span class="text-text-secondary">Tahap berjalan</span>
              <span class="text-right text-text-primary">{{ currentStage?.judul || '-' }}</span>
            </div>
            <div class="flex items-center justify-between gap-4">
              <span class="text-text-secondary">Tahap berikutnya</span>
              <span class="text-right text-text-primary">{{ nextStage?.judul || '-' }}</span>
            </div>
            <div class="flex items-center justify-between gap-4">
              <span class="text-text-secondary">Tahap aktif</span>
              <span class="text-text-primary">{{ activeStages }}</span>
            </div>
            <div class="flex items-center justify-between gap-4">
              <span class="text-text-secondary">Tampil publik</span>
              <span class="text-text-primary">{{ publicStages }}</span>
            </div>
          </div>
        </section>

        <section
          class="rounded-2xl border p-5"
          :class="hasDateWarning ? 'border-status-pending-text/20 bg-status-pending-bg text-status-pending-text' : 'border-border bg-bg-surface text-text-secondary'"
        >
          <div class="flex items-start gap-3">
            <Clock3 class="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <h2 class="text-sm font-semibold text-text-primary">Catatan Validasi</h2>
              <p class="mt-1 text-sm leading-[1.5]">
                {{ hasDateWarning ? 'Ada tahap dengan tanggal selesai lebih awal dari tanggal mulai.' : 'Tanggal overlap boleh terjadi untuk tahap yang memang berjalan bersamaan.' }}
              </p>
            </div>
          </div>
        </section>
      </aside>
    </div>

    <Teleport to="body">
      <Transition
        enter-active-class="transition-[opacity,backdrop-filter] duration-300 ease-out [&>aside]:transition-transform [&>aside]:duration-300 [&>aside]:ease-out"
        enter-from-class="opacity-0 backdrop-blur-none [&>aside]:translate-x-full"
        enter-to-class="opacity-100 backdrop-blur-[14px] [&>aside]:translate-x-0"
        leave-active-class="transition-[opacity,backdrop-filter] duration-300 ease-in [&>aside]:transition-transform [&>aside]:duration-300 [&>aside]:ease-in"
        leave-from-class="opacity-100 backdrop-blur-[14px] [&>aside]:translate-x-0"
        leave-to-class="opacity-0 backdrop-blur-none [&>aside]:translate-x-full"
      >
        <div
          v-if="isDrawerOpen"
          class="fixed inset-0 z-50 bg-text-primary/20 backdrop-blur-[14px]"
          @click.self="closeDrawer"
        >
          <aside class="ml-auto flex h-full w-[min(680px,calc(100%-320px))] flex-col overflow-hidden border-l-2 border-border bg-bg-base shadow-[rgba(0,0,0,0.08)_-12px_0_32px_0]">
            <header class="shrink-0 border-b border-border bg-bg-surface px-8 py-5">
              <div class="flex items-start justify-between gap-5">
                <div>
                  <h2 class="font-heading text-[22px] font-bold leading-[1.18] tracking-[-0.3px] text-text-primary">
                    {{ editingItem ? 'Edit Tahap PPDB' : 'Tambah Tahap PPDB' }}
                  </h2>
                  <p class="mt-1 text-sm text-text-secondary">
                    Tahap publik akan ditampilkan sebagai jadwal PPDB.
                  </p>
                </div>
                <button
                  type="button"
                  class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-bg-base hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/20"
                  aria-label="Tutup"
                  @click="closeDrawer"
                >
                  <XCircle class="h-5 w-5" />
                </button>
              </div>
            </header>

            <main class="min-h-0 grow overflow-y-auto px-8 py-6">
              <div class="grid grid-cols-2 gap-5">
                <AppInput v-model="form.judul" label="Nama Tahap" required placeholder="Contoh: Pendaftaran Online" class="col-span-2" />
                <AppInput v-model="form.tanggalMulai" type="date" label="Tanggal Mulai" required />
                <AppInput v-model="form.tanggalSelesai" type="date" label="Tanggal Selesai" required />
                <AppInput v-model="form.urutan" label="Urutan" inputmode="numeric" placeholder="1" />

                <AppSelect
                  v-model="form.status"
                  label="Status"
                  required
                  :options="timelineStatusOptions"
                />

                <div class="col-span-2 flex items-center justify-between rounded-2xl border border-border bg-bg-surface px-5 py-4">
                  <div>
                    <p class="text-sm font-medium text-text-primary">Tampilkan di publik</p>
                    <p class="mt-0.5 text-xs text-text-secondary">Aktifkan jika tahap ini perlu terlihat di halaman PPDB.</p>
                  </div>
                  <label class="relative inline-flex cursor-pointer items-center">
                    <input v-model="form.tampilPublik" type="checkbox" class="peer sr-only">
                    <span class="h-7 w-13 rounded-full bg-gray-300 transition-colors duration-150 peer-checked:bg-success peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand/20"></span>
                    <span class="absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white transition-transform duration-150 peer-checked:translate-x-6"></span>
                  </label>
                </div>

                <AppTextarea
                  v-model="form.deskripsi"
                  label="Deskripsi"
                  class="col-span-2"
                  :rows="4"
                  :maxlength="220"
                  placeholder="Deskripsi singkat tahap PPDB"
                />
              </div>
            </main>

            <footer class="shrink-0 border-t border-border bg-bg-surface px-8 py-4">
              <div class="flex items-center justify-end gap-3">
                <AppButton variant="ghost" :disabled="isSaving" @click="closeDrawer">Batal</AppButton>
                <AppButton variant="primary" :loading="isSaving" :disabled="isSaving" @click="handleSave">
                  Simpan Tahap
                </AppButton>
              </div>
            </footer>
          </aside>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

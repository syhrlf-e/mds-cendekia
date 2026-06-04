<script setup lang="ts">
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  X,
  AlertTriangle,
  Info
} from 'lucide-vue-next'
import { useAdminTimelineService } from '~/services/useAdminTimelineService'
import type { GelombangTimelineDto, TimelineCreatePayload } from '~/types/adminTimeline'

type GelombangForm = {
  order: number | ''
  mulai: string
  selesai: string
  kuota: number | ''
  status: boolean
  tahun_ajaran: string
  timeline: { tanggal: string; deskripsi: string }[]
}

definePageMeta({
  layout: 'admin',
  middleware: ['admin-auth']
})

useHead({ title: 'Timeline PPDB | MDS Cendekia' })

const {
  listTimelines,
  createTimeline,
  deleteTimeline
} = useAdminTimelineService()
const { addToast } = useToast()

const items = ref<GelombangTimelineDto[]>([])
const loading = ref(false)
const saving = ref(false)
const error = ref('')

const isDrawerOpen = ref(false)
const editingId = ref<number | null>(null) // Placeholder if edit is added

let previousBodyOverflow = ''
let previousHtmlOverflow = ''

const form = ref<GelombangForm>({
  order: '',
  mulai: '',
  selesai: '',
  kuota: '',
  status: true,
  tahun_ajaran: '',
  timeline: []
})

const getApiErrorMessage = (err: any, fallback: string) => {
  return err?.data?.message || err?.response?._data?.message || err?.message || fallback
}

const formatDateDisplay = (dateString: string) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return dateString
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date)
}

const formatDateForInput = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().split('T')[0]
}

const formatIsoString = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString()
}

const fetchTimeline = async () => {
  loading.value = true
  error.value = ''

  const { data, error: fetchError } = await listTimelines()

  loading.value = false

  if (fetchError || !data?.success) {
    error.value = 'Gagal memuat data timeline PPDB.'
    return
  }

  items.value = Array.isArray(data.data) ? data.data : []
}

const setPageScrollLock = (locked: boolean) => {
  if (!import.meta.client) return

  if (locked) {
    previousBodyOverflow = document.body.style.overflow
    previousHtmlOverflow = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    return
  }

  document.body.style.overflow = previousBodyOverflow
  document.documentElement.style.overflow = previousHtmlOverflow
}

const resetForm = () => {
  editingId.value = null
  form.value = {
    order: '',
    mulai: '',
    selesai: '',
    kuota: '',
    status: true,
    tahun_ajaran: '',
    timeline: []
  }
}

const openCreate = () => {
  resetForm()
  form.value.timeline.push({ tanggal: '', deskripsi: '' }) // at least one step
  isDrawerOpen.value = true
}

const closeDrawer = () => {
  isDrawerOpen.value = false
}

const addTimelineStep = () => {
  form.value.timeline.push({ tanggal: '', deskripsi: '' })
}

const removeTimelineStep = (index: number) => {
  form.value.timeline.splice(index, 1)
}

const deleteTimelineStep = async (step: GelombangTimelineDto['timeline'][number], gelombang: GelombangTimelineDto) => {
  if (!import.meta.client) return
  if (!step.id) {
    addToast('Tahap timeline belum memiliki ID dari server.', 'error')
    return
  }

  const confirmed = window.confirm(`Hapus tahap "${step.deskripsi}" dari Gelombang ${gelombang.order}?`)
  if (!confirmed) return

  const { data, error: deleteError } = await deleteTimeline(step.id)

  if (deleteError || data?.success === false) {
    addToast(data?.message || getApiErrorMessage(deleteError, 'Tahap timeline belum berhasil dihapus.'), 'error')
    return
  }

  addToast(data?.message || 'Tahap timeline berhasil dihapus.', 'success')
  await fetchTimeline()
}

const submitForm = async () => {
  // Simple validation
  if (!form.value.tahun_ajaran || !form.value.order || !form.value.kuota || !form.value.mulai || !form.value.selesai) {
    addToast('Mohon lengkapi seluruh field gelombang.', 'warning')
    return
  }
  
  if (form.value.timeline.length === 0) {
    addToast('Minimal harus ada 1 tahap timeline.', 'warning')
    return
  }
  
  const hasEmptyStep = form.value.timeline.some(step => !step.tanggal || !step.deskripsi)
  if (hasEmptyStep) {
    addToast('Lengkapi tanggal dan deskripsi pada seluruh tahap timeline.', 'warning')
    return
  }

  saving.value = true

  const payload: TimelineCreatePayload = {
    order: Number(form.value.order),
    mulai: formatIsoString(form.value.mulai),
    selesai: formatIsoString(form.value.selesai),
    kuota: Number(form.value.kuota),
    status: form.value.status,
    tahun_ajaran: form.value.tahun_ajaran,
    timeline: form.value.timeline.map(step => ({
      id_gelombang: Number(form.value.order),
      tanggal: formatIsoString(step.tanggal),
      deskripsi: step.deskripsi
    }))
  }

  const { data, error: submitError } = await createTimeline(payload)

  saving.value = false

  if (submitError || data?.success === false) {
    addToast(getApiErrorMessage(submitError, 'Gelombang gagal disimpan.'), 'error')
    return
  }

  addToast('Gelombang berhasil ditambahkan.', 'success')
  closeDrawer()
  await fetchTimeline()
}

watch(isDrawerOpen, value => {
  setPageScrollLock(value)
  if (!value) resetForm()
})

onMounted(fetchTimeline)

onBeforeUnmount(() => {
  setPageScrollLock(false)
})
</script>

<template>
  <div class="relative flex h-full min-h-0 flex-col overflow-hidden">
    <div class="flex min-h-0 flex-1 flex-col gap-4">
      <section class="shrink-0 flex items-center justify-between rounded-2xl border border-border bg-bg-surface p-4">
        <div>
          <h1 class="text-xl font-semibold text-text-primary">Manajemen Timeline PPDB</h1>
          <p class="text-sm text-text-secondary mt-1">Kelola gelombang dan tahapan pendaftaran peserta didik baru.</p>
        </div>
        <AppButton variant="primary" @click="openCreate">
          <Plus class="mr-2 h-4 w-4" />
          Tambah Gelombang
        </AppButton>
      </section>

      <section class="min-h-0 flex-1 overflow-auto">
        <!-- Error State -->
        <div v-if="error && !loading" class="mb-4 rounded-xl border border-error/20 bg-status-rejected-bg p-4 flex items-center gap-3">
          <AlertTriangle class="h-5 w-5 text-status-rejected-text shrink-0" />
          <p class="text-sm text-status-rejected-text">{{ error }}</p>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex min-h-[400px] items-center justify-center">
          <AppEmptyState title="Memuat timeline PPDB" description="Sebentar, data sedang diambil dari server.">
            <template #icon>
              <CalendarDays />
            </template>
          </AppEmptyState>
        </div>

        <!-- Empty State -->
        <div v-else-if="!items.length && !error" class="flex min-h-[400px] items-center justify-center">
          <AppEmptyState title="Belum ada timeline" description="Tambahkan gelombang pertama untuk memulai.">
            <template #icon>
              <CalendarDays />
            </template>
            <template #action>
              <AppButton variant="primary" @click="openCreate">Tambah Gelombang</AppButton>
            </template>
          </AppEmptyState>
        </div>

        <!-- List View -->
        <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-10">
          <article
            v-for="gelombang in items"
            :key="gelombang.id"
            class="flex flex-col rounded-2xl border border-border bg-bg-surface overflow-hidden shadow-sm transition-shadow hover:shadow-md"
          >
            <!-- Card Header -->
            <div class="flex items-center justify-between border-b border-border bg-bg-base px-6 py-4">
              <div>
                <h2 class="text-lg font-bold text-text-primary">Gelombang {{ gelombang.order }}</h2>
                <p class="text-sm font-medium text-text-secondary">TA {{ gelombang.tahun_ajaran }}</p>
              </div>
              <div class="flex items-center gap-3">
                <span
                  class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
                  :class="gelombang.status ? 'bg-status-approved-bg text-status-approved-text' : 'bg-status-rejected-bg text-status-rejected-text'"
                >
                  {{ gelombang.status ? 'Aktif' : 'Nonaktif' }}
                </span>
              </div>
            </div>

            <!-- Card Body: Gelombang Info -->
            <div class="px-6 py-4 border-b border-border-soft bg-white">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-xs text-text-muted mb-1">Periode</p>
                  <p class="text-sm font-medium text-text-primary flex items-center gap-1.5">
                    <Clock class="h-3.5 w-3.5 text-text-secondary" />
                    {{ formatDateDisplay(gelombang.mulai) }} - {{ formatDateDisplay(gelombang.selesai) }}
                  </p>
                </div>
                <div>
                  <p class="text-xs text-text-muted mb-1">Kuota</p>
                  <p class="text-sm font-medium text-text-primary">
                    {{ gelombang.kuota }} Siswa
                  </p>
                </div>
              </div>
            </div>

            <!-- Card Body: Timeline -->
            <div class="p-6 bg-white flex-1">
              <h3 class="text-sm font-bold text-text-primary mb-4">Tahapan Timeline:</h3>
              <div class="relative pl-3 border-l-2 border-border-soft space-y-6">
                <div v-if="!gelombang.timeline || !gelombang.timeline.length" class="text-sm text-text-muted italic -ml-3 pl-3">
                  Belum ada tahap.
                </div>
                
                <div v-for="step in gelombang.timeline" :key="step.id" class="group relative pr-10">
                  <div class="absolute -left-[23px] top-0.5 h-4 w-4 rounded-full border-2 border-white bg-brand shadow-sm"></div>
                  <div>
                    <h4 class="text-sm font-semibold text-text-primary leading-none">{{ step.deskripsi }}</h4>
                    <p class="text-xs text-text-secondary mt-1.5">{{ formatDateDisplay(step.tanggal) }}</p>
                  </div>
                  <button
                    type="button"
                    class="absolute right-0 top-[-6px] inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border-soft bg-bg-surface text-text-secondary opacity-0 transition-all hover:bg-status-rejected-bg hover:text-error group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-error/20"
                    title="Hapus tahap timeline"
                    @click="deleteTimelineStep(step, gelombang)"
                  >
                    <Trash2 class="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>

    <!-- Drawer Form -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-[opacity,backdrop-filter] duration-300 ease-out [&>aside]:transition-transform [&>aside]:duration-300 [&>aside]:ease-out"
        enter-from-class="opacity-0 backdrop-blur-none [&>aside]:translate-x-full"
        enter-to-class="opacity-100 backdrop-blur-[4px] [&>aside]:translate-x-0"
        leave-active-class="transition-[opacity,backdrop-filter] duration-300 ease-in [&>aside]:transition-transform [&>aside]:duration-300 [&>aside]:ease-in"
        leave-from-class="opacity-100 backdrop-blur-[4px] [&>aside]:translate-x-0"
        leave-to-class="opacity-0 backdrop-blur-none [&>aside]:translate-x-full"
      >
        <div
          v-if="isDrawerOpen"
          class="fixed left-0 top-0 z-50 flex h-[100dvh] w-full justify-end bg-black/50"
          @click.self="closeDrawer"
        >
          <aside class="flex h-full w-[600px] max-w-full flex-col bg-bg-base shadow-2xl">
            <!-- Drawer Header -->
            <header class="flex h-[70px] shrink-0 items-center justify-between border-b border-border bg-bg-surface px-6">
              <h2 class="text-xl font-bold text-text-primary">
                Tambah Gelombang
              </h2>
              <button
                type="button"
                class="flex h-9 w-9 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-bg-base hover:text-text-primary"
                @click="closeDrawer"
              >
                <X class="h-5 w-5" />
              </button>
            </header>

            <!-- Drawer Body -->
            <main class="min-h-0 flex-1 overflow-y-auto px-6 py-6">
              <form @submit.prevent="submitForm" class="space-y-6">
                <!-- Data Gelombang -->
                <div class="rounded-2xl border border-border bg-bg-surface p-5 space-y-4">
                  <div class="flex items-center gap-2 mb-2">
                    <Info class="h-4 w-4 text-brand" />
                    <h3 class="text-sm font-bold text-text-primary">Informasi Gelombang</h3>
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="mb-1.5 block text-xs font-semibold text-text-primary">Tahun Ajaran <span class="text-error">*</span></label>
                      <input
                        v-model="form.tahun_ajaran"
                        type="text"
                        required
                        placeholder="Contoh: 2026/2027"
                        class="w-full rounded-xl border border-border bg-bg-base px-3 py-2 text-sm text-text-primary outline-none transition-colors hover:bg-bg-surface focus:border-brand focus:ring-2 focus:ring-brand/20"
                      >
                    </div>
                    <div>
                      <label class="mb-1.5 block text-xs font-semibold text-text-primary">Gelombang Ke- <span class="text-error">*</span></label>
                      <input
                        v-model="form.order"
                        type="number"
                        required
                        placeholder="Contoh: 1"
                        class="w-full rounded-xl border border-border bg-bg-base px-3 py-2 text-sm text-text-primary outline-none transition-colors hover:bg-bg-surface focus:border-brand focus:ring-2 focus:ring-brand/20"
                      >
                    </div>
                    <div>
                      <label class="mb-1.5 block text-xs font-semibold text-text-primary">Tanggal Mulai <span class="text-error">*</span></label>
                      <input
                        v-model="form.mulai"
                        type="date"
                        required
                        class="w-full rounded-xl border border-border bg-bg-base px-3 py-2 text-sm text-text-primary outline-none transition-colors hover:bg-bg-surface focus:border-brand focus:ring-2 focus:ring-brand/20"
                      >
                    </div>
                    <div>
                      <label class="mb-1.5 block text-xs font-semibold text-text-primary">Tanggal Selesai <span class="text-error">*</span></label>
                      <input
                        v-model="form.selesai"
                        type="date"
                        required
                        class="w-full rounded-xl border border-border bg-bg-base px-3 py-2 text-sm text-text-primary outline-none transition-colors hover:bg-bg-surface focus:border-brand focus:ring-2 focus:ring-brand/20"
                      >
                    </div>
                    <div>
                      <label class="mb-1.5 block text-xs font-semibold text-text-primary">Kuota <span class="text-error">*</span></label>
                      <input
                        v-model="form.kuota"
                        type="number"
                        required
                        placeholder="Contoh: 100"
                        class="w-full rounded-xl border border-border bg-bg-base px-3 py-2 text-sm text-text-primary outline-none transition-colors hover:bg-bg-surface focus:border-brand focus:ring-2 focus:ring-brand/20"
                      >
                    </div>
                    <div class="flex items-center gap-3 justify-end pb-2 pt-6">
                      <div class="text-right">
                        <p class="text-sm font-semibold text-text-primary">Status Aktif</p>
                      </div>
                      <label class="relative inline-flex cursor-pointer items-center">
                        <input v-model="form.status" type="checkbox" class="peer sr-only">
                        <span class="h-7 w-12 rounded-full bg-border-soft transition-colors duration-200 peer-checked:bg-success peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand/20"></span>
                        <span class="absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition-transform duration-200 peer-checked:translate-x-5"></span>
                      </label>
                    </div>
                  </div>
                </div>

                <!-- Timeline Steps -->
                <div class="rounded-2xl border border-border bg-bg-surface p-5">
                  <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-2">
                      <Clock class="h-4 w-4 text-brand" />
                      <h3 class="text-sm font-bold text-text-primary">Tahapan Timeline</h3>
                    </div>
                    <button
                      type="button"
                      @click="addTimelineStep"
                      class="text-xs font-semibold text-brand hover:text-brand-hover"
                    >
                      + Tambah Tahap
                    </button>
                  </div>

                  <div class="space-y-3">
                    <div
                      v-for="(step, index) in form.timeline"
                      :key="index"
                      class="relative grid grid-cols-[1fr_minmax(0,1.5fr)_auto] gap-3 items-start border-l-2 border-brand/30 pl-4 py-2"
                    >
                      <div class="absolute -left-[5px] top-[14px] h-2 w-2 rounded-full bg-brand"></div>
                      <div>
                        <input
                          v-model="step.tanggal"
                          type="date"
                          required
                          class="w-full rounded-lg border border-border bg-bg-base px-3 py-2 text-xs text-text-primary outline-none transition-colors hover:bg-bg-surface focus:border-brand focus:ring-1 focus:ring-brand"
                        >
                      </div>
                      <div>
                        <input
                          v-model="step.deskripsi"
                          type="text"
                          required
                          placeholder="Deskripsi tahap..."
                          class="w-full rounded-lg border border-border bg-bg-base px-3 py-2 text-xs text-text-primary outline-none transition-colors hover:bg-bg-surface focus:border-brand focus:ring-1 focus:ring-brand"
                        >
                      </div>
                      <button
                        type="button"
                        class="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-lg text-text-muted hover:bg-status-rejected-bg hover:text-error transition-colors"
                        title="Hapus tahap"
                        @click="removeTimelineStep(index)"
                      >
                        <Trash2 class="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div v-if="!form.timeline.length" class="text-sm text-text-muted italic py-4 text-center border border-dashed border-border-soft rounded-lg">
                      Belum ada tahap yang ditambahkan.
                    </div>
                  </div>
                </div>
              </form>
            </main>

            <!-- Drawer Footer -->
            <footer class="shrink-0 border-t border-border bg-bg-surface px-6 py-4">
              <div class="flex items-center justify-end gap-3">
                <AppButton variant="ghost" :disabled="saving" @click="closeDrawer">Batal</AppButton>
                <AppButton variant="primary" :loading="saving" :disabled="saving" @click="submitForm">
                  Simpan Gelombang
                </AppButton>
              </div>
            </footer>
          </aside>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

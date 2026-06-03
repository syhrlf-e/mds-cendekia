<script setup lang="ts">
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Eye,
  ExternalLink,
  FileText,
  MoreHorizontal,
  Search,
  UserRound,
  Users,
  XCircle
} from 'lucide-vue-next'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { defaultBerkas, normalizeActionId } from '~/mappers/adminPendaftarMapper'
import { useAdminPendaftaranService } from '~/services/useAdminPendaftaranService'
import type { Registration, RegistrationFile, RegistrationStatus } from '~/types/adminPendaftaran'

type SortKey = 'nama' | 'tanggal' | ''
type SortOrder = 'asc' | 'desc'
type TabKey = 'diri' | 'ortu' | 'berkas'

definePageMeta({
  layout: 'admin',
  middleware: ['admin-auth']
})

useHead({ title: 'Pendaftaran | MDS Cendekia' })

const {
  updatePendaftarStatus,
  verifyBerkas
} = useAdminPendaftaranService()
const {
  pendaftar: registrations,
  pendaftarLoading: isLoading,
  pendaftarError: loadError,
  loadPendaftar: loadCachedPendaftar,
  refreshPendaftar
} = useAdminDataCache()

const searchQuery = ref('')
const debouncedSearch = ref('')
const filterStatus = ref<RegistrationStatus | ''>('')
const sortKey = ref<SortKey>('tanggal')
const sortOrder = ref<SortOrder>('desc')
const currentPage = ref(1)
const perPage = ref(10)
const activeTab = ref<TabKey>('diri')
const selectedItem = ref<Registration | null>(null)
const isDetailModalOpen = ref(false)
const isApproveModalOpen = ref(false)
const isRejectModalOpen = ref(false)
const isRejectGuardOpen = ref(false)
const isRejectBerkasModalOpen = ref(false)
const isBerkasActionMenuOpen = ref(false)
const berkasDecisionMode = ref<'reject' | 'revision'>('revision')
const isFilePreviewOpen = ref(false)
const previewFile = ref<RegistrationFile | null>(null)
const pdfPagesRef = ref<HTMLElement | null>(null)
const isPdfRendering = ref(false)
const pdfRenderError = ref('')
const pdfPageCount = ref(0)
const viewedFileIds = ref<Set<string>>(new Set())
const rejectReason = ref('')
const rejectBerkasReason = ref('')
const isProcessingApprove = ref(false)
const isProcessingReject = ref(false)
const isProcessingVerifyBerkas = ref(false)

const rejectionReasons = [
  'Anda tidak memenuhi kriteria pendaftaran',
  'Kuota pendaftaran sudah terpenuhi',
  'Tidak lolos seleksi administrasi',
  'Program atau paket yang dipilih tidak tersedia',
  'Keputusan panitia penerimaan peserta didik baru'
]

const berkasRejectionReasons = [
  'Berkas tidak valid',
  'Berkas pendaftaran belum lengkap',
  'Berkas tidak terbaca dengan jelas',
  'Data pada berkas tidak sesuai',
  'Format berkas tidak sesuai ketentuan'
]

const berkasDecisionCopy = computed(() => {
  if (berkasDecisionMode.value === 'reject') {
    return {
      title: 'Alasan Penolakan Berkas',
      description: 'Pilih alasan berkas ditolak. Catatan ini akan dikirim ke sistem sebagai dasar penolakan.',
      emptyMessage: 'Pilih alasan penolakan berkas terlebih dahulu.',
      successStatus: 'Ditolak',
      successToast: 'Berkas pendaftar berhasil ditolak'
    }
  }

  return {
    title: 'Alasan Perbaikan Berkas',
    description: 'Pilih alasan perbaikan berkas yang akan dikirim sebagai catatan ke sistem.',
    emptyMessage: 'Pilih alasan perbaikan berkas terlebih dahulu.',
    successStatus: 'Perlu perbaikan',
    successToast: 'Permintaan perbaikan berkas berhasil dikirim'
  }
})

let debounceTimeout: ReturnType<typeof setTimeout> | null = null

const detailTabs: Array<{ key: TabKey, label: string }> = [
  { key: 'diri', label: 'Data Diri' },
  { key: 'ortu', label: 'Orang Tua' },
  { key: 'berkas', label: 'Berkas' }
]

const statusFilterOptions = [
  { label: 'Semua Status', value: '' },
  { label: 'Menunggu', value: 'pending' },
  { label: 'Diterima', value: 'approved' },
  { label: 'Ditolak', value: 'rejected' }
]

const perPageOptions = [
  { label: '10 / halaman', value: 10 },
  { label: '20 / halaman', value: 20 },
  { label: '50 / halaman', value: 50 }
]

const getAdminActionId = (id: string) => normalizeActionId(id)
const getBerkasActionId = (id: string) => normalizeActionId(id)

const loadPendaftar = (force = false) => force ? refreshPendaftar() : loadCachedPendaftar()

const isBerkasVerified = computed(() => {
  const status = selectedItem.value?.statusBerkas.toLowerCase() || ''
  const isNegative = status.includes('menunggu') || status.includes('belum') || status.includes('tidak') || status.includes('perbaikan')
  return (
    (status.includes('verifikasi') && !status.includes('menunggu')) ||
    status.includes('terverifikasi') ||
    status.includes('sesuai') ||
    status.includes('komplit') ||
    (status.includes('lengkap') && !isNegative) ||
    status.includes('diterima') ||
    status.includes('disetujui') ||
    status.includes('approved') ||
    (status.includes('valid') && !status.includes('tidak valid'))
  )
})

const isBerkasRejected = computed(() => {
  const status = selectedItem.value?.statusBerkas.toLowerCase() || ''
  return status.includes('tolak') || status.includes('ditolak') || status.includes('rejected') || status.includes('tidak valid') || status.includes('perbaikan')
})

const isBerkasFinal = computed(() => isBerkasVerified.value)

const selectedBerkasFiles = computed(() => {
  return selectedItem.value?.berkasFiles?.length ? selectedItem.value.berkasFiles : defaultBerkas
})

const previewFileType = computed(() => {
  const url = previewFile.value?.url.toLowerCase() || ''
  const name = previewFile.value?.name.toLowerCase() || ''
  const source = `${url} ${name}`

  if (/\.(png|jpe?g|webp|gif|bmp)(\?|#|$)/i.test(source)) return 'image'
  return 'pdf'
})

const renderPdfPreview = async () => {
  if (!import.meta.client || !previewFile.value?.url || previewFileType.value !== 'pdf') return

  await nextTick()
  const container = pdfPagesRef.value
  if (!container) return

  isPdfRendering.value = true
  pdfRenderError.value = ''
  pdfPageCount.value = 0
  container.innerHTML = ''

  try {
    const pdfjs = await import('pdfjs-dist')
    pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).toString()

    const loadingTask = pdfjs.getDocument(previewFile.value.url)
    const pdf = await loadingTask.promise
    pdfPageCount.value = pdf.numPages

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber)
      const baseViewport = page.getViewport({ scale: 1 })
      const containerWidth = Math.min(720, Math.max(320, container.clientWidth || 720))
      const scale = containerWidth / baseViewport.width
      const viewport = page.getViewport({ scale })
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')

      if (!context) throw new Error('Canvas context is not available')

      canvas.width = Math.floor(viewport.width)
      canvas.height = Math.floor(viewport.height)
      canvas.style.width = `${Math.floor(viewport.width)}px`
      canvas.style.height = `${Math.floor(viewport.height)}px`
      canvas.className = 'bg-white shadow-[0_10px_30px_rgba(15,23,42,0.16)]'

      container.appendChild(canvas)

      await page.render({
        canvas,
        canvasContext: context,
        viewport
      }).promise
    }
  } catch (error) {
    console.error('Failed to render PDF preview:', error)
    pdfRenderError.value = 'PDF belum bisa ditampilkan di preview internal.'
  } finally {
    isPdfRendering.value = false
  }
}

const getBerkasStatusClass = (status: string) => {
  const normalized = status.toLowerCase()

  if (normalized.includes('tolak') || normalized.includes('ditolak') || normalized.includes('rejected') || normalized.includes('tidak valid')) {
    return 'bg-status-rejected-bg text-status-rejected-text'
  }

  if (normalized.includes('perbaikan') || normalized.includes('revisi')) {
    return 'bg-status-pending-bg text-status-pending-text'
  }

  if ((normalized.includes('verifikasi') && !normalized.includes('menunggu')) || normalized.includes('terverifikasi') || normalized.includes('sesuai') || normalized.includes('komplit') || (normalized.includes('lengkap') && !normalized.includes('belum'))) {
    return 'bg-status-approved-bg text-status-approved-text'
  }

  if (
    normalized.includes('diterima') ||
    normalized.includes('disetujui') ||
    normalized.includes('approved') ||
    (normalized.includes('valid') && !normalized.includes('tidak valid'))
  ) {
    return 'bg-status-approved-bg text-status-approved-text'
  }

  return 'bg-status-pending-bg text-status-pending-text'
}

const getOutlineStatusClass = (status: string) => {
  const normalized = status.toLowerCase()

  if (normalized.includes('tolak') || normalized.includes('ditolak') || normalized.includes('rejected') || normalized.includes('tidak valid')) {
    return 'border-status-rejected-text/25 bg-status-rejected-bg/60 text-status-rejected-text'
  }

  if (
    normalized.includes('diterima') ||
    normalized.includes('disetujui') ||
    normalized.includes('approved') ||
    normalized.includes('terverifikasi') ||
    normalized.includes('sesuai') ||
    normalized.includes('komplit') ||
    (normalized.includes('lengkap') && !normalized.includes('belum')) ||
    (normalized.includes('valid') && !normalized.includes('tidak valid'))
  ) {
    return 'border-status-approved-text/25 bg-status-approved-bg/60 text-status-approved-text'
  }

  return 'border-status-pending-text/25 bg-status-pending-bg/70 text-status-pending-text'
}

const fieldSections = computed(() => {
  if (!selectedItem.value) return []

  return [
    {
      title: 'Identitas Calon Siswa',
      fields: [
        ['Nama Lengkap', selectedItem.value.nama],
        ['NISN', selectedItem.value.nisn],
        ['NIK', selectedItem.value.nik],
        ['Tempat Lahir', selectedItem.value.tempatLahir],
        ['Tanggal Lahir', formatLongDate(selectedItem.value.tanggalLahir)],
        ['Jenis Kelamin', selectedItem.value.jenisKelamin],
        ['Agama', selectedItem.value.agama],
        ['Asal Sekolah', selectedItem.value.sekolah],
        ['Program', selectedItem.value.program],
        ['Gelombang', selectedItem.value.gelombang ? String(selectedItem.value.gelombang) : '-'],
        ['Email', selectedItem.value.email],
        ['No. HP', selectedItem.value.hp]
      ]
    },
    {
      title: 'Alamat',
      fields: [
        ['Alamat', selectedItem.value.alamat, 'full'],
        ['RT / RW', selectedItem.value.rtRw],
        ['Kode Pos', selectedItem.value.kodePos],
        ['Provinsi', selectedItem.value.provinsi],
        ['Kota/Kab', selectedItem.value.kota],
        ['Kecamatan', selectedItem.value.kecamatan],
        ['Kelurahan', selectedItem.value.kelurahan]
      ]
    }
  ]
})

const parentSections = computed(() => {
  if (!selectedItem.value) return []

  return selectedItem.value.orangTua.map(parent => ({
    title: parent.title,
    fields: [
      ['Nama Lengkap', parent.nama],
      ['NIK', parent.nik],
      ['Agama', parent.agama],
      ['Hubungan', parent.hubungan],
      ['Peran', parent.peran],
      ['No. HP', parent.hp],
      ['Email', parent.email],
      ['Pendidikan Terakhir', parent.pendidikan],
      ['Pekerjaan', parent.pekerjaan],
      ['Penghasilan Per Bulan', parent.penghasilan]
    ]
  }))
})

const filteredAndSortedData = computed(() => {
  const query = debouncedSearch.value.toLowerCase().trim()
  const result = registrations.value.filter(item => {
    const matchesSearch = !query ||
      item.nama.toLowerCase().includes(query) ||
      item.id.toLowerCase().includes(query) ||
      item.nisn.toLowerCase().includes(query)
    const matchesStatus = !filterStatus.value || item.status === filterStatus.value
    return matchesSearch && matchesStatus
  })

  if (!sortKey.value) return result

  return [...result].sort((a, b) => {
    const valueA = a[sortKey.value as 'nama' | 'tanggal']
    const valueB = b[sortKey.value as 'nama' | 'tanggal']

    if (valueA < valueB) return sortOrder.value === 'asc' ? -1 : 1
    if (valueA > valueB) return sortOrder.value === 'asc' ? 1 : -1
    return 0
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredAndSortedData.value.length / perPage.value)))

const paginationStart = computed(() => {
  if (!filteredAndSortedData.value.length) return 0
  return (currentPage.value - 1) * perPage.value + 1
})

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filteredAndSortedData.value.slice(start, start + perPage.value)
})

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

const formatLongDate = (dateString: string) => {
  if (!dateString) return '-'

  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return '-'

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const handleSearch = () => {
  if (debounceTimeout) clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(() => {
    debouncedSearch.value = searchQuery.value
    currentPage.value = 1
  }, 300)
}

const handleSort = (key: 'nama' | 'tanggal') => {
  if (key === 'tanggal') {
    sortKey.value = 'tanggal'
    sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
    return
  }

  if (sortKey.value !== 'nama') {
    sortKey.value = 'nama'
    sortOrder.value = 'asc'
    return
  }

  if (sortOrder.value === 'asc') {
    sortOrder.value = 'desc'
    return
  }

  sortKey.value = ''
  sortOrder.value = 'asc'
}

const getSortIcon = (key: 'nama' | 'tanggal') => {
  if (sortKey.value !== key) return ChevronsUpDown
  return sortOrder.value === 'asc' ? ChevronUp : ChevronDown
}

const openDetail = (item: Registration) => {
  selectedItem.value = item
  activeTab.value = 'diri'
  isDetailModalOpen.value = true
}

const closeFilePreview = () => {
  isFilePreviewOpen.value = false
  previewFile.value = null
  pdfRenderError.value = ''
  pdfPageCount.value = 0
  if (pdfPagesRef.value) pdfPagesRef.value.innerHTML = ''
}

const focusBerkasTab = () => {
  activeTab.value = 'berkas'
}

const openBerkasDecisionModal = (mode: 'reject' | 'revision') => {
  berkasDecisionMode.value = mode
  rejectBerkasReason.value = ''
  isBerkasActionMenuOpen.value = false
  isRejectBerkasModalOpen.value = true
}

const closeDetail = () => {
  if (isFilePreviewOpen.value) {
    closeFilePreview()
    window.setTimeout(() => {
      isDetailModalOpen.value = false
    }, 260)
    return
  }

  isDetailModalOpen.value = false
}

const openFile = (file: RegistrationFile) => {
  if (!import.meta.client) return
  const url = file.url

  if (!url || url === '#') {
    useToast().addToast('File berkas belum tersedia dari server.', 'error')
    return
  }

  viewedFileIds.value = new Set([...viewedFileIds.value, file.id])
  previewFile.value = file
  isFilePreviewOpen.value = true

  if (previewFileType.value === 'pdf') {
    renderPdfPreview()
  }
}

const openPreviewInNewTab = () => {
  if (!import.meta.client || !previewFile.value?.url) return
  window.open(previewFile.value.url, '_blank', 'noopener,noreferrer')
}

const promptReject = () => {
  rejectReason.value = ''
  isRejectModalOpen.value = true
}

const attemptCancelReject = (nextValue?: boolean) => {
  if (nextValue !== false) return
  if (rejectReason.value.trim()) {
    isRejectGuardOpen.value = true
    return
  }

  isRejectModalOpen.value = false
}

const confirmCancelReject = () => {
  rejectReason.value = ''
  isRejectGuardOpen.value = false
  isRejectModalOpen.value = false
}

const handleApprove = async () => {
  if (!selectedItem.value) return

  isProcessingApprove.value = true
  const actionId = getAdminActionId(selectedItem.value.id)

  const { data, error } = await updatePendaftarStatus({
    id: actionId,
    accept: true,
    notes: ''
  })

  isProcessingApprove.value = false

  const message = data?.message || ''
  const isInternalErrorMessage = message.toLowerCase().includes('internal server error')

  if (error || isInternalErrorMessage || data?.success === false || data?.status === false) {
    const errorMessage = error?.data?.message || error?.response?._data?.message || message || 'Status pendaftar belum berhasil diubah.'
    useToast().addToast(errorMessage, 'error')
    return
  }

  selectedItem.value.status = 'approved'
  selectedItem.value.statusText = 'Diterima'
  isApproveModalOpen.value = false
  closeFilePreview()
  isDetailModalOpen.value = false
  await loadPendaftar(true)
  useToast().addToast(message || 'Pendaftar berhasil diterima', 'success')
}

const handleReject = async () => {
  if (!selectedItem.value) return
  const selectedReason = rejectReason.value.trim()

  if (!selectedReason) {
    useToast().addToast('Pilih alasan penolakan terlebih dahulu.', 'error')
    return
  }

  isProcessingReject.value = true
  const actionId = getAdminActionId(selectedItem.value.id)

  const { data, error } = await updatePendaftarStatus({
    id: actionId,
    accept: false,
    notes: selectedReason
  })

  isProcessingReject.value = false

  const message = data?.message || ''
  const isInternalErrorMessage = message.toLowerCase().includes('internal server error')

  if (error || isInternalErrorMessage || data?.success === false || data?.status === false) {
    const errorMessage = error?.data?.message || error?.response?._data?.message || message || 'Status pendaftar belum berhasil diubah.'
    useToast().addToast(errorMessage, 'error')
    return
  }

  selectedItem.value.status = 'rejected'
  selectedItem.value.statusText = 'Ditolak'
  isRejectModalOpen.value = false
  closeFilePreview()
  isDetailModalOpen.value = false
  await loadPendaftar(true)
  useToast().addToast(message || 'Pendaftar berhasil ditolak', 'success')
}

const handleVerifyBerkas = async (decision: 'reject' | 'revision' | 'valid') => {
  if (!selectedItem.value) return
  const acceptValue = decision === 'valid' ? 1 : decision === 'revision' ? 2 : 0
  const selectedReason = rejectBerkasReason.value.trim()

  if (acceptValue !== 1 && !selectedReason) {
    useToast().addToast(berkasDecisionCopy.value.emptyMessage, 'error')
    return
  }

  isProcessingVerifyBerkas.value = true
  const actionId = getBerkasActionId(selectedItem.value.id)

  const { data, error } = await verifyBerkas({
    id: actionId,
    accept: acceptValue,
    notes: acceptValue === 1 ? 'Berkas lengkap dan sesuai' : selectedReason
  })

  isProcessingVerifyBerkas.value = false

  const message = data?.message || ''
  const isInternalErrorMessage = message.toLowerCase().includes('internal server error')

  if (error || isInternalErrorMessage || data?.success === false || data?.status === false) {
    const errorMessage = error?.data?.message || error?.response?._data?.message || message || 'Berkas pendaftar belum berhasil diverifikasi.'
    useToast().addToast(errorMessage, 'error')
    return
  }

  selectedItem.value.statusBerkas = acceptValue === 1 ? 'Berkas sesuai' : berkasDecisionCopy.value.successStatus
  isRejectBerkasModalOpen.value = false
  rejectBerkasReason.value = ''
  await loadPendaftar(true)
  useToast().addToast(message || (acceptValue === 1 ? 'Berkas pendaftar lengkap dan sesuai' : berkasDecisionCopy.value.successToast), 'success')
}

onMounted(loadPendaftar)

watch([filterStatus, perPage], () => {
  currentPage.value = 1
})

watch(totalPages, value => {
  if (currentPage.value > value) currentPage.value = value
})
</script>

<template>
  <div class="flex h-full min-h-0 flex-col">
    <div class="flex min-h-0 flex-1 flex-col gap-2">
      <section class="shrink-0 rounded-2xl border border-border bg-bg-surface p-4">
        <div class="grid grid-cols-[minmax(360px,1fr)_220px_140px] gap-4">
          <div class="relative">
            <Search class="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-text-muted" />
            <input
              v-model="searchQuery"
              type="search"
              placeholder="Cari nama, kode pendaftaran, atau NISN..."
              class="h-11 w-full rounded-xl border border-border-soft bg-bg-base py-2.5 pl-10 pr-4 text-sm leading-none text-text-primary outline-none transition-colors placeholder:text-text-muted hover:bg-bg-surface focus:border-brand focus:bg-bg-surface focus:ring-[3px] focus:ring-brand/12"
              @input="handleSearch"
            >
          </div>

          <div class="relative">
            <AppSelect
              v-model="filterStatus"
              :options="statusFilterOptions"
              placeholder="Semua Status"
            />
          </div>

          <div class="relative">
            <AppSelect
              v-model="perPage"
              :options="perPageOptions"
            />
          </div>
        </div>
      </section>

      <section class="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-bg-surface">
        <div class="min-h-0 flex-1 overflow-auto">
        <table class="w-full border-collapse text-left">
          <thead class="sticky top-0 z-10 bg-bg-base">
            <tr class="h-12 text-xs font-semibold uppercase tracking-wider text-text-secondary">
              <th class="w-14 px-4">No</th>
              <th class="w-52 px-4">Kode Pendaftaran</th>
              <th class="min-w-52 px-4">
                <button class="flex items-center gap-2 uppercase" @click="handleSort('nama')">
                  Nama
                  <component :is="getSortIcon('nama')" class="h-3.5 w-3.5" :class="sortKey === 'nama' ? 'text-brand' : 'text-text-muted'" />
                </button>
              </th>
              <th class="w-[136px] px-4">NISN</th>
              <th class="min-w-48 px-4">Asal Sekolah</th>
              <th class="w-48 px-4">
                <button class="flex items-center gap-2 uppercase" @click="handleSort('tanggal')">
                  Tanggal Daftar
                  <component :is="getSortIcon('tanggal')" class="h-3.5 w-3.5" :class="sortKey === 'tanggal' ? 'text-brand' : 'text-text-muted'" />
                </button>
              </th>
              <th class="w-40 px-4">Status</th>
              <th class="w-40 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border-soft">
            <tr v-if="isLoading">
              <td colspan="8">
                <div class="flex min-h-105 items-center justify-center">
                  <AppEmptyState
                    title="Memuat data pendaftar"
                    description="Sebentar, data sedang diambil dari server."
                  >
                    <template #icon>
                      <Users />
                    </template>
                  </AppEmptyState>
                </div>
              </td>
            </tr>
            <tr v-else-if="loadError">
              <td colspan="8">
                <div class="flex min-h-105 items-center justify-center">
                  <AppEmptyState
                    title="Data pendaftar belum bisa dimuat"
                    :description="loadError"
                  >
                    <template #icon>
                      <XCircle />
                    </template>
                    <template #action>
                      <AppButton variant="primary" @click="loadPendaftar">
                        Coba Lagi
                      </AppButton>
                    </template>
                  </AppEmptyState>
                </div>
              </td>
            </tr>
            <tr
              v-for="(item, index) in isLoading || loadError ? [] : paginatedData"
              :key="item.id"
              class="h-15 text-sm text-text-primary transition-colors hover:bg-bg-base"
            >
              <td class="px-4 text-text-secondary">{{ paginationStart + index }}</td>
              <td class="px-4 font-medium text-text-primary">{{ item.id }}</td>
              <td class="px-4">
                <p class="text-text-primary">{{ item.nama }}</p>
              </td>
              <td class="px-4 text-text-primary">{{ item.nisn }}</td>
              <td class="px-4 text-text-secondary">{{ item.sekolah }}</td>
              <td class="px-4 text-text-secondary">{{ formatDate(item.tanggal) }}</td>
              <td class="px-4"><AppBadge :status="item.status" :text="item.statusText" /></td>
              <td class="px-4 text-center">
                <button
                  type="button"
                  class="inline-flex h-9 items-center gap-2 rounded-xl border border-border-soft bg-bg-base px-3 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-surface hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/20"
                  @click="openDetail(item)"
                >
                  <Eye class="h-4 w-4" />
                  Detail
                </button>
              </td>
            </tr>
            <tr v-if="!isLoading && !loadError && filteredAndSortedData.length === 0">
              <td colspan="8">
                <div class="flex min-h-[420px] items-center justify-center">
                  <AppEmptyState
                    title="Belum ada data pendaftar"
                    description="Data pendaftar akan muncul di sini"
                  >
                    <template #icon>
                      <Users />
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
        :last-page="totalPages"
        :total="filteredAndSortedData.length"
        :disabled="isLoading || !!loadError || filteredAndSortedData.length === 0"
        @page-change="currentPage = $event"
      />
  </div>
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
        v-if="selectedItem && isDetailModalOpen"
        class="fixed inset-0 z-50 bg-text-primary/20 backdrop-blur-[14px]"
        style="--detail-drawer-width: min(1080px, calc(100% - 320px));"
        @click.self="closeDetail"
      >
        <aside class="relative z-[40] ml-auto flex h-full w-[var(--detail-drawer-width)] flex-col overflow-hidden border-l-2 border-border bg-bg-base shadow-[rgba(0,0,0,0.08)_-12px_0_32px_0]">

          <!-- ═══════════════════════════════════════════════════
               ZONE 1 · STICKY IDENTITY HEADER
               ═══════════════════════════════════════════════════ -->
          <div class="sticky top-0 z-20 shrink-0 bg-bg-surface shadow-sm">

            <!-- Row 1: Close + Photo + Identity + Status -->
            <div class="flex items-start justify-between gap-5 border-b border-border px-8 py-5">
              <div class="flex min-w-0 items-start gap-5">
                <!-- Close button -->
                <button
                  type="button"
                  class="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-bg-base hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/20"
                  aria-label="Tutup detail"
                  @click="closeDetail"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>

                <!-- Photo 3x4 -->
                <div class="h-[112px] w-[84px] shrink-0 overflow-hidden rounded-2xl border border-border bg-bg-parchment shadow-sm">
                  <img
                    v-if="selectedItem.fotoUrl"
                    :src="selectedItem.fotoUrl"
                    :alt="`Foto ${selectedItem.nama}`"
                    class="h-full w-full object-cover"
                  >
                  <div
                    v-else
                    class="flex h-full w-full flex-col items-center justify-center gap-1 px-2 text-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-text-muted/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>
                    <p class="text-[10px] font-medium leading-[1.3] text-text-muted">Foto belum tersedia</p>
                  </div>
                </div>

                <div class="min-w-0">
                  <h2 class="truncate font-heading text-[22px] font-bold leading-[1.18] tracking-[-0.3px] text-text-primary">
                    {{ selectedItem.nama }}
                  </h2>
                  <p class="mt-1 truncate text-sm font-medium leading-[1.43] text-text-secondary">
                    {{ selectedItem.id }}
                    <span class="mx-1.5 opacity-40">·</span>
                    {{ selectedItem.sekolah }}
                  </p>
                  <span v-if="selectedItem.gelombang" class="mt-3 inline-flex rounded-full border border-border-soft px-3 py-1 text-xs font-medium text-text-secondary">
                    Gelombang {{ selectedItem.gelombang }}
                  </span>
                </div>
              </div>

              <div class="flex shrink-0 flex-col items-end gap-2 pt-1">
                <div class="flex items-center gap-2 whitespace-nowrap">
                  <span class="text-xs font-medium leading-none text-text-secondary">Status Pendaftaran :</span>
                  <span
                    class="inline-flex rounded-full border px-2.5 py-1 text-xs font-medium leading-none"
                    :class="getOutlineStatusClass(selectedItem.statusText)"
                  >
                    {{ selectedItem.statusText }}
                  </span>
                </div>
                <div class="flex items-center gap-2 whitespace-nowrap">
                  <span class="text-xs font-medium leading-none text-text-secondary">Status Berkas :</span>
                  <span
                    class="inline-flex rounded-full border px-2.5 py-1 text-xs font-medium leading-none"
                    :class="getOutlineStatusClass(selectedItem.statusBerkas)"
                  >
                    {{ selectedItem.statusBerkas }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Row 2: Tab bar (full-width, underline style) -->
            <div class="flex items-center bg-bg-base px-8">
              <button
                v-for="tab in detailTabs"
                :key="tab.key"
                type="button"
                class="relative h-11 px-5 text-sm font-normal leading-none transition-colors focus:outline-none"
                :class="activeTab === tab.key
                  ? 'text-brand after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:rounded-t-full after:bg-brand after:content-[\'\']'
                  : 'text-text-secondary hover:text-text-primary'"
                @click="activeTab = tab.key"
              >
                {{ tab.label }}
              </button>
            </div>
          </div>

          <!-- ═══════════════════════════════════════════════════
               ZONE 2 · SCROLLABLE CONTENT AREA
               ═══════════════════════════════════════════════════ -->
          <main class="min-h-0 grow overflow-y-auto">
            <div class="mx-auto w-full max-w-5xl px-8 py-6">

              <!-- ── Tab: Data Diri ── -->
              <div v-if="activeTab === 'diri'" class="grid grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] items-start gap-4">
                <section
                  v-for="section in fieldSections"
                  :key="section.title"
                  class="overflow-hidden rounded-2xl border border-border bg-bg-surface"
                  :class="section.title === 'Identitas Calon Siswa' ? 'row-span-2' : ''"
                >
                  <div class="border-b border-border bg-bg-base px-6 py-3">
                    <h3 class="text-[11px] font-bold uppercase tracking-widest text-text-muted">
                      {{ section.title }}
                    </h3>
                  </div>
                  <div class="grid grid-cols-2 gap-x-8 gap-y-5 p-6">
                    <div
                      v-for="field in section.fields"
                      :key="field[0]"
                      :class="field[2] === 'full' ? 'col-span-2' : ''"
                    >
                      <p class="mb-1 text-[11px] font-semibold uppercase tracking-wider text-text-muted">{{ field[0] }}</p>
                      <p class="text-[15px] font-medium leading-[1.47] tracking-[-0.15px] text-text-primary">{{ field[1] || '—' }}</p>
                    </div>
                  </div>
                </section>
              </div>

              <!-- ── Tab: Orang Tua ── -->
              <div v-else-if="activeTab === 'ortu' && parentSections.length" class="grid grid-cols-2 items-start gap-4">
                <section
                  v-for="section in parentSections"
                  :key="section.title"
                  class="overflow-hidden rounded-2xl border border-border bg-bg-surface"
                >
                  <div class="border-b border-border bg-bg-base px-6 py-3">
                    <h3 class="text-[11px] font-bold uppercase tracking-widest text-text-muted">
                      {{ section.title }}
                    </h3>
                  </div>
                  <div class="grid grid-cols-2 gap-x-8 gap-y-5 p-6">
                    <div
                      v-for="field in section.fields"
                      :key="field[0]"
                    >
                      <p class="mb-1 text-[11px] font-semibold uppercase tracking-wider text-text-muted">{{ field[0] }}</p>
                      <p class="text-[15px] font-medium leading-[1.47] tracking-[-0.15px] text-text-primary">{{ field[1] || '—' }}</p>
                    </div>
                  </div>
                </section>
              </div>

              <!-- Empty state orang tua -->
              <div v-else-if="activeTab === 'ortu'" class="flex min-h-[360px] items-center justify-center rounded-2xl border border-dashed border-border bg-bg-surface">
                <AppEmptyState
                  title="Data orang tua belum tersedia"
                  description="Data orang tua belum dikirim oleh endpoint admin."
                >
                  <template #icon>
                    <UserRound />
                  </template>
                </AppEmptyState>
              </div>

              <!-- ── Tab: Berkas ── -->
              <div v-else class="space-y-4">
                <div class="overflow-hidden rounded-2xl border border-border bg-bg-surface">
                  <!-- Card header -->
                  <div class="flex items-center justify-between gap-4 border-b border-border bg-bg-base px-6 py-3">
                    <h3 class="text-[11px] font-bold uppercase tracking-widest text-text-muted">
                      Status saat ini
                    </h3>
                    <span
                      class="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium"
                      :class="getBerkasStatusClass(selectedItem.statusBerkas)"
                    >
                      {{ selectedItem.statusBerkas }}
                    </span>
                  </div>

                  <!-- Validation action row -->
                  <div class="flex items-center justify-between gap-6 border-b border-border-soft px-6 py-4">
                    <div>
                      <p class="text-sm font-medium text-text-primary">Validasi paket berkas</p>
                    </div>
                    <div class="flex shrink-0 flex-wrap items-center justify-end gap-2">
                      <AppButton
                        variant="secondary"
                        :disabled="isBerkasVerified || isProcessingVerifyBerkas"
                        class="!min-h-8 !px-3 !py-1.5 !text-xs"
                        @click="openBerkasDecisionModal('revision')"
                      >
                        Ajukan Perbaikan
                      </AppButton>
                      <AppButton
                        variant="success"
                        :loading="isProcessingVerifyBerkas"
                        :disabled="isBerkasVerified || isProcessingVerifyBerkas"
                        class="!min-h-8 !px-3 !py-1.5 !text-xs"
                        @click="handleVerifyBerkas('valid')"
                      >
                        Berkas Sesuai
                      </AppButton>
                      <div class="relative">
                        <button
                          type="button"
                          class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border-soft bg-bg-surface text-text-secondary transition-colors hover:bg-bg-base hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:pointer-events-none disabled:opacity-40"
                          :disabled="isBerkasVerified || isProcessingVerifyBerkas"
                          aria-label="Aksi berkas lainnya"
                          @click="isBerkasActionMenuOpen = !isBerkasActionMenuOpen"
                        >
                          <MoreHorizontal class="h-4 w-4" />
                        </button>

                        <div
                          v-if="isBerkasActionMenuOpen"
                          class="absolute right-0 top-10 z-20 w-44 overflow-hidden rounded-xl border border-border bg-bg-surface p-1 shadow-lg"
                        >
                          <button
                            type="button"
                            class="flex w-full items-center rounded-lg px-3 py-2 text-left text-xs font-medium text-error transition-colors hover:bg-status-rejected-bg"
                            @click="openBerkasDecisionModal('reject')"
                          >
                            Tolak berkas
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- File list -->
                  <div class="divide-y divide-border-soft">
                    <div
                      v-for="file in selectedBerkasFiles"
                      :key="file.id"
                      class="group flex items-center gap-4 px-6 py-3.5 transition-colors hover:bg-bg-base"
                    >
                      <div
                        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                        :class="file.url ? 'bg-primary-50' : 'bg-bg-base'"
                      >
                        <FileText class="h-5 w-5" :class="file.url ? 'text-brand' : 'text-text-muted'" />
                      </div>

                      <div class="min-w-0 grow">
                        <p class="truncate text-sm font-medium leading-[1.43] tracking-[-0.1px] text-text-primary">
                          {{ file.name }}
                        </p>
                        <p class="text-xs leading-[1.5] text-text-secondary">
                          {{ file.url ? 'Dokumen tersedia' : 'Belum diunggah' }}
                        </p>
                      </div>

                      <div class="w-2 shrink-0">
                        <span
                          v-if="viewedFileIds.has(file.id)"
                          class="inline-flex h-2 w-2 rounded-full bg-success"
                          title="Sudah dilihat"
                        />
                      </div>

                      <AppButton
                        variant="ghost"
                        :disabled="!file.url"
                        @click="openFile(file)"
                      >
                        {{ file.url ? 'Lihat' : 'Belum Ada' }}
                      </AppButton>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </main>

          <!-- ═══════════════════════════════════════════════════
               ZONE 3 · FOOTER ACTION BAR — COLOR-CODED PER STATE
               ═══════════════════════════════════════════════════ -->
          <footer
            class="shrink-0 border-t-2 px-8 py-4 transition-colors"
            :class="{
              'border-border bg-bg-surface': selectedItem.status === 'pending' && !isBerkasFinal && !isBerkasRejected,
              'border-error/25 bg-status-rejected-bg': selectedItem.status === 'pending' && isBerkasRejected,
              'border-success/30 bg-status-approved-bg': selectedItem.status === 'pending' && isBerkasVerified,
              'border-border bg-bg-base': selectedItem.status !== 'pending'
            }"
          >
            <div class="mx-auto flex max-w-4xl items-center justify-between gap-6">

              <!-- Left: contextual hint -->
              <div>
                <template v-if="selectedItem.status !== 'pending'">
                  <p class="text-sm font-semibold text-text-primary">
                    Pendaftaran sudah {{ selectedItem.status === 'approved' ? 'diterima ✓' : 'ditolak ✕' }}
                  </p>
                  <p class="mt-0.5 text-xs leading-[1.5] text-text-secondary">
                    Tindakan lanjutan tidak tersedia untuk pendaftaran yang sudah diputuskan.
                  </p>
                </template>

                <template v-else-if="isBerkasVerified">
                  <p class="text-sm font-semibold text-status-approved-text">
                    Berkas sudah lengkap dan sesuai — ambil keputusan final
                  </p>
                  <p class="mt-0.5 text-xs leading-[1.5] text-status-approved-text/70">
                    Terima atau tolak pendaftar ini sekarang.
                  </p>
                </template>

                <template v-else-if="isBerkasRejected">
                  <p class="text-sm font-semibold text-status-rejected-text">
                    Berkas perlu ditindaklanjuti
                  </p>
                  <p class="mt-0.5 text-xs leading-[1.5] text-status-rejected-text/70">
                    Catatan berkas sudah dikirim. Keputusan final belum bisa diambil sebelum berkas lengkap dan sesuai.
                  </p>
                </template>

                <template v-else>
                  <p class="text-sm font-semibold text-text-primary">
                    Menunggu verifikasi berkas
                  </p>
                  <p class="mt-0.5 text-xs leading-[1.5] text-text-secondary">
                    Tandai berkas sebagai sesuai atau ajukan tindak lanjut di tab Berkas sebelum keputusan final.
                  </p>
                </template>
              </div>

              <!-- Right: action buttons -->
              <div class="flex shrink-0 items-center gap-3">
                <template v-if="selectedItem.status === 'pending' && isBerkasVerified">
                  <AppButton variant="ghost" @click="closeDetail">Tutup</AppButton>
                  <AppButton variant="danger" @click="promptReject">Tolak Pendaftar</AppButton>
                  <AppButton variant="success" @click="isApproveModalOpen = true">Terima Pendaftar</AppButton>
                </template>
                <template v-else-if="selectedItem.status === 'pending' && isBerkasRejected">
                  <AppButton variant="ghost" @click="closeDetail">Tutup</AppButton>
                  <AppButton variant="secondary" @click="focusBerkasTab">Review Berkas</AppButton>
                </template>
                <template v-else>
                  <AppButton variant="ghost" @click="closeDetail">Tutup</AppButton>
                </template>
              </div>

            </div>
          </footer>

        </aside>

        <Transition
          enter-active-class="transition-transform duration-300 ease-out"
          enter-from-class="translate-x-full"
          enter-to-class="translate-x-0"
          leave-active-class="transition-transform duration-250 ease-in"
          leave-from-class="translate-x-0"
          leave-to-class="translate-x-full"
        >
          <aside
            v-if="isFilePreviewOpen && previewFile"
            class="absolute inset-y-0 right-[var(--detail-drawer-width)] z-[30] flex w-[min(760px,calc(100%-var(--detail-drawer-width)))] flex-col border-r border-border bg-bg-surface shadow-[rgba(0,0,0,0.18)_-16px_0_40px_0]"
          >
            <header class="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border bg-bg-surface px-5">
              <div class="min-w-0">
                <p class="truncate text-sm font-semibold text-text-primary">{{ previewFile.name }}</p>
                <p class="text-xs text-text-secondary">
                  {{ previewFileType === 'pdf' && pdfPageCount ? `${pdfPageCount} halaman` : 'Preview dokumen pendaftaran' }}
                </p>
              </div>
              <div class="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  class="inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-bg-base hover:text-text-primary"
                  aria-label="Buka di tab baru"
                  @click="openPreviewInNewTab"
                >
                  <ExternalLink class="h-4 w-4" />
                </button>
                <button
                  type="button"
                  class="inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-bg-base hover:text-text-primary"
                  aria-label="Tutup preview"
                  @click="closeFilePreview"
                >
                  <XCircle class="h-4 w-4" />
                </button>
              </div>
            </header>

            <div class="min-h-0 flex-1 overflow-auto bg-bg-parchment p-5">
              <div class="flex min-h-full items-start justify-center">
                <img
                  v-if="previewFileType === 'image'"
                  :src="previewFile.url"
                  :alt="previewFile.name"
                  class="max-h-full max-w-full object-contain"
                >
                <div v-else-if="previewFileType === 'pdf'" class="flex min-h-full w-full items-start justify-center">
                  <div v-if="isPdfRendering" class="mt-24 flex flex-col items-center gap-3 text-text-secondary">
                    <div class="dot-wave">
                      <span class="bg-brand"></span>
                      <span class="bg-brand"></span>
                      <span class="bg-brand"></span>
                    </div>
                    <p class="text-sm font-medium">Memuat preview PDF...</p>
                  </div>
                  <div v-else-if="pdfRenderError" class="mt-24 flex max-w-md flex-col items-center px-6 text-center">
                    <FileText class="mb-4 h-10 w-10 text-brand" />
                    <p class="text-sm font-medium text-text-primary">{{ pdfRenderError }}</p>
                    <p class="mt-1 text-sm leading-[1.43] text-text-secondary">
                      Gunakan tombol buka di tab baru jika dokumen berasal dari server yang membatasi preview.
                    </p>
                  </div>
                  <div
                    v-show="!isPdfRendering && !pdfRenderError"
                    ref="pdfPagesRef"
                    class="flex w-full flex-col items-center gap-5"
                  />
                </div>
              </div>
            </div>
          </aside>
        </Transition>
      </div>
    </Transition>
  </Teleport>

  <AppModal v-model="isApproveModalOpen" title="Terima Pendaftar Ini?" width="max-w-[400px]" :z-index="60">

    <p class="text-sm leading-[1.43] tracking-[-0.15px] text-text-primary">
      Status pendaftar akan diubah menjadi diterima. Sistem juga akan mengirimkan email notifikasi kepada pendaftar.
    </p>

    <template #footer>
      <AppButton variant="ghost" :disabled="isProcessingApprove" @click="isApproveModalOpen = false">Batal</AppButton>
      <AppButton variant="success" :loading="isProcessingApprove" @click="handleApprove">Ya, Terima</AppButton>
    </template>
  </AppModal>

  <AppModal
    :model-value="isRejectModalOpen"
    title="Alasan Penolakan Pendaftar"
    width="max-w-[480px]"
    :z-index="60"
    @update:model-value="attemptCancelReject"
  >
    <div class="space-y-4">
      <p class="text-sm leading-[1.43] tracking-[-0.15px] text-text-secondary">
        Pilih alasan keputusan akhir yang akan dikirim sebagai catatan ke sistem.
      </p>

      <div class="flex flex-wrap gap-2">
        <button
          v-for="reason in rejectionReasons"
          :key="reason"
          type="button"
          :disabled="isProcessingReject"
          class="rounded-full border px-4 py-2 text-sm font-medium leading-none transition-colors disabled:pointer-events-none disabled:opacity-50"
          :class="rejectReason === reason ? 'border-error bg-status-rejected-bg text-error' : 'border-border-soft bg-bg-base text-text-secondary hover:border-error/40 hover:bg-status-rejected-bg hover:text-error'"
          @click="rejectReason = reason"
        >
          {{ reason }}
        </button>
      </div>
    </div>

    <template #footer>
      <AppButton variant="ghost" :disabled="isProcessingReject" @click="attemptCancelReject(false)">Batal</AppButton>
      <AppButton variant="danger" :disabled="!rejectReason.trim() || isProcessingReject" :loading="isProcessingReject" @click="handleReject">Kirim</AppButton>
    </template>
  </AppModal>

  <AppModal v-model="isRejectGuardOpen" title="Kamu berubah pikiran?" width="max-w-[360px]" :z-index="70">
    <p class="text-sm leading-[1.43] tracking-[-0.15px] text-text-primary">
      Alasan yang sudah ditulis akan hilang.
    </p>

    <template #footer>
      <AppButton variant="ghost" @click="isRejectGuardOpen = false">Tidak</AppButton>
      <AppButton variant="danger" @click="confirmCancelReject">
        <XCircle class="mr-2 h-4 w-4" />
        Ya, Keluar
      </AppButton>
    </template>
  </AppModal>

  <AppModal v-model="isRejectBerkasModalOpen" :title="berkasDecisionCopy.title" width="max-w-[480px]" :z-index="60">
    <div class="space-y-4">
      <p class="text-sm leading-[1.43] tracking-[-0.15px] text-text-secondary">
        {{ berkasDecisionCopy.description }}
      </p>

      <div class="flex flex-wrap gap-2">
        <button
          v-for="reason in berkasRejectionReasons"
          :key="reason"
          type="button"
          :disabled="isProcessingVerifyBerkas"
          class="rounded-full border px-4 py-2 text-sm font-medium leading-none transition-colors disabled:pointer-events-none disabled:opacity-50"
          :class="rejectBerkasReason === reason ? 'border-error bg-status-rejected-bg text-error' : 'border-border-soft bg-bg-base text-text-secondary hover:border-error/40 hover:bg-status-rejected-bg hover:text-error'"
          @click="rejectBerkasReason = reason"
        >
          {{ reason }}
        </button>
      </div>
    </div>

    <template #footer>
      <AppButton
        variant="ghost"
        :disabled="isProcessingVerifyBerkas"
        @click="isRejectBerkasModalOpen = false"
      >
        Batal
      </AppButton>
      <AppButton
        variant="danger"
        :disabled="!rejectBerkasReason.trim() || isProcessingVerifyBerkas"
        :loading="isProcessingVerifyBerkas"
        @click="handleVerifyBerkas(berkasDecisionMode)"
      >
        Kirim
      </AppButton>
    </template>
  </AppModal>
</template>

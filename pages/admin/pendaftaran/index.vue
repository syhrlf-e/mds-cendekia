<script setup lang="ts">
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Eye,
  FileText,
  Filter,
  Search,
  UserRound,
  Users,
  XCircle
} from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'

type RegistrationStatus = 'pending' | 'approved' | 'rejected'
type SortKey = 'nama' | 'tanggal' | ''
type SortOrder = 'asc' | 'desc'
type TabKey = 'diri' | 'ortu' | 'berkas'

type Registration = {
  id: string
  nama: string
  fotoUrl: string
  nisn: string
  sekolah: string
  tanggal: string
  status: RegistrationStatus
  statusText: string
  statusBerkas: string
  nik: string
  email: string
  hp: string
  tempatLahir: string
  tanggalLahir: string
  jenisKelamin: string
  agama: string
  alamat: string
  rtRw: string
  kodePos: string
  provinsi: string
  kota: string
  kecamatan: string
  kelurahan: string
  gelombang: number | null
  program?: string
  program_paket?: string
}

type AdminPendaftarDto = {
  id: string
  nama: string
  foto?: string
  foto_url?: string
  url_foto?: string
  pas_foto?: string
  file_foto?: string
  path_foto?: string
  berkas?: AdminBerkasDto[] | AdminBerkasDto
  berkas_pendaftaran?: AdminBerkasDto[] | AdminBerkasDto
  berkas_persyaratan?: AdminBerkasDto[] | AdminBerkasDto
  dokumen?: AdminBerkasDto[] | AdminBerkasDto
  files?: AdminBerkasDto[] | AdminBerkasDto
  nik: string
  nisn: string
  status_berkas: string
  status_pendaftaran: string
  created_at: string
  no_telepon: string
  email: string
  asal_sekolah?: string
  sekolah_asal?: string
  nama_sekolah_asal?: string
  riwayat_pendidikan?: {
    nama_sekolah_asal?: string
    asal_sekolah?: string
    sekolah_asal?: string
  }
  tempat_lahir: string
  tanggal_lahir: string
  jenis_kelamin: string
  agama?: string
  alamat: string
  rt: string
  rw: string
  kelurahan: string
  kecamatan: string
  kota?: string
  kabupaten?: string
  kota_kabupaten?: string
  kabupaten_kota?: string
  kota_kab?: string
  provinsi: string
  kode_pos: string
  gelombang: number
  program?: string
  program_paket?: string
}

type AdminBerkasDto = {
    jenis_berkas?: string
    jenis?: string
    tipe?: string
    kategori?: string
    nama?: string
    nama_berkas?: string
    nama_file?: string
    url?: string
    url_file?: string
    file_url?: string
    file?: string
    berkas?: string
    path?: string
    path_file?: string
    file_path?: string
    lokasi_file?: string
    data?: AdminBerkasDto
    file_data?: AdminBerkasDto
}

type PublicCheckStatusResponse = {
  status?: boolean
  success?: boolean
  message?: string
  data?: {
    status?: string
    status_pendaftaran?: string
  }
}

definePageMeta({
  layout: 'admin',
  middleware: ['admin-auth']
})

useHead({ title: 'Pendaftaran | MDS Cendekia' })

const config = useRuntimeConfig()
const { get, post } = useApi()
const registrations = ref<Registration[]>([])
const isLoading = ref(true)
const loadError = ref('')

const berkas = [
  { id: 1, name: 'Foto Siswa (3x4 berwarna)', url: '#' },
  { id: 2, name: 'Buku Rapor SMP', url: '#' },
  { id: 3, name: 'Surat Keterangan Nilai Rapor Semester I-V', url: '#' },
  { id: 4, name: 'Ijazah / SKL', url: '#' },
  { id: 5, name: 'Akta Kelahiran', url: '#' },
  { id: 6, name: 'Kartu Keluarga', url: '#' }
]

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

let debounceTimeout: ReturnType<typeof setTimeout> | null = null

const detailTabs: Array<{ key: TabKey, label: string }> = [
  { key: 'diri', label: 'Data Diri' },
  { key: 'ortu', label: 'Orang Tua' },
  { key: 'berkas', label: 'Berkas' }
]

const normalizeStatus = (status: string): RegistrationStatus => {
  const normalized = status.toLowerCase()

  if (normalized.includes('terima') || normalized.includes('diterima') || normalized.includes('approved')) return 'approved'
  if (normalized.includes('tolak') || normalized.includes('ditolak') || normalized.includes('rejected')) return 'rejected'
  return 'pending'
}

const normalizeActionId = (id: string) => id.replace(/[^a-zA-Z0-9]/g, '')
const getAdminActionId = (id: string) => id.trim()
const getBerkasActionId = (id: string) => normalizeActionId(id)

const readPublicStatusText = (response?: PublicCheckStatusResponse | null) => {
  return response?.data?.status_pendaftaran || response?.data?.status || ''
}

const verifyPublicRegistrationStatus = async (item: Registration) => {
  const { data, error } = await post<PublicCheckStatusResponse>('/register/cek-status', {
    kode_pendaftaran: normalizeActionId(item.id),
    nisn: item.nisn
  }, { showErrorToast: false })

  if (error || !data?.status || !data.data) return ''
  return readPublicStatusText(data)
}

const ensureArray = (response: unknown): AdminPendaftarDto[] => {
  if (Array.isArray(response)) return response as AdminPendaftarDto[]

  const data = response as {
    data?: AdminPendaftarDto | AdminPendaftarDto[]
    result?: AdminPendaftarDto | AdminPendaftarDto[]
    items?: AdminPendaftarDto[]
  } | null

  if (Array.isArray(data?.data)) return data.data
  if (data?.data) return [data.data]
  if (Array.isArray(data?.result)) return data.result
  if (data?.result) return [data.result]
  if (Array.isArray(data?.items)) return data.items
  if (data && typeof data === 'object' && 'id' in data) return [data as AdminPendaftarDto]
  return []
}

const normalizeAssetUrl = (url?: string) => {
  const rawUrl = String(url || '').trim()
  if (!rawUrl) return ''
  if (/^https?:\/\//i.test(rawUrl)) return rawUrl

  const baseUrl = String(config.public.apiBaseUrl || '').replace(/\/$/, '')
  const path = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`
  return `${baseUrl}${path}`
}

const asBerkasArray = (value?: AdminBerkasDto[] | AdminBerkasDto) => {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

const getBerkasLabel = (file: AdminBerkasDto) => {
  return [
    file.jenis_berkas,
    file.jenis,
    file.tipe,
    file.kategori,
    file.nama,
    file.nama_berkas,
    file.nama_file
  ].filter(Boolean).join(' ').toLowerCase()
}

const getBerkasUrl = (file?: AdminBerkasDto): string => {
  if (!file) return ''

  return normalizeAssetUrl(
    file.url ||
    file.url_file ||
    file.file_url ||
    file.file ||
    file.berkas ||
    file.path ||
    file.path_file ||
    file.file_path ||
    file.lokasi_file ||
    getBerkasUrl(file.data) ||
    getBerkasUrl(file.file_data)
  )
}

const getFotoUrl = (item: AdminPendaftarDto) => {
  const directUrl = item.foto_url || item.url_foto || item.foto || item.pas_foto || item.file_foto || item.path_foto
  if (directUrl) return normalizeAssetUrl(directUrl)

  const berkasList = [
    ...asBerkasArray(item.berkas),
    ...asBerkasArray(item.berkas_pendaftaran),
    ...asBerkasArray(item.berkas_persyaratan),
    ...asBerkasArray(item.dokumen),
    ...asBerkasArray(item.files)
  ]
  const fotoBerkas = berkasList.find(file => {
    const label = getBerkasLabel(file)
    return label.includes('foto') || label.includes('photo') || label.includes('pas')
  })

  return getBerkasUrl(fotoBerkas)
}

const mapPendaftar = (item: AdminPendaftarDto): Registration => ({
  id: item.id,
  nama: item.nama,
  fotoUrl: getFotoUrl(item),
  nisn: item.nisn,
  sekolah: item.asal_sekolah || item.nama_sekolah_asal || item.sekolah_asal || item.riwayat_pendidikan?.nama_sekolah_asal || item.riwayat_pendidikan?.asal_sekolah || item.riwayat_pendidikan?.sekolah_asal || '-',
  tanggal: item.created_at,
  status: normalizeStatus(item.status_pendaftaran),
  statusText: item.status_pendaftaran || 'Menunggu verifikasi',
  statusBerkas: item.status_berkas || 'Menunggu verifikasi',
  nik: item.nik,
  email: item.email,
  hp: item.no_telepon,
  tempatLahir: item.tempat_lahir,
  tanggalLahir: item.tanggal_lahir,
  jenisKelamin: item.jenis_kelamin,
  agama: item.agama || '-',
  alamat: item.alamat,
  rtRw: `${item.rt || '-'} / ${item.rw || '-'}`,
  kodePos: item.kode_pos,
  provinsi: item.provinsi,
  kota: item.kota || item.kabupaten || item.kota_kabupaten || item.kabupaten_kota || item.kota_kab || '-',
  kecamatan: item.kecamatan,
  kelurahan: item.kelurahan,
  gelombang: item.gelombang ?? null,
  program: item.program_paket || item.program || '-'
})

const loadPendaftar = async () => {
  isLoading.value = true
  loadError.value = ''

  const { data, error } = await get<AdminPendaftarDto | AdminPendaftarDto[] | { data?: AdminPendaftarDto | AdminPendaftarDto[] }>('/api/pendaftar/data', {
    showErrorToast: false
  })

  isLoading.value = false

  if (error) {
    loadError.value = error?.data?.message || error?.response?._data?.message || 'Data pendaftar belum bisa diambil.'
    registrations.value = []
    return
  }

  registrations.value = ensureArray(data).map(mapPendaftar)
}

const isBerkasVerified = computed(() => {
  const status = selectedItem.value?.statusBerkas.toLowerCase() || ''
  return (
    (status.includes('verifikasi') && !status.includes('menunggu')) ||
    status.includes('terverifikasi') ||
    status.includes('diterima') ||
    status.includes('disetujui') ||
    status.includes('approved') ||
    (status.includes('valid') && !status.includes('tidak valid'))
  )
})

const isBerkasRejected = computed(() => {
  const status = selectedItem.value?.statusBerkas.toLowerCase() || ''
  return status.includes('tolak') || status.includes('ditolak') || status.includes('rejected') || status.includes('tidak valid')
})

const isBerkasFinal = computed(() => isBerkasVerified.value || isBerkasRejected.value)

const getBerkasStatusClass = (status: string) => {
  const normalized = status.toLowerCase()

  if (normalized.includes('tolak') || normalized.includes('ditolak') || normalized.includes('rejected') || normalized.includes('tidak valid')) {
    return 'bg-status-rejected-bg text-status-rejected-text'
  }

  if ((normalized.includes('verifikasi') && !normalized.includes('menunggu')) || normalized.includes('terverifikasi')) {
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
        ['Gelombang', selectedItem.value.gelombang ? String(selectedItem.value.gelombang) : '-']
      ]
    },
    {
      title: 'Kontak',
      fields: [
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

const closeDetail = () => {
  isDetailModalOpen.value = false
}

const openFile = (url: string) => {
  if (!import.meta.client) return
  window.open(url, '_blank', 'noopener,noreferrer')
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

  const { data, error } = await post<{ success?: boolean, status?: boolean, message?: string }>('/api/pendaftar/status', {
    id: actionId,
    accept: true,
    notes: ''
  }, { showErrorToast: false })

  isProcessingApprove.value = false

  const message = data?.message || ''
  const isInternalErrorMessage = message.toLowerCase().includes('internal server error')

  if (error || isInternalErrorMessage || data?.success === false || data?.status === false) {
    const errorMessage = error?.data?.message || error?.response?._data?.message || message || 'Status pendaftar belum berhasil diubah.'
    useToast().addToast(errorMessage, 'error')
    return
  }

  const publicStatusText = await verifyPublicRegistrationStatus(selectedItem.value)
  const publicStatus = normalizeStatus(publicStatusText)

  if (publicStatus !== 'approved') {
    await loadPendaftar()
    useToast().addToast(
      publicStatusText
        ? `Server menerima aksi, tapi status cek pendaftaran masih "${publicStatusText}".`
        : 'Server menerima aksi, tapi status cek pendaftaran belum bisa diverifikasi.',
      'error'
    )
    return
  }

  selectedItem.value.status = 'approved'
  selectedItem.value.statusText = publicStatusText || 'Diterima'
  isApproveModalOpen.value = false
  isDetailModalOpen.value = false
  await loadPendaftar()
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

  const { data, error } = await post<{ success?: boolean, status?: boolean, message?: string }>('/api/pendaftar/status', {
    id: actionId,
    accept: false,
    notes: selectedReason
  }, { showErrorToast: false })

  isProcessingReject.value = false

  const message = data?.message || ''
  const isInternalErrorMessage = message.toLowerCase().includes('internal server error')

  if (error || isInternalErrorMessage || data?.success === false || data?.status === false) {
    const errorMessage = error?.data?.message || error?.response?._data?.message || message || 'Status pendaftar belum berhasil diubah.'
    useToast().addToast(errorMessage, 'error')
    return
  }

  const publicStatusText = await verifyPublicRegistrationStatus(selectedItem.value)
  const publicStatus = normalizeStatus(publicStatusText)

  if (publicStatus !== 'rejected') {
    await loadPendaftar()
    useToast().addToast(
      publicStatusText
        ? `Server menerima aksi, tapi status cek pendaftaran masih "${publicStatusText}".`
        : 'Server menerima aksi, tapi status cek pendaftaran belum bisa diverifikasi.',
      'error'
    )
    return
  }

  selectedItem.value.status = 'rejected'
  selectedItem.value.statusText = publicStatusText || 'Ditolak'
  isRejectModalOpen.value = false
  isDetailModalOpen.value = false
  await loadPendaftar()
  useToast().addToast(message || 'Pendaftar berhasil ditolak', 'success')
}

const handleVerifyBerkas = async (accept: boolean) => {
  if (!selectedItem.value) return
  const selectedReason = rejectBerkasReason.value.trim()

  if (!accept && !selectedReason) {
    useToast().addToast('Pilih alasan penolakan berkas terlebih dahulu.', 'error')
    return
  }

  isProcessingVerifyBerkas.value = true
  const actionId = getBerkasActionId(selectedItem.value.id)

  const { data, error } = await post<{ success?: boolean, status?: boolean, message?: string }>('/api/pendaftar/berkas', {
    id: actionId,
    accept,
    notes: accept ? 'Berkas valid' : selectedReason
  }, { showErrorToast: false })

  isProcessingVerifyBerkas.value = false

  const message = data?.message || ''
  const isInternalErrorMessage = message.toLowerCase().includes('internal server error')

  if (error || isInternalErrorMessage || data?.success === false || data?.status === false) {
    const errorMessage = error?.data?.message || error?.response?._data?.message || message || 'Berkas pendaftar belum berhasil diverifikasi.'
    useToast().addToast(errorMessage, 'error')
    return
  }

  selectedItem.value.statusBerkas = accept ? 'Terverifikasi' : 'Ditolak'
  isRejectBerkasModalOpen.value = false
  rejectBerkasReason.value = ''
  await loadPendaftar()
  useToast().addToast(message || (accept ? 'Berkas pendaftar berhasil diverifikasi' : 'Berkas pendaftar berhasil ditolak'), 'success')
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
            <Search class="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-text-muted" />
            <input
              v-model="searchQuery"
              type="search"
              placeholder="Cari nama, kode pendaftaran, atau NISN..."
              class="h-11 w-full rounded-xl border border-border-soft bg-bg-base py-2.5 pl-10 pr-4 text-sm leading-none text-text-primary outline-none transition-colors placeholder:text-text-muted hover:bg-bg-surface focus:border-brand focus:bg-bg-surface focus:ring-[3px] focus:ring-brand/12"
              @input="handleSearch"
            >
          </div>

          <div class="relative">
            <Filter class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <select
              v-model="filterStatus"
              class="h-11 w-full appearance-none rounded-xl border border-border-soft bg-bg-base py-2.5 pl-10 pr-10 text-sm font-medium text-text-primary outline-none transition-colors hover:bg-bg-surface focus:border-brand focus:bg-bg-surface focus:ring-[3px] focus:ring-brand/12"
            >
              <option value="">Semua Status</option>
              <option value="pending">Menunggu</option>
              <option value="approved">Diterima</option>
              <option value="rejected">Ditolak</option>
            </select>
            <ChevronDown class="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          </div>

          <div class="relative">
            <select
              v-model="perPage"
              class="h-11 w-full appearance-none rounded-xl border border-border-soft bg-bg-base py-2.5 pl-4 pr-10 text-sm font-medium text-text-primary outline-none transition-colors hover:bg-bg-surface focus:border-brand focus:bg-bg-surface focus:ring-[3px] focus:ring-brand/12"
            >
              <option :value="10">10 / halaman</option>
              <option :value="20">20 / halaman</option>
              <option :value="50">50 / halaman</option>
            </select>
            <ChevronDown class="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
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
          <tbody class="divide-y divide-primary-50">
            <tr v-if="isLoading">
              <td colspan="8">
                <div class="flex min-h-[420px] items-center justify-center">
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
                <div class="flex min-h-[420px] items-center justify-center">
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
              class="h-[60px] text-sm text-text-primary transition-colors hover:bg-bg-base"
            >
              <td class="px-4 text-text-secondary">{{ paginationStart + index }}</td>
              <td class="px-4 font-medium text-text-primary">{{ item.id }}</td>
              <td class="px-4">
                <p class="font-semibold text-text-primary">{{ item.nama }}</p>
              </td>
              <td class="px-4 text-text-primary">{{ item.nisn }}</td>
              <td class="px-4 text-text-secondary">{{ item.sekolah }}</td>
              <td class="px-4 text-text-secondary">{{ formatDate(item.tanggal) }}</td>
              <td class="px-4"><AppBadge :status="item.status" :text="item.statusText" /></td>
              <td class="px-4 text-center">
                <button
                  type="button"
                  class="inline-flex h-9 items-center gap-2 rounded-xl bg-primary-50 px-3 text-sm font-semibold text-brand transition-colors hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-brand/20"
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
        @click.self="closeDetail"
      >
        <aside class="ml-[320px] flex h-full w-[calc(100%-320px)] flex-col border-l border-border bg-bg-base">
          <header class="shrink-0 border-b border-border bg-bg-surface px-8 py-6">
            <div class="mb-6 ml-[max(0px,calc((100%-1024px)/2))] flex items-center justify-between gap-6">
              <div class="flex min-w-0 items-center gap-6">
                <div class="h-[208px] w-[156px] shrink-0 overflow-hidden rounded-2xl border border-border bg-bg-parchment">
                  <img
                    v-if="selectedItem.fotoUrl"
                    :src="selectedItem.fotoUrl"
                    :alt="`Foto ${selectedItem.nama}`"
                    class="h-full w-full object-cover"
                  >
                  <div
                    v-else
                    class="flex h-full w-full items-center justify-center px-4 text-center text-sm font-medium leading-[1.29] text-text-secondary"
                  >
                    Foto belum tersedia
                  </div>
                </div>

                <div class="min-w-0">
                  <div>
                    <div class="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
                      <h2 class="truncate font-heading text-[36px] font-semibold leading-[1.1] tracking-[-0.2px] text-text-primary">
                        {{ selectedItem.nama }}
                      </h2>
                      <AppBadge :status="selectedItem.status" :text="selectedItem.statusText" />
                      <span
                        class="rounded-full px-2.5 py-0.75 text-xs font-semibold"
                        :class="getBerkasStatusClass(selectedItem.statusBerkas)"
                      >
                        Berkas: {{ selectedItem.statusBerkas }}
                      </span>
                    </div>
                    <p class="mt-3 text-[17px] font-medium leading-[1.47] tracking-[-0.2px] text-text-secondary">
                      {{ selectedItem.id }}
                    </p>
                  </div>

                  <nav class="mt-6 inline-flex rounded-full border border-border bg-bg-base p-1">
                    <button
                      v-for="tab in detailTabs"
                      :key="tab.key"
                      type="button"
                      class="rounded-full px-5 py-2 text-sm font-medium leading-none text-text-secondary transition-colors hover:text-text-primary"
                      :class="activeTab === tab.key ? 'bg-brand text-white hover:text-white' : ''"
                      @click="activeTab = tab.key"
                    >
                      {{ tab.label }}
                    </button>
                  </nav>
                </div>
              </div>
            </div>

          </header>

          <main class="min-h-0 grow overflow-y-auto px-8 py-6">
            <div v-if="activeTab === 'diri'" class="mx-auto max-w-5xl space-y-4">
              <section
                v-for="section in fieldSections"
                :key="section.title"
                class="rounded-2xl border border-border bg-bg-surface p-6"
              >
                <h3 class="mb-5 border-b border-border pb-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  {{ section.title }}
                </h3>
                <div class="grid grid-cols-2 gap-x-10 gap-y-4">
                  <div
                    v-for="field in section.fields"
                    :key="field[0]"
                    :class="field[2] === 'full' ? 'col-span-2' : ''"
                  >
                    <p class="mb-1 text-sm leading-[1.43] tracking-[-0.15px] text-text-secondary">{{ field[0] }}</p>
                    <p class="text-[17px] font-medium leading-[1.47] tracking-[-0.2px] text-text-primary">{{ field[1] }}</p>
                  </div>
                </div>
              </section>
            </div>

            <div v-else-if="activeTab === 'ortu'" class="mx-auto flex min-h-[420px] max-w-5xl items-center justify-center rounded-2xl border border-border bg-bg-surface">
              <AppEmptyState
                title="Data orang tua belum tersedia"
                description="Data orang tua akan ditampilkan setelah endpoint backend tersedia."
              >
                <template #icon>
                  <UserRound />
                </template>
              </AppEmptyState>
            </div>

            <div v-else class="mx-auto max-w-5xl space-y-4">
              <section class="rounded-2xl border border-border bg-bg-surface p-6">
                <div class="mb-6 flex items-start justify-between gap-6">
                  <div>
                    <h3 class="text-[17px] font-semibold leading-[1.24] tracking-[-0.2px] text-text-primary">Berkas Pendaftaran</h3>
                    <p class="mt-1 text-sm leading-[1.43] tracking-[-0.15px] text-text-secondary">
                      Dokumen pendukung yang diunggah calon siswa.
                    </p>
                  </div>
                  <div class="flex shrink-0 items-center gap-3">
                    <span
                      class="rounded-full px-2.5 py-0.75 text-xs font-semibold"
                      :class="getBerkasStatusClass(selectedItem.statusBerkas)"
                    >
                      {{ selectedItem.statusBerkas }}
                    </span>
                    <AppButton
                      variant="danger"
                      :disabled="isBerkasFinal || isProcessingVerifyBerkas"
                      @click="rejectBerkasReason = ''; isRejectBerkasModalOpen = true"
                    >
                      Tolak Berkas
                    </AppButton>
                    <AppButton
                      variant="success"
                      :loading="isProcessingVerifyBerkas"
                      :disabled="isBerkasFinal || isProcessingVerifyBerkas"
                      @click="handleVerifyBerkas(true)"
                    >
                      {{ isBerkasVerified ? 'Berkas Disetujui' : isBerkasRejected ? 'Berkas Ditolak' : 'Setujui Berkas' }}
                    </AppButton>
                  </div>
                </div>

                <div class="overflow-hidden rounded-2xl border border-border bg-bg-surface">
                  <div
                    v-for="file in berkas"
                    :key="file.id"
                    class="flex h-14 items-center border-b border-primary-50 px-4 last:border-b-0"
                  >
                    <FileText class="mr-3 h-4 w-4 text-brand" />
                    <span class="grow text-sm leading-[1.43] tracking-[-0.15px] text-text-primary">{{ file.name }}</span>
                    <AppButton variant="ghost" @click="openFile(file.url)">
                      Lihat
                    </AppButton>
                  </div>
                </div>
              </section>
            </div>
          </main>

          <footer class="shrink-0 border-t border-border bg-bg-surface px-8 py-4">
            <template v-if="selectedItem.status === 'pending'">
              <div v-if="isBerkasVerified" class="flex items-center justify-between gap-6">
                <AppButton variant="ghost" @click="closeDetail">Tutup</AppButton>
                <div class="flex items-center gap-3">
                  <AppButton variant="danger" @click="promptReject">Tolak Pendaftar</AppButton>
                  <AppButton variant="success" @click="isApproveModalOpen = true">Terima Pendaftar</AppButton>
                </div>
              </div>
              <div v-else-if="isBerkasRejected" class="flex items-center justify-between gap-6">
                <AppButton variant="ghost" @click="closeDetail">Tutup</AppButton>
                <p class="text-sm leading-[1.43] tracking-[-0.15px] text-text-secondary">
                  Berkas sudah ditolak. Alasan penolakan telah dikirim ke pendaftar.
                </p>
              </div>
              <div v-else class="flex items-center justify-between gap-6">
                <AppButton variant="ghost" @click="closeDetail">Tutup</AppButton>
                <p class="text-sm leading-[1.43] tracking-[-0.15px] text-text-secondary">
                  Verifikasi berkas terlebih dahulu sebelum mengambil keputusan final.
                </p>
              </div>
            </template>
            <div v-else class="flex items-center justify-between gap-6">
              <AppButton variant="ghost" @click="closeDetail">Tutup</AppButton>
              <p class="text-sm leading-[1.43] tracking-[-0.15px] text-text-secondary">
                Tindakan tidak tersedia karena pendaftar sudah {{ selectedItem.status === 'approved' ? 'diterima' : 'ditolak' }}.
              </p>
            </div>
          </footer>
        </aside>
      </div>
    </Transition>
  </Teleport>

  <AppModal v-model="isApproveModalOpen" title="Terima Pendaftar?" width="max-w-[400px]" :z-index="60">
    <p class="text-sm leading-[1.43] tracking-[-0.15px] text-text-primary">
      Tindakan ini akan mengirimkan email notifikasi ke pendaftar.
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

  <AppModal v-model="isRejectBerkasModalOpen" title="Alasan Penolakan Berkas" width="max-w-[480px]" :z-index="60">
    <div class="space-y-4">
      <p class="text-sm leading-[1.43] tracking-[-0.15px] text-text-secondary">
        Pilih alasan penolakan berkas yang akan dikirim sebagai catatan ke sistem.
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
        @click="handleVerifyBerkas(false)"
      >
        Kirim
      </AppButton>
    </template>
  </AppModal>
</template>

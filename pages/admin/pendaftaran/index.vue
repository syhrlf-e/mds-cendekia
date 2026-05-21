<script setup lang="ts">
import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  FileText,
  Mail,
  MapPin,
  Phone,
  Search,
  School,
  UserRound,
  Users,
  XCircle
} from 'lucide-vue-next'
import { computed, ref } from 'vue'

type RegistrationStatus = 'pending' | 'approved' | 'rejected'
type SortKey = 'nama' | 'tanggal' | ''
type SortOrder = 'asc' | 'desc'
type TabKey = 'diri' | 'ortu' | 'berkas'

type Registration = {
  id: string
  nama: string
  nisn: string
  sekolah: string
  tanggal: string
  status: RegistrationStatus
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
}

definePageMeta({
  layout: 'admin',
  middleware: ['admin-auth']
})

useHead({ title: 'Pendaftaran | MDS Cendekia' })

const registrations = ref<Registration[]>([
  {
    id: 'MDS-2026-0001',
    nama: 'Budi Santoso',
    nisn: '0101234567',
    sekolah: 'SMPN 1 Jakarta',
    tanggal: '2026-05-12',
    status: 'pending',
    nik: '3174011205110001',
    email: 'budi.santoso@example.com',
    hp: '081234567890',
    tempatLahir: 'Jakarta',
    tanggalLahir: '12 Januari 2011',
    jenisKelamin: 'Laki-laki',
    agama: 'Islam',
    alamat: 'Jl. Melati No. 12, Kebayoran Baru',
    rtRw: '001 / 002',
    kodePos: '12190',
    provinsi: 'DKI Jakarta',
    kota: 'Jakarta Selatan',
    kecamatan: 'Kebayoran Baru',
    kelurahan: 'Senayan'
  },
  {
    id: 'MDS-2026-0002',
    nama: 'Siti Aminah',
    nisn: '0102345678',
    sekolah: 'SMPN 2 Bandung',
    tanggal: '2026-05-13',
    status: 'approved',
    nik: '3273012303110002',
    email: 'siti.aminah@example.com',
    hp: '082112223333',
    tempatLahir: 'Bandung',
    tanggalLahir: '23 Maret 2011',
    jenisKelamin: 'Perempuan',
    agama: 'Islam',
    alamat: 'Jl. Cemara No. 8, Coblong',
    rtRw: '003 / 004',
    kodePos: '40132',
    provinsi: 'Jawa Barat',
    kota: 'Bandung',
    kecamatan: 'Coblong',
    kelurahan: 'Dago'
  },
  {
    id: 'MDS-2026-0003',
    nama: 'Andi Wijaya',
    nisn: '0103456789',
    sekolah: 'SMP Muhammadiyah',
    tanggal: '2026-05-14',
    status: 'rejected',
    nik: '3578010202110003',
    email: 'andi.wijaya@example.com',
    hp: '083145678901',
    tempatLahir: 'Surabaya',
    tanggalLahir: '2 Februari 2011',
    jenisKelamin: 'Laki-laki',
    agama: 'Islam',
    alamat: 'Jl. Kenanga No. 21, Gubeng',
    rtRw: '005 / 006',
    kodePos: '60281',
    provinsi: 'Jawa Timur',
    kota: 'Surabaya',
    kecamatan: 'Gubeng',
    kelurahan: 'Airlangga'
  },
  {
    id: 'MDS-2026-0004',
    nama: 'Rina Marlina',
    nisn: '0104567890',
    sekolah: 'SMP IT Al-Huda',
    tanggal: '2026-05-15',
    status: 'pending',
    nik: '3674011504110004',
    email: 'rina.marlina@example.com',
    hp: '085677778888',
    tempatLahir: 'Tangerang',
    tanggalLahir: '15 April 2011',
    jenisKelamin: 'Perempuan',
    agama: 'Islam',
    alamat: 'Jl. Anggrek No. 4, Cipondoh',
    rtRw: '007 / 008',
    kodePos: '15148',
    provinsi: 'Banten',
    kota: 'Tangerang',
    kecamatan: 'Cipondoh',
    kelurahan: 'Poris Plawad'
  }
])

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
const activeTab = ref<TabKey>('diri')
const selectedItem = ref<Registration | null>(null)
const isDetailModalOpen = ref(false)
const isApproveModalOpen = ref(false)
const isRejectModalOpen = ref(false)
const isRejectGuardOpen = ref(false)
const rejectReason = ref('')
const isProcessingApprove = ref(false)
const isProcessingReject = ref(false)

let debounceTimeout: ReturnType<typeof setTimeout> | null = null

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
        ['Tanggal Lahir', selectedItem.value.tanggalLahir],
        ['Jenis Kelamin', selectedItem.value.jenisKelamin],
        ['Agama', selectedItem.value.agama],
        ['Asal Sekolah', selectedItem.value.sekolah]
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

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const handleSearch = () => {
  if (debounceTimeout) clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(() => {
    debouncedSearch.value = searchQuery.value
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
  isProcessingApprove.value = true
  await new Promise(resolve => setTimeout(resolve, 800))
  if (selectedItem.value) selectedItem.value.status = 'approved'
  isProcessingApprove.value = false
  isApproveModalOpen.value = false
  isDetailModalOpen.value = false
  useToast().addToast('Pendaftar berhasil diterima', 'success')
}

const handleReject = async () => {
  isProcessingReject.value = true
  await new Promise(resolve => setTimeout(resolve, 800))
  if (selectedItem.value) selectedItem.value.status = 'rejected'
  isProcessingReject.value = false
  isRejectModalOpen.value = false
  isDetailModalOpen.value = false
  useToast().addToast('Pendaftar berhasil ditolak', 'error')
}
</script>

<template>
  <div class="flex h-full flex-col">
    <header class="mb-8 flex items-end justify-between">
      <div>
        <h1 class="text-[28px] font-semibold leading-[1.2] tracking-[-0.2px] text-text-primary">Pendaftaran</h1>
      </div>
      <p class="text-sm leading-[1.43] tracking-[-0.15px] text-text-secondary">
        {{ filteredAndSortedData.length }} pendaftar
      </p>
    </header>

    <section class="mb-5 flex items-center gap-4">
      <div class="relative w-105">
        <Search class="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Cari kode pendaftaran, nama, atau NISN..."
          class="h-11 w-full rounded-lg border border-border bg-bg-surface py-3 pl-10 pr-4 text-[17px] leading-[1.47] tracking-[-0.2px] text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-brand focus:ring-[3px] focus:ring-brand/12"
          @input="handleSearch"
        >
      </div>

      <div class="relative">
        <select
          v-model="filterStatus"
          class="h-11 appearance-none rounded-lg border border-border-soft bg-[#fafafc] py-2 pl-4 pr-10 text-[13px] font-medium text-text-primary outline-none transition-colors hover:bg-bg-parchment focus:border-brand focus:ring-[3px] focus:ring-brand/12"
        >
          <option value="">Semua</option>
          <option value="pending">Menunggu</option>
          <option value="approved">Diterima</option>
          <option value="rejected">Ditolak</option>
        </select>
        <ChevronDown class="pointer-events-none absolute right-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-secondary" />
      </div>
    </section>

    <section class="overflow-hidden rounded-xl border border-border bg-bg-surface">
      <table class="w-full border-collapse text-left">
        <thead>
          <tr class="h-11 bg-bg-base text-xs font-semibold uppercase tracking-wider text-text-secondary">
            <th class="w-14 px-4">No</th>
            <th class="w-48 px-4">Kode Pendaftaran</th>
            <th class="min-w-44 px-4">
              <button class="flex items-center gap-2 uppercase" @click="handleSort('nama')">
                Nama
                <component :is="getSortIcon('nama')" class="h-3.5 w-3.5" :class="sortKey === 'nama' ? 'text-brand' : 'text-text-muted'" />
              </button>
            </th>
            <th class="w-32 px-4">NISN</th>
            <th class="min-w-44 px-4">Asal Sekolah</th>
            <th class="w-44 px-4">
              <button class="flex items-center gap-2 uppercase" @click="handleSort('tanggal')">
                Tanggal Daftar
                <component :is="getSortIcon('tanggal')" class="h-3.5 w-3.5" :class="sortKey === 'tanggal' ? 'text-brand' : 'text-text-muted'" />
              </button>
            </th>
            <th class="w-30 px-4">Status</th>
            <th class="w-40 px-4 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in filteredAndSortedData"
            :key="item.id"
            class="h-14 border-t border-primary-50 text-sm text-text-primary transition-colors hover:bg-bg-base"
          >
            <td class="px-4 text-text-secondary">{{ index + 1 }}</td>
            <td class="px-4 text-text-primary">{{ item.id }}</td>
            <td class="px-4">
              <p class="font-medium text-text-primary">{{ item.nama }}</p>
            </td>
            <td class="px-4 text-text-primary">{{ item.nisn }}</td>
            <td class="px-4">{{ item.sekolah }}</td>
            <td class="px-4">{{ formatDate(item.tanggal) }}</td>
            <td class="px-4"><AppBadge :status="item.status" /></td>
            <td class="px-4 text-center">
              <AppButton variant="ghost" @click="openDetail(item)">
                Lihat Detail
              </AppButton>
            </td>
          </tr>
          <tr v-if="filteredAndSortedData.length === 0">
              <td colspan="8">
              <AppEmptyState
                title="Belum ada data pendaftar"
                description="Data pendaftar akan muncul di sini"
              >
                <template #icon>
                  <Users />
                </template>
              </AppEmptyState>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>

  <AppModal v-if="selectedItem" v-model="isDetailModalOpen" width="max-w-[80vw]">
    <template #header>
      <h2 class="text-[17px] font-semibold leading-[1.24] tracking-[-0.2px] text-text-primary">Detail Pendaftar</h2>
    </template>

    <div class="-m-6 flex h-[calc(80vh-130px)] flex-col bg-bg-surface">
      <div class="flex gap-6 border-b border-border bg-bg-surface p-6">
        <div class="flex h-40 w-30 shrink-0 items-center justify-center rounded-lg border border-border bg-bg-parchment text-sm font-medium text-text-secondary">
          Foto
        </div>

        <div class="flex min-w-0 grow flex-col justify-between">
          <div class="flex items-start justify-between gap-6">
            <div class="min-w-0">
              <p class="mb-2 font-mono text-sm text-text-secondary">
                {{ selectedItem.id }}
              </p>
              <h3 class="truncate font-heading text-3xl font-semibold text-text-primary">
                {{ selectedItem.nama }}
              </h3>
            </div>
            <AppBadge :status="selectedItem.status" />
          </div>

          <div class="grid grid-cols-4 gap-3">
            <div class="rounded-lg border border-border bg-bg-base px-3 py-2">
              <div class="mb-1 flex items-center gap-1.5 text-sm text-text-secondary">
                <CalendarDays class="h-3.5 w-3.5" />
                Daftar
              </div>
              <p class="text-sm font-medium text-text-primary">{{ formatDate(selectedItem.tanggal) }}</p>
            </div>
            <div class="rounded-lg border border-border bg-bg-base px-3 py-2">
              <div class="mb-1 flex items-center gap-1.5 text-sm text-text-secondary">
                <School class="h-3.5 w-3.5" />
                Sekolah
              </div>
              <p class="truncate text-sm font-medium text-text-primary">{{ selectedItem.sekolah }}</p>
            </div>
            <div class="rounded-lg border border-border bg-bg-base px-3 py-2">
              <div class="mb-1 flex items-center gap-1.5 text-sm text-text-secondary">
                <Phone class="h-3.5 w-3.5" />
                No. HP
              </div>
              <p class="truncate text-sm font-medium text-text-primary">{{ selectedItem.hp }}</p>
            </div>
            <div class="rounded-lg border border-border bg-bg-base px-3 py-2">
              <div class="mb-1 flex items-center gap-1.5 text-sm text-text-secondary">
                <Mail class="h-3.5 w-3.5" />
                Email
              </div>
              <p class="truncate text-sm font-medium text-text-primary">{{ selectedItem.email }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="flex min-h-0 grow">
        <nav class="w-36 shrink-0 border-r border-border bg-bg-surface p-3">
          <button
            v-for="tab in [
              { key: 'diri', label: 'Data Diri' },
              { key: 'ortu', label: 'Orang Tua' },
              { key: 'berkas', label: 'Berkas' }
            ]"
            :key="tab.key"
            class="mb-1 w-full rounded-lg px-4 py-3 text-left text-sm leading-[1.29] text-text-secondary transition-colors hover:bg-bg-base hover:text-text-primary"
            :class="activeTab === tab.key ? 'border-l-[3px] border-brand bg-bg-base pl-3.25 font-semibold text-brand' : ''"
            @click="activeTab = tab.key as TabKey"
          >
            {{ tab.label }}
          </button>
        </nav>

        <div class="grow overflow-y-auto bg-bg-surface p-6">
          <div v-if="activeTab === 'diri'" class="space-y-6">
            <section
              v-for="section in fieldSections"
              :key="section.title"
            >
              <h4 class="mb-4 border-b border-border pb-2 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                {{ section.title }}
              </h4>
              <div class="grid grid-cols-2 gap-x-8 gap-y-4">
                <div
                  v-for="field in section.fields"
                  :key="field[0]"
                  :class="field[2] === 'full' ? 'col-span-2' : ''"
                >
                  <p class="mb-1 text-sm text-text-secondary">{{ field[0] }}</p>
                  <p class="text-sm font-medium leading-[1.43] tracking-[-0.15px] text-text-primary">{{ field[1] }}</p>
                </div>
              </div>
            </section>

            <section class="rounded-xl border border-border bg-bg-base p-4">
              <div class="mb-1 flex items-center gap-2 text-sm text-text-secondary">
                <MapPin class="h-3.5 w-3.5 text-brand" />
                Ringkasan Lokasi
              </div>
              <p class="text-sm font-medium leading-[1.43] tracking-[-0.15px] text-text-primary">
                {{ selectedItem.kelurahan }}, {{ selectedItem.kecamatan }}, {{ selectedItem.kota }}, {{ selectedItem.provinsi }} {{ selectedItem.kodePos }}
              </p>
            </section>
          </div>

          <div v-else-if="activeTab === 'ortu'" class="flex h-full items-center justify-center">
            <AppEmptyState
              title="Segera hadir"
              description="Data orang tua akan ditampilkan setelah API tersedia"
            >
              <template #icon>
                <UserRound />
              </template>
            </AppEmptyState>
          </div>

          <div v-else>
            <div class="mb-4">
              <h4 class="text-[17px] font-semibold leading-[1.24] tracking-[-0.2px] text-text-primary">Berkas Pendaftaran</h4>
              <p class="mt-1 text-sm leading-[1.43] tracking-[-0.15px] text-text-secondary">
                Dokumen pendukung yang diunggah calon siswa.
              </p>
            </div>

            <div class="overflow-hidden rounded-xl border border-border bg-bg-surface">
              <div
                v-for="file in berkas"
                :key="file.id"
                class="flex h-12 items-center border-b border-primary-50 px-4 last:border-b-0"
              >
                <FileText class="mr-3 h-4 w-4 text-brand" />
                <span class="grow text-sm leading-[1.43] tracking-[-0.15px] text-text-primary">{{ file.name }}</span>
                <AppButton variant="ghost" @click="openFile(file.url)">
                  Lihat
                </AppButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <template v-if="selectedItem.status === 'pending'">
        <div class="flex w-full items-center justify-between">
          <AppButton variant="danger" @click="promptReject">Tolak</AppButton>
          <div class="flex items-center gap-3">
            <p class="text-sm leading-[1.43] tracking-[-0.15px] text-text-secondary">
              Tinjau data sebelum membuat keputusan.
            </p>
            <AppButton variant="success" @click="isApproveModalOpen = true">Terima</AppButton>
          </div>
        </div>
      </template>
      <p v-else class="text-sm text-text-secondary">
        Tindakan tidak tersedia karena pendaftar sudah {{ selectedItem.status === 'approved' ? 'diterima' : 'ditolak' }}.
      </p>
    </template>
  </AppModal>

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
    title="Alasan Penolakan"
    width="max-w-[480px]"
    :z-index="60"
    @update:model-value="attemptCancelReject"
  >
    <AppTextarea
      v-model="rejectReason"
      placeholder="Tuliskan alasan penolakan..."
      required
      :rows="5"
      :disabled="isProcessingReject"
    />

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
</template>

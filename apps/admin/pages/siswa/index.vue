<script setup lang="ts">
import {
  BadgeCheck,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  GraduationCap,
  Search,
  XCircle
} from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'
import type { Student } from '~/types/adminSiswa'

type SortKey = 'nama' | 'nis' | 'tanggal' | ''
type SortOrder = 'asc' | 'desc'

definePageMeta({
  layout: 'admin',
  middleware: ['admin-auth']
})

useHead({ title: 'Siswa | MDS Cendekia' })

const {
  students,
  studentsLoading: isLoading,
  studentsError: loadError,
  loadStudents: loadCachedStudents,
  refreshStudents
} = useAdminDataCache()
const searchQuery = ref('')
const debouncedSearch = ref('')
const filterProgram = ref('')
const sortKey = ref<SortKey>('tanggal')
const sortOrder = ref<SortOrder>('desc')
const currentPage = ref(1)
const perPage = ref(10)
const selectedItem = ref<Student | null>(null)
const isDetailOpen = ref(false)

let debounceTimeout: ReturnType<typeof setTimeout> | null = null

const loadStudents = (force = false) => force ? refreshStudents() : loadCachedStudents()

const handleSearch = () => {
  if (debounceTimeout) clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(() => {
    debouncedSearch.value = searchQuery.value.trim().toLowerCase()
    currentPage.value = 1
  }, 250)
}

const programOptions = computed(() => {
  return [...new Set(students.value.map(item => item.program).filter(Boolean))].sort((a, b) => a.localeCompare(b))
})

const programFilterOptions = computed(() => [
  { label: 'Semua Program', value: '' },
  ...programOptions.value.map(program => ({ label: program, value: program }))
])

const perPageOptions = [
  { label: '10 / halaman', value: 10 },
  { label: '20 / halaman', value: 20 },
  { label: '50 / halaman', value: 50 }
]

const filteredAndSortedData = computed(() => {
  const query = debouncedSearch.value
  const filtered = students.value.filter(item => {
    const matchesSearch = !query || [
      item.nama,
      item.nis,
      item.nisn,
      item.kodePendaftaran,
      item.sekolah,
      item.program
    ].some(value => value.toLowerCase().includes(query))
    const matchesProgram = !filterProgram.value || item.program === filterProgram.value

    return matchesSearch && matchesProgram
  })

  const sorted = [...filtered]
  sorted.sort((a, b) => {
    if (!sortKey.value) return 0

    const valueA = sortKey.value === 'tanggal'
      ? new Date(a.tanggalDiterima).getTime()
      : String(a[sortKey.value]).toLowerCase()
    const valueB = sortKey.value === 'tanggal'
      ? new Date(b.tanggalDiterima).getTime()
      : String(b[sortKey.value]).toLowerCase()

    if (valueA < valueB) return sortOrder.value === 'asc' ? -1 : 1
    if (valueA > valueB) return sortOrder.value === 'asc' ? 1 : -1
    return 0
  })

  return sorted
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredAndSortedData.value.length / perPage.value)))
const paginationStart = computed(() => (currentPage.value - 1) * perPage.value + 1)
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filteredAndSortedData.value.slice(start, start + perPage.value)
})

const handleSort = (key: SortKey) => {
  if (sortKey.value !== key) {
    sortKey.value = key
    sortOrder.value = key === 'tanggal' ? 'desc' : 'asc'
    return
  }

  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
}

const getSortIcon = (key: SortKey) => {
  if (sortKey.value !== key) return ChevronsUpDown
  return sortOrder.value === 'asc' ? ChevronUp : ChevronDown
}

const openDetail = (item: Student) => {
  selectedItem.value = item
  isDetailOpen.value = true
}

const closeDetail = () => {
  isDetailOpen.value = false
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

const truncateWords = (value: string, maxWords = 4) => {
  const words = value.trim().split(/\s+/).filter(Boolean)
  if (words.length <= maxWords) return value
  return `${words.slice(0, maxWords).join(' ')}...`
}

const formatAddress = (item: Student) => {
  return [
    item.alamat,
    item.rt && item.rw ? `RT ${item.rt}/RW ${item.rw}` : '',
    item.kelurahan,
    item.kecamatan,
    item.kabupatenKota,
    item.provinsi,
    item.kodePos
  ].filter(Boolean).join(', ') || '-'
}

onMounted(loadStudents)

watch([filterProgram, perPage], () => {
  currentPage.value = 1
})

watch(totalPages, value => {
  if (currentPage.value > value) currentPage.value = value
})
</script>

<template>
  <div class="flex h-full min-h-0 flex-col">
    <div class="flex min-h-0 flex-1 flex-col gap-2">
      <section class="admin-students-toolbar shrink-0 rounded-2xl border border-border bg-bg-surface p-4">
        <div class="admin-students-toolbar-grid grid grid-cols-[minmax(0,1fr)_minmax(170px,220px)_120px] gap-3 2xl:gap-4">
          <div class="relative">
            <Search class="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-text-muted" />
            <input
              v-model="searchQuery"
              type="search"
              placeholder="Cari nama, NIS, NISN, atau asal sekolah..."
              class="admin-students-search h-11 w-full rounded-xl border border-border-soft bg-bg-base py-2.5 pl-10 pr-4 text-sm leading-none text-text-primary outline-none transition-colors placeholder:text-text-muted hover:bg-bg-surface focus:border-brand focus:bg-bg-surface focus:ring-[3px] focus:ring-brand/12"
              @input="handleSearch"
            >
          </div>

          <div class="relative">
            <AppSelect
              v-model="filterProgram"
              :options="programFilterOptions"
              placeholder="Semua Program"
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

      <section class="admin-students-table-card flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-bg-surface">
        <div class="min-h-0 flex-1 overflow-hidden">
          <table class="admin-students-table w-full table-fixed border-collapse text-left">
            <thead class="sticky top-0 z-10 bg-bg-base">
              <tr class="h-12 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                <th class="admin-students-col-no px-4">No</th>
                <th class="admin-students-col-nis px-4">
                  <button class="flex items-center gap-2 uppercase" @click="handleSort('nis')">
                    NIS
                    <component :is="getSortIcon('nis')" class="h-3.5 w-3.5" :class="sortKey === 'nis' ? 'text-brand' : 'text-text-muted'" />
                  </button>
                </th>
                <th class="admin-students-col-name px-4">
                  <button class="flex items-center gap-2 uppercase" @click="handleSort('nama')">
                    Nama Siswa
                    <component :is="getSortIcon('nama')" class="h-3.5 w-3.5" :class="sortKey === 'nama' ? 'text-brand' : 'text-text-muted'" />
                  </button>
                </th>
                <th class="admin-students-col-nisn px-4">NISN</th>
                <th class="admin-students-col-school px-4">Asal Sekolah</th>
                <th class="admin-students-col-program px-4">Program</th>
                <th class="admin-students-col-date px-4">
                  <button class="flex items-center gap-2 uppercase" @click="handleSort('tanggal')">
                    Tanggal Diterima
                    <component :is="getSortIcon('tanggal')" class="h-3.5 w-3.5" :class="sortKey === 'tanggal' ? 'text-brand' : 'text-text-muted'" />
                  </button>
                </th>
                <th class="admin-students-col-status px-4">Status</th>
                <th class="admin-students-col-action px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border-soft">
              <tr v-if="isLoading">
                <td colspan="9">
                  <div class="flex min-h-[420px] items-center justify-center">
                    <AppEmptyState
                      title="Memuat data siswa"
                      description="Sebentar, data siswa sedang diambil dari server."
                    >
                      <template #icon>
                        <GraduationCap />
                      </template>
                    </AppEmptyState>
                  </div>
                </td>
              </tr>

              <tr v-else-if="loadError">
                <td colspan="9">
                  <div class="flex min-h-[420px] items-center justify-center">
                    <AppEmptyState
                      title="Data siswa belum bisa dimuat"
                      :description="loadError"
                    >
                      <template #icon>
                        <XCircle />
                      </template>
                      <template #action>
                        <AppButton variant="primary" @click="loadStudents">
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
                class="admin-students-row h-[60px] text-sm text-text-primary transition-colors hover:bg-bg-base"
              >
                <td class="px-4 text-text-secondary">{{ paginationStart + index }}</td>
                <td class="px-4 text-text-primary">{{ item.nis }}</td>
                <td class="px-4">
                  <p class="truncate text-text-primary" :title="item.nama">{{ truncateWords(item.nama, 4) }}</p>
                </td>
                <td class="px-4 text-text-primary">{{ item.nisn || '-' }}</td>
                <td class="px-4 text-text-secondary">
                  <p class="truncate" :title="item.sekolah || '-'">{{ item.sekolah ? truncateWords(item.sekolah, 4) : '-' }}</p>
                </td>
                <td class="px-4 text-text-primary">
                  <p class="truncate" :title="item.program">{{ item.program }}</p>
                </td>
                <td class="px-4 text-text-secondary">{{ formatDate(item.tanggalDiterima) }}</td>
                <td class="px-4">
                  <AppBadge variant="success">
                    <BadgeCheck class="h-3.5 w-3.5" />
                    {{ item.status }}
                  </AppBadge>
                </td>
                <td class="px-4 text-center">
                  <button
                    type="button"
                    class="admin-students-action-button inline-flex h-9 items-center gap-2 rounded-xl border border-border-soft bg-bg-base px-3 text-sm font-normal text-text-secondary transition-colors hover:bg-bg-surface hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/20"
                    @click="openDetail(item)"
                  >
                    Detail
                  </button>
                </td>
              </tr>

              <tr v-if="!isLoading && !loadError && filteredAndSortedData.length === 0">
                <td colspan="9">
                  <div class="flex min-h-[420px] items-center justify-center">
                    <AppEmptyState
                      title="Belum ada data siswa"
                      description="Siswa yang sudah diterima dan memiliki NIS akan muncul di sini."
                    >
                      <template #icon>
                        <GraduationCap />
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
        v-if="selectedItem && isDetailOpen"
        class="fixed inset-0 z-50 bg-text-primary/20 backdrop-blur-[14px]"
        @click.self="closeDetail"
      >
        <aside class="ml-auto flex h-full w-[min(760px,calc(100%-320px))] flex-col overflow-hidden border-l-2 border-border bg-bg-base">
          <header class="shrink-0 border-b border-border bg-bg-surface px-8 py-5">
            <div class="flex items-start gap-5">
              <button
                type="button"
                class="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-bg-base hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/20"
                aria-label="Tutup detail siswa"
                @click="closeDetail"
              >
                <XCircle class="h-5 w-5" />
              </button>

              <div class="h-[112px] w-[84px] shrink-0 overflow-hidden rounded-2xl border border-border bg-bg-parchment">
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

              <div class="min-w-0 grow">
                <h2 class="truncate font-heading text-[22px] font-bold leading-[1.18] tracking-[-0.3px] text-text-primary">
                  {{ selectedItem.nama }}
                </h2>
                <div class="mt-3 flex flex-wrap items-center gap-2">
                  <AppBadge variant="success">
                    <BadgeCheck class="h-3.5 w-3.5" />
                    Siswa {{ selectedItem.status }}
                  </AppBadge>
                  <AppBadge v-if="selectedItem.gelombang" variant="brand">
                    Gelombang {{ selectedItem.gelombang }}
                  </AppBadge>
                </div>
              </div>
            </div>
          </header>

          <main class="min-h-0 grow overflow-y-auto px-8 py-6">
            <div>
              <section class="overflow-hidden rounded-2xl border border-border bg-bg-surface">
                <div class="border-b border-border bg-bg-base px-6 py-3">
                  <h3 class="text-[11px] font-bold uppercase tracking-widest text-text-muted">Data Diri Siswa</h3>
                </div>
                <div class="grid grid-cols-2 gap-x-8 gap-y-5 p-6">
                  <div>
                    <p class="mb-1 text-[11px] font-semibold uppercase tracking-wider text-text-muted">NIS</p>
                    <p class="text-[15px] font-medium text-text-primary">{{ selectedItem.nis }}</p>
                  </div>
                  <div>
                    <p class="mb-1 text-[11px] font-semibold uppercase tracking-wider text-text-muted">NISN</p>
                    <p class="text-[15px] font-medium text-text-primary">{{ selectedItem.nisn || '-' }}</p>
                  </div>
                  <div class="col-span-2">
                    <p class="mb-1 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Nama Lengkap</p>
                    <p class="text-[15px] font-medium text-text-primary">{{ selectedItem.nama }}</p>
                  </div>
                  <div>
                    <p class="mb-1 text-[11px] font-semibold uppercase tracking-wider text-text-muted">NIK</p>
                    <p class="text-[15px] font-medium text-text-primary">{{ selectedItem.nik || '-' }}</p>
                  </div>
                  <div>
                    <p class="mb-1 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Jenis Kelamin</p>
                    <p class="text-[15px] font-medium text-text-primary">{{ selectedItem.jenisKelamin || '-' }}</p>
                  </div>
                  <div>
                    <p class="mb-1 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Tempat Lahir</p>
                    <p class="text-[15px] font-medium text-text-primary">{{ selectedItem.tempatLahir || '-' }}</p>
                  </div>
                  <div>
                    <p class="mb-1 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Tanggal Lahir</p>
                    <p class="text-[15px] font-medium text-text-primary">{{ formatDate(selectedItem.tanggalLahir) }}</p>
                  </div>
                  <div>
                    <p class="mb-1 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Agama</p>
                    <p class="text-[15px] font-medium text-text-primary">{{ selectedItem.agama || '-' }}</p>
                  </div>
                  <div>
                    <p class="mb-1 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Program</p>
                    <p class="text-[15px] font-medium text-text-primary">{{ selectedItem.program }}</p>
                  </div>
                  <div>
                    <p class="mb-1 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Gelombang</p>
                    <p class="text-[15px] font-medium text-text-primary">{{ selectedItem.gelombang || '-' }}</p>
                  </div>
                  <div class="col-span-2">
                    <p class="mb-1 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Asal Sekolah</p>
                    <p class="text-[15px] font-medium text-text-primary">{{ selectedItem.sekolah || '-' }}</p>
                  </div>
                  <div class="col-span-2">
                    <p class="mb-1 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Tanggal Diterima</p>
                    <p class="text-[15px] font-medium text-text-primary">{{ formatDate(selectedItem.tanggalDiterima) }}</p>
                  </div>
                  <div>
                    <p class="mb-1 text-[11px] font-semibold uppercase tracking-wider text-text-muted">No. HP</p>
                    <p class="text-[15px] font-medium text-text-primary">{{ selectedItem.hp || '-' }}</p>
                  </div>
                  <div>
                    <p class="mb-1 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Email</p>
                    <p class="text-[15px] font-medium text-text-primary">{{ selectedItem.email || '-' }}</p>
                  </div>
                  <div class="col-span-2">
                    <p class="mb-1 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Alamat</p>
                    <p class="text-[15px] font-medium leading-[1.5] text-text-primary">{{ formatAddress(selectedItem) }}</p>
                  </div>
                </div>
              </section>

              <section class="mt-6 overflow-hidden rounded-2xl border border-border bg-bg-surface">
                <div class="border-b border-border bg-bg-base px-6 py-3">
                  <h3 class="text-[11px] font-bold uppercase tracking-widest text-text-muted">Orang Tua / Wali</h3>
                </div>
                <div class="divide-y divide-border-soft">
                  <div
                    v-for="parent in selectedItem.orangTua"
                    :key="`${parent.nik}-${parent.hubungan}-${parent.peran}`"
                    class="grid grid-cols-2 gap-x-8 gap-y-5 p-6"
                  >
                    <div>
                      <p class="mb-1 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Nama</p>
                      <p class="text-[15px] font-medium text-text-primary">{{ parent.nama || '-' }}</p>
                    </div>
                    <div>
                      <p class="mb-1 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Hubungan</p>
                      <p class="text-[15px] font-medium text-text-primary">{{ parent.hubungan || '-' }}</p>
                    </div>
                    <div>
                      <p class="mb-1 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Peran</p>
                      <p class="text-[15px] font-medium text-text-primary">{{ parent.peran || '-' }}</p>
                    </div>
                    <div>
                      <p class="mb-1 text-[11px] font-semibold uppercase tracking-wider text-text-muted">NIK</p>
                      <p class="text-[15px] font-medium text-text-primary">{{ parent.nik || '-' }}</p>
                    </div>
                    <div>
                      <p class="mb-1 text-[11px] font-semibold uppercase tracking-wider text-text-muted">No. HP</p>
                      <p class="text-[15px] font-medium text-text-primary">{{ parent.no_telepon || '-' }}</p>
                    </div>
                    <div>
                      <p class="mb-1 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Email</p>
                      <p class="text-[15px] font-medium text-text-primary">{{ parent.email || '-' }}</p>
                    </div>
                    <div>
                      <p class="mb-1 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Pekerjaan</p>
                      <p class="text-[15px] font-medium text-text-primary">{{ parent.pekerjaan || '-' }}</p>
                    </div>
                    <div>
                      <p class="mb-1 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Pendidikan</p>
                      <p class="text-[15px] font-medium text-text-primary">{{ parent.pendidikan || '-' }}</p>
                    </div>
                  </div>

                  <div v-if="selectedItem.orangTua.length === 0" class="p-6 text-sm text-text-secondary">
                    Data orang tua atau wali belum tersedia.
                  </div>
                </div>
              </section>

              <section class="mt-6 overflow-hidden rounded-2xl border border-border bg-bg-surface">
                <div class="border-b border-border bg-bg-base px-6 py-3">
                  <h3 class="text-[11px] font-bold uppercase tracking-widest text-text-muted">Riwayat Pendidikan</h3>
                </div>
                <div class="grid grid-cols-2 gap-x-8 gap-y-5 p-6">
                  <div class="col-span-2">
                    <p class="mb-1 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Sekolah Asal</p>
                    <p class="text-[15px] font-medium text-text-primary">{{ selectedItem.riwayatPendidikan?.nama_sekolah_asal || '-' }}</p>
                  </div>
                  <div>
                    <p class="mb-1 text-[11px] font-semibold uppercase tracking-wider text-text-muted">NPSN</p>
                    <p class="text-[15px] font-medium text-text-primary">{{ selectedItem.riwayatPendidikan?.npsn_sekolah_asal || '-' }}</p>
                  </div>
                  <div>
                    <p class="mb-1 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Tahun Lulus</p>
                    <p class="text-[15px] font-medium text-text-primary">{{ selectedItem.riwayatPendidikan?.tahun_lulus || '-' }}</p>
                  </div>
                  <div>
                    <p class="mb-1 text-[11px] font-semibold uppercase tracking-wider text-text-muted">No. Ijazah</p>
                    <p class="text-[15px] font-medium text-text-primary">{{ selectedItem.riwayatPendidikan?.no_ijazah || '-' }}</p>
                  </div>
                  <div class="col-span-2">
                    <p class="mb-1 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Alamat Sekolah Asal</p>
                    <p class="text-[15px] font-medium leading-[1.5] text-text-primary">{{ selectedItem.riwayatPendidikan?.alamat_sekolah_asal || '-' }}</p>
                  </div>
                </div>
              </section>
            </div>
          </main>

          <footer class="shrink-0 border-t border-border bg-bg-surface px-8 py-4">
            <div class="flex items-center justify-between gap-6">
              <p class="text-sm font-medium text-text-secondary">
                Data ini berasal dari pendaftar yang sudah diterima dan memiliki NIS.
              </p>
              <AppButton variant="ghost" @click="closeDetail">Tutup</AppButton>
            </div>
          </footer>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.admin-students-col-no {
  width: 5%;
}

.admin-students-col-nis {
  width: 10%;
}

.admin-students-col-name {
  width: 17%;
}

.admin-students-col-nisn {
  width: 10%;
}

.admin-students-col-school {
  width: 15%;
}

.admin-students-col-program {
  width: 9%;
}

.admin-students-col-date {
  width: 13%;
}

.admin-students-col-status {
  width: 12%;
}

.admin-students-col-action {
  width: 9%;
}

.admin-students-table th,
.admin-students-table td {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 1439px) {
  .admin-students-toolbar {
    padding: 14px;
    border-radius: 14px;
  }

  .admin-students-toolbar-grid {
    grid-template-columns: minmax(0, 1fr) minmax(150px, 190px) 112px;
    gap: 10px;
  }

  .admin-students-search {
    height: 40px;
    font-size: 13px;
  }

  .admin-students-table-card {
    border-radius: 14px;
  }

  .admin-students-table th,
  .admin-students-table td {
    padding-inline: 12px;
  }

  .admin-students-table thead tr {
    height: 44px;
    font-size: 11px;
  }

  .admin-students-row {
    height: 54px;
    font-size: 13px;
  }

  .admin-students-action-button {
    min-height: 32px;
    height: 32px;
    padding-inline: 10px;
    font-size: 12px;
  }
}

@media (max-height: 820px) {
  .admin-students-toolbar {
    padding: 12px;
    border-radius: 12px;
  }

  .admin-students-toolbar-grid {
    grid-template-columns: minmax(0, 1fr) minmax(145px, 180px) 108px;
    gap: 8px;
  }

  .admin-students-search {
    height: 38px;
    border-radius: 10px;
    font-size: 13px;
  }

  .admin-students-table-card {
    border-radius: 12px;
  }

  .admin-students-table th,
  .admin-students-table td {
    padding-inline: 10px;
  }

  .admin-students-table thead tr {
    height: 40px;
  }

  .admin-students-row {
    height: 48px;
    font-size: 12px;
  }

  .admin-students-action-button {
    min-height: 30px;
    height: 30px;
    padding-inline: 9px;
    border-radius: 10px;
  }
}
</style>

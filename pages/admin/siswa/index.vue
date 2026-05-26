<script setup lang="ts">
import {
  BadgeCheck,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Eye,
  GraduationCap,
  Search,
  UserRound,
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
      <section class="shrink-0 rounded-2xl border border-border bg-bg-surface p-4">
        <div class="grid grid-cols-[minmax(360px,1fr)_220px_140px] gap-4">
          <div class="relative">
            <Search class="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-text-muted" />
            <input
              v-model="searchQuery"
              type="search"
              placeholder="Cari nama, NIS, NISN, atau asal sekolah..."
              class="h-11 w-full rounded-xl border border-border-soft bg-bg-base py-2.5 pl-10 pr-4 text-sm leading-none text-text-primary outline-none transition-colors placeholder:text-text-muted hover:bg-bg-surface focus:border-brand focus:bg-bg-surface focus:ring-[3px] focus:ring-brand/12"
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

      <section class="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-bg-surface">
        <div class="min-h-0 flex-1 overflow-auto">
          <table class="w-full border-collapse text-left">
            <thead class="sticky top-0 z-10 bg-bg-base">
              <tr class="h-12 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                <th class="w-14 px-4">No</th>
                <th class="w-40 px-4">
                  <button class="flex items-center gap-2 uppercase" @click="handleSort('nis')">
                    NIS
                    <component :is="getSortIcon('nis')" class="h-3.5 w-3.5" :class="sortKey === 'nis' ? 'text-brand' : 'text-text-muted'" />
                  </button>
                </th>
                <th class="min-w-52 px-4">
                  <button class="flex items-center gap-2 uppercase" @click="handleSort('nama')">
                    Nama Siswa
                    <component :is="getSortIcon('nama')" class="h-3.5 w-3.5" :class="sortKey === 'nama' ? 'text-brand' : 'text-text-muted'" />
                  </button>
                </th>
                <th class="w-[136px] px-4">NISN</th>
                <th class="min-w-48 px-4">Asal Sekolah</th>
                <th class="w-32 px-4">Program</th>
                <th class="w-44 px-4">
                  <button class="flex items-center gap-2 uppercase" @click="handleSort('tanggal')">
                    Tanggal Diterima
                    <component :is="getSortIcon('tanggal')" class="h-3.5 w-3.5" :class="sortKey === 'tanggal' ? 'text-brand' : 'text-text-muted'" />
                  </button>
                </th>
                <th class="w-32 px-4">Status</th>
                <th class="w-36 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-primary-50">
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
                class="h-[60px] text-sm text-text-primary transition-colors hover:bg-bg-base"
              >
                <td class="px-4 text-text-secondary">{{ paginationStart + index }}</td>
                <td class="px-4 text-text-primary">{{ item.nis }}</td>
                <td class="px-4">
                  <p class="text-text-primary">{{ item.nama }}</p>
                </td>
                <td class="px-4 text-text-primary">{{ item.nisn || '-' }}</td>
                <td class="px-4 text-text-secondary">{{ item.sekolah || '-' }}</td>
                <td class="px-4 text-text-primary">{{ item.program }}</td>
                <td class="px-4 text-text-secondary">{{ formatDate(item.tanggalDiterima) }}</td>
                <td class="px-4">
                  <span class="inline-flex items-center gap-1.5 rounded-full bg-status-approved-bg px-3 py-0.5 text-xs font-normal text-status-approved-text">
                    <BadgeCheck class="h-3.5 w-3.5" />
                    {{ item.status }}
                  </span>
                </td>
                <td class="px-4 text-center">
                  <button
                    type="button"
                    class="inline-flex h-9 items-center gap-2 rounded-xl border border-border-soft bg-bg-base px-3 text-sm font-normal text-text-secondary transition-colors hover:bg-bg-surface hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/20"
                    @click="openDetail(item)"
                  >
                    <Eye class="h-4 w-4" />
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
        <aside class="ml-auto flex h-full w-[min(760px,calc(100%-320px))] flex-col overflow-hidden border-l-2 border-border bg-bg-base shadow-[rgba(0,0,0,0.08)_-12px_0_32px_0]">
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

              <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-brand">
                <UserRound class="h-7 w-7" />
              </div>

              <div class="min-w-0 grow">
                <h2 class="truncate font-heading text-[22px] font-bold leading-[1.18] tracking-[-0.3px] text-text-primary">
                  {{ selectedItem.nama }}
                </h2>
                <p class="mt-1 truncate text-sm font-medium leading-[1.43] text-text-secondary">
                  NIS {{ selectedItem.nis }}
                  <span class="mx-1.5 opacity-40">·</span>
                  {{ selectedItem.program }}
                </p>
                <div class="mt-3 flex flex-wrap items-center gap-2">
                  <span class="inline-flex items-center gap-1.5 rounded-full bg-status-approved-bg px-3 py-0.5 text-xs font-medium text-status-approved-text">
                    <BadgeCheck class="h-3.5 w-3.5" />
                    Siswa {{ selectedItem.status }}
                  </span>
                  <span v-if="selectedItem.gelombang" class="rounded-full bg-primary-50 px-3 py-0.5 text-xs font-medium text-brand">
                    Gelombang {{ selectedItem.gelombang }}
                  </span>
                </div>
              </div>
            </div>
          </header>

          <main class="min-h-0 grow overflow-y-auto px-8 py-6">
            <div class="grid grid-cols-2 gap-4">
              <section class="overflow-hidden rounded-2xl border border-border bg-bg-surface">
                <div class="border-b border-border bg-bg-base px-6 py-3">
                  <h3 class="text-[11px] font-bold uppercase tracking-widest text-text-muted">Identitas Siswa</h3>
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
                </div>
              </section>

              <section class="overflow-hidden rounded-2xl border border-border bg-bg-surface">
                <div class="border-b border-border bg-bg-base px-6 py-3">
                  <h3 class="text-[11px] font-bold uppercase tracking-widest text-text-muted">Akademik</h3>
                </div>
                <div class="grid grid-cols-2 gap-x-8 gap-y-5 p-6">
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
                </div>
              </section>

              <section class="col-span-2 overflow-hidden rounded-2xl border border-border bg-bg-surface">
                <div class="border-b border-border bg-bg-base px-6 py-3">
                  <h3 class="text-[11px] font-bold uppercase tracking-widest text-text-muted">Kontak</h3>
                </div>
                <div class="grid grid-cols-2 gap-x-8 gap-y-5 p-6">
                  <div>
                    <p class="mb-1 text-[11px] font-semibold uppercase tracking-wider text-text-muted">No. HP</p>
                    <p class="text-[15px] font-medium text-text-primary">{{ selectedItem.hp || '-' }}</p>
                  </div>
                  <div>
                    <p class="mb-1 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Email</p>
                    <p class="text-[15px] font-medium text-text-primary">{{ selectedItem.email || '-' }}</p>
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

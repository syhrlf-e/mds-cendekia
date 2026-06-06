<script setup lang="ts">
import {
  Users,
  GraduationCap,
  Newspaper,
  CalendarDays,
  FileText,
  Clock,
  Activity,
  AlertCircle
} from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'

definePageMeta({
  layout: 'admin',
  middleware: ['admin-auth']
})

useHead({ title: 'Dashboard | MDS Cendekia' })
const {
  dashboardSummary: summaryData,
  dashboardSummaryLoading: isLoading,
  dashboardSummaryError,
  loadDashboardSummary
} = useAdminDataCache()
const errorMessage = ref('')

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return dateString
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const formatShortDate = (dateString: string) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return dateString
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date)
}

const totalDistribution = computed(() => {
  return summaryData.value.distribusi_program_paket.reduce((acc, curr) => acc + curr.total, 0)
})

const getStatusBadgeClass = (status: string | null | undefined) => {
  const normalized = String(status || '').toLowerCase()
  if (normalized.includes('verifikasi')) return 'bg-amber-100 text-amber-700 border-amber-200'
  if (normalized.includes('belum lengkap')) return 'bg-rose-100 text-rose-700 border-rose-200'
  if (normalized.includes('aktif') || normalized.includes('sesuai')) return 'bg-emerald-100 text-emerald-700 border-emerald-200'
  return 'bg-gray-100 text-gray-700 border-gray-200'
}

const fetchSummary = async () => {
  errorMessage.value = ''

  await loadDashboardSummary()

  errorMessage.value = dashboardSummaryError.value
}

onMounted(fetchSummary)

watch(dashboardSummaryError, (message) => {
  errorMessage.value = message
})
</script>

<template>
  <div class="flex h-full min-h-0 flex-col gap-6 p-1">
    <div v-if="errorMessage" class="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-800">
      {{ errorMessage }}
    </div>

    <!-- Top Section: 3 KPI Cards -->
    <section class="grid shrink-0 grid-cols-1 md:grid-cols-3 gap-6">
      <article class="flex items-center gap-5 rounded-2xl border border-border-soft bg-white p-6 transition-colors hover:border-border">
        <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand">
          <Users class="h-6 w-6" />
        </div>
        <div>
          <p class="text-sm font-medium text-text-secondary">Total Pendaftar</p>
          <p class="mt-1 text-3xl font-bold tracking-tight text-text-primary">
            {{ isLoading ? '...' : summaryData.total_pendaftar }}
          </p>
        </div>
      </article>

      <article class="flex items-center gap-5 rounded-2xl border border-border-soft bg-white p-6 transition-colors hover:border-border">
        <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-success/10 text-success">
          <GraduationCap class="h-6 w-6" />
        </div>
        <div>
          <p class="text-sm font-medium text-text-secondary">Total Siswa</p>
          <p class="mt-1 text-3xl font-bold tracking-tight text-text-primary">
            {{ isLoading ? '...' : summaryData.total_siswa }}
          </p>
        </div>
      </article>

      <article class="flex items-center gap-5 rounded-2xl border border-border-soft bg-white p-6 transition-colors hover:border-border">
        <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
          <Newspaper class="h-6 w-6" />
        </div>
        <div>
          <p class="text-sm font-medium text-text-secondary">Total Berita</p>
          <p class="mt-1 text-3xl font-bold tracking-tight text-text-primary">
            {{ isLoading ? '...' : summaryData.total_berita }}
          </p>
        </div>
      </article>
    </section>

    <!-- Middle Section: Distribusi & Status -->
    <section class="grid shrink-0 grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Distribusi Program Paket -->
      <article class="flex flex-col rounded-2xl border border-border-soft bg-white p-6">
        <div class="mb-6 flex items-center gap-3">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bg-base text-text-secondary">
            <Activity class="h-5 w-5" />
          </div>
          <div>
            <h2 class="text-base font-semibold text-text-primary">Distribusi Program Paket</h2>
            <p class="text-sm text-text-secondary">Sebaran pendaftar berdasarkan program pilihan</p>
          </div>
        </div>

        <div class="flex-1 space-y-5">
          <div v-if="isLoading" class="space-y-4">
            <div v-for="item in 3" :key="item" class="space-y-2">
              <div class="h-4 w-36 animate-pulse rounded bg-bg-base"></div>
              <div class="h-2.5 w-full animate-pulse rounded-full bg-bg-base"></div>
            </div>
          </div>
          <div v-for="item in summaryData.distribusi_program_paket" :key="item.program">
            <div class="mb-2 flex items-center justify-between text-sm">
              <span class="font-medium text-text-primary">{{ item.program }}</span>
              <span class="text-text-secondary">{{ item.total }} Pendaftar</span>
            </div>
            <div class="h-2.5 w-full overflow-hidden rounded-full bg-bg-base">
              <div
                class="h-full rounded-full bg-brand transition-all duration-500"
                :style="{ width: `${totalDistribution > 0 ? (item.total / totalDistribution) * 100 : 0}%` }"
              ></div>
            </div>
          </div>
          <p v-if="!isLoading && !summaryData.distribusi_program_paket.length" class="text-sm text-text-muted italic">Belum ada distribusi program.</p>
        </div>
      </article>

      <!-- Status Gelombang & Program Aktif -->
      <article class="flex flex-col rounded-2xl border border-border-soft bg-white p-6">
        <div class="mb-6 flex items-center gap-3">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bg-base text-text-secondary">
            <CalendarDays class="h-5 w-5" />
          </div>
          <div>
            <h2 class="text-base font-semibold text-text-primary">Status PPDB Saat Ini</h2>
            <p class="text-sm text-text-secondary">Informasi gelombang dan program aktif</p>
          </div>
        </div>

        <div class="flex-1 flex flex-col gap-5">
          <!-- Gelombang Aktif -->
          <div class="rounded-xl border border-border-soft bg-bg-surface p-4">
            <p class="mb-3 text-sm font-semibold text-text-secondary uppercase tracking-wider">Gelombang Berjalan</p>
            <div v-if="summaryData.gelombang.length" class="space-y-3">
              <div v-for="gel in summaryData.gelombang" :key="gel.order" class="flex items-center justify-between">
                <div>
                  <p class="font-medium text-text-primary">Gelombang {{ gel.order }}</p>
                  <p class="mt-0.5 text-xs text-text-secondary flex items-center gap-1.5">
                    <Clock class="h-3 w-3" />
                    {{ formatShortDate(gel.mulai) }} - {{ formatShortDate(gel.selesai) }}
                  </p>
                </div>
                <span class="inline-flex rounded-full bg-status-approved-bg px-2.5 py-1 text-xs font-medium text-status-approved-text border border-status-approved-text/20">
                  {{ gel.status }}
                </span>
              </div>
            </div>
            <div v-else class="text-sm text-text-muted italic">Tidak ada gelombang aktif.</div>
          </div>

          <!-- Program Aktif -->
          <div class="rounded-xl border border-border-soft bg-bg-surface p-4">
            <p class="mb-3 text-sm font-semibold text-text-secondary uppercase tracking-wider">Program Dibuka</p>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="prog in summaryData.program_paket"
                :key="prog.nama"
                class="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-sm font-medium text-text-primary"
              >
                <span class="h-1.5 w-1.5 rounded-full bg-success"></span>
                {{ prog.nama }}
              </span>
              <span v-if="!summaryData.program_paket.length" class="text-sm text-text-muted italic">Tidak ada program.</span>
            </div>
          </div>
        </div>
      </article>
    </section>

    <!-- Bottom Section: Pendaftar Perlu Aksi & Aktivitas PPDB -->
    <section class="grid flex-1 grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6 min-h-0 pb-6">

      <!-- Pendaftar Perlu Aksi -->
      <article class="flex flex-col min-h-0 overflow-hidden rounded-2xl border border-border-soft bg-white">
        <div class="flex items-center justify-between border-b border-border-soft px-6 py-5">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <AlertCircle class="h-5 w-5" />
            </div>
            <div>
              <h2 class="text-base font-semibold text-text-primary">Perlu Tindakan</h2>
              <p class="text-sm text-text-secondary">Pendaftar yang berkasnya menunggu verifikasi admin</p>
            </div>
          </div>
        </div>

        <div class="flex-1 overflow-auto">
          <table class="w-full text-left text-sm whitespace-nowrap">
            <thead class="sticky top-0 bg-bg-surface text-xs font-semibold uppercase tracking-wider text-text-secondary border-b border-border-soft">
              <tr>
                <th class="px-6 py-4">Pendaftar</th>
                <th class="px-6 py-4">Program</th>
                <th class="px-6 py-4">Status Berkas</th>
                <th class="px-6 py-4">Tanggal Masuk</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border-soft">
              <tr
                v-for="(item, index) in summaryData.pendaftar_perlu_aksi"
                :key="index"
                class="transition-colors hover:bg-bg-base/50"
              >
                <td class="px-6 py-4 font-medium text-text-primary">{{ item.nama }}</td>
                <td class="px-6 py-4 text-text-secondary">{{ item.program_paket }}</td>
                <td class="px-6 py-4">
                  <span class="inline-flex rounded-full px-2.5 py-1 text-xs font-medium border" :class="getStatusBadgeClass(item.status_berkas)">
                    {{ item.status_berkas }}
                  </span>
                </td>
                <td class="px-6 py-4 text-text-secondary">{{ formatDate(item.created_at) }}</td>
              </tr>
              <tr v-if="!summaryData.pendaftar_perlu_aksi.length">
                <td colspan="4" class="px-6 py-10 text-center text-text-muted italic">Tidak ada pendaftar yang menunggu aksi.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>

      <!-- Aktivitas PPDB Terbaru -->
      <article class="flex flex-col min-h-0 overflow-hidden rounded-2xl border border-border-soft bg-white">
        <div class="flex items-center gap-3 border-b border-border-soft px-6 py-5">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bg-base text-text-secondary">
            <FileText class="h-5 w-5" />
          </div>
          <div>
            <h2 class="text-base font-semibold text-text-primary">Aktivitas Terbaru</h2>
            <p class="text-sm text-text-secondary">Log riwayat kegiatan PPDB</p>
          </div>
        </div>

        <div class="flex-1 overflow-auto p-6">
          <div class="relative space-y-6 before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border-soft before:to-transparent">

            <div
              v-for="(act, index) in summaryData.aktivitas_ppdb"
              :key="index"
              class="relative flex items-start gap-4"
            >
              <div class="absolute left-2 top-2 h-2 w-2 -translate-x-1/2 rounded-full border-2 border-white bg-brand shadow-sm"></div>
              <div class="pl-6">
                <p class="text-sm font-medium text-text-primary">{{ act.nama }}</p>
                <p class="mt-1 text-xs text-text-secondary">{{ formatDate(act.created_at) }}</p>
              </div>
            </div>

            <div v-if="!summaryData.aktivitas_ppdb.length" class="text-center text-sm text-text-muted italic py-4">
              Belum ada aktivitas.
            </div>

          </div>
        </div>
      </article>

    </section>
  </div>
</template>

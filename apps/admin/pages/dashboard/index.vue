<script setup lang="ts">
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  GraduationCap,
  LayoutDashboard,
  Newspaper,
  UserCheck,
  UserRound,
  Users,
  XCircle
} from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import { isDashboardBerkasVerifiedText, useAdminDashboardService } from '~/services/useAdminDashboardService'
import type { AdminSummaryDto, DashboardActivity, DashboardRegistration, DashboardTimeline } from '~/types/adminDashboard'
import type { RegistrationStatus } from '~/types/adminPendaftaran'

definePageMeta({
  layout: 'admin',
  middleware: ['admin-auth']
})

useHead({ title: 'Dashboard | MDS Cendekia' })

const { getDashboardData } = useAdminDashboardService()
const { prefetchAdminData } = useAdminDataCache()
const isLoading = ref(true)
const loadError = ref('')
const registrations = ref<DashboardRegistration[]>([])
const timelineItems = ref<DashboardTimeline[]>([])
const totalStudents = ref(0)
const summary = ref<AdminSummaryDto | null>(null)

const isBerkasVerifiedText = (status: string) => {
  return isDashboardBerkasVerifiedText(status)
}

const isBerkasRejectedText = (status: string) => {
  const normalized = status.toLowerCase()
  return normalized.includes('tolak') || normalized.includes('rejected') || normalized.includes('tidak valid')
}

const loadDashboard = async () => {
  isLoading.value = true
  loadError.value = ''

  const dashboardData = await getDashboardData()

  registrations.value = dashboardData.registrations
  timelineItems.value = dashboardData.timelineItems
  totalStudents.value = dashboardData.totalStudents
  summary.value = dashboardData.summary

  if (dashboardData.hasCriticalError) {
    loadError.value = 'Ringkasan dashboard belum bisa diambil dari server.'
  }

  isLoading.value = false
}

const counts = computed(() => {
  const total = summary.value?.total_pendaftar ?? summary.value?.total ?? registrations.value.length
  const accepted = summary.value?.diterima ?? registrations.value.filter(item => item.status === 'approved').length
  const rejected = summary.value?.ditolak ?? registrations.value.filter(item => item.status === 'rejected').length
  const pending = summary.value?.menunggu ?? registrations.value.filter(item => item.status === 'pending').length
  const verifiedFiles = summary.value?.berkas_terverifikasi ?? summary.value?.berkas_disetujui ?? registrations.value.filter(item => isBerkasVerifiedText(item.statusBerkas)).length
  const students = summary.value?.total_siswa ?? summary.value?.siswa ?? totalStudents.value
  const news = summary.value?.total_berita ?? summary.value?.berita ?? 0

  return {
    total,
    pending,
    verifiedFiles,
    accepted,
    rejected,
    students,
    news
  }
})

const kpiCards = computed(() => [
  {
    label: 'Total Pendaftar',
    value: counts.value.total,
    helper: 'Semua data masuk',
    icon: Users,
    tone: 'bg-primary-50 text-brand'
  },
  {
    label: 'Menunggu Verifikasi',
    value: counts.value.pending,
    helper: 'Perlu dicek admin',
    icon: Clock3,
    tone: 'bg-status-pending-bg text-status-pending-text'
  },
  {
    label: 'Diterima',
    value: counts.value.accepted,
    helper: 'Lolos seleksi',
    icon: UserCheck,
    tone: 'bg-status-approved-bg text-status-approved-text'
  },
  {
    label: 'Siswa Terdaftar',
    value: counts.value.students,
    helper: 'Sudah punya NIS',
    icon: GraduationCap,
    tone: 'bg-bg-base text-text-secondary'
  },
  {
    label: 'Total Berita',
    value: counts.value.news,
    helper: 'Konten sekolah',
    icon: Newspaper,
    tone: 'bg-bg-base text-text-secondary'
  }
])

const programDistribution = computed(() => {
  const countByProgram = new Map<string, number>()
  registrations.value.forEach((item) => {
    countByProgram.set(item.program, (countByProgram.get(item.program) || 0) + 1)
  })

  return [...countByProgram.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 4)
})

const recentRegistrations = computed(() => {
  return [...registrations.value]
    .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
    .slice(0, 6)
})

const actionRows = computed(() => {
  return registrations.value
    .filter(item => item.status === 'pending')
    .sort((a, b) => {
      const priorityA = isBerkasVerifiedText(a.statusBerkas) ? 0 : isBerkasRejectedText(a.statusBerkas) ? 2 : 1
      const priorityB = isBerkasVerifiedText(b.statusBerkas) ? 0 : isBerkasRejectedText(b.statusBerkas) ? 2 : 1
      if (priorityA !== priorityB) return priorityA - priorityB
      return new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
    })
    .slice(0, 5)
})

const activities = computed<DashboardActivity[]>(() => {
  return recentRegistrations.value.map((item) => {
    if (item.status === 'approved') {
      return {
        id: `approved-${item.id}`,
        title: 'Pendaftar diterima',
        description: item.nama,
        date: item.tanggal,
        tone: 'approved'
      }
    }

    if (item.status === 'rejected') {
      return {
        id: `rejected-${item.id}`,
        title: 'Pendaftar ditolak',
        description: item.nama,
        date: item.tanggal,
        tone: 'rejected'
      }
    }

    return {
      id: `pending-${item.id}`,
      title: isBerkasVerifiedText(item.statusBerkas) ? 'Berkas siap diputuskan' : 'Pendaftar baru masuk',
      description: item.nama,
      date: item.tanggal,
      tone: isBerkasVerifiedText(item.statusBerkas) ? 'approved' : 'pending'
    }
  })
})

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

const formatLongDate = (date: string) => {
  if (!date) return '-'
  const parsedDate = new Date(date)
  if (Number.isNaN(parsedDate.getTime())) return date

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(parsedDate)
}

const registrationPeriod = computed(() => {
  return timelineItems.value.find(item => item.judul.toLowerCase().includes('pendaftaran')) || null
})

const registrationPeriodStatus = computed(() => {
  const period = registrationPeriod.value
  if (!period || period.status === 'nonaktif') return 'Nonaktif'

  const now = new Date()
  const start = new Date(`${period.tanggalMulai}T00:00:00`)
  const end = new Date(`${period.tanggalSelesai || period.tanggalMulai}T23:59:59`)

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 'Belum Diatur'
  if (now < start) return 'Belum Mulai'
  if (now > end) return 'Selesai'
  return 'Aktif'
})

const registrationPeriodStatusClass = computed(() => {
  if (registrationPeriodStatus.value === 'Aktif') return 'bg-status-approved-bg text-status-approved-text'
  if (registrationPeriodStatus.value === 'Selesai' || registrationPeriodStatus.value === 'Nonaktif') return 'bg-status-rejected-bg text-status-rejected-text'
  return 'bg-status-pending-bg text-status-pending-text'
})

const statusClass = (status: RegistrationStatus) => {
  if (status === 'approved') return 'bg-status-approved-bg text-status-approved-text'
  if (status === 'rejected') return 'bg-status-rejected-bg text-status-rejected-text'
  return 'bg-status-pending-bg text-status-pending-text'
}

const activityToneClass = (tone: DashboardActivity['tone']) => {
  if (tone === 'approved') return 'bg-status-approved-bg text-status-approved-text'
  if (tone === 'rejected') return 'bg-status-rejected-bg text-status-rejected-text'
  return 'bg-status-pending-bg text-status-pending-text'
}

onMounted(() => {
  void prefetchAdminData()
  loadDashboard()
})
</script>

<template>
  <div class="flex h-full min-h-0 flex-col gap-4">
    <section
      v-if="loadError && !isLoading"
      class="rounded-2xl border border-error/20 bg-status-rejected-bg px-5 py-4 text-sm text-status-rejected-text"
    >
      <div class="flex items-center gap-3">
        <AlertCircle class="h-5 w-5 shrink-0" />
        <p>{{ loadError }}</p>
      </div>
    </section>

    <section class="grid shrink-0 grid-cols-5 gap-3">
      <article
        v-for="card in kpiCards"
        :key="card.label"
        class="rounded-2xl border border-border bg-bg-surface p-4 shadow-sm"
      >
        <div class="mb-4 flex items-center justify-between gap-3">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-xl"
            :class="card.tone"
          >
            <component :is="card.icon" class="h-5 w-5" />
          </div>
        </div>
        <p class="text-xs font-medium uppercase tracking-wider text-text-muted">{{ card.label }}</p>
        <p class="mt-2 text-[28px] font-semibold leading-none tracking-[-0.2px] text-text-primary">
          {{ isLoading ? '...' : card.value }}
        </p>
        <p class="mt-2 text-xs leading-[1.4] text-text-secondary">{{ card.helper }}</p>
      </article>
    </section>

    <div class="grid min-h-[360px] shrink-0 grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)] gap-4">
      <section class="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-bg-surface">
          <div class="flex min-h-16 shrink-0 items-center justify-between gap-4 border-b border-border bg-bg-base px-5 py-3">
            <div>
              <h2 class="text-sm font-semibold text-text-primary">Perlu Aksi</h2>
              <p class="mt-0.5 text-xs text-text-secondary">Pendaftar pending yang paling perlu diperiksa</p>
            </div>
            <NuxtLink
              to="/pendaftaran"
              class="inline-flex h-9 items-center rounded-xl border border-border-soft bg-bg-surface px-3 text-sm font-normal text-text-secondary transition-colors hover:bg-bg-base hover:text-text-primary"
            >
              Lihat semua
            </NuxtLink>
          </div>

          <div class="min-h-0 flex-1 overflow-auto">
            <table class="w-full border-collapse text-left">
              <thead class="sticky top-0 z-10 bg-bg-base">
                <tr class="h-11 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  <th class="px-5">Nama</th>
                  <th class="w-36 px-4">Program</th>
                  <th class="w-44 px-4">Status Berkas</th>
                  <th class="w-36 px-4">Tanggal</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border-soft">
                <tr v-if="isLoading">
                  <td colspan="4" class="px-5 py-12 text-center text-sm text-text-secondary">
                    Memuat antrian...
                  </td>
                </tr>
                <tr v-else-if="!actionRows.length">
                  <td colspan="4" class="px-5 py-12 text-center text-sm text-text-secondary">
                    Belum ada pendaftar yang perlu aksi.
                  </td>
                </tr>
                <tr
                  v-for="item in actionRows"
                  :key="item.id"
                  class="h-[58px] text-sm transition-colors hover:bg-bg-base"
                >
                  <td class="px-5">
                    <p class="text-text-primary">{{ item.nama }}</p>
                    <p class="mt-0.5 text-xs text-text-secondary">{{ item.nisn || item.id }}</p>
                  </td>
                  <td class="px-4 text-text-primary">{{ item.program }}</td>
                  <td class="px-4">
                    <span
                      class="inline-flex items-center rounded-full px-3 py-0.5 text-xs font-normal"
                      :class="isBerkasVerifiedText(item.statusBerkas) ? 'bg-status-approved-bg text-status-approved-text' : isBerkasRejectedText(item.statusBerkas) ? 'bg-status-rejected-bg text-status-rejected-text' : 'bg-status-pending-bg text-status-pending-text'"
                    >
                      {{ item.statusBerkas }}
                    </span>
                  </td>
                  <td class="px-4 text-text-secondary">{{ formatDate(item.tanggal) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

      <section class="rounded-2xl border border-border bg-bg-surface p-5">
          <div class="mb-5 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-brand">
              <CalendarDays class="h-5 w-5" />
            </div>
            <div>
              <h2 class="text-sm font-semibold text-text-primary">Ringkasan PPDB</h2>
              <p class="mt-0.5 text-xs text-text-secondary">Periode aktif saat ini</p>
            </div>
          </div>

          <div class="space-y-3 text-sm">
            <div class="flex items-center justify-between gap-4">
              <span class="text-text-secondary">Status</span>
              <span
                class="rounded-full px-3 py-0.5 text-xs font-normal"
                :class="registrationPeriodStatusClass"
              >
                {{ registrationPeriodStatus }}
              </span>
            </div>
            <div class="flex items-center justify-between gap-4">
              <span class="text-text-secondary">Tanggal buka</span>
              <span class="text-right text-text-primary">{{ formatLongDate(registrationPeriod?.tanggalMulai || '') }}</span>
            </div>
            <div class="flex items-center justify-between gap-4">
              <span class="text-text-secondary">Tanggal tutup</span>
              <span class="text-right text-text-primary">{{ formatLongDate(registrationPeriod?.tanggalSelesai || '') }}</span>
            </div>
            <div class="flex items-center justify-between gap-4">
              <span class="text-text-secondary">Sumber jadwal</span>
              <NuxtLink to="/timeline-ppdb" class="text-brand hover:text-brand-hover">
                Timeline PPDB
              </NuxtLink>
            </div>
          </div>
        </section>
    </div>

    <div class="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_360px] gap-4">
        <section class="min-h-0 overflow-hidden rounded-2xl border border-border bg-bg-surface">
          <div class="border-b border-border bg-bg-base px-5 py-4">
            <h2 class="text-sm font-semibold text-text-primary">Aktivitas Terbaru</h2>
            <p class="mt-0.5 text-xs text-text-secondary">Pergerakan terakhir di PPDB</p>
          </div>

          <div class="min-h-0 overflow-auto p-5">
            <div v-if="isLoading" class="py-10 text-center text-sm text-text-secondary">
              Memuat aktivitas...
            </div>
            <div v-else-if="!activities.length" class="py-10 text-center text-sm text-text-secondary">
              Belum ada aktivitas terbaru.
            </div>
            <div v-else class="grid grid-cols-2 gap-3">
              <div
                v-for="activity in activities"
                :key="activity.id"
                class="flex gap-3 rounded-xl border border-border-soft bg-bg-base px-4 py-3"
              >
                <div
                  class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                  :class="activityToneClass(activity.tone)"
                >
                  <CheckCircle2 v-if="activity.tone === 'approved'" class="h-4 w-4" />
                  <XCircle v-else-if="activity.tone === 'rejected'" class="h-4 w-4" />
                  <UserRound v-else class="h-4 w-4" />
                </div>
                <div class="min-w-0">
                  <p class="text-sm text-text-primary">{{ activity.title }}</p>
                  <p class="truncate text-xs text-text-secondary">{{ activity.description }}</p>
                  <p class="mt-1 text-xs text-text-muted">{{ formatDate(activity.date) }}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="rounded-2xl border border-border bg-bg-surface p-5">
          <div class="mb-4 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-bg-base text-text-secondary">
              <LayoutDashboard class="h-5 w-5" />
            </div>
            <div>
              <h2 class="text-sm font-semibold text-text-primary">Distribusi Program</h2>
              <p class="mt-0.5 text-xs text-text-secondary">Berdasarkan data pendaftar</p>
            </div>
          </div>

          <div class="space-y-3">
            <div
              v-for="item in programDistribution"
              :key="item.label"
              class="flex items-center justify-between gap-4 rounded-xl border border-border-soft bg-bg-base px-4 py-3 text-sm"
            >
              <span class="text-text-secondary">{{ item.label }}</span>
              <span class="text-text-primary">{{ item.value }}</span>
            </div>
            <p v-if="!isLoading && !programDistribution.length" class="py-4 text-center text-sm text-text-secondary">
              Belum ada data program.
            </p>
          </div>
        </section>
    </div>
  </div>
</template>

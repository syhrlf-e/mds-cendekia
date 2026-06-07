import { computed, type Ref } from 'vue'
import type { AdminSummaryDto } from '~/types/adminDashboard'
import { resolveAllowedAdminAssetUrl } from '~/utils/adminAssetUrl'

export type DashboardApplicantMetric = {
  label: string
  value: number
}

export type DashboardSecondaryMetric = DashboardApplicantMetric & {
  title: string
}

export type DashboardQuotaItem = {
  label: string
  used: number
  quota: number
}

export const useDashboardViewModel = (summaryData: Ref<AdminSummaryDto>) => {
  const config = useRuntimeConfig()
  const runningWaves = computed(() => summaryData.value.gelombang.filter(item => item.status).slice(0, 3))
  const activePrograms = computed(() => summaryData.value.program_paket.filter(item => item.status))
  const latestNews = computed(() => summaryData.value.berita_terbaru.slice(0, 3))
  const latestApplicants = computed(() => summaryData.value.pendaftar_terbaru.slice(0, 5))

  const applicantMetrics = computed<DashboardApplicantMetric[]>(() => [
    {
      label: 'Menunggu Verifikasi',
      value: summaryData.value.total_menunggu_verifikasi
    },
    {
      label: 'Pendaftaran Diterima',
      value: summaryData.value.total_pendaftar_diterima
    },
    {
      label: 'Pendaftaran Ditolak',
      value: summaryData.value.total_pendaftar_ditolak
    }
  ])

  const secondaryMetrics = computed<DashboardSecondaryMetric[]>(() => [
    {
      title: 'Data Siswa',
      label: 'Total Siswa',
      value: summaryData.value.total_siswa
    },
    {
      title: 'Galeri',
      label: 'Foto Galeri',
      value: summaryData.value.total_galeri
    },
    {
      title: 'Berita',
      label: 'Berita Aktif',
      value: summaryData.value.total_berita
    }
  ])

  const quotaItems = computed<DashboardQuotaItem[]>(() => summaryData.value.gelombang.slice(0, 3).map(item => ({
    label: `Gelombang ${item.order || '-'}`,
    used: item.total_pendaftar,
    quota: item.kuota
  })))

  const formatRelativeDate = (dateString: string) => {
    if (!dateString) return '-'

    const normalizedDate = dateString.includes('T') ? dateString : dateString.replace(' ', 'T')
    const date = new Date(normalizedDate)
    if (Number.isNaN(date.getTime())) return dateString

    const diffMs = Date.now() - date.getTime()
    const minutes = Math.max(1, Math.floor(diffMs / 60000))
    if (minutes < 60) return `${minutes} menit lalu`

    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} jam lalu`

    const days = Math.floor(hours / 24)
    if (days === 1) return 'kemarin'
    if (days < 7) return `${days} hari lalu`

    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date)
  }

  const resolveAssetUrl = (path: string) => {
    return resolveAllowedAdminAssetUrl(path, {
      apiBaseUrl: String(config.public.apiBaseUrl || ''),
      allowedOrigins: String(config.public.assetAllowedOrigins || '')
    })
  }

  const applicantStatusLabel = (status: boolean) => status ? 'Diterima' : 'Menunggu'
  const applicantStatusClass = (status: boolean) => status
    ? 'bg-success text-white'
    : 'bg-[#ffae00] text-white'

  return {
    latestNews,
    latestApplicants,
    activePrograms,
    runningWaves,
    applicantMetrics,
    secondaryMetrics,
    quotaItems,
    formatRelativeDate,
    resolveAssetUrl,
    applicantStatusLabel,
    applicantStatusClass
  }
}

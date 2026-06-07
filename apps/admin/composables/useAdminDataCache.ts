import { computed } from 'vue'
import { getAdminSessionGeneration } from './useAdminSession'
import { createEmptyDashboardSummary, useAdminDashboardService } from '~/services/useAdminDashboardService'
import { useAdminGalleryService } from '~/services/useAdminGalleryService'
import { useAdminNewsService } from '~/services/useAdminNewsService'
import { useAdminPaketSekolahService } from '~/services/useAdminPaketSekolahService'
import { useAdminPendaftaranService } from '~/services/useAdminPendaftaranService'
import { useAdminSiswaService } from '~/services/useAdminSiswaService'
import { useAdminTimelineService } from '~/services/useAdminTimelineService'
import type { AdminSummaryDto } from '~/types/adminDashboard'
import type { GalleryItem } from '~/types/adminGallery'
import type { AdminNewsItem } from '~/types/adminNews'
import type { PaketSekolah } from '~/types/adminPaketSekolah'
import type { Registration } from '~/types/adminPendaftaran'
import type { Student } from '~/types/adminSiswa'
import type { GelombangTimelineDto } from '~/types/adminTimeline'

type LoadOptions = {
  force?: boolean
  background?: boolean
}

const ADMIN_CACHE_TTL_MS = 2 * 60 * 1000

let pendaftarRequest: Promise<void> | null = null
let studentsRequest: Promise<void> | null = null
let dashboardSummaryRequest: Promise<void> | null = null
let newsRequest: Promise<void> | null = null
let galleryRequest: Promise<void> | null = null
let timelineRequest: Promise<void> | null = null
let packagesRequest: Promise<void> | null = null

const isFresh = (loadedAt: number) => loadedAt > 0 && Date.now() - loadedAt < ADMIN_CACHE_TTL_MS

export const useAdminDataCache = () => {
  const dashboardService = useAdminDashboardService()
  const newsService = useAdminNewsService()
  const galleryService = useAdminGalleryService()
  const timelineService = useAdminTimelineService()
  const paketSekolahService = useAdminPaketSekolahService()
  const pendaftaranService = useAdminPendaftaranService()
  const siswaService = useAdminSiswaService()

  const dashboardSummary = useState<AdminSummaryDto>('admin-cache:dashboard-summary', () => createEmptyDashboardSummary())
  const dashboardSummaryLoadedAt = useState<number>('admin-cache:dashboard-summary-loaded-at', () => 0)
  const dashboardSummaryLoading = useState<boolean>('admin-cache:dashboard-summary-loading', () => false)
  const dashboardSummaryError = useState<string>('admin-cache:dashboard-summary-error', () => '')

  const pendaftar = useState<Registration[]>('admin-cache:pendaftar', () => [])
  const pendaftarLoadedAt = useState<number>('admin-cache:pendaftar-loaded-at', () => 0)
  const pendaftarLoading = useState<boolean>('admin-cache:pendaftar-loading', () => false)
  const pendaftarError = useState<string>('admin-cache:pendaftar-error', () => '')

  const students = useState<Student[]>('admin-cache:students', () => [])
  const studentsLoadedAt = useState<number>('admin-cache:students-loaded-at', () => 0)
  const studentsLoading = useState<boolean>('admin-cache:students-loading', () => false)
  const studentsError = useState<string>('admin-cache:students-error', () => '')

  const news = useState<AdminNewsItem[]>('admin-cache:news', () => [])
  const newsLoadedAt = useState<number>('admin-cache:news-loaded-at', () => 0)
  const newsLoading = useState<boolean>('admin-cache:news-loading', () => false)
  const newsError = useState<string>('admin-cache:news-error', () => '')

  const galleryItems = useState<GalleryItem[]>('admin-cache:gallery', () => [])
  const galleryLoadedAt = useState<number>('admin-cache:gallery-loaded-at', () => 0)
  const galleryLoading = useState<boolean>('admin-cache:gallery-loading', () => false)
  const galleryError = useState<string>('admin-cache:gallery-error', () => '')

  const timelineItems = useState<GelombangTimelineDto[]>('admin-cache:timeline', () => [])
  const timelineLoadedAt = useState<number>('admin-cache:timeline-loaded-at', () => 0)
  const timelineLoading = useState<boolean>('admin-cache:timeline-loading', () => false)
  const timelineError = useState<string>('admin-cache:timeline-error', () => '')

  const packages = useState<PaketSekolah[]>('admin-cache:packages', () => [])
  const packagesLoadedAt = useState<number>('admin-cache:packages-loaded-at', () => 0)
  const packagesLoading = useState<boolean>('admin-cache:packages-loading', () => false)
  const packagesError = useState<string>('admin-cache:packages-error', () => '')

  const hasDashboardSummaryCache = computed(() => dashboardSummaryLoadedAt.value > 0)
  const hasPendaftarCache = computed(() => pendaftarLoadedAt.value > 0)
  const hasStudentsCache = computed(() => studentsLoadedAt.value > 0)
  const hasNewsCache = computed(() => newsLoadedAt.value > 0)
  const hasGalleryCache = computed(() => galleryLoadedAt.value > 0)
  const hasTimelineCache = computed(() => timelineLoadedAt.value > 0)
  const hasPackagesCache = computed(() => packagesLoadedAt.value > 0)

  const readErrorMessage = (error: any, fallback: string) => {
    return error?.data?.message || error?.response?._data?.message || error?.message || fallback
  }

  const fetchDashboardSummary = async (options: LoadOptions = {}) => {
    if (dashboardSummaryRequest) {
      await dashboardSummaryRequest
      return
    }

    const shouldShowLoading = !options.background
    const requestGeneration = getAdminSessionGeneration()
    if (shouldShowLoading) dashboardSummaryLoading.value = true
    dashboardSummaryError.value = ''

    dashboardSummaryRequest = (async () => {
      try {
        const { data, error } = await dashboardService.getDashboardSummary()
        if (requestGeneration !== getAdminSessionGeneration()) return

        if (error) {
          if (options.background && hasDashboardSummaryCache.value) return
          dashboardSummaryError.value = readErrorMessage(error, 'Ringkasan dashboard belum bisa dimuat.')
          return
        }

        dashboardSummary.value = data
        dashboardSummaryLoadedAt.value = Date.now()
      } finally {
        if (shouldShowLoading) dashboardSummaryLoading.value = false
        dashboardSummaryRequest = null
      }
    })()

    await dashboardSummaryRequest
  }

  const fetchPendaftar = async (options: LoadOptions = {}) => {
    if (pendaftarRequest) {
      await pendaftarRequest
      return
    }

    const shouldShowLoading = !options.background
    const requestGeneration = getAdminSessionGeneration()
    if (shouldShowLoading) pendaftarLoading.value = true
    pendaftarError.value = ''

    pendaftarRequest = (async () => {
      try {
        const { data, error } = await pendaftaranService.listPendaftar()
        if (requestGeneration !== getAdminSessionGeneration()) return

        if (error) {
          if (options.background && pendaftar.value.length) return
          pendaftarError.value = readErrorMessage(error, 'Data pendaftar belum bisa diambil.')
          if (!pendaftar.value.length) pendaftar.value = []
          return
        }

        pendaftar.value = data
        pendaftarLoadedAt.value = Date.now()
      } finally {
        if (shouldShowLoading) pendaftarLoading.value = false
        pendaftarRequest = null
      }
    })()

    await pendaftarRequest
  }

  const fetchStudents = async (options: LoadOptions = {}) => {
    if (studentsRequest) {
      await studentsRequest
      return
    }

    const shouldShowLoading = !options.background
    const requestGeneration = getAdminSessionGeneration()
    if (shouldShowLoading) studentsLoading.value = true
    studentsError.value = ''

    studentsRequest = (async () => {
      try {
        const { data, error } = await siswaService.listStudents()
        if (requestGeneration !== getAdminSessionGeneration()) return

        if (error && options.background && students.value.length) return

        students.value = data
        studentsError.value = error ? readErrorMessage(error, 'Data siswa belum bisa diambil dari server.') : ''

        if (!error) {
          studentsLoadedAt.value = Date.now()
        }
      } finally {
        if (shouldShowLoading) studentsLoading.value = false
        studentsRequest = null
      }
    })()

    await studentsRequest
  }

  const fetchNews = async (options: LoadOptions = {}) => {
    if (newsRequest) {
      await newsRequest
      return
    }

    const shouldShowLoading = !options.background
    const requestGeneration = getAdminSessionGeneration()
    if (shouldShowLoading) newsLoading.value = true
    newsError.value = ''

    newsRequest = (async () => {
      try {
        const { data, error } = await newsService.listNews()
        if (requestGeneration !== getAdminSessionGeneration()) return

        if (error) {
          if (options.background && news.value.length) return
          newsError.value = readErrorMessage(error, 'Data berita belum bisa diambil dari server.')
          if (!news.value.length) news.value = []
          return
        }

        news.value = data
        newsLoadedAt.value = Date.now()
      } finally {
        if (shouldShowLoading) newsLoading.value = false
        newsRequest = null
      }
    })()

    await newsRequest
  }

  const fetchGallery = async (options: LoadOptions = {}) => {
    if (galleryRequest) {
      await galleryRequest
      return
    }

    const shouldShowLoading = !options.background
    const requestGeneration = getAdminSessionGeneration()
    if (shouldShowLoading) galleryLoading.value = true
    galleryError.value = ''

    galleryRequest = (async () => {
      try {
        const { data, error } = await galleryService.listGallery()
        if (requestGeneration !== getAdminSessionGeneration()) return

        if (error) {
          if (options.background && galleryItems.value.length) return
          galleryError.value = readErrorMessage(error, 'Data galeri belum bisa diambil dari server.')
          if (!galleryItems.value.length) galleryItems.value = []
          return
        }

        galleryItems.value = data
        galleryLoadedAt.value = Date.now()
      } finally {
        if (shouldShowLoading) galleryLoading.value = false
        galleryRequest = null
      }
    })()

    await galleryRequest
  }

  const fetchTimeline = async (options: LoadOptions = {}) => {
    if (timelineRequest) {
      await timelineRequest
      return
    }

    const shouldShowLoading = !options.background
    const requestGeneration = getAdminSessionGeneration()
    if (shouldShowLoading) timelineLoading.value = true
    timelineError.value = ''

    timelineRequest = (async () => {
      try {
        const { data, error } = await timelineService.listTimelines()
        if (requestGeneration !== getAdminSessionGeneration()) return

        if (error || !data?.success) {
          if (options.background && timelineItems.value.length) return
          timelineError.value = readErrorMessage(error, 'Data pelaksanaan PPDB belum bisa diambil dari server.')
          if (!timelineItems.value.length) timelineItems.value = []
          return
        }

        timelineItems.value = data.data || []
        timelineLoadedAt.value = Date.now()
      } finally {
        if (shouldShowLoading) timelineLoading.value = false
        timelineRequest = null
      }
    })()

    await timelineRequest
  }

  const fetchPackages = async (options: LoadOptions = {}) => {
    if (packagesRequest) {
      await packagesRequest
      return
    }

    const shouldShowLoading = !options.background
    const requestGeneration = getAdminSessionGeneration()
    if (shouldShowLoading) packagesLoading.value = true
    packagesError.value = ''

    packagesRequest = (async () => {
      try {
        const { data, error } = await paketSekolahService.listPackages()
        if (requestGeneration !== getAdminSessionGeneration()) return

        if (error) {
          if (options.background && packages.value.length) return
          packagesError.value = readErrorMessage(error, 'Data paket sekolah belum bisa diambil dari server.')
          if (!packages.value.length) packages.value = []
          return
        }

        packages.value = data
        packagesLoadedAt.value = Date.now()
      } finally {
        if (shouldShowLoading) packagesLoading.value = false
        packagesRequest = null
      }
    })()

    await packagesRequest
  }

  const loadDashboardSummary = async (options: LoadOptions = {}) => {
    if (!options.force && hasDashboardSummaryCache.value) {
      if (!isFresh(dashboardSummaryLoadedAt.value)) void fetchDashboardSummary({ background: true })
      return
    }

    await fetchDashboardSummary(options)
  }

  const loadPendaftar = async (options: LoadOptions = {}) => {
    if (!options.force && hasPendaftarCache.value) {
      if (!isFresh(pendaftarLoadedAt.value)) void fetchPendaftar({ background: true })
      return
    }

    await fetchPendaftar(options)
  }

  const loadStudents = async (options: LoadOptions = {}) => {
    if (!options.force && hasStudentsCache.value) {
      if (!isFresh(studentsLoadedAt.value)) void fetchStudents({ background: true })
      return
    }

    await fetchStudents(options)
  }

  const loadNews = async (options: LoadOptions = {}) => {
    if (!options.force && hasNewsCache.value) {
      if (!isFresh(newsLoadedAt.value)) void fetchNews({ background: true })
      return
    }

    await fetchNews(options)
  }

  const loadGallery = async (options: LoadOptions = {}) => {
    if (!options.force && hasGalleryCache.value) {
      if (!isFresh(galleryLoadedAt.value)) void fetchGallery({ background: true })
      return
    }

    await fetchGallery(options)
  }

  const loadTimeline = async (options: LoadOptions = {}) => {
    if (!options.force && hasTimelineCache.value) {
      if (!isFresh(timelineLoadedAt.value)) void fetchTimeline({ background: true })
      return
    }

    await fetchTimeline(options)
  }

  const loadPackages = async (options: LoadOptions = {}) => {
    if (!options.force && hasPackagesCache.value) {
      if (!isFresh(packagesLoadedAt.value)) void fetchPackages({ background: true })
      return
    }

    await fetchPackages(options)
  }

  const refreshDashboardSummary = () => loadDashboardSummary({ force: true })
  const refreshPendaftar = () => loadPendaftar({ force: true })
  const refreshStudents = () => loadStudents({ force: true })
  const refreshNews = () => loadNews({ force: true })
  const refreshGallery = () => loadGallery({ force: true })
  const refreshTimeline = () => loadTimeline({ force: true })
  const refreshPackages = () => loadPackages({ force: true })

  const prefetchAdminData = async () => {
    await Promise.allSettled([
      loadDashboardSummary({ background: hasDashboardSummaryCache.value }),
      loadPendaftar({ background: hasPendaftarCache.value }),
      loadStudents({ background: hasStudentsCache.value }),
      loadTimeline({ background: hasTimelineCache.value }),
      loadPackages({ background: hasPackagesCache.value }),
      loadNews({ background: hasNewsCache.value }),
      loadGallery({ background: hasGalleryCache.value })
    ])
  }

  const clearAdminDataCache = () => {
    dashboardSummary.value = createEmptyDashboardSummary()
    dashboardSummaryLoadedAt.value = 0
    dashboardSummaryError.value = ''
    pendaftar.value = []
    pendaftarLoadedAt.value = 0
    pendaftarError.value = ''
    students.value = []
    studentsLoadedAt.value = 0
    studentsError.value = ''
    news.value = []
    newsLoadedAt.value = 0
    newsError.value = ''
    galleryItems.value = []
    galleryLoadedAt.value = 0
    galleryError.value = ''
    timelineItems.value = []
    timelineLoadedAt.value = 0
    timelineError.value = ''
    packages.value = []
    packagesLoadedAt.value = 0
    packagesError.value = ''
  }

  return {
    dashboardSummary,
    dashboardSummaryLoading,
    dashboardSummaryError,
    pendaftar,
    pendaftarLoading,
    pendaftarError,
    students,
    studentsLoading,
    studentsError,
    news,
    newsLoading,
    newsError,
    galleryItems,
    galleryLoading,
    galleryError,
    timelineItems,
    timelineLoading,
    timelineError,
    packages,
    packagesLoading,
    packagesError,
    loadDashboardSummary,
    loadPendaftar,
    loadStudents,
    loadNews,
    loadGallery,
    loadTimeline,
    loadPackages,
    refreshDashboardSummary,
    refreshPendaftar,
    refreshStudents,
    refreshNews,
    refreshGallery,
    refreshTimeline,
    refreshPackages,
    prefetchAdminData,
    clearAdminDataCache
  }
}

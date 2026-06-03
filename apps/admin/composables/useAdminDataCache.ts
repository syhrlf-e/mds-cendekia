import { computed } from 'vue'
import { useAdminPendaftaranService } from '~/services/useAdminPendaftaranService'
import { useAdminSiswaService } from '~/services/useAdminSiswaService'
import type { Registration } from '~/types/adminPendaftaran'
import type { Student } from '~/types/adminSiswa'

type LoadOptions = {
  force?: boolean
  background?: boolean
}

const ADMIN_CACHE_TTL_MS = 2 * 60 * 1000

let pendaftarRequest: Promise<void> | null = null
let studentsRequest: Promise<void> | null = null

const isFresh = (loadedAt: number) => loadedAt > 0 && Date.now() - loadedAt < ADMIN_CACHE_TTL_MS

export const useAdminDataCache = () => {
  const pendaftaranService = useAdminPendaftaranService()
  const siswaService = useAdminSiswaService()

  const pendaftar = useState<Registration[]>('admin-cache:pendaftar', () => [])
  const pendaftarLoadedAt = useState<number>('admin-cache:pendaftar-loaded-at', () => 0)
  const pendaftarLoading = useState<boolean>('admin-cache:pendaftar-loading', () => false)
  const pendaftarError = useState<string>('admin-cache:pendaftar-error', () => '')

  const students = useState<Student[]>('admin-cache:students', () => [])
  const studentsLoadedAt = useState<number>('admin-cache:students-loaded-at', () => 0)
  const studentsLoading = useState<boolean>('admin-cache:students-loading', () => false)
  const studentsError = useState<string>('admin-cache:students-error', () => '')

  const hasPendaftarCache = computed(() => pendaftarLoadedAt.value > 0)
  const hasStudentsCache = computed(() => studentsLoadedAt.value > 0)

  const readErrorMessage = (error: any, fallback: string) => {
    return error?.data?.message || error?.response?._data?.message || error?.message || fallback
  }

  const fetchPendaftar = async (options: LoadOptions = {}) => {
    if (pendaftarRequest) {
      await pendaftarRequest
      return
    }

    const shouldShowLoading = !options.background
    if (shouldShowLoading) pendaftarLoading.value = true
    pendaftarError.value = ''

    pendaftarRequest = (async () => {
      try {
        const { data, error } = await pendaftaranService.listPendaftar()

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
    if (shouldShowLoading) studentsLoading.value = true
    studentsError.value = ''

    studentsRequest = (async () => {
      try {
        const { data, error } = await siswaService.listStudents()

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

  const refreshPendaftar = () => loadPendaftar({ force: true })
  const refreshStudents = () => loadStudents({ force: true })

  const prefetchAdminData = async () => {
    await Promise.allSettled([
      loadPendaftar({ background: hasPendaftarCache.value }),
      loadStudents({ background: hasStudentsCache.value })
    ])
  }

  const clearAdminDataCache = () => {
    pendaftar.value = []
    pendaftarLoadedAt.value = 0
    pendaftarError.value = ''
    students.value = []
    studentsLoadedAt.value = 0
    studentsError.value = ''
  }

  return {
    pendaftar,
    pendaftarLoading,
    pendaftarError,
    students,
    studentsLoading,
    studentsError,
    loadPendaftar,
    loadStudents,
    refreshPendaftar,
    refreshStudents,
    prefetchAdminData,
    clearAdminDataCache
  }
}

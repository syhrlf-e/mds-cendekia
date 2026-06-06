import { computed, ref, watch } from 'vue'
import type { Ref } from 'vue'
import type { Registration, RegistrationStatus } from '~/types/adminPendaftaran'

type SortKey = 'nama' | 'tanggal' | ''
type SortOrder = 'asc' | 'desc'

export const usePendaftaranList = (registrations: Ref<Registration[]>) => {
  const searchQuery = ref('')
  const debouncedSearch = ref('')
  const filterStatus = ref<RegistrationStatus | ''>('')
  const sortKey = ref<SortKey>('tanggal')
  const sortOrder = ref<SortOrder>('desc')
  const currentPage = ref(1)
  const perPage = ref(10)

  let debounceTimeout: ReturnType<typeof setTimeout> | null = null

  const statusFilterOptions: Array<{ label: string, value: RegistrationStatus | '' }> = [
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

  watch([filterStatus, perPage], () => {
    currentPage.value = 1
  })

  watch(totalPages, value => {
    if (currentPage.value > value) currentPage.value = value
  })

  return {
    searchQuery,
    filterStatus,
    sortKey,
    sortOrder,
    currentPage,
    perPage,
    statusFilterOptions,
    perPageOptions,
    filteredAndSortedData,
    totalPages,
    paginationStart,
    paginatedData,
    handleSearch,
    handleSort,
    formatDate
  }
}

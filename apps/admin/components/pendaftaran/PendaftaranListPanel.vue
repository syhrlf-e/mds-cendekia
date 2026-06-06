<script setup lang="ts">
import type { Registration, RegistrationStatus } from '~/types/adminPendaftaran'

type SortKey = 'nama' | 'tanggal' | ''
type SortOrder = 'asc' | 'desc'

defineProps<{
  searchQuery: string
  filterStatus: RegistrationStatus | ''
  perPage: number
  statusFilterOptions: Array<{ label: string, value: RegistrationStatus | '' }>
  perPageOptions: Array<{ label: string, value: number }>
  items: Registration[]
  isLoading: boolean
  loadError: string
  filteredCount: number
  paginationStart: number
  sortKey: SortKey
  sortOrder: SortOrder
  formatDate: (dateString: string) => string
  currentPage: number
  totalPages: number
}>()

const emit = defineEmits<{
  'update:searchQuery': [value: string]
  'update:filterStatus': [value: RegistrationStatus | '']
  'update:perPage': [value: number]
  'update:currentPage': [value: number]
  search: []
  retry: []
  sort: [key: 'nama' | 'tanggal']
  openDetail: [item: Registration]
}>()
</script>

<template>
  <div class="flex h-full min-h-0 flex-col">
    <div class="flex min-h-0 flex-1 flex-col gap-2">
      <PendaftaranToolbar
        :search-query="searchQuery"
        :filter-status="filterStatus"
        :per-page="perPage"
        :status-filter-options="statusFilterOptions"
        :per-page-options="perPageOptions"
        @update:search-query="emit('update:searchQuery', $event)"
        @update:filter-status="emit('update:filterStatus', $event)"
        @update:per-page="emit('update:perPage', $event)"
        @search="emit('search')"
      />

      <PendaftaranTable
        :items="items"
        :is-loading="isLoading"
        :load-error="loadError"
        :filtered-count="filteredCount"
        :pagination-start="paginationStart"
        :sort-key="sortKey"
        :sort-order="sortOrder"
        :format-date="formatDate"
        @retry="emit('retry')"
        @sort="emit('sort', $event)"
        @open-detail="emit('openDetail', $event)"
      />

      <AppPaginationBar
        :current-page="currentPage"
        :last-page="totalPages"
        :total="filteredCount"
        :disabled="isLoading || !!loadError || filteredCount === 0"
        @page-change="emit('update:currentPage', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronDown, ChevronUp, ChevronsUpDown, Users, XCircle } from 'lucide-vue-next'
import type { Component } from 'vue'
import type { Registration } from '~/types/adminPendaftaran'

type SortKey = 'nama' | 'tanggal' | ''
type SortOrder = 'asc' | 'desc'

defineProps<{
  items: Registration[]
  isLoading: boolean
  loadError: string
  filteredCount: number
  paginationStart: number
  sortKey: SortKey
  sortOrder: SortOrder
  formatDate: (dateString: string) => string
}>()

const emit = defineEmits<{
  retry: []
  sort: [key: 'nama' | 'tanggal']
  openDetail: [item: Registration]
}>()

const getSortIcon = (currentSortKey: SortKey, currentSortOrder: SortOrder, key: 'nama' | 'tanggal'): Component => {
  if (currentSortKey !== key) return ChevronsUpDown
  return currentSortOrder === 'asc' ? ChevronUp : ChevronDown
}

const truncateWords = (value: string, maxWords = 4) => {
  const words = value.trim().split(/\s+/).filter(Boolean)
  if (words.length <= maxWords) return value
  return `${words.slice(0, maxWords).join(' ')}...`
}
</script>

<template>
  <section class="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-bg-surface">
    <div class="min-h-0 flex-1 overflow-auto">
      <table class="admin-registration-table w-full table-fixed border-collapse text-left">
        <thead class="sticky top-0 z-10 bg-bg-base">
          <tr class="admin-registration-head-row h-12 text-xs font-semibold uppercase tracking-wider text-text-secondary">
            <th class="admin-registration-col-no px-4">No</th>
            <th class="admin-registration-col-code px-4">Kode Pendaftaran</th>
            <th class="admin-registration-col-name px-4">
              <button class="flex items-center gap-2 uppercase" @click="emit('sort', 'nama')">
                Nama
                <component :is="getSortIcon(sortKey, sortOrder, 'nama')" class="h-3.5 w-3.5" :class="sortKey === 'nama' ? 'text-brand' : 'text-text-muted'" />
              </button>
            </th>
            <th class="admin-registration-col-nisn px-4">NISN</th>
            <th class="admin-registration-col-school px-4">Asal Sekolah</th>
            <th class="admin-registration-col-date px-4">
              <button class="flex items-center gap-2 uppercase" @click="emit('sort', 'tanggal')">
                Tanggal Daftar
                <component :is="getSortIcon(sortKey, sortOrder, 'tanggal')" class="h-3.5 w-3.5" :class="sortKey === 'tanggal' ? 'text-brand' : 'text-text-muted'" />
              </button>
            </th>
            <th class="admin-registration-col-status px-4">Status</th>
            <th class="admin-registration-col-action px-4 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border-soft">
          <tr v-if="isLoading">
            <td colspan="8">
              <div class="flex min-h-105 items-center justify-center">
                <AppEmptyState
                  title="Memuat data pendaftar"
                  description="Sebentar, data sedang diambil dari server."
                >
                  <template #icon>
                    <Users />
                  </template>
                </AppEmptyState>
              </div>
            </td>
          </tr>
          <tr v-else-if="loadError">
            <td colspan="8">
              <div class="flex min-h-105 items-center justify-center">
                <AppEmptyState
                  title="Data pendaftar belum bisa dimuat"
                  :description="loadError"
                >
                  <template #icon>
                    <XCircle />
                  </template>
                  <template #action>
                    <AppButton variant="primary" @click="emit('retry')">
                      Coba Lagi
                    </AppButton>
                  </template>
                </AppEmptyState>
              </div>
            </td>
          </tr>
          <tr
            v-for="(item, index) in isLoading || loadError ? [] : items"
            :key="item.id"
            class="admin-registration-row h-15 text-sm text-text-primary transition-colors hover:bg-bg-base"
          >
            <td class="admin-registration-col-no px-4 text-text-secondary">{{ paginationStart + index }}</td>
            <td class="admin-registration-col-code px-4 font-medium text-text-primary">
              <span class="block truncate">{{ item.id }}</span>
            </td>
            <td class="admin-registration-col-name px-4">
              <p class="truncate text-text-primary">{{ truncateWords(item.nama, 4) }}</p>
            </td>
            <td class="admin-registration-col-nisn px-4 text-text-primary">
              <span class="block truncate">{{ item.nisn }}</span>
            </td>
            <td class="admin-registration-col-school px-4 text-text-secondary">
              <span class="block truncate">{{ truncateWords(item.sekolah, 4) }}</span>
            </td>
            <td class="admin-registration-col-date px-4 text-text-secondary">{{ formatDate(item.tanggal) }}</td>
            <td class="admin-registration-col-status px-4"><AppBadge :status="item.status" :text="item.statusText" /></td>
            <td class="admin-registration-col-action px-4 text-center">
              <button
                type="button"
                class="admin-registration-detail-button inline-flex h-9 items-center gap-2 rounded-xl border border-border-soft bg-bg-base px-3 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-surface hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/20"
                @click="emit('openDetail', item)"
              >
                Detail
              </button>
            </td>
          </tr>
          <tr v-if="!isLoading && !loadError && filteredCount === 0">
            <td colspan="8">
              <div class="flex min-h-[420px] items-center justify-center">
                <AppEmptyState
                  title="Belum ada data pendaftar"
                  description="Data pendaftar akan muncul di sini"
                >
                  <template #icon>
                    <Users />
                  </template>
                </AppEmptyState>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.admin-registration-col-no {
  width: 5%;
}

.admin-registration-col-code {
  width: 16%;
}

.admin-registration-col-name {
  width: 18%;
}

.admin-registration-col-nisn {
  width: 11%;
}

.admin-registration-col-school {
  width: 17%;
}

.admin-registration-col-date {
  width: 14%;
}

.admin-registration-col-status {
  width: 10%;
}

.admin-registration-col-action {
  width: 9%;
}

@media (max-width: 1439px) {
  .admin-registration-table {
    font-size: 13px;
  }

  .admin-registration-col-no {
    width: 5%;
  }

  .admin-registration-col-code {
    width: 15%;
  }

  .admin-registration-col-name {
    width: 18%;
  }

  .admin-registration-col-nisn {
    width: 10%;
  }

  .admin-registration-col-school {
    width: 16%;
  }

  .admin-registration-col-date {
    width: 13%;
  }

  .admin-registration-col-status {
    width: 12%;
  }

  .admin-registration-col-action {
    width: 11%;
  }

  .admin-registration-head-row > th,
  .admin-registration-row > td {
    padding-left: 10px;
    padding-right: 10px;
  }

  .admin-registration-detail-button {
    height: 34px;
    gap: 6px;
    padding-left: 10px;
    padding-right: 10px;
    font-size: 13px;
  }
}

@media (max-height: 820px) {
  .admin-registration-row {
    height: 52px;
  }

  .admin-registration-head-row {
    height: 44px;
  }
}
</style>

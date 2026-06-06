<script setup lang="ts">
import { ChevronDown, ChevronUp, ChevronsUpDown, Eye, Users, XCircle } from 'lucide-vue-next'
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
</script>

<template>
  <section class="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-bg-surface">
    <div class="min-h-0 flex-1 overflow-auto">
      <table class="w-full border-collapse text-left">
        <thead class="sticky top-0 z-10 bg-bg-base">
          <tr class="h-12 text-xs font-semibold uppercase tracking-wider text-text-secondary">
            <th class="w-14 px-4">No</th>
            <th class="w-52 px-4">Kode Pendaftaran</th>
            <th class="min-w-52 px-4">
              <button class="flex items-center gap-2 uppercase" @click="emit('sort', 'nama')">
                Nama
                <component :is="getSortIcon(sortKey, sortOrder, 'nama')" class="h-3.5 w-3.5" :class="sortKey === 'nama' ? 'text-brand' : 'text-text-muted'" />
              </button>
            </th>
            <th class="w-[136px] px-4">NISN</th>
            <th class="min-w-48 px-4">Asal Sekolah</th>
            <th class="w-48 px-4">
              <button class="flex items-center gap-2 uppercase" @click="emit('sort', 'tanggal')">
                Tanggal Daftar
                <component :is="getSortIcon(sortKey, sortOrder, 'tanggal')" class="h-3.5 w-3.5" :class="sortKey === 'tanggal' ? 'text-brand' : 'text-text-muted'" />
              </button>
            </th>
            <th class="w-40 px-4">Status</th>
            <th class="w-40 px-4 text-center">Aksi</th>
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
            class="h-15 text-sm text-text-primary transition-colors hover:bg-bg-base"
          >
            <td class="px-4 text-text-secondary">{{ paginationStart + index }}</td>
            <td class="px-4 font-medium text-text-primary">{{ item.id }}</td>
            <td class="px-4">
              <p class="text-text-primary">{{ item.nama }}</p>
            </td>
            <td class="px-4 text-text-primary">{{ item.nisn }}</td>
            <td class="px-4 text-text-secondary">{{ item.sekolah }}</td>
            <td class="px-4 text-text-secondary">{{ formatDate(item.tanggal) }}</td>
            <td class="px-4"><AppBadge :status="item.status" :text="item.statusText" /></td>
            <td class="px-4 text-center">
              <button
                type="button"
                class="inline-flex h-9 items-center gap-2 rounded-xl border border-border-soft bg-bg-base px-3 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-surface hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/20"
                @click="emit('openDetail', item)"
              >
                <Eye class="h-4 w-4" />
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

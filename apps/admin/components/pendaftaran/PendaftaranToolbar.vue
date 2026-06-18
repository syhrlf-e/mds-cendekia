<script setup lang="ts">
import { Search } from 'lucide-vue-next'
import type { RegistrationStatus } from '~/types/adminPendaftaran'

defineProps<{
  searchQuery: string
  filterStatus: RegistrationStatus | ''
  perPage: number
  statusFilterOptions: Array<{ label: string, value: RegistrationStatus | '' }>
  perPageOptions: Array<{ label: string, value: number }>
}>()

const emit = defineEmits<{
  'update:searchQuery': [value: string]
  'update:filterStatus': [value: RegistrationStatus | '']
  'update:perPage': [value: number]
  search: []
}>()
</script>

<template>
  <section class="shrink-0 rounded-2xl border border-border bg-bg-surface p-4">
    <div class="grid grid-cols-[minmax(0,1fr)_minmax(170px,220px)_120px] gap-3 2xl:gap-4">
      <div class="relative">
        <Search class="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-text-muted" />
        <input
          :value="searchQuery"
          type="search"
          placeholder="Cari nama, kode pendaftaran, atau NISN..."
          class="h-11 w-full rounded-xl border border-border-soft bg-bg-base py-2.5 pl-10 pr-4 text-sm leading-none text-text-primary outline-none transition-colors placeholder:text-text-muted hover:bg-bg-surface focus:border-brand focus:bg-bg-surface focus:ring-[3px] focus:ring-brand/12"
          @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value); emit('search')"
        >
      </div>

      <div class="relative">
        <AppSelect
          :model-value="filterStatus"
          :options="statusFilterOptions"
          placeholder="Semua Status"
          @update:model-value="emit('update:filterStatus', $event as RegistrationStatus | '')"
        />
      </div>

      <div class="relative">
        <AppSelect
          :model-value="perPage"
          :options="perPageOptions"
          @update:model-value="emit('update:perPage', Number($event))"
        />
      </div>
    </div>
  </section>
</template>

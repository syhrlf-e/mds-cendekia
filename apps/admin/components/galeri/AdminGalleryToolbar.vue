<script setup lang="ts">
import { Plus, Search } from 'lucide-vue-next'

const searchQuery = defineModel<string>('searchQuery', { required: true })

defineEmits<{
  create: []
}>()
</script>

<template>
  <section class="shrink-0 rounded-2xl border border-border bg-bg-surface p-4">
    <div class="grid items-center gap-4 lg:grid-cols-[minmax(320px,1fr)_auto]">
      <div class="relative">
        <Search class="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-text-muted" />
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Cari nama atau deskripsi galeri..."
          class="h-11 w-full rounded-xl border border-border-soft bg-bg-base py-2.5 pl-10 pr-4 text-sm leading-none text-text-primary outline-none transition-colors placeholder:text-text-muted hover:bg-bg-surface focus:border-brand focus:bg-bg-surface focus:ring-[3px] focus:ring-brand/12"
        >
      </div>

      <AppButton
        variant="primary"
        @click="$emit('create')"
      >
        <Plus class="mr-2 h-4 w-4" />
        Tambah Galeri
      </AppButton>
    </div>
  </section>
</template>

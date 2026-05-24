<script setup lang="ts">
import { Newspaper } from 'lucide-vue-next'

definePageMeta({
  layout: 'admin',
  middleware: ['admin-auth']
})

useHead({ title: 'Berita | MDS Cendekia' })
</script>

<template>
  <div class="flex min-h-[calc(100vh-134px)] items-center justify-center">
    <AppEmptyState
      title="Modul berita belum tersedia"
      description="Nanti area ini dipakai untuk tambah, edit, dan hapus berita sekolah."
    >
      <template #icon>
        <Newspaper />
      </template>
    </AppEmptyState>
  </div>
</template>

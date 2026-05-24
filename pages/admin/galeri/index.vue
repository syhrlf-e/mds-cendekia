<script setup lang="ts">
import { Images } from 'lucide-vue-next'

definePageMeta({
  layout: 'admin',
  middleware: ['admin-auth']
})

useHead({ title: 'Galeri | MDS Cendekia' })
</script>

<template>
  <div class="flex min-h-[calc(100vh-134px)] items-center justify-center">
    <AppEmptyState
      title="Modul galeri belum tersedia"
      description="Nanti area ini dipakai untuk mengelola foto dan dokumentasi sekolah."
    >
      <template #icon>
        <Images />
      </template>
    </AppEmptyState>
  </div>
</template>

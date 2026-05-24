<script setup lang="ts">
import { School } from 'lucide-vue-next'

definePageMeta({
  layout: 'admin',
  middleware: ['admin-auth']
})

useHead({ title: 'Profil Sekolah | MDS Cendekia' })
</script>

<template>
  <div class="flex min-h-[calc(100vh-134px)] items-center justify-center">
    <AppEmptyState
      title="Modul profil sekolah belum tersedia"
      description="Nanti area ini dipakai untuk mengelola informasi utama sekolah."
    >
      <template #icon>
        <School />
      </template>
    </AppEmptyState>
  </div>
</template>

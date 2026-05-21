<script setup lang="ts">
import { LayoutDashboard } from 'lucide-vue-next'

definePageMeta({
  layout: 'admin',
  middleware: ['admin-auth']
})

useHead({ title: 'Dashboard | MDS Cendekia' })
</script>

<template>
  <div class="flex min-h-[calc(100vh-64px)] items-center justify-center">
    <AppEmptyState
      title="Dashboard sedang dalam penyempurnaan"
      description="Fitur ini akan segera hadir"
    >
      <template #icon>
        <LayoutDashboard />
      </template>
    </AppEmptyState>
  </div>
</template>

<script setup lang="ts">
import { Wrench } from 'lucide-vue-next'

definePageMeta({
  layout: 'admin',
  middleware: ['admin-auth']
})

useHead({ title: 'Dashboard | Admin PPDB MDS Cendekia' })
</script>

<template>
  <div class="h-full flex flex-col items-center justify-center text-center p-8 animate-in fade-in duration-300">
    <div class="w-24 h-24 bg-primary-50 text-brand rounded-full flex items-center justify-center mb-6">
      <Wrench class="w-12 h-12" />
    </div>
    <h1 class="text-3xl font-heading font-bold text-text-primary mb-3">Dashboard</h1>
    <p class="text-lg text-text-secondary max-w-md">
      Dashboard sedang dalam penyempurnaan. Fitur ini akan segera hadir.
    </p>
  </div>
</template>
<script setup lang="ts">
import { AlertCircle } from 'lucide-vue-next'

useHead({ title: 'Revisi Berkas | PPDB MDS Cendekia' })
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-bg-base p-4">
    <section class="w-full max-w-lg rounded-2xl border border-border bg-bg-surface p-8 text-center">
      <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-status-pending-bg text-status-pending-text">
        <AlertCircle class="h-6 w-6" />
      </div>
      <h1 class="mb-2 font-heading text-2xl font-semibold text-text-primary">
        Link Revisi Diperlukan
      </h1>
      <p class="mb-6 text-sm leading-relaxed text-text-secondary">
        Revisi berkas hanya bisa dibuka melalui link resmi yang diterbitkan oleh API.
      </p>
      <AppButton variant="secondary" @click="$router.push('/ppdb')">
        Kembali ke PPDB
      </AppButton>
    </section>
  </div>
</template>

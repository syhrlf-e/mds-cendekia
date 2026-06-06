<script setup lang="ts">
import type { DashboardLatestNews } from '~/types/adminDashboard'

defineProps<{
  items: DashboardLatestNews[]
  formatRelativeDate: (dateString: string) => string
  resolveAssetUrl: (path: string) => string
}>()
</script>

<template>
  <DashboardPanel
    title="Berita Terbaru"
    class="h-[309px]"
  >
    <div class="space-y-4 px-2 pt-3">
      <div
        v-for="item in items"
        :key="`${item.gambar}-${item.created_at}`"
        class="grid grid-cols-[50px_1fr] gap-3"
      >
        <div class="h-[50px] w-[50px] overflow-hidden rounded-lg bg-[#d9d9d9]">
          <img
            v-if="item.gambar"
            :src="resolveAssetUrl(item.gambar)"
            alt="Gambar berita terbaru"
            class="h-full w-full object-cover"
          >
        </div>
        <div class="min-w-0">
          <p class="line-clamp-2 text-[12px] font-medium leading-[1.25] text-text-primary">
            Judul belum tersedia
          </p>
          <p class="mt-1 text-right text-[11px] text-text-primary/70">
            {{ formatRelativeDate(item.created_at) }}
          </p>
        </div>
      </div>
      <p v-if="!items.length" class="px-1 text-[13px] text-text-muted">Belum ada berita aktif.</p>
    </div>
  </DashboardPanel>
</template>

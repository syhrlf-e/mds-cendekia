<script setup lang="ts">
import { Edit2, Image as ImageIcon, Images, Trash2 } from 'lucide-vue-next'
import type { GalleryItem } from '~/types/adminGallery'

defineProps<{
  loading: boolean
  error: string
  filteredCount: number
  pagedItems: GalleryItem[]
}>()

defineEmits<{
  refresh: []
  create: []
  edit: [item: GalleryItem]
  delete: [item: GalleryItem]
}>()

const formatDate = (dateString: string) => {
  if (!dateString) return '-'

  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return '-'

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}
</script>

<template>
  <section class="min-h-0 flex-1 overflow-auto rounded-2xl border border-border bg-bg-surface p-4">
    <div
      v-if="loading"
      class="flex min-h-[420px] items-center justify-center"
    >
      <AppEmptyState
        title="Memuat data galeri"
        description="Sebentar, data galeri sedang diambil dari server."
      >
        <template #icon>
          <Images />
        </template>
      </AppEmptyState>
    </div>

    <div
      v-else-if="error"
      class="flex min-h-[420px] items-center justify-center"
    >
      <AppEmptyState
        title="Data galeri belum bisa dimuat"
        :description="error"
      >
        <template #icon>
          <Images />
        </template>
        <template #action>
          <AppButton
            variant="primary"
            @click="$emit('refresh')"
          >
            Coba Lagi
          </AppButton>
        </template>
      </AppEmptyState>
    </div>

    <div
      v-else-if="filteredCount === 0"
      class="flex min-h-[420px] items-center justify-center"
    >
      <AppEmptyState
        title="Belum ada galeri"
        description="Foto dan dokumentasi sekolah yang ditambahkan akan muncul di sini."
      >
        <template #icon>
          <Images />
        </template>
        <template #action>
          <AppButton
            variant="primary"
            @click="$emit('create')"
          >
            Tambah Galeri
          </AppButton>
        </template>
      </AppEmptyState>
    </div>

    <div
      v-else
      class="overflow-hidden rounded-xl border border-border-soft"
    >
      <table class="w-full border-collapse text-left">
        <thead class="bg-bg-base">
          <tr class="h-12 text-xs font-semibold uppercase tracking-wider text-text-secondary">
            <th class="w-20 px-4">Urutan</th>
            <th class="min-w-80 px-4">Galeri</th>
            <th class="w-40 px-4">Tipe</th>
            <th class="w-40 px-4">Tanggal</th>
            <th class="w-36 px-4 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border-soft">
          <tr
            v-for="item in pagedItems"
            :key="item.id"
            class="h-[76px] text-sm text-text-primary transition-colors hover:bg-bg-base"
          >
            <td class="px-4 font-medium text-text-secondary">
              {{ item.order }}
            </td>
            <td class="px-4">
              <div class="flex min-w-0 items-center gap-3">
                <div class="flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border-soft bg-bg-parchment">
                  <img
                    v-if="item.gambar"
                    :src="item.gambar"
                    :alt="item.nama"
                    class="h-full w-full object-cover"
                  >
                  <ImageIcon
                    v-else
                    class="h-6 w-6 text-text-muted"
                  />
                </div>
                <div class="min-w-0">
                  <p class="truncate font-medium text-text-primary">
                    {{ item.nama }}
                  </p>
                  <p class="mt-1 line-clamp-1 text-xs text-text-secondary">
                    {{ item.deskripsi || 'Tanpa deskripsi.' }}
                  </p>
                </div>
              </div>
            </td>
            <td class="px-4">
              <span
                class="inline-flex rounded-full px-3 py-1 text-xs font-medium"
                :class="item.isHead ? 'bg-primary-50 text-brand' : 'bg-bg-base text-text-secondary'"
              >
                {{ item.isHead ? 'Gambar Utama' : 'Carousel' }}
              </span>
            </td>
            <td class="px-4 text-text-secondary">
              {{ formatDate(item.createdAt) }}
            </td>
            <td class="px-4 text-center">
              <div class="flex items-center justify-center gap-1.5">
                <button
                  type="button"
                  class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border-soft bg-bg-base text-text-secondary transition-colors hover:bg-bg-surface hover:text-brand"
                  title="Edit galeri"
                  @click="$emit('edit', item)"
                >
                  <Edit2 class="h-4 w-4" />
                </button>
                <button
                  type="button"
                  class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border-soft bg-bg-base text-text-secondary transition-colors hover:bg-status-rejected-bg hover:text-error"
                  title="Hapus galeri"
                  @click="$emit('delete', item)"
                >
                  <Trash2 class="h-4 w-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

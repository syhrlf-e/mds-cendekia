<script setup lang="ts">
import { Edit2, Image as ImageIcon, Images, MoreHorizontal, Trash2 } from 'lucide-vue-next'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { GalleryItem } from '~/types/adminGallery'

defineProps<{
  loading: boolean
  error: string
  filteredCount: number
  pagedItems: GalleryItem[]
}>()

const emit = defineEmits<{
  refresh: []
  create: []
  edit: [item: GalleryItem]
  delete: [item: GalleryItem]
}>()

const activeDropdown = ref<number | string | null>(null)

const closeDropdown = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.gallery-dropdown-container')) {
    activeDropdown.value = null
  }
}

const toggleDropdown = (id: number | string) => {
  activeDropdown.value = activeDropdown.value === id ? null : id
}

const selectAction = (action: 'edit' | 'delete', item: GalleryItem) => {
  activeDropdown.value = null

  if (action === 'edit') {
    emit('edit', item)
    return
  }

  emit('delete', item)
}

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

onMounted(() => {
  document.addEventListener('click', closeDropdown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeDropdown)
})
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
      class="overflow-visible rounded-xl border border-border-soft"
    >
      <table class="w-full border-collapse text-left">
        <thead class="bg-bg-base">
          <tr class="h-12 text-xs font-semibold uppercase tracking-wider text-text-secondary">
            <th class="w-20 px-4">Urutan</th>
            <th class="min-w-80 px-4">Galeri</th>
            <th class="w-40 px-4">Tipe</th>
            <th class="w-40 px-4">Tanggal</th>
            <th class="w-24 px-4 text-left"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border-soft">
          <tr
            v-for="(item, index) in pagedItems"
            :key="item.id"
            class="h-[76px] text-sm text-text-primary transition-colors hover:bg-bg-base"
          >
            <td class="px-4 font-medium text-text-secondary">
              {{ index + 1 }}
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
              <AppBadge :variant="item.isHead ? 'brand' : 'neutral'" size="md">
                {{ item.isHead ? 'Gambar Utama' : 'Carousel' }}
              </AppBadge>
            </td>
            <td class="px-4 text-text-secondary">
              {{ formatDate(item.createdAt) }}
            </td>
            <td class="px-4 text-left">
              <div class="gallery-dropdown-container relative inline-block text-left">
                <button
                  type="button"
                  class="flex h-8 w-8 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-bg-base focus:outline-none"
                  aria-label="Buka aksi galeri"
                  @click.stop="toggleDropdown(item.id)"
                >
                  <MoreHorizontal class="h-4 w-4" />
                </button>

                <Transition
                  enter-active-class="transition duration-100 ease-out"
                  enter-from-class="scale-95 opacity-0"
                  enter-to-class="scale-100 opacity-100"
                  leave-active-class="transition duration-75 ease-in"
                  leave-from-class="scale-100 opacity-100"
                  leave-to-class="scale-95 opacity-0"
                >
                  <div
                    v-if="activeDropdown === item.id"
                    class="absolute right-0 z-50 mt-1 w-36 rounded-md border border-border-soft bg-white p-1 font-sans shadow-md"
                  >
                    <button
                      type="button"
                      class="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm font-medium text-[#3b3b3b] transition-colors hover:bg-gray-100"
                      @click="selectAction('edit', item)"
                    >
                      <Edit2 class="h-4 w-4" />
                      Edit
                    </button>
                    <div class="my-1 h-px bg-border-soft" />
                    <button
                      type="button"
                      class="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm font-medium text-error transition-colors hover:bg-status-rejected-bg"
                      @click="selectAction('delete', item)"
                    >
                      <Trash2 class="h-4 w-4" />
                      Hapus
                    </button>
                  </div>
                </Transition>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

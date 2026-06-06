<script setup lang="ts">
import { Save, Trash2, Upload, X } from 'lucide-vue-next'
import type { GalleryFormState, GalleryItem } from '~/types/adminGallery'

defineProps<{
  isEdit: boolean
  saving: boolean
  imagePreview: string
  primaryGalleryItem: GalleryItem | null
  editingId: string
}>()

const isOpen = defineModel<boolean>({ required: true })
const form = defineModel<GalleryFormState>('form', { required: true })
const fileInput = ref<HTMLInputElement | null>(null)

defineEmits<{
  close: []
  submit: []
  fileSelect: [event: Event]
  removeImage: []
  primaryToggle: []
}>()

const triggerFileInput = () => {
  fileInput.value?.click()
}
</script>

<template>
  <AppModal
    v-model="isOpen"
    :title="isEdit ? 'Edit Galeri' : 'Tambah Galeri'"
    width="max-w-2xl"
    :close-on-backdrop="false"
    @close="$emit('close')"
  >
    <form
      class="space-y-5"
      @submit.prevent="$emit('submit')"
    >
      <div>
        <label class="mb-2 block text-sm font-medium text-text-primary">
          Gambar <span v-if="!isEdit" class="text-error">*</span>
        </label>

        <div
          v-if="imagePreview"
          class="group relative overflow-hidden rounded-xl border border-border"
        >
          <img
            :src="imagePreview"
            alt="Preview galeri"
            class="h-72 w-full object-cover"
          >
          <div class="absolute inset-0 flex items-center justify-center gap-3 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-lg bg-bg-surface/95 px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-white"
              @click="triggerFileInput"
            >
              <Upload class="h-4 w-4" />
              Ganti
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-lg bg-error px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-status-rejected-text"
              @click="$emit('removeImage')"
            >
              <Trash2 class="h-4 w-4" />
              Hapus
            </button>
          </div>
        </div>

        <button
          v-else
          type="button"
          class="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-8 text-center transition-colors hover:border-brand hover:bg-bg-base"
          @click="triggerFileInput"
        >
          <Upload class="mb-3 h-12 w-12 text-text-muted" />
          <span class="text-sm font-medium text-text-primary">Klik untuk upload gambar</span>
          <span class="mt-1 text-xs text-text-secondary">PNG, JPG, WEBP maksimal 4MB.</span>
        </button>

        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          class="hidden"
          @change="$emit('fileSelect', $event)"
        >
      </div>

      <div class="flex items-center justify-between gap-5 rounded-2xl border border-border bg-bg-base px-5 py-4">
        <div class="min-w-0">
          <p class="text-sm font-medium text-text-primary">Jadikan gambar utama</p>
          <p class="mt-1 text-xs leading-relaxed text-text-secondary">
            Gambar utama tampil sebagai foto besar di halaman web dan tidak masuk carousel.
          </p>
          <p
            v-if="primaryGalleryItem && primaryGalleryItem.id !== editingId"
            class="mt-1 text-xs text-text-muted"
          >
            Saat ini: {{ primaryGalleryItem.nama }}
          </p>
        </div>

        <label class="relative inline-flex shrink-0 cursor-pointer items-center">
          <input
            v-model="form.isUtama"
            type="checkbox"
            class="peer sr-only"
            :disabled="saving"
            @change="$emit('primaryToggle')"
          >
          <span class="h-7 w-13 rounded-full bg-gray-300 transition-colors duration-150 peer-checked:bg-brand peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand/20 peer-disabled:cursor-not-allowed peer-disabled:opacity-60"></span>
          <span class="absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white transition-transform duration-150 peer-checked:translate-x-6"></span>
        </label>
      </div>

      <AppInput
        v-model="form.nama"
        label="Nama Galeri"
        placeholder="Contoh: Kegiatan belajar mandiri"
        required
        :disabled="saving"
      />

      <AppTextarea
        v-model="form.deskripsi"
        label="Deskripsi"
        placeholder="Tuliskan deskripsi singkat dokumentasi ini..."
        required
        :rows="4"
        :disabled="saving"
      />
    </form>

    <template #footer>
      <AppButton
        variant="secondary"
        :disabled="saving"
        @click="$emit('close')"
      >
        <X class="mr-2 h-4 w-4" />
        Batal
      </AppButton>
      <AppButton
        variant="primary"
        :loading="saving"
        @click="$emit('submit')"
      >
        <Save class="mr-2 h-4 w-4" />
        {{ isEdit ? 'Update Galeri' : 'Simpan Galeri' }}
      </AppButton>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
import { Save, Trash2, Upload, X } from 'lucide-vue-next'
import type { GalleryFormState } from '~/types/adminGallery'
import { ADMIN_IMAGE_ACCEPT } from '~/utils/adminImageUpload'

defineProps<{
  isEdit: boolean
  saving: boolean
  imagePreview: string
}>()

const isOpen = defineModel<boolean>({ required: true })
const form = defineModel<GalleryFormState>('form', { required: true })
const fileInput = ref<HTMLInputElement | null>(null)

defineEmits<{
  close: []
  submit: []
  fileSelect: [event: Event]
  removeImage: []
}>()

const triggerFileInput = () => {
  fileInput.value?.click()
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-[opacity,backdrop-filter] duration-300 ease-out [&>aside]:transition-transform [&>aside]:duration-300 [&>aside]:ease-out"
      enter-from-class="opacity-0 backdrop-blur-none [&>aside]:translate-x-full"
      enter-to-class="opacity-100 backdrop-blur-sm [&>aside]:translate-x-0"
      leave-active-class="transition-[opacity,backdrop-filter] duration-300 ease-in [&>aside]:transition-transform [&>aside]:duration-300 [&>aside]:ease-in"
      leave-from-class="opacity-100 backdrop-blur-sm [&>aside]:translate-x-0"
      leave-to-class="opacity-0 backdrop-blur-none [&>aside]:translate-x-full"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 bg-text-primary/20 backdrop-blur-sm"
        @click.self="!saving && $emit('close')"
      >
        <aside class="admin-gallery-drawer relative z-[40] ml-auto flex h-full w-[min(680px,calc(100%-280px))] flex-col overflow-hidden border-l border-border-soft bg-bg-surface shadow-2xl 2xl:w-[680px]">
          <header class="admin-gallery-drawer-header shrink-0 border-b border-border-soft px-8 py-6">
            <div class="flex items-start justify-between gap-5">
              <div class="min-w-0">
                <h2 class="truncate font-heading text-xl font-bold leading-tight text-text-primary">
                  {{ isEdit ? 'Edit Galeri' : 'Tambah Galeri' }}
                </h2>
                <p class="mt-2 max-w-md font-body text-sm leading-relaxed text-text-secondary">
                  Kelola dokumentasi kegiatan yang akan ditampilkan pada galeri sekolah.
                </p>
              </div>

              <button
                type="button"
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-bg-base hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/20"
                aria-label="Tutup form galeri"
                :disabled="saving"
                @click="$emit('close')"
              >
                <X class="h-5 w-5" />
              </button>
            </div>
          </header>

          <form
            class="admin-gallery-drawer-body min-h-0 grow overflow-y-auto px-8 py-7"
            @submit.prevent="$emit('submit')"
          >
            <div class="space-y-6">
              <section class="rounded-2xl border border-border-soft bg-bg-base p-4">
                <label class="mb-3 block font-heading text-sm font-semibold text-text-primary">
                  Gambar <span v-if="!isEdit" class="text-error">*</span>
                </label>

                <div
                  v-if="imagePreview"
                  class="group relative overflow-hidden rounded-xl border border-border-soft bg-bg-surface"
                >
                  <img
                    :src="imagePreview"
                    alt="Preview galeri"
                    class="admin-gallery-preview h-80 w-full object-cover"
                  >
                  <div class="absolute inset-0 flex items-center justify-center gap-3 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      class="inline-flex items-center gap-2 rounded-xl bg-bg-surface/95 px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-white"
                      :disabled="saving"
                      @click="triggerFileInput"
                    >
                      <Upload class="h-4 w-4" />
                      Ganti
                    </button>
                    <button
                      type="button"
                      class="inline-flex items-center gap-2 rounded-xl bg-error px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-status-rejected-text disabled:cursor-not-allowed disabled:opacity-60"
                      :disabled="saving"
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
                  class="admin-gallery-upload flex min-h-72 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-border-soft bg-bg-surface p-8 text-center transition-colors hover:border-brand hover:bg-primary-50/40 disabled:cursor-not-allowed disabled:opacity-60"
                  :disabled="saving"
                  @click="triggerFileInput"
                >
                  <Upload class="mb-3 h-12 w-12 text-text-muted" />
                  <span class="font-heading text-sm font-semibold text-text-primary">Klik untuk upload gambar</span>
                  <span class="mt-1 font-body text-xs text-text-secondary">PNG, JPG, WEBP maksimal 4MB.</span>
                </button>

                <input
                  ref="fileInput"
                  type="file"
                  :accept="ADMIN_IMAGE_ACCEPT"
                  class="hidden"
                  :disabled="saving"
                  @change="$emit('fileSelect', $event)"
                >
              </section>

              <section class="space-y-5 rounded-2xl border border-border-soft bg-bg-surface p-5">
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
                  :rows="5"
                  :disabled="saving"
                />
              </section>
            </div>
          </form>

          <footer class="admin-gallery-drawer-footer shrink-0 border-t border-border-soft bg-bg-surface px-8 py-5">
            <div class="flex justify-end gap-3">
              <AppButton
                variant="secondary"
                :disabled="saving"
                @click="$emit('close')"
              >
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
            </div>
          </footer>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
@media (max-height: 820px) {
  .admin-gallery-drawer-header,
  .admin-gallery-drawer-body,
  .admin-gallery-drawer-footer {
    padding-left: 24px;
    padding-right: 24px;
  }

  .admin-gallery-drawer-header {
    padding-top: 18px;
    padding-bottom: 18px;
  }

  .admin-gallery-drawer-body {
    padding-top: 18px;
    padding-bottom: 18px;
  }

  .admin-gallery-drawer-footer {
    padding-top: 14px;
    padding-bottom: 14px;
  }

  .admin-gallery-preview {
    height: 240px;
  }

  .admin-gallery-upload {
    min-height: 220px;
    padding: 24px;
  }
}
</style>

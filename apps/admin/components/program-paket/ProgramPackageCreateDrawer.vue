<script setup lang="ts">
import { PackageOpen, X } from 'lucide-vue-next'
import { computed, reactive, watch } from 'vue'
import type { PaketSekolah } from '~/types/adminPaketSekolah'

export type ProgramPackageCreatePayload = {
  nama: string
  deskripsi: string
  status: boolean
}

const props = defineProps<{
  modelValue: boolean
  mode?: 'create' | 'edit'
  item?: PaketSekolah | null
  saving?: boolean
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void
  (event: 'submit', payload: ProgramPackageCreatePayload): void
}>()

const form = reactive({
  nama: '',
  deskripsi: '',
  status: true
})

const errors = reactive({
  nama: '',
  deskripsi: ''
})

const isEditMode = computed(() => props.mode === 'edit')

const resetForm = () => {
  form.nama = isEditMode.value ? props.item?.nama || '' : ''
  form.deskripsi = isEditMode.value ? props.item?.deskripsi || '' : ''
  form.status = isEditMode.value ? props.item?.status === 'aktif' : true
  errors.nama = ''
  errors.deskripsi = ''
}

const closeDrawer = () => {
  if (props.saving) return
  emit('update:modelValue', false)
}

const validateForm = () => {
  errors.nama = form.nama.trim() ? '' : 'Nama program wajib diisi.'
  errors.deskripsi = form.deskripsi.trim() ? '' : 'Deskripsi wajib diisi.'

  return !errors.nama && !errors.deskripsi
}

const submitForm = () => {
  if (!validateForm()) return

  emit('submit', {
    nama: form.nama.trim(),
    deskripsi: form.deskripsi.trim(),
    status: form.status
  })
}

watch(
  () => [props.modelValue, props.item, props.mode] as const,
  ([isOpen]) => {
    if (isOpen) resetForm()
  }
)
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
        v-if="modelValue"
        class="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
        @click.self="closeDrawer"
      >
        <aside class="relative z-[40] ml-auto flex h-full w-[680px] flex-col overflow-hidden border-l border-border-soft bg-bg-surface shadow-2xl">
          <header class="shrink-0 border-b border-border-soft bg-bg-surface px-8 py-6">
            <div class="flex items-center justify-between gap-6">
              <div class="flex items-center gap-4">
                <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-brand">
                  <PackageOpen class="h-6 w-6" />
                </div>
                <div class="min-w-0">
                  <p class="font-heading text-sm font-medium leading-none text-text-muted">
                    Program Paket
                  </p>
                  <h2 class="mt-1.5 font-heading text-xl font-bold leading-tight text-text-primary">
                    {{ isEditMode ? 'Edit Program Paket' : 'Tambah Program Paket' }}
                  </h2>
                </div>
              </div>

              <button
                type="button"
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-bg-base hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/20"
                :disabled="saving"
                :aria-label="isEditMode ? 'Tutup edit program paket' : 'Tutup tambah program paket'"
                @click="closeDrawer"
              >
                <X class="h-5 w-5" />
              </button>
            </div>
          </header>

          <form class="flex min-h-0 grow flex-col bg-bg-surface" @submit.prevent="submitForm">
            <main class="min-h-0 grow overflow-y-auto px-8 py-8">
              <div class="mx-auto w-full space-y-8">
                <!-- Card Informasi Utama -->
                <section class="rounded-[24px] border border-border-soft bg-bg-base p-6 shadow-sm">
                  <div class="mb-6">
                    <h3 class="font-heading text-lg font-semibold leading-none text-text-primary">
                      Informasi Utama
                    </h3>
                    <p class="mt-2 font-body text-sm leading-relaxed text-text-secondary">
                      {{ isEditMode ? 'Perbarui nama dan deskripsi utama program.' : 'Buat data program paket beserta penjelasannya.' }}
                    </p>
                  </div>

                  <div class="flex flex-col gap-6">
                    <AppInput
                      v-model="form.nama"
                      label="Nama Program"
                      placeholder="Contoh: Program Paket C"
                      required
                      :error="errors.nama"
                      :disabled="saving"
                    />

                    <AppTextarea
                      v-model="form.deskripsi"
                      label="Deskripsi"
                      placeholder="Tulis penjelasan lengkap tentang program paket ini..."
                      required
                      :rows="6"
                      :error="errors.deskripsi"
                      :disabled="saving"
                    />
                  </div>
                </section>

                <!-- Card Pengaturan -->
                <section
                  v-if="isEditMode"
                  class="rounded-[24px] border border-border-soft bg-bg-base p-6 shadow-sm"
                >
                  <div class="flex items-center justify-between gap-4">
                    <div class="min-w-0 pr-4">
                      <h3 class="font-heading text-lg font-semibold text-text-primary">
                        Status Publikasi
                      </h3>
                      <p class="mt-1 font-body text-sm text-text-secondary">
                        {{ form.status ? 'Program saat ini aktif dan dapat dilihat.' : 'Program sedang disembunyikan (nonaktif).' }}
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      :aria-checked="form.status"
                      class="relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand/20 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      :class="form.status ? 'bg-success' : 'bg-border-soft'"
                      :disabled="saving"
                      @click="form.status = !form.status"
                    >
                      <span class="sr-only">Toggle status program</span>
                      <span
                        class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out"
                        :class="form.status ? 'translate-x-5' : 'translate-x-0'"
                      />
                    </button>
                  </div>
                </section>
              </div>
            </main>

            <footer class="shrink-0 border-t border-border-soft bg-bg-surface px-8 py-5">
              <div class="flex justify-end gap-3">
                <AppButton
                  variant="ghost"
                  type="button"
                  :disabled="saving"
                  @click="closeDrawer"
                >
                  Batal
                </AppButton>
                <AppButton
                  type="submit"
                  :loading="saving"
                >
                  {{ isEditMode ? 'Simpan Perubahan' : 'Simpan Program' }}
                </AppButton>
              </div>
            </footer>
          </form>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { reactive, watch } from 'vue'

export type ProgramPackageCreatePayload = {
  nama: string
  deskripsi: string
}

const props = defineProps<{
  modelValue: boolean
  saving?: boolean
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void
  (event: 'submit', payload: ProgramPackageCreatePayload): void
}>()

const form = reactive({
  nama: '',
  deskripsi: ''
})

const errors = reactive({
  nama: '',
  deskripsi: ''
})

const resetForm = () => {
  form.nama = ''
  form.deskripsi = ''
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
    deskripsi: form.deskripsi.trim()
  })
}

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) resetForm()
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-[opacity,backdrop-filter] duration-300 ease-out [&>aside]:transition-transform [&>aside]:duration-300 [&>aside]:ease-out"
      enter-from-class="opacity-0 backdrop-blur-none [&>aside]:translate-x-full"
      enter-to-class="opacity-100 backdrop-blur-[14px] [&>aside]:translate-x-0"
      leave-active-class="transition-[opacity,backdrop-filter] duration-300 ease-in [&>aside]:transition-transform [&>aside]:duration-300 [&>aside]:ease-in"
      leave-from-class="opacity-100 backdrop-blur-[14px] [&>aside]:translate-x-0"
      leave-to-class="opacity-0 backdrop-blur-none [&>aside]:translate-x-full"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 bg-text-primary/20 backdrop-blur-[14px]"
        @click.self="closeDrawer"
      >
        <aside class="relative z-[40] ml-auto flex h-[calc(100%-16px)] w-[min(640px,calc(100%-320px))] flex-col overflow-hidden border-l-2 border-border bg-bg-base">
          <header class="shrink-0 border-b border-border bg-bg-surface px-8 py-6">
            <div class="flex items-start justify-between gap-6">
              <div class="min-w-0">
                <p class="font-heading text-sm font-medium leading-none text-text-muted">
                  Program Paket
                </p>
                <h2 class="mt-2 font-heading text-2xl font-semibold leading-tight text-text-primary">
                  Tambah Program Paket
                </h2>
              </div>

              <button
                type="button"
                class="flex h-10 w-10 items-center justify-center rounded-xl text-text-secondary transition-colors hover:bg-bg-base hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/20"
                :disabled="saving"
                aria-label="Tutup tambah program paket"
                @click="closeDrawer"
              >
                <X class="h-5 w-5" />
              </button>
            </div>
          </header>

          <form class="flex min-h-0 grow flex-col" @submit.prevent="submitForm">
            <main class="min-h-0 grow overflow-y-auto">
              <div class="mx-auto w-full max-w-xl px-8 py-6">
                <section class="rounded-2xl bg-bg-surface p-6">
                  <div>
                    <h3 class="font-heading text-lg font-semibold leading-none text-text-primary">
                      Informasi Program
                    </h3>
                    <p class="mt-2 font-body text-sm leading-relaxed text-text-secondary">
                      Buat data program terlebih dahulu. Pengaturan pendaftaran dapat dikelola setelah program tersimpan.
                    </p>
                  </div>

                  <div class="mt-6 flex flex-col gap-5">
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
                      placeholder="Tulis ringkasan program paket..."
                      required
                      :rows="6"
                      :error="errors.deskripsi"
                      :disabled="saving"
                    />
                  </div>
                </section>
              </div>
            </main>

            <footer class="shrink-0 border-t border-border bg-bg-surface px-8 py-4">
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
                  Simpan Program
                </AppButton>
              </div>
            </footer>
          </form>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

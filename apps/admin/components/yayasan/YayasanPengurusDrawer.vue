<script setup lang="ts">
import { User, X } from 'lucide-vue-next'
import { computed, reactive, ref, watch } from 'vue'
import type { OrganizationMember, OrganizationCreatePayload } from '~/types/adminOrganization'

const props = defineProps<{
  modelValue: boolean
  mode?: 'create' | 'edit'
  item?: OrganizationMember | null
  saving?: boolean
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void
  (event: 'submit', payload: OrganizationCreatePayload): void
}>()

const isEditMode = computed(() => props.mode === 'edit')
const photoPreview = ref<string | null>(null)
const photoFile = ref<File | null>(null)
const photoInput = ref<HTMLInputElement | null>(null)
const customJobValue = '__custom__'
const jobOptions = [
  { label: 'Ketua Pembina', value: 'Ketua Pembina' },
  { label: 'Ketua Pengawas', value: 'Ketua Pengawas' },
  { label: 'Ketua Umum', value: 'Ketua Umum' },
  { label: 'Sekretaris', value: 'Sekretaris' },
  { label: 'Bendahara', value: 'Bendahara' },
  { label: 'Lainnya', value: customJobValue }
]

const form = reactive({
  nama: '',
  jabatanOption: '',
  jabatanCustom: '',
  join_at: ''
})

const errors = reactive({
  nama: '',
  jabatan: '',
  gambar: '',
  join_at: ''
})

const closeDrawer = () => {
  if (props.saving) return
  emit('update:modelValue', false)
}

const resetForm = () => {
  const currentJob = props.item?.jabatan ?? ''
  const hasKnownJob = jobOptions.some(option => option.value === currentJob)

  form.nama = props.item?.nama ?? ''
  form.jabatanOption = currentJob && hasKnownJob ? currentJob : currentJob ? customJobValue : ''
  form.jabatanCustom = currentJob && !hasKnownJob ? currentJob : ''
  form.join_at = props.item?.join_at ? props.item.join_at.split('T')[0] ?? '' : ''
  photoPreview.value = props.item?.gambar
    ? `https://api.mdscendekia.my.id${props.item.gambar}`
    : null
  photoFile.value = null
  errors.nama = ''
  errors.jabatan = ''
  errors.gambar = ''
  errors.join_at = ''
}

const onPhotoChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  photoFile.value = file
  photoPreview.value = URL.createObjectURL(file)
}

const removePhoto = () => {
  photoFile.value = null
  photoPreview.value = null
  if (photoInput.value) photoInput.value.value = ''
}

const validate = () => {
  const selectedJob = form.jabatanOption === customJobValue ? form.jabatanCustom.trim() : form.jabatanOption.trim()

  errors.nama = form.nama.trim() ? '' : 'Nama wajib diisi.'
  errors.jabatan = selectedJob ? '' : 'Jabatan wajib diisi.'
  errors.gambar = isEditMode.value || photoFile.value || photoPreview.value ? '' : 'Foto pengurus wajib diunggah.'
  errors.join_at = form.join_at ? '' : 'Tanggal bergabung wajib diisi.'
  return !errors.nama && !errors.jabatan && !errors.gambar && !errors.join_at
}

const submitForm = () => {
  if (!validate()) return
  const selectedJob = form.jabatanOption === customJobValue ? form.jabatanCustom.trim() : form.jabatanOption.trim()

  emit('submit', {
    nama: form.nama.trim(),
    jabatan: selectedJob,
    sambutan: props.item?.sambutan ?? '',
    join_at: form.join_at,
    gambar: photoFile.value
  })
}

const initials = computed(() => {
  const parts = form.nama.trim().split(' ')
  return parts.length >= 2
    ? `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase()
    : (parts[0]?.[0] ?? '?').toUpperCase()
})

watch(() => [props.modelValue, props.item, props.mode], ([isOpen]) => {
  if (isOpen) resetForm()
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-[opacity,backdrop-filter] duration-300 ease-out [&>aside]:transition-transform [&>aside]:duration-300 [&>aside]:ease-out"
      enter-from-class="opacity-0 [&>aside]:translate-x-full"
      enter-to-class="opacity-100 [&>aside]:translate-x-0"
      leave-active-class="transition-[opacity,backdrop-filter] duration-300 ease-in [&>aside]:transition-transform [&>aside]:duration-300 [&>aside]:ease-in"
      leave-from-class="opacity-100 [&>aside]:translate-x-0"
      leave-to-class="opacity-0 [&>aside]:translate-x-full"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
        @click.self="closeDrawer"
      >
        <aside class="admin-yayasan-drawer relative ml-auto flex h-full w-[min(680px,calc(100%-280px))] flex-col overflow-hidden border-l border-border-soft bg-bg-surface shadow-2xl 2xl:w-[680px]">
          <!-- Header -->
          <header class="admin-yayasan-drawer-header shrink-0 border-b border-border-soft bg-bg-surface px-8 py-6">
            <div class="flex items-center justify-between gap-6">
              <div class="flex items-center gap-4">
                <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-brand">
                  <User class="h-6 w-6" />
                </div>
                <div>
                  <p class="font-heading text-sm font-medium text-text-muted">Pengurus Yayasan</p>
                  <h2 class="mt-1 font-heading text-xl font-bold text-text-primary">
                    {{ isEditMode ? 'Edit Pengurus' : 'Tambah Pengurus' }}
                  </h2>
                </div>
              </div>
              <button
                type="button"
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-bg-base hover:text-text-primary focus:outline-none"
                :disabled="saving"
                @click="closeDrawer"
              >
                <X class="h-5 w-5" />
              </button>
            </div>
          </header>

          <!-- Body -->
          <form class="flex min-h-0 grow flex-col" @submit.prevent="submitForm">
            <main class="admin-yayasan-drawer-body min-h-0 grow overflow-y-auto px-8 py-8">
              <div class="admin-yayasan-drawer-stack space-y-6">

                <!-- Foto Pengurus -->
                <section class="admin-yayasan-drawer-card rounded-[24px] border border-border-soft bg-bg-base p-6">
                  <h3 class="admin-yayasan-card-title mb-5 font-heading text-base font-semibold text-text-primary">Foto Pengurus</h3>
                  <div class="flex items-center gap-5">
                    <div class="relative shrink-0">
                      <div
                        class="admin-yayasan-avatar h-20 w-20 overflow-hidden rounded-full border-2 border-border-soft bg-primary-50"
                        :class="photoPreview ? '' : 'flex items-center justify-center'"
                      >
                        <img
                          v-if="photoPreview"
                          :src="photoPreview"
                          alt="Preview foto"
                          class="h-full w-full object-cover"
                        >
                        <span v-else class="font-heading text-2xl font-bold text-brand">
                          {{ initials }}
                        </span>
                      </div>
                      <button
                        v-if="photoPreview"
                        type="button"
                        class="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm border border-border-soft text-text-secondary transition-colors hover:text-error"
                        @click="removePhoto"
                      >
                        <X class="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div class="min-w-0">
                      <input
                        ref="photoInput"
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp"
                        class="hidden"
                        @change="onPhotoChange"
                      >
                      <button
                        type="button"
                        class="inline-flex h-9 items-center gap-2 rounded-xl border border-border-soft bg-bg-surface px-4 font-heading text-sm font-medium text-text-primary transition-colors hover:bg-bg-base focus:outline-none"
                        :disabled="saving"
                        @click="photoInput?.click()"
                      >
                        {{ photoPreview ? 'Ganti Foto' : 'Unggah Foto' }}
                      </button>
                      <p class="mt-2 font-body text-xs text-text-muted">JPG, PNG, atau WebP · Maks. 2 MB</p>
                      <p v-if="errors.gambar" class="mt-2 font-body text-xs text-error">{{ errors.gambar }}</p>
                    </div>
                  </div>
                </section>

                <!-- Informasi Dasar -->
                <section class="admin-yayasan-drawer-card rounded-[24px] border border-border-soft bg-bg-base p-6">
                  <h3 class="admin-yayasan-card-title mb-5 font-heading text-base font-semibold text-text-primary">Informasi Dasar</h3>
                  <div class="admin-yayasan-field-grid grid grid-cols-2 gap-5">
                    <div class="col-span-2">
                      <AppInput
                        v-model="form.nama"
                        label="Nama Lengkap"
                        placeholder="Contoh: Dr. Ahmad Fauzi, M.Pd"
                        :error="errors.nama"
                        :disabled="saving"
                      />
                    </div>
                    <div class="col-span-2">
                      <AppSelect
                        v-model="form.jabatanOption"
                        label="Jabatan"
                        :options="jobOptions"
                        placeholder="Pilih jabatan"
                        :error="errors.jabatan"
                        :disabled="saving"
                        required
                      />
                    </div>
                    <div v-if="form.jabatanOption === customJobValue" class="col-span-2">
                      <AppInput
                        v-model="form.jabatanCustom"
                        label="Jabatan Lainnya"
                        placeholder="Contoh: Koordinator Humas"
                        :error="errors.jabatan"
                        :disabled="saving"
                      />
                    </div>
                    <div class="col-span-2">
                      <label class="flex flex-col gap-2">
                        <span class="font-heading text-sm font-medium text-text-primary">Tanggal Bergabung</span>
                        <input
                          v-model="form.join_at"
                          type="date"
                          class="h-11 rounded-xl border px-3 font-heading text-sm text-text-primary outline-none transition-colors"
                          :class="errors.join_at
                            ? 'border-error bg-error/5 focus:border-error focus:ring-2 focus:ring-error/20'
                            : 'border-border-soft bg-bg-surface focus:border-brand focus:ring-2 focus:ring-brand/20'"
                          :disabled="saving"
                        >
                        <span v-if="errors.join_at" class="text-xs text-error">{{ errors.join_at }}</span>
                      </label>
                    </div>
                  </div>
                </section>

              </div>
            </main>

            <!-- Footer -->
            <footer class="admin-yayasan-drawer-footer shrink-0 border-t border-border-soft bg-bg-surface px-8 py-5">
              <div class="flex justify-end gap-3">
                <AppButton variant="ghost" type="button" :disabled="saving" @click="closeDrawer">
                  Batal
                </AppButton>
                <AppButton type="submit" :loading="saving">
                  {{ isEditMode ? 'Simpan Perubahan' : 'Tambah Pengurus' }}
                </AppButton>
              </div>
            </footer>
          </form>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
@media (max-height: 820px) {
  .admin-yayasan-drawer {
    width: min(640px, calc(100% - 280px));
  }

  .admin-yayasan-drawer-header,
  .admin-yayasan-drawer-body,
  .admin-yayasan-drawer-footer {
    padding-left: 24px;
    padding-right: 24px;
  }

  .admin-yayasan-drawer-header {
    padding-top: 18px;
    padding-bottom: 18px;
  }

  .admin-yayasan-drawer-body {
    padding-top: 20px;
    padding-bottom: 20px;
  }

  .admin-yayasan-drawer-footer {
    padding-top: 14px;
    padding-bottom: 14px;
  }

  .admin-yayasan-drawer-stack > :not([hidden]) ~ :not([hidden]) {
    --tw-space-y-reverse: 0;
    margin-top: calc(20px * calc(1 - var(--tw-space-y-reverse)));
    margin-bottom: calc(20px * var(--tw-space-y-reverse));
  }

  .admin-yayasan-drawer-card {
    padding: 20px;
  }

  .admin-yayasan-avatar {
    height: 72px;
    width: 72px;
  }

  .admin-yayasan-field-grid {
    gap: 16px;
  }

  .admin-yayasan-card-title {
    margin-bottom: 16px;
  }
}

@media (max-width: 1279px) {
  .admin-yayasan-drawer {
    width: min(620px, calc(100% - 264px));
  }

  .admin-yayasan-avatar {
    height: 76px;
    width: 76px;
  }
}
</style>

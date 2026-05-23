<script setup lang="ts">
import { Calendar, Monitor, Sun } from 'lucide-vue-next'
import { ref } from 'vue'
import { useToast } from '~/composables/useToast'

definePageMeta({
  layout: 'admin',
  middleware: ['admin-auth']
})

useHead({ title: 'Pengaturan | MDS Cendekia' })

const { addToast } = useToast()

const isSaving = ref(false)
const isRegistrationOpen = ref(true)
const themeMode = ref<'light' | 'system'>('light')
const startDate = ref('2026-07-01')
const endDate = ref('2026-08-31')
const errorMsg = ref('')

const themeOptions = [
  { value: 'light', label: 'Terang', icon: Sun },
  { value: 'system', label: 'Sistem', icon: Monitor }
] as const

const validate = () => {
  if (!isRegistrationOpen.value) return ''
  if (!startDate.value && !endDate.value) return 'Harap isi tanggal buka dan tutup pendaftaran'
  if (startDate.value && !endDate.value) return 'Harap isi tanggal tutup pendaftaran'
  if (!startDate.value && endDate.value) return 'Harap isi tanggal buka pendaftaran'
  if (startDate.value > endDate.value) return 'Tanggal tutup tidak boleh lebih awal dari tanggal buka'
  return ''
}

const handleSave = async () => {
  errorMsg.value = validate()
  if (errorMsg.value) return

  isSaving.value = true
  await new Promise(resolve => setTimeout(resolve, 800))
  isSaving.value = false
  addToast('Pengaturan berhasil disimpan', 'success')
}
</script>

<template>
  <div>
    <header class="mb-8">
      <h1 class="text-[28px] font-semibold leading-[1.2] tracking-[-0.2px] text-text-primary">Pengaturan</h1>
    </header>

    <div class="grid max-w-4xl gap-4">
      <section class="rounded-2xl border border-border bg-bg-surface p-6 shadow-sm">
        <div class="mb-5 flex items-center justify-between gap-6">
          <div>
            <h2 class="text-[17px] font-semibold leading-[1.24] tracking-[-0.2px] text-text-primary">
              Preferensi Tampilan
            </h2>
            <p class="mt-1 text-sm leading-[1.43] tracking-[-0.15px] text-text-secondary">
              Pilih mode tampilan untuk panel admin.
            </p>
          </div>

          <div class="flex items-center rounded-xl border border-border-soft bg-bg-base p-1">
            <button
              v-for="option in themeOptions"
              :key="option.value"
              type="button"
              class="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition-colors"
              :class="themeMode === option.value ? 'bg-bg-surface text-brand shadow-sm' : 'text-text-muted hover:text-text-secondary'"
              @click="themeMode = option.value"
            >
              <component :is="option.icon" class="h-4 w-4" />
              {{ option.label }}
            </button>
          </div>
        </div>
      </section>

      <form
        class="rounded-2xl border border-border bg-bg-surface p-6 shadow-sm"
        @submit.prevent="handleSave"
      >
        <h2 class="mb-6 text-[17px] font-semibold leading-[1.24] tracking-[-0.2px] text-text-primary">
          Periode Pendaftaran
        </h2>

        <div class="mb-6 flex items-center justify-between">
          <div>
            <p class="text-sm font-semibold leading-[1.29] tracking-[-0.15px] text-text-primary">Status Pendaftaran</p>
            <p class="mt-1 text-sm leading-[1.43] tracking-[-0.15px] text-text-secondary">
              {{ isRegistrationOpen ? 'Aktif' : 'Nonaktif' }}
            </p>
          </div>

          <label class="relative inline-flex cursor-pointer items-center">
            <input v-model="isRegistrationOpen" type="checkbox" class="peer sr-only" :disabled="isSaving">
            <span class="h-7 w-13 rounded-full bg-gray-300 transition-colors duration-150 peer-checked:bg-success peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand/20"></span>
            <span class="absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white transition-transform duration-150 peer-checked:translate-x-6"></span>
          </label>
        </div>

        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-1.5">
            <label for="start-date" class="text-sm font-medium text-text-primary">Tanggal Buka</label>
            <div class="relative">
              <input
                id="start-date"
                v-model="startDate"
                type="date"
                :disabled="isSaving"
                class="h-11 w-full rounded-lg border border-border bg-bg-surface px-4 pr-11 text-[17px] leading-[1.47] tracking-[-0.2px] text-text-primary outline-none transition-colors focus:border-brand focus:ring-[3px] focus:ring-brand/12 disabled:cursor-not-allowed disabled:bg-bg-parchment disabled:text-text-muted"
              >
              <Calendar class="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="end-date" class="text-sm font-medium text-text-primary">Tanggal Tutup</label>
            <div class="relative">
              <input
                id="end-date"
                v-model="endDate"
                type="date"
                :disabled="isSaving"
                class="h-11 w-full rounded-lg border border-border bg-bg-surface px-4 pr-11 text-[17px] leading-[1.47] tracking-[-0.2px] text-text-primary outline-none transition-colors focus:border-brand focus:ring-[3px] focus:ring-brand/12 disabled:cursor-not-allowed disabled:bg-bg-parchment disabled:text-text-muted"
              >
              <Calendar class="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            </div>
          </div>
        </div>

        <p v-if="errorMsg" class="mt-4 text-xs leading-[1.4] tracking-[-0.08px] text-error">
          {{ errorMsg }}
        </p>

        <div class="mt-8 flex justify-end">
          <AppButton type="submit" variant="primary" :loading="isSaving" :disabled="isSaving">
            Terapkan
          </AppButton>
        </div>
      </form>
    </div>
  </div>
</template>

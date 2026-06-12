<script setup lang="ts">
import { Monitor, PackageOpen, Sun } from 'lucide-vue-next'
import { ref } from 'vue'
import { useToast } from '~/composables/useToast'

definePageMeta({
  layout: 'admin',
  middleware: ['admin-auth']
})

useHead({ title: 'Pengaturan | MDS Cendekia' })

const { addToast } = useToast()

const isSaving = ref(false)
const themeMode = ref<'light' | 'system'>('light')

const themeOptions = [
  { value: 'light', label: 'Terang', icon: Sun },
  { value: 'system', label: 'Sistem', icon: Monitor }
] as const

const handleSave = async () => {
  isSaving.value = true
  await new Promise(resolve => setTimeout(resolve, 600))
  isSaving.value = false
  addToast('Pengaturan berhasil disimpan', 'success')
}
</script>

<template>
  <div class="grid max-w-4xl gap-4">
    <section class="rounded-2xl border border-border bg-bg-surface p-6">
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
            :class="themeMode === option.value ? 'bg-bg-surface text-brand' : 'text-text-muted hover:text-text-secondary'"
            @click="themeMode = option.value"
          >
            <component :is="option.icon" class="h-4 w-4" />
            {{ option.label }}
          </button>
        </div>
      </div>

      <div class="flex justify-end">
        <AppButton variant="primary" :loading="isSaving" :disabled="isSaving" @click="handleSave">
          Simpan Pengaturan
        </AppButton>
      </div>
    </section>

    <section class="rounded-2xl border border-border bg-bg-surface p-6">
      <div class="flex items-start gap-4">
        <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-brand">
          <PackageOpen class="h-5 w-5" />
        </div>
        <div>
          <h2 class="text-[17px] font-semibold leading-[1.24] tracking-[-0.2px] text-text-primary">
            Program Paket
          </h2>
          <p class="mt-1 max-w-2xl text-sm leading-[1.5] tracking-[-0.15px] text-text-secondary">
            Pendaftaran, gelombang, dan timeline dikelola dari Program Paket agar alur PPDB berada dalam satu tempat.
          </p>
          <NuxtLink
            to="/paket-sekolah"
            class="mt-4 inline-flex h-10 items-center rounded-xl border border-border-soft bg-bg-base px-4 text-sm font-normal text-text-secondary transition-colors hover:bg-bg-surface hover:text-text-primary"
          >
            Buka Program Paket
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

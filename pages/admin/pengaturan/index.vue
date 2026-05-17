<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from '~/composables/useToast'
import { Save } from 'lucide-vue-next'

definePageMeta({
  layout: 'admin',
  middleware: ['admin-auth']
})

useHead({ title: 'Pengaturan PPDB | Admin MDS Cendekia' })

const { addToast } = useToast()
const isSaving = ref(false)

// State
const isRegistrationOpen = ref(true)
const startDate = ref('2026-07-01')
const endDate = ref('2026-08-31')

const handleSave = async () => {
  isSaving.value = true
  
  // Mock API Call
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  isSaving.value = false
  addToast('Pengaturan PPDB berhasil disimpan.', 'success')
}
</script>

<template>
  <div class="flex flex-col h-full animate-in fade-in duration-300">
    <div class="mb-8">
      <h1 class="text-3xl font-heading font-bold text-text-primary mb-2">Pengaturan PPDB</h1>
      <p class="text-text-secondary">Atur periode dan konfigurasi sistem penerimaan peserta didik baru.</p>
    </div>
    
    <div class="bg-bg-surface border border-border rounded-2xl flex-grow shadow-sm p-6 md:p-8 max-w-3xl">
      <form @submit.prevent="handleSave" class="flex flex-col gap-8">
        
        <!-- Toggle Status -->
        <div class="flex items-center justify-between p-5 bg-bg-base border border-border rounded-xl">
          <div class="flex flex-col">
            <span class="text-lg font-heading font-semibold text-text-primary">Status Pendaftaran</span>
            <span class="text-sm text-text-secondary mt-1">
              {{ isRegistrationOpen ? 'Pendaftaran saat ini dibuka untuk umum.' : 'Pendaftaran saat ini ditutup.' }}
            </span>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" v-model="isRegistrationOpen" class="sr-only peer" :disabled="isSaving">
            <div class="w-14 h-7 bg-text-secondary/30 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[4px] after:bg-white after:border-border after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-success"></div>
          </label>
        </div>

        <div class="h-px w-full bg-border"></div>

        <!-- Date Pickers -->
        <div class="flex flex-col gap-4">
          <h3 class="text-lg font-heading font-semibold text-text-primary">Periode Pendaftaran</h3>
          <p class="text-sm text-text-secondary mb-2">Atur rentang tanggal kapan pendaftaran dapat diakses oleh calon siswa baru di halaman utama.</p>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <AppInput 
              v-model="startDate" 
              type="date" 
              label="Tanggal Buka" 
              required 
              :disabled="isSaving"
            />
            <AppInput 
              v-model="endDate" 
              type="date" 
              label="Tanggal Tutup" 
              required 
              :disabled="isSaving"
            />
          </div>
        </div>

        <!-- Save Action -->
        <div class="pt-4 flex justify-end">
          <AppButton 
            type="submit" 
            variant="primary" 
            :loading="isSaving" 
            :disabled="isSaving"
            class="min-w-[150px] shadow-md flex items-center justify-center gap-2"
          >
            <Save v-if="!isSaving" class="w-5 h-5 shrink-0" />
            Simpan Pengaturan
          </AppButton>
        </div>
        
      </form>
    </div>
  </div>
</template>
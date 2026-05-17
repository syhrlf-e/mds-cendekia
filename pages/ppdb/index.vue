<script setup lang="ts">
import { ref, computed } from 'vue'

useHead({
  title: 'PPDB MDS Cendekia'
})

// Mock state for MVP, will be integrated with API later
const periodStatus = ref<'open' | 'closed' | 'upcoming'>('open') 
const openDate = ref('1 Juli 2026')
const academicYear = ref('2026/2027')

const daftarLabel = computed(() => {
  if (periodStatus.value === 'upcoming') return `Pendaftaran dibuka ${openDate.value}`
  if (periodStatus.value === 'closed') return 'Pendaftaran telah ditutup'
  return 'Daftar Sekarang'
})

const isDaftarDisabled = computed(() => periodStatus.value !== 'open')
</script>

<template>
  <div class="min-h-screen flex flex-col lg:flex-row bg-bg-base">
    <!-- Left Column: Branding / Illustration (60%) -->
    <div class="hidden lg:flex lg:w-[60%] bg-brand p-12 flex-col justify-center items-center text-white relative overflow-hidden">
      <!-- Decorative background elements -->
      <div class="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
      
      <div class="z-10 text-center max-w-2xl">
        <!-- Logo Placeholder for Desktop -->
        <div class="w-24 h-24 bg-white/20 rounded-2xl mx-auto mb-8 flex items-center justify-center backdrop-blur-sm">
          <span class="text-3xl font-heading font-bold text-white">MDS</span>
        </div>
        <h1 class="text-4xl lg:text-5xl font-heading font-bold mb-6 leading-tight">
          Selamat Datang di<br>MDS Cendekia
        </h1>
        <p class="text-white/80 text-lg lg:text-xl">
          Membangun generasi cerdas, berakhlak mulia, dan berwawasan global.
        </p>
      </div>
    </div>

    <!-- Right Column: Interactive Content (40%) -->
    <div class="w-full lg:w-[40%] flex flex-col p-4 sm:p-8 lg:p-12 h-screen overflow-y-auto bg-bg-surface">
      <div class="flex-grow flex flex-col justify-center max-w-md mx-auto w-full py-12">
        <!-- Logo Placeholder for Mobile -->
        <div class="mb-8 lg:hidden flex items-center gap-3">
          <div class="w-12 h-12 bg-brand rounded-xl flex items-center justify-center">
            <span class="text-lg font-heading font-bold text-white">MDS</span>
          </div>
          <span class="text-xl font-heading font-bold text-text-primary">MDS Cendekia</span>
        </div>
        
        <!-- Hero Content -->
        <div class="mb-12">
          <h1 class="text-3xl sm:text-4xl font-heading font-bold text-text-primary mb-3 leading-tight">
            Penerimaan Peserta Didik Baru
          </h1>
          <p class="text-text-secondary text-lg font-medium">
            Tahun Ajaran {{ academicYear }}
          </p>
        </div>

        <!-- CTA Buttons -->
        <div class="flex flex-col gap-4 mb-12">
          <AppButton 
            variant="primary" 
            :disabled="isDaftarDisabled"
            @click="$router.push('/ppdb/daftar')"
            class="w-full text-lg shadow-lg shadow-cta/20"
          >
            {{ daftarLabel }}
          </AppButton>
          
          <AppButton 
            variant="secondary"
            @click="$router.push('/ppdb/cek-status')"
            class="w-full text-lg"
          >
            Cek Status Pendaftaran
          </AppButton>
        </div>
        
        <!-- Timeline -->
        <div class="mb-10">
          <h2 class="text-xl font-heading font-semibold text-text-primary mb-2">Alur Proses</h2>
          <AppTimeline />
        </div>
        
        <!-- Info Cards -->
        <div class="flex flex-col gap-3 pb-8">
          <AppInfoCard 
            v-for="card in cards" 
            :key="card.id"
            :title="card.title"
            :description="card.description"
            @click="activeCardId = card.id"
          />
        </div>
      </div>
    </div>
    
    <!-- Modals & Bottom Sheets Content -->
    <template v-if="activeCardContent">
      <AppModal 
        v-model="isModalOpen" 
        :title="activeCardContent.title"
      >
        <div v-if="activeCardId === 'alur'" class="space-y-4">
          <ol class="list-decimal pl-5 text-text-primary space-y-2">
            <li>Isi formulir data diri & orang tua</li>
            <li>Upload berkas persyaratan</li>
            <li>Dapatkan nomor pendaftaran</li>
            <li>Tunggu hasil seleksi</li>
          </ol>
        </div>
        
        <div v-else-if="activeCardId === 'syarat'" class="space-y-4">
          <ul class="list-disc pl-5 text-text-primary space-y-2">
            <li>Foto siswa 3x4 berwarna</li>
            <li>Buku Rapor SMP asli & fotocopy</li>
            <li>Surat Keterangan Nilai Rapor Semester I–V</li>
            <li>Ijazah / SKL asli & fotocopy</li>
            <li>Akta Kelahiran asli & fotocopy</li>
            <li>Kartu Keluarga asli & fotocopy</li>
          </ul>
        </div>
        
        <div v-else-if="activeCardId === 'info'" class="space-y-4">
          <ul class="list-disc pl-5 text-text-primary space-y-2">
            <li>Informasi kuota (jika tersedia)</li>
            <li>Kontak sekolah</li>
            <li>Catatan penting dari pihak sekolah</li>
          </ul>
        </div>
      </AppModal>

      <AppBottomSheet 
        v-model="isBottomSheetOpen"
      >
        <div class="mb-4">
          <h3 class="text-xl font-heading font-semibold text-text-primary">{{ activeCardContent.title }}</h3>
        </div>
        
        <div v-if="activeCardId === 'alur'" class="space-y-4">
          <ol class="list-decimal pl-5 text-text-primary space-y-2">
            <li>Isi formulir data diri & orang tua</li>
            <li>Upload berkas persyaratan</li>
            <li>Dapatkan nomor pendaftaran</li>
            <li>Tunggu hasil seleksi</li>
          </ol>
        </div>
        
        <div v-else-if="activeCardId === 'syarat'" class="space-y-4">
          <ul class="list-disc pl-5 text-text-primary space-y-2">
            <li>Foto siswa 3x4 berwarna</li>
            <li>Buku Rapor SMP asli & fotocopy</li>
            <li>Surat Keterangan Nilai Rapor Semester I–V</li>
            <li>Ijazah / SKL asli & fotocopy</li>
            <li>Akta Kelahiran asli & fotocopy</li>
            <li>Kartu Keluarga asli & fotocopy</li>
          </ul>
        </div>
        
        <div v-else-if="activeCardId === 'info'" class="space-y-4">
          <ul class="list-disc pl-5 text-text-primary space-y-2">
            <li>Informasi kuota (jika tersedia)</li>
            <li>Kontak sekolah</li>
            <li>Catatan penting dari pihak sekolah</li>
          </ul>
        </div>
      </AppBottomSheet>
    </template>
  </div>
</template>
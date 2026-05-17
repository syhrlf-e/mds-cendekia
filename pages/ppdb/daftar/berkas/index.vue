<script setup lang="ts">
import { reactive, ref, computed } from 'vue'

useHead({ title: 'Upload Berkas | PPDB MDS Cendekia' })

const berkas = reactive({
  foto: null as File | null,
  rapor: null as File | null,
  skRapor: null as File | null,
  ijazah: null as File | null,
  akta: null as File | null,
  kk: null as File | null
})

const isAllUploaded = computed(() => {
  return berkas.foto && berkas.rapor && berkas.skRapor && berkas.ijazah && berkas.akta && berkas.kk
})

const isConfirmModalOpen = ref(false)
const isSubmitting = ref(false)
const isSuccessSheetOpen = ref(false)
const nomorPendaftaran = ref('')

const proceedSubmit = () => {
  isConfirmModalOpen.value = true
}

const submitForm = async () => {
  isSubmitting.value = true
  
  // Mock API Call delay
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  isSubmitting.value = false
  isConfirmModalOpen.value = false
  
  // Mock generated registration number
  nomorPendaftaran.value = `MDS-2026-${Math.floor(1000 + Math.random() * 9000)}`
  isSuccessSheetOpen.value = true
}
</script>

<template>
  <div class="min-h-screen bg-bg-base py-8 md:py-12 px-4">
    <div class="w-full lg:w-1/2 mx-auto flex flex-col gap-6">
      
      <div class="mb-2">
        <h1 class="text-2xl md:text-3xl font-heading font-bold text-text-primary">Upload Berkas</h1>
        <p class="text-text-secondary mt-1">Unggah dokumen persyaratan untuk menyelesaikan pendaftaran.</p>
      </div>

      <div class="bg-bg-surface border border-border rounded-2xl p-5 md:p-8 flex flex-col gap-6 shadow-sm">
        <AppFileUpload v-model="berkas.foto" label="1. Foto Siswa (3x4 berwarna)" accept=".jpg,.png" :maxSize="1" />
        <AppFileUpload v-model="berkas.rapor" label="2. Buku Rapor SMP" accept=".pdf" :maxSize="2" />
        <AppFileUpload v-model="berkas.skRapor" label="3. Surat Keterangan Nilai Rapor Semester I–V" accept=".pdf" :maxSize="2" />
        <AppFileUpload v-model="berkas.ijazah" label="4. Ijazah / SKL" accept=".pdf" :maxSize="2" />
        <AppFileUpload v-model="berkas.akta" label="5. Akta Kelahiran" accept=".pdf" :maxSize="2" />
        <AppFileUpload v-model="berkas.kk" label="6. Kartu Keluarga" accept=".pdf" :maxSize="2" />
      </div>

      <!-- Tombol Kirim -->
      <div class="flex justify-end">
        <AppButton 
          variant="primary" 
          :disabled="!isAllUploaded" 
          @click="proceedSubmit"
          class="w-full md:w-auto shadow-md"
        >
          Kirim Pendaftaran
        </AppButton>
      </div>

    </div>
  </div>

  <!-- Modal Konfirmasi Submit -->
  <AppModal v-model="isConfirmModalOpen" title="Konfirmasi">
    <p class="text-text-primary text-base">Apakah kamu yakin data dan berkas yang diunggah sudah sesuai?</p>
    
    <template #footer>
      <AppButton variant="secondary" @click="isConfirmModalOpen = false" :disabled="isSubmitting">
        Belum
      </AppButton>
      <AppButton variant="primary" @click="submitForm" :loading="isSubmitting">
        Ya, Kirim
      </AppButton>
    </template>
  </AppModal>

  <!-- Bottom Sheet Hasil Submit -->
  <AppBottomSheet v-model="isSuccessSheetOpen" @close="$router.push('/ppdb/cek-status')">
    <div class="flex flex-col items-center text-center pt-6">
      <div class="w-16 h-16 bg-status-approved text-white rounded-full flex items-center justify-center mb-5 shadow-lg shadow-success/30">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      
      <h3 class="text-2xl font-heading font-bold text-text-primary mb-2">Pendaftaran Berhasil!</h3>
      <p class="text-text-secondary mb-8">Pendaftaran berhasil! Cek email kamu untuk informasi lebih lanjut.</p>
      
      <div class="w-full bg-bg-base border border-border rounded-xl p-5 mb-8">
        <p class="text-sm font-medium text-text-secondary mb-1">Nomor Pendaftaran</p>
        <p class="text-2xl font-heading font-bold text-brand tracking-wider">{{ nomorPendaftaran }}</p>
      </div>

      <AppButton 
        variant="primary" 
        class="w-full"
        @click="$router.push('/ppdb/cek-status')"
      >
        Cek Status Pendaftaran
      </AppButton>
    </div>
  </AppBottomSheet>
</template>
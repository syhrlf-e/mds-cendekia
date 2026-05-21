<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { Download, AlertCircle } from 'lucide-vue-next'

useHead({ title: 'Kartu Peserta | PPDB MDS Cendekia' })

const route = useRoute()
const router = useRouter()

const isGenerating = ref(true)
const errorMsg = ref('')
const cardRef = ref<HTMLElement | null>(null)

// Mock Data
const dataPeserta = ref<any>(null)

onMounted(async () => {
  const paramId = route.query.id

  if (!paramId) {
    errorMsg.value = 'Parameter ID tidak ditemukan.'
    isGenerating.value = false
    return
  }

  // Mock API delay fetching participant data
  await new Promise(resolve => setTimeout(resolve, 1000))

  dataPeserta.value = {
    nomor: 'MDS-2026-1234',
    nama: 'Syahrul Efendi',
    ttl: 'Jakarta, 12 Januari 2011',
    jenisKelamin: 'Laki-laki',
    sekolah: 'SMP Negeri 1 Jakarta',
    noHp: '081234567890',
    email: 'syahrul@example.com'
  }

  // Give DOM time to render the mock data
  setTimeout(() => {
    generatePDF()
  }, 500)
})

const generatePDF = async () => {
  if (!cardRef.value) return
  isGenerating.value = true

  try {
    const canvas = await html2canvas(cardRef.value, {
      scale: 2, // High resolution
      useCORS: true,
      backgroundColor: '#ffffff'
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [canvas.width * 0.264583, canvas.height * 0.264583] // Convert px to mm roughly
    })

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width * 0.264583, canvas.height * 0.264583)
    pdf.save(`Kartu_Peserta_${dataPeserta.value.nomor}.pdf`)

  } catch (err) {
    console.error('Failed to generate PDF:', err)
    errorMsg.value = 'Gagal men-generate PDF. Silakan coba klik tombol unduh manual.'
  } finally {
    isGenerating.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-bg-base flex flex-col items-center justify-center p-4">
    <div class="w-full max-w-2xl flex flex-col items-center">

      <!-- Status State -->
      <div v-if="errorMsg" class="mb-6 p-4 bg-error/10 border border-error rounded-xl flex items-center gap-3 text-error w-full">
        <AlertCircle class="w-6 h-6 shrink-0" />
        <p class="text-sm font-medium">{{ errorMsg }}</p>
      </div>

      <div v-if="isGenerating && !errorMsg" class="mb-6 flex flex-col items-center gap-3">
        <div class="dot-wave">
          <span class="bg-brand"></span>
          <span class="bg-brand"></span>
          <span class="bg-brand"></span>
        </div>
        <p class="text-sm font-medium text-text-secondary">Menyiapkan Kartu Peserta...</p>
      </div>

      <!-- PDF Card Target (Hidden visually on mobile/small screens if needed, but we'll show it as a preview) -->
      <div v-show="dataPeserta" class="w-full bg-white border border-border shadow-xl rounded-none overflow-hidden" ref="cardRef">
        <!-- Header -->
        <div class="border-b border-border p-6 flex items-center justify-center gap-4 bg-brand text-white">
          <!-- TODO: Ganti src dengan path logo MDS yang asli (.jpg/.png) -->
          <img src="/images/logo-mds-main.png" alt="Logo MDS" class="w-16 h-16 object-contain" />
          <div class="flex flex-col">
            <h2 class="text-2xl font-heading font-bold uppercase tracking-wider">Kartu Peserta Didik Baru</h2>
            <p class="text-sm opacity-90 font-medium">Tahun Ajaran 2026/2027 | PPDB MDS Cendekia</p>
          </div>
        </div>

        <!-- Body -->
        <div class="p-8 flex flex-row gap-8">
          <!-- Foto Placeholder -->
          <div class="w-32 h-40 border-2 border-dashed border-border flex flex-col items-center justify-center shrink-0 bg-bg-base text-text-secondary">
            <span class="text-xs font-medium">Foto 3x4</span>
          </div>

          <!-- Biodata -->
          <div class="grow flex flex-col justify-center">
            <div class="grid grid-cols-[140px_auto] gap-y-3 text-sm text-text-primary">
              <div class="font-semibold">Nomor Pendaftaran</div>
              <div class="font-bold text-brand uppercase">{{ dataPeserta?.nomor }}</div>

              <div class="font-semibold">Nama Lengkap</div>
              <div class="uppercase">{{ dataPeserta?.nama }}</div>

              <div class="font-semibold">TTL</div>
              <div>{{ dataPeserta?.ttl }}</div>

              <div class="font-semibold">Jenis Kelamin</div>
              <div>{{ dataPeserta?.jenisKelamin }}</div>

              <div class="font-semibold">Asal Sekolah</div>
              <div>{{ dataPeserta?.sekolah }}</div>

              <div class="font-semibold">No. HP</div>
              <div>{{ dataPeserta?.noHp }}</div>

              <div class="font-semibold">Email</div>
              <div>{{ dataPeserta?.email }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Manual Actions -->
      <div v-if="dataPeserta" class="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
        <AppButton
          variant="primary"
          @click="generatePDF"
          :disabled="isGenerating"
          class="w-full sm:w-auto flex items-center gap-2 shadow-md"
        >
          <Download class="w-5 h-5" /> Unduh Ulang PDF
        </AppButton>
        <AppButton
          variant="secondary"
          @click="$router.push('/ppdb')"
          :disabled="isGenerating"
          class="w-full sm:w-auto"
        >
          Kembali ke Beranda
        </AppButton>
      </div>

    </div>
  </div>
</template>

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

const fields = [
  { label: 'Nomor Pendaftaran', key: 'nomor', important: true },
  { label: 'Nama Lengkap', key: 'nama' },
  { label: 'Tempat, Tgl Lahir', key: 'ttl' },
  { label: 'Jenis Kelamin', key: 'jenisKelamin' },
  { label: 'Asal Sekolah', key: 'sekolah' },
  { label: 'No. HP', key: 'noHp' },
  { label: 'Email', key: 'email' }
]

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
    email: 'syahrul@example.com',
    tahunAjaran: '2026/2027',
    tanggalCetak: '23 Mei 2026'
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
    <div class="w-full max-w-4xl flex flex-col items-center">

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

      <!-- PDF Card Target -->
      <div
        v-show="dataPeserta"
        ref="cardRef"
        class="w-full overflow-hidden bg-white text-[#1d1d1f] shadow-xl"
        style="width: 960px; min-height: 560px;"
      >
        <div class="flex items-center gap-5 bg-[#a7221b] px-10 py-8 text-white">
          <div class="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white p-2">
            <img src="/images/logo-mds-main.png" alt="Logo MDS" class="h-full w-full object-contain" />
          </div>

          <div class="min-w-0">
            <p class="text-xs font-medium uppercase tracking-[0.2em] text-white/80">PPDB MDS Cendekia</p>
            <h2 class="mt-1 font-heading text-3xl font-semibold uppercase leading-tight">
              Kartu Peserta Didik Baru
            </h2>
            <p class="mt-1 text-sm font-medium text-white/85">
              Tahun Ajaran {{ dataPeserta?.tahunAjaran }}
            </p>
          </div>
        </div>

        <div class="border-x border-b border-[#fee3e2] px-10 py-9">
          <div class="grid grid-cols-[220px_1fr] gap-10">
            <div class="flex flex-col items-center">
              <div class="flex h-[260px] w-[195px] items-center justify-center border border-[#fee3e2] bg-[#fafafa]">
                <span class="text-sm font-medium text-[#6b7280]">Foto 3x4</span>
              </div>
              <p class="mt-4 text-center text-xs font-medium uppercase tracking-[0.16em] text-[#6b7280]">
                Peserta
              </p>
            </div>

            <div class="min-w-0">
              <div class="border-b border-[#fee3e2] pb-4">
                <p class="text-xs font-medium uppercase tracking-[0.18em] text-[#6b7280]">
                  Identitas Peserta
                </p>
                <h3 class="mt-2 font-heading text-2xl font-semibold uppercase leading-tight text-[#1d1d1f]">
                  {{ dataPeserta?.nama }}
                </h3>
              </div>

              <div class="mt-5 divide-y divide-[#fee3e2]">
                <div
                  v-for="field in fields"
                  :key="field.key"
                  class="grid grid-cols-[170px_16px_1fr] py-3 text-sm"
                >
                  <dt class="font-medium text-[#6b7280]">{{ field.label }}</dt>
                  <dd class="text-[#6b7280]">:</dd>
                  <dd
                    class="font-medium text-[#1d1d1f]"
                    :class="field.important ? 'text-[#a7221b]' : ''"
                  >
                    {{ dataPeserta?.[field.key] }}
                  </dd>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-8 flex items-end justify-between border-t border-[#fee3e2] pt-5">
            <p class="max-w-md text-xs leading-5 text-[#6b7280]">
              Kartu ini wajib dibawa saat proses daftar ulang. Data pada kartu diterbitkan oleh sistem PPDB MDS Cendekia.
            </p>
            <div class="text-right text-xs text-[#6b7280]">
              <p>Dicetak pada</p>
              <p class="mt-1 font-medium text-[#1d1d1f]">{{ dataPeserta?.tanggalCetak }}</p>
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

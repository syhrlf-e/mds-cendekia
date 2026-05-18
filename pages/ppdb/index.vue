<script setup lang="ts">
import { ref, computed } from 'vue'
import { Calendar, FileText, Wallet, Download } from 'lucide-vue-next'

useHead({
  title: 'PPDB | MDS Cendekia',
  meta: [
    { name: 'description', content: 'Pendaftaran Peserta Didik Baru MDS Cendekia. Membangun generasi cerdas, berakhlak mulia, dan berwawasan global.' }
  ]
})

const periodStatus = ref<'open' | 'closed' | 'upcoming'>('open')
const openDate = ref('1 Juli 2026')
const academicYear = ref('2026/2027')

const daftarLabel = computed(() => {
  if (periodStatus.value === 'upcoming') return `Pendaftaran dibuka ${openDate.value}`
  if (periodStatus.value === 'closed') return 'Pendaftaran telah ditutup'
  return 'Daftar Sekarang'
})

const isDaftarDisabled = computed(() => periodStatus.value !== 'open')

const landingInfo = ref({
  biaya_formulir: 250000,
  spp_bulanan: 850000,
  persyaratan: [
    'Foto siswa 3x4 berwarna',
    'Buku Rapor SMP asli & fotocopy',
    'Surat Keterangan Nilai Rapor Semester I–V',
    'Ijazah / SKL asli & fotocopy',
    'Akta Kelahiran asli & fotocopy',
    'Kartu Keluarga asli & fotocopy'
  ],
  waves: [
    { id: 1, name: 'Gelombang 1', start_date: '2026-07-01', end_date: '2026-07-15' },
    { id: 2, name: 'Gelombang 2', start_date: '2026-07-16', end_date: '2026-07-31' }
  ],
  jadwal_tambahan: [
    { label: 'Pengumuman Hasil Seleksi', value: '5 Agustus 2026' },
    { label: 'Daftar Ulang', value: '6 - 10 Agustus 2026' }
  ],
  active_wave: { name: 'Gelombang 1', fee: 5000000 }
})

const documents = ref([
  { id: 1, title: 'Brosur PPDB MDS Cendekia 2026' },
  { id: 2, title: 'Panduan Pendaftaran Online' }
])

const formatCurrency = (amount: number) => {
  if (!amount) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

const formatDateRange = (startDate: string, endDate: string) => {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }
  return `${formatDate(startDate)} - ${formatDate(endDate)}`
}
</script>

<template>
  <div class="min-h-screen bg-bg-base font-sans">

    <section class="relative min-h-[60vh] overflow-hidden pt-20 pb-16 flex items-center">
      <div class="absolute inset-0 bg-brand opacity-5"></div>

      <div class="relative z-10 w-full px-6 md:px-12 lg:px-24 mx-auto max-w-7xl">
        <div class="max-w-2xl">
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold text-text-primary mb-6 leading-tight">
            Penerimaan Peserta Didik Baru <br/>
            <span class="text-brand">{{ academicYear }}</span>
          </h1>

          <p class="text-lg md:text-xl text-text-secondary mb-10 leading-relaxed font-medium">
            Selamat Datang di PPDB MDS Cendekia.<br />
            Membangun generasi cerdas, berakhlak mulia, dan berwawasan global.
          </p>

          <div class="flex flex-col sm:flex-row gap-4 w-full">
            <AppButton
              variant="primary"
              :disabled="isDaftarDisabled"
              @click="$router.push('/ppdb/daftar')"
              class="flex-1 text-base py-4 shadow-xl shadow-brand/20 font-bold"
            >
              {{ daftarLabel }}
            </AppButton>

            <AppButton
              variant="secondary"
              @click="$router.push('/ppdb/cek-status')"
              class="flex-1 text-base py-4 border-2 font-bold bg-bg-surface hover:bg-bg-base hover:text-brand transition-colors"
            >
              Cek Status Pendaftaran
            </AppButton>
          </div>
        </div>
      </div>
    </section>

    <section class="py-16 bg-bg-surface border-y border-border">
      <div class="w-full px-6 md:px-12 lg:px-24 mx-auto max-w-7xl">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">

          <div class="bg-bg-base rounded-3xl p-8 shadow-sm border border-border hover:shadow-md transition-shadow">
            <div class="flex items-center gap-4 mb-6">
              <div class="w-14 h-14 rounded-2xl bg-brand/10 flex items-center justify-center shrink-0">
                <Calendar class="w-7 h-7 text-brand" />
              </div>
              <h3 class="text-xl font-heading font-bold text-text-primary">Jadwal Pendaftaran</h3>
            </div>
            <ul class="space-y-4 text-sm md:text-base text-text-secondary">
              <li v-for="wave in landingInfo.waves" :key="wave.id" class="flex items-start gap-3">
                <span class="w-2 h-2 rounded-full bg-cta mt-2 shrink-0"></span>
                <span>{{ wave.name }}: <br/><strong class="text-text-primary">{{ formatDateRange(wave.start_date, wave.end_date) }}</strong></span>
              </li>
              <li v-for="(jadwal, index) in landingInfo.jadwal_tambahan" :key="'jadwal-' + index" class="flex items-start gap-3">
                <span class="w-2 h-2 rounded-full bg-border mt-2 shrink-0"></span>
                <span>{{ jadwal.label }}: <br/><strong class="text-text-primary">{{ jadwal.value }}</strong></span>
              </li>
            </ul>
          </div>

          <div class="bg-bg-base rounded-3xl p-8 shadow-sm border border-border hover:shadow-md transition-shadow">
            <div class="flex items-center gap-4 mb-6">
              <div class="w-14 h-14 rounded-2xl bg-brand/10 flex items-center justify-center shrink-0">
                <FileText class="w-7 h-7 text-brand" />
              </div>
              <h3 class="text-xl font-heading font-bold text-text-primary">Persyaratan</h3>
            </div>
            <ul class="space-y-4 text-sm md:text-base text-text-secondary">
              <li v-for="(item, index) in landingInfo.persyaratan" :key="index" class="flex items-start gap-3">
                <span class="w-2 h-2 rounded-full bg-cta mt-2 shrink-0"></span>
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>

          <div class="bg-bg-base rounded-3xl p-8 shadow-sm border border-border hover:shadow-md transition-shadow">
            <div class="flex items-center gap-4 mb-6">
              <div class="w-14 h-14 rounded-2xl bg-brand/10 flex items-center justify-center shrink-0">
                <Wallet class="w-7 h-7 text-brand" />
              </div>
              <h3 class="text-xl font-heading font-bold text-text-primary">Biaya Pendaftaran</h3>
            </div>
            <div class="space-y-4 text-sm md:text-base text-text-secondary">
              <div class="flex justify-between items-center border-b border-border pb-3">
                <span>Biaya Formulir</span>
                <span class="font-bold text-text-primary">{{ formatCurrency(landingInfo.biaya_formulir) }}</span>
              </div>
              <div v-if="landingInfo.active_wave" class="flex justify-between items-center border-b border-border pb-3">
                <span>Uang Pangkal <br/><span class="text-xs">({{ landingInfo.active_wave.name }})</span></span>
                <span class="font-bold text-text-primary">{{ formatCurrency(landingInfo.active_wave.fee) }}</span>
              </div>
              <div class="flex justify-between items-center pt-1">
                <span>SPP Bulanan</span>
                <span class="font-bold text-text-primary">{{ formatCurrency(landingInfo.spp_bulanan) }}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>

    <section class="py-16 bg-bg-base">
      <div class="w-full px-6 md:px-12 lg:px-24 mx-auto max-w-3xl">
        <div class="flex items-center gap-4 mb-8">
          <div class="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
            <Download class="w-6 h-6 text-brand" />
          </div>
          <div>
            <h3 class="text-xl font-heading font-bold text-text-primary">
              Dokumen & Unduhan
            </h3>
            <p class="text-text-secondary text-sm">Download brosur dan berkas panduan pendaftaran.</p>
          </div>
        </div>

        <div v-if="documents && documents.length > 0" class="bg-bg-surface rounded-2xl border border-border overflow-hidden shadow-sm">
          <div class="divide-y divide-border">
            <div
              v-for="doc in documents"
              :key="doc.id"
              class="flex items-center justify-between px-6 py-4 hover:bg-bg-base transition-colors group cursor-pointer"
            >
              <span class="text-base font-medium text-text-primary group-hover:text-brand transition-colors">{{ doc.title }}</span>
              <button
                class="p-2.5 bg-brand text-white hover:bg-brand-hover rounded-xl transition-colors shrink-0 shadow-sm"
                title="Download"
              >
                <Download class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-12 bg-bg-surface rounded-2xl border-2 border-dashed border-border">
          <FileText class="w-12 h-12 text-border mx-auto mb-3" />
          <p class="text-text-secondary font-medium">Belum ada dokumen yang tersedia.</p>
        </div>
      </div>
    </section>

  </div>
</template>

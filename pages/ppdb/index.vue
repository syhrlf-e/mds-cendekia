<script setup lang="ts">
import { ref, computed } from 'vue'
import { Calendar, FileText, Wallet, Download } from 'lucide-vue-next'

useHead({
  title: 'PPDB | MDS Cendekia',
  meta: [
    {
      name: 'description',
      content: 'Informasi PPDB MDS Cendekia 2026/2027 untuk program pendidikan kesetaraan Kejar Paket C, termasuk jadwal, persyaratan, biaya, dan pendaftaran online.'
    },
    {
      property: 'og:title',
      content: 'PPDB MDS Cendekia 2026/2027'
    },
    {
      property: 'og:description',
      content: 'Daftar pendidikan kesetaraan Kejar Paket C di MDS Cendekia. Lihat jadwal, persyaratan dokumen, biaya, dan alur pendaftaran.'
    },
    {
      name: 'twitter:title',
      content: 'PPDB MDS Cendekia 2026/2027'
    },
    {
      name: 'twitter:description',
      content: 'Daftar pendidikan kesetaraan Kejar Paket C di MDS Cendekia. Lihat jadwal, persyaratan dokumen, biaya, dan alur pendaftaran.'
    }
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

const ppdbUrl = useAbsoluteSiteUrl('/ppdb')
const siteHomeUrl = useAbsoluteSiteUrl('/')

useJsonLd(() => {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `PPDB MDS Cendekia Tahun ${academicYear.value}`,
    description: 'Halaman resmi PPDB MDS Cendekia untuk informasi jadwal, persyaratan dokumen, rincian biaya, dan pendaftaran pendidikan kesetaraan.',
    inLanguage: 'id-ID',
    about: {
      '@type': 'EducationalOccupationalProgram',
      name: 'Program Pendidikan Kesetaraan Kejar Paket C',
      educationalCredentialAwarded: 'Ijazah setara SMA',
      provider: {
        '@id': siteHomeUrl ? `${siteHomeUrl}#school` : '#school'
      }
    },
    mainEntity: {
      '@type': 'Course',
      name: 'Kejar Paket C MDS Cendekia',
      description: 'Program pendidikan kesetaraan setara Sekolah Menengah Atas dengan sistem belajar adaptif.',
      provider: {
        '@id': siteHomeUrl ? `${siteHomeUrl}#school` : '#school'
      },
      offers: {
        '@type': 'Offer',
        category: 'PPDB',
        priceCurrency: 'IDR',
        price: landingInfo.value.active_wave.fee,
        availability: isDaftarDisabled.value ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock'
      }
    }
  }

  if (ppdbUrl) schema.url = ppdbUrl

  return schema
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
  <div class="min-h-screen bg-[#FFFFFF] font-sans">
    <section class="relative bg-[#FFFFFF] px-6 py-[160px] lg:pt-[200px] lg:pb-[120px]">
      <div class="public-navbar-container relative z-10 flex flex-col items-start">

        <div class="mb-[24px] flex h-[35px] w-fit px-6 items-center justify-center rounded-full border border-[#E5E5E5] bg-transparent font-heading text-[14px] font-medium text-[#525252] z-20">
          {{ landingInfo.active_wave.name }}
        </div>
        <h1 class="font-heading text-[48px] lg:text-[64px] font-medium leading-[1.1] tracking-tight lg:whitespace-nowrap z-20">
          <span class="text-[#3B3B3B]">Penerimaan Peserta Didik Baru</span><br/>
          <span class="text-brand">Tahun {{ academicYear }}</span>
        </h1>
        <p class="mt-[24px] mb-[54px] max-w-lg font-sans text-[20px] leading-relaxed text-[#525252]">
          Membangun generasi cerdas, berakhlak mulia, dan berwawasan global. Mulai perjalanan pendidikan kesetaraan Anda bersama YMDSC hari ini.
        </p>

        <div class="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <NuxtLink
            v-if="!isDaftarDisabled"
            to="/ppdb/daftar"
            class="flex h-[56px] min-w-[200px] cursor-pointer items-center justify-center rounded-full bg-brand px-8 font-heading text-[18px] font-medium text-white transition-opacity hover:opacity-90"
          >
            {{ daftarLabel }}
          </NuxtLink>
          <button
            v-else
            :disabled="isDaftarDisabled"
            class="flex h-[56px] min-w-[200px] cursor-pointer items-center justify-center rounded-full bg-brand px-8 font-heading text-[18px] font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {{ daftarLabel }}
          </button>
          <NuxtLink
            to="/ppdb/cek-status"
            class="flex h-[56px] min-w-[200px] cursor-pointer items-center justify-center rounded-full border border-[#E5E5E5] bg-transparent px-8 font-heading text-[18px] font-medium text-[#3B3B3B] transition-colors hover:bg-[#F9FAFB]"
          >
            Cek Status Pendaftaran
          </NuxtLink>
        </div>

      </div>
    </section>
    <section class="bg-[#F9FAFB] px-6 py-[120px] border-t border-[#E5E5E5]">
      <div class="public-navbar-container">
        <div class="flex flex-col lg:flex-row gap-[80px]">
          <div class="lg:w-1/3">
            <h2 class="sticky top-[120px] font-heading text-[48px] font-normal leading-tight text-[#3B3B3B]">
              Informasi<br/>Pendaftaran.
            </h2>
          </div>
          <div class="lg:w-2/3 flex flex-col gap-16">
            <div>
              <div class="flex items-center gap-4 mb-8">
                <div class="h-[1px] flex-grow bg-[#E5E5E5]"></div>
                <h3 class="font-sans text-[16px] text-[#6B7280] capitalize font-medium">Jadwal & Gelombang</h3>
              </div>

              <div class="flex flex-col gap-6">
                <div v-for="wave in landingInfo.waves" :key="wave.id" class="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-[#E5E5E5] pb-6">
                  <p class="font-heading text-[28px] font-medium text-[#3B3B3B]">{{ wave.name }}</p>
                  <p class="font-sans text-[18px] text-[#525252] mt-2 sm:mt-0">{{ formatDateRange(wave.start_date, wave.end_date) }}</p>
                </div>
                <div v-for="(jadwal, index) in landingInfo.jadwal_tambahan" :key="'jadwal-' + index" class="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-[#E5E5E5] pb-6">
                  <p class="font-heading text-[24px] font-medium text-[#3B3B3B]">{{ jadwal.label }}</p>
                  <p class="font-sans text-[18px] text-[#525252] mt-2 sm:mt-0">{{ jadwal.value }}</p>
                </div>
              </div>
            </div>
            <div>
              <div class="flex items-center gap-4 mb-8">
                <div class="h-[1px] flex-grow bg-[#E5E5E5]"></div>
                <h3 class="font-sans text-[16px] text-[#6B7280] capitalize font-medium">Persyaratan Dokumen</h3>
              </div>
              <ul class="flex flex-col gap-6">
                <li v-for="(item, index) in landingInfo.persyaratan" :key="index" class="flex items-start gap-4 border-b border-[#E5E5E5] pb-6">
                  <div class="mt-2 h-3 w-3 rounded-full bg-brand shrink-0"></div>
                  <span class="font-heading text-[24px] font-medium text-[#3B3B3B]">{{ item }}</span>
                </li>
              </ul>
            </div>
            <div>
              <div class="flex items-center gap-4 mb-8">
                <div class="h-[1px] flex-grow bg-[#E5E5E5]"></div>
                <h3 class="font-sans text-[16px] text-[#6B7280] capitalize font-medium">Rincian Biaya</h3>
              </div>
              <div class="flex flex-col gap-6">
                <div class="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-[#E5E5E5] pb-6">
                  <span class="font-sans text-[20px] text-[#525252]">Biaya Formulir</span>
                  <span class="font-heading text-[32px] font-medium text-[#3B3B3B]">{{ formatCurrency(landingInfo.biaya_formulir) }}</span>
                </div>
                <div v-if="landingInfo.active_wave" class="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-[#E5E5E5] pb-6">
                  <span class="font-sans text-[20px] text-[#525252]">Uang Pangkal ({{ landingInfo.active_wave.name }})</span>
                  <span class="font-heading text-[32px] font-medium text-[#3B3B3B]">{{ formatCurrency(landingInfo.active_wave.fee) }}</span>
                </div>
                <div class="flex flex-col sm:flex-row sm:items-baseline justify-between pb-2">
                  <span class="font-sans text-[20px] text-[#525252]">SPP Bulanan</span>
                  <span class="font-heading text-[32px] font-medium text-[#3B3B3B]">{{ formatCurrency(landingInfo.spp_bulanan) }}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  </div>
</template>

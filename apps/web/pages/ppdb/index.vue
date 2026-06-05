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

const faqItems = [
  {
    question: 'Apa program yang dibuka pada PPDB MDS Cendekia?',
    answer: 'PPDB MDS Cendekia membuka pendaftaran pendidikan kesetaraan Kejar Paket C setara SMA untuk tahun ajaran 2026/2027.'
  },
  {
    question: 'Siapa yang bisa mendaftar ke MDS Cendekia?',
    answer: 'Calon peserta didik dari berbagai usia dan latar belakang dapat mendaftar selama memenuhi persyaratan dokumen yang diminta untuk program pendidikan kesetaraan.'
  },
  {
    question: 'Dokumen apa saja yang perlu disiapkan?',
    answer: 'Dokumen utama yang perlu disiapkan meliputi foto siswa 3x4 berwarna, rapor SMP, surat keterangan nilai rapor semester I sampai V, ijazah atau SKL, akta kelahiran, dan kartu keluarga.'
  },
  {
    question: 'Kapan jadwal PPDB MDS Cendekia dibuka?',
    answer: 'Gelombang 1 dibuka pada 1 sampai 15 Juli 2026, sedangkan Gelombang 2 dibuka pada 16 sampai 31 Juli 2026. Pengumuman hasil seleksi dijadwalkan pada 5 Agustus 2026.'
  },
  {
    question: 'Berapa biaya pendaftaran dan biaya pendidikan?',
    answer: 'Biaya formulir sebesar Rp 250.000, uang pangkal Gelombang 1 sebesar Rp 5.000.000, dan SPP bulanan sebesar Rp 850.000.'
  },
  {
    question: 'Bagaimana cara mengecek status pendaftaran?',
    answer: 'Status pendaftaran dapat dicek melalui halaman Cek Status Pendaftaran setelah calon peserta didik mengirimkan formulir pendaftaran online.'
  }
] as const

const ppdbUrl = useAbsoluteSiteUrl('/ppdb')
const siteHomeUrl = useAbsoluteSiteUrl('/')

useBreadcrumbJsonLd([
  { name: 'Beranda', path: '/' },
  { name: 'PPDB', path: '/ppdb' }
])

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

useJsonLd(() => {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    name: 'FAQ PPDB MDS Cendekia',
    inLanguage: 'id-ID',
    mainEntity: faqItems.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
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
  <div class="min-h-screen bg-white font-sans">
    <section class="relative bg-white px-0 pb-16 pt-28 md:py-36 lg:pb-24 lg:pt-40 2xl:pb-30 2xl:pt-50">
      <div class="public-navbar-container relative z-10 flex flex-col items-start">

        <div class="z-20 mb-4 flex h-8 w-fit items-center justify-center rounded-full border border-neutral-200 bg-transparent px-4 font-heading text-xs font-medium text-neutral-600 md:mb-5 md:h-9 md:px-5 md:text-sm 2xl:mb-6 2xl:px-6">
          {{ landingInfo.active_wave.name }}
        </div>
        <h1 class="z-20 max-w-md font-heading text-3xl font-medium leading-tight tracking-tight text-text-public-heading md:max-w-none md:text-5xl md:leading-[1.1] lg:text-5xl lg:whitespace-nowrap xl:text-6xl">
          <span class="text-text-public-heading">Penerimaan Peserta Didik Baru</span><br class="hidden md:block"/>
          <span class="text-brand">Tahun {{ academicYear }}</span>
        </h1>
        <p class="mb-8 mt-4 max-w-md font-sans text-sm leading-7 text-neutral-600 md:mb-10 md:mt-5 md:max-w-2xl md:text-lg md:leading-relaxed lg:mb-12 lg:mt-6 2xl:mb-14 2xl:max-w-lg 2xl:text-xl">
          Membangun generasi cerdas, berakhlak mulia, dan berwawasan global. Mulai perjalanan pendidikan kesetaraan Anda bersama YMDSC hari ini.
        </p>

        <div class="flex w-full flex-col gap-3 sm:w-auto sm:flex-row lg:gap-4">
          <NuxtLink
            v-if="!isDaftarDisabled"
            to="/ppdb/verifikasi"
            class="flex h-12 w-full cursor-pointer items-center justify-center rounded-full bg-brand px-6 font-heading text-sm font-medium text-white transition-opacity hover:opacity-90 sm:min-w-48 lg:h-14 lg:min-w-50 lg:px-8 lg:text-lg"
          >
            {{ daftarLabel }}
          </NuxtLink>
          <button
            v-else
            :disabled="isDaftarDisabled"
            class="flex h-12 w-full cursor-pointer items-center justify-center rounded-full bg-brand px-6 font-heading text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-48 lg:h-14 lg:min-w-50 lg:px-8 lg:text-lg"
          >
            {{ daftarLabel }}
          </button>
          <NuxtLink
            to="/ppdb/cek-status"
            class="flex h-12 w-full cursor-pointer items-center justify-center rounded-full border border-neutral-200 bg-transparent px-6 font-heading text-sm font-medium text-text-public-heading transition-colors hover:bg-bg-base sm:min-w-60 sm:whitespace-nowrap lg:h-14 lg:min-w-72 lg:px-8 lg:text-base xl:text-lg"
          >
            Cek Status Pendaftaran
          </NuxtLink>
        </div>

      </div>
    </section>
    <section class="border-t border-neutral-200 bg-bg-base px-0 py-16 md:py-28 lg:py-30">
      <div class="public-navbar-container">
        <div class="flex flex-col gap-10 md:gap-14 lg:flex-row lg:gap-16 2xl:gap-20">
          <div class="lg:w-1/3">
            <h2 class="font-heading text-2xl font-normal leading-tight text-text-public-heading md:text-4xl lg:sticky lg:top-30 lg:text-4xl 2xl:text-5xl">
              Informasi<br/>Pendaftaran.
            </h2>
          </div>
          <div class="flex flex-col gap-10 md:gap-12 lg:w-2/3 2xl:gap-16">
            <div>
              <div class="mb-5 flex items-center gap-3 md:mb-7 md:gap-4 2xl:mb-8">
                <div class="h-px flex-grow bg-border"></div>
                <h3 class="font-sans text-xs font-medium capitalize text-gray-500 md:text-sm 2xl:text-base">Jadwal & Gelombang</h3>
              </div>

              <div class="flex flex-col gap-4 md:gap-5 2xl:gap-6">
                <div v-for="wave in landingInfo.waves" :key="wave.id" class="flex flex-col justify-between border-b border-neutral-200 pb-4 sm:flex-row sm:items-baseline md:pb-5 2xl:pb-6">
                  <p class="font-heading text-xl font-medium text-text-public-heading md:text-2xl 2xl:text-3xl">{{ wave.name }}</p>
                  <p class="mt-1.5 font-sans text-sm text-neutral-600 sm:mt-0 md:text-base 2xl:text-lg">{{ formatDateRange(wave.start_date, wave.end_date) }}</p>
                </div>
                <div v-for="(jadwal, index) in landingInfo.jadwal_tambahan" :key="'jadwal-' + index" class="flex flex-col justify-between border-b border-neutral-200 pb-4 sm:flex-row sm:items-baseline md:pb-5 2xl:pb-6">
                  <p class="font-heading text-lg font-medium text-text-public-heading md:text-xl 2xl:text-2xl">{{ jadwal.label }}</p>
                  <p class="mt-1.5 font-sans text-sm text-neutral-600 sm:mt-0 md:text-base 2xl:text-lg">{{ jadwal.value }}</p>
                </div>
              </div>
            </div>
            <div>
              <div class="mb-5 flex items-center gap-3 md:mb-7 md:gap-4 2xl:mb-8">
                <div class="h-px flex-grow bg-border"></div>
                <h3 class="font-sans text-xs font-medium capitalize text-gray-500 md:text-sm 2xl:text-base">Persyaratan Dokumen</h3>
              </div>
              <ul class="flex flex-col gap-4 md:gap-5 2xl:gap-6">
                <li v-for="(item, index) in landingInfo.persyaratan" :key="index" class="flex items-start gap-3 border-b border-neutral-200 pb-4 md:gap-4 md:pb-5 2xl:pb-6">
                  <div class="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand md:h-2.5 md:w-2.5 2xl:h-3 2xl:w-3"></div>
                  <span class="font-heading text-lg font-medium leading-snug text-text-public-heading md:text-xl 2xl:text-2xl">{{ item }}</span>
                </li>
              </ul>
            </div>
            <div>
              <div class="mb-5 flex items-center gap-3 md:mb-7 md:gap-4 2xl:mb-8">
                <div class="h-px flex-grow bg-border"></div>
                <h3 class="font-sans text-xs font-medium capitalize text-gray-500 md:text-sm 2xl:text-base">Rincian Biaya</h3>
              </div>
              <div class="flex flex-col gap-4 md:gap-5 2xl:gap-6">
                <div class="flex flex-col justify-between border-b border-neutral-200 pb-4 sm:flex-row sm:items-baseline md:pb-5 2xl:pb-6">
                  <span class="font-sans text-sm text-neutral-600 md:text-lg 2xl:text-xl">Biaya Formulir</span>
                  <span class="mt-1 font-heading text-xl font-medium text-text-public-heading sm:mt-0 md:text-2xl 2xl:text-3xl">{{ formatCurrency(landingInfo.biaya_formulir) }}</span>
                </div>
                <div v-if="landingInfo.active_wave" class="flex flex-col justify-between border-b border-neutral-200 pb-4 sm:flex-row sm:items-baseline md:pb-5 2xl:pb-6">
                  <span class="font-sans text-sm text-neutral-600 md:text-lg 2xl:text-xl">Uang Pangkal ({{ landingInfo.active_wave.name }})</span>
                  <span class="mt-1 font-heading text-xl font-medium text-text-public-heading sm:mt-0 md:text-2xl 2xl:text-3xl">{{ formatCurrency(landingInfo.active_wave.fee) }}</span>
                </div>
                <div class="flex flex-col justify-between pb-2 sm:flex-row sm:items-baseline">
                  <span class="font-sans text-sm text-neutral-600 md:text-lg 2xl:text-xl">SPP Bulanan</span>
                  <span class="mt-1 font-heading text-xl font-medium text-text-public-heading sm:mt-0 md:text-2xl 2xl:text-3xl">{{ formatCurrency(landingInfo.spp_bulanan) }}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
    <PublicFaqSection
      title="Pertanyaan"
      highlight="PPDB."
      subtitle="Jawaban ringkas seputar pendaftaran, program, dokumen, jadwal, biaya, dan pengecekan status calon peserta didik."
      :items="faqItems"
    />
  </div>
</template>

<script setup lang="ts">
import { ArrowRight, Instagram, Facebook, Youtube, MapPin, Phone, Mail, Plus, Minus } from 'lucide-vue-next'
import type { GalleryItem } from '~/types/gallery'
import { usePublicGalleryService } from '~/services/usePublicGalleryService'
import { usePublicNewsService } from '~/services/usePublicNewsService'

useHead({
  title: 'Beranda | MDS Cendekia',
  meta: [
    {
      name: 'description',
      content: 'MDS Cendekia menyediakan pendidikan kesetaraan inklusif dan adaptif melalui program Kejar Paket C untuk membantu peserta didik meraih ijazah resmi.'
    },
    {
      property: 'og:title',
      content: 'MDS Cendekia | Pendidikan Kesetaraan dan PPDB Paket C'
    },
    {
      property: 'og:description',
      content: 'Sekolah pendidikan kesetaraan inklusif dengan sistem belajar adaptif untuk semua usia bersama Yayasan Mukti Daris Sasmita Cendekia.'
    },
    {
      name: 'twitter:title',
      content: 'MDS Cendekia | Pendidikan Kesetaraan dan PPDB Paket C'
    },
    {
      name: 'twitter:description',
      content: 'Sekolah pendidikan kesetaraan inklusif dengan sistem belajar adaptif untuk semua usia bersama Yayasan Mukti Daris Sasmita Cendekia.'
    }
  ]
})

useMdsOrganizationJsonLd()
useWebsiteJsonLd()

const homeUrl = useAbsoluteSiteUrl('/')

useJsonLd(() => {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Beranda MDS Cendekia',
    description: 'Informasi resmi MDS Cendekia tentang pendidikan kesetaraan, profil yayasan, galeri, berita, dan PPDB.',
    inLanguage: 'id-ID',
    about: {
      '@id': homeUrl ? `${homeUrl}#school` : '#school'
    }
  }

  if (homeUrl) {
    schema.url = homeUrl
    schema.isPartOf = {
      '@id': `${homeUrl}#website`
    }
  }

  return schema
})

const { listPublicNews } = usePublicNewsService()
const { listPublicGallery } = usePublicGalleryService()

const { data: publicNewsItems, pending: isNewsLoading } = useLazyAsyncData('public-news-home', async () => {
  const { data } = await listPublicNews(5)
  return data
}, {
  server: false,
  default: () => []
})

const visiblePublicNewsItems = computed(() => publicNewsItems.value.slice(0, 4))
const hasMorePublicNews = computed(() => publicNewsItems.value.length > 4)

const { data: publicGalleryItems, pending: isGalleryLoading } = useLazyAsyncData('public-gallery-home', async () => {
  const { data } = await listPublicGallery(12)
  return data
}, {
  server: false,
  default: () => []
})

const galleryFallbackItems: GalleryItem[] = [
  {
    id: 'fallback-1',
    nama: 'Galeri Lingkungan',
    deskripsi: '',
    gambar: '/images/logo-mds-main.png',
    isUtama: true,
    urutan: 1,
    createdAt: '',
    updatedAt: ''
  }
]

const displayGalleryItems = computed(() => publicGalleryItems.value.length ? publicGalleryItems.value : galleryFallbackItems)
const primaryGalleryIndex = computed(() => {
  const featuredIndex = displayGalleryItems.value.findIndex(item => item.isUtama)
  return featuredIndex >= 0 ? featuredIndex : 0
})
const activeGalleryItem = computed(() => {
  return displayGalleryItems.value[primaryGalleryIndex.value] || displayGalleryItems.value[0]
})
const squareGalleryItems = computed(() => displayGalleryItems.value.filter(item => item.id !== activeGalleryItem.value?.id))
const galleryTrackRef = ref<HTMLElement | null>(null)
const currentGalleryIndex = ref(0)

const scrollGalleryItemIntoView = async (index: number) => {
  await nextTick()

  const target = galleryTrackRef.value?.querySelector<HTMLElement>(`[data-gallery-index="${index}"]`)
  target?.scrollIntoView({
    behavior: 'smooth',
    block: 'nearest',
    inline: 'center'
  })
}

const selectGalleryIndex = (index: number) => {
  currentGalleryIndex.value = index
  scrollGalleryItemIntoView(index)
}

const handleGalleryScroll = () => {
  const track = galleryTrackRef.value
  if (!track) return

  const trackCenter = track.scrollLeft + (track.clientWidth / 2)
  const items = Array.from(track.querySelectorAll<HTMLElement>('[data-gallery-index]'))
  const nearestItem = items.reduce<{ index: number, distance: number } | null>((nearest, item) => {
    const itemIndex = Number(item.dataset.galleryIndex)
    const itemCenter = item.offsetLeft + (item.offsetWidth / 2)
    const distance = Math.abs(trackCenter - itemCenter)

    if (!nearest || distance < nearest.distance) return { index: itemIndex, distance }
    return nearest
  }, null)

  if (nearestItem) currentGalleryIndex.value = nearestItem.index
}

const activeFaqIndex = ref<number | null>(null)
const faqList = [
  {
    question: 'Apakah ijazah Kejar Paket C resmi dan setara dengan ijazah SMA biasa?',
    answer: 'Ya, ijazah Kejar Paket C sangat resmi dan diakui oleh negara. Ijazah ini setara dengan ijazah SMA reguler dan sepenuhnya sah digunakan untuk melanjutkan pendidikan ke perguruan tinggi (kuliah), mendaftar CPNS, TNI/Polri, maupun melamar pekerjaan di perusahaan swasta atau BUMN.'
  },
  {
    question: 'Bagaimana jadwal belajarnya? Apakah akan mengganggu waktu kerja saya?',
    answer: 'Tentu tidak. Kami merancang sistem belajar hybrid yang adaptif dan sangat fleksibel. Anda dapat mengakses materi secara mandiri (online) kapan saja di sela-sela waktu kerja, dipadukan dengan sesi tatap muka berkala yang jadwalnya disesuaikan agar tidak mengganggu aktivitas harian Anda.'
  },
  {
    question: 'Siapa saja yang boleh mendaftar? Apakah ada batasan umur?',
    answer: 'Tidak ada batasan umur untuk bergabung! Kami membuka pintu seluas-luasnya secara inklusif bagi siapa saja—baik remaja yang sempat putus sekolah, maupun orang dewasa atau pekerja yang ingin menyelesaikan jenjang pendidikan setara SMA.'
  },
  {
    question: 'Berapa biaya pendaftarannya?',
    answer: 'MDS Cendekia merupakan yayasan nirlaba yang berfokus pada pemberdayaan sosial. Kami menawarkan skema biaya yang sangat terjangkau, dan dalam beberapa kondisi, kami menyediakan program beasiswa/subsidi khusus. Silakan hubungi kami atau klik tombol "Daftarkan Diri Kamu" untuk mendapatkan rincian biaya terbaru.'
  }
]

useJsonLd(() => {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    name: 'FAQ MDS Cendekia',
    inLanguage: 'id-ID',
    mainEntity: faqList.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  }

  if (homeUrl) schema.url = `${homeUrl}#faq`

  return schema
})

watch(publicGalleryItems, () => {
  currentGalleryIndex.value = 0
})

const formatNewsDate = (date: string) => {
  if (!date) return ''
  const parsedDate = new Date(date)
  if (Number.isNaN(parsedDate.getTime())) return date

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(parsedDate)
}

const truncateWords = (text: string, maxWords = 18) => {
  const words = text.trim().split(/\s+/).filter(Boolean)
  if (words.length <= maxWords) return text
  return `${words.slice(0, maxWords).join(' ')}...`
}

const buildNewsPath = (item: { id: string, slug?: string }) => `/berita/${encodeURIComponent(item.slug || item.id)}`
</script>

<template>
  <div class="min-h-screen bg-white font-sans">
    <section class="relative flex min-h-svh flex-col items-center justify-center overflow-hidden pb-14 pt-24 md:min-h-screen md:pb-0 md:pt-20">
      <div class="public-container relative z-10 flex flex-col items-center text-center">
        <div class="pointer-events-none absolute left-1/2 top-1/2 -z-10 aspect-square w-120 max-w-[150vw] -translate-x-1/2 -translate-y-1/2 sm:w-160 md:w-420 md:max-w-[190vw]">
          <span class="absolute inset-0 rounded-full border border-brand/10" />
          <span class="absolute inset-[10%] rounded-full border border-brand/10" />
          <span class="absolute inset-[20%] rounded-full border border-brand/10" />
          <span class="absolute inset-[40%] rounded-full border border-brand/10" />
        </div>

        <h1 class="mb-6 max-w-sm font-heading text-4xl font-medium leading-tight text-text-public-heading sm:max-w-2xl sm:text-5xl md:mb-7 md:max-w-4xl lg:text-5xl xl:mb-8 2xl:max-w-5xl 2xl:text-6xl">
          Tidak ada kata terlambat <br />
          <span class="text-brand">untuk belajar.</span>
        </h1>

        <p class="mb-8 max-w-sm font-heading text-base font-normal leading-relaxed text-text-public-heading md:mb-10 md:max-w-2xl lg:mb-12 2xl:mb-14.5 2xl:max-w-3xl">
          Kami membuka pintu bagi semua usia untuk mendapatkan pendidikan kesetaraan dan vokasi resmi secara inklusif dan berkelanjutan.
        </p>

        <NuxtLink
          to="/ppdb"
          class="flex h-12 w-full max-w-56 cursor-pointer items-center justify-center rounded-full bg-brand px-6 font-heading text-sm font-medium text-white transition-colors hover:bg-brand-hover focus:outline-none md:w-60 md:max-w-none 2xl:h-14 2xl:w-62.5 2xl:text-base"
        >
          Daftarkan Diri Kamu
        </NuxtLink>
      </div>
    </section>

    <section id="profil" class="relative flex flex-col items-center justify-center bg-white px-0 pb-16 pt-24 md:pb-20 md:pt-44 lg:pt-48 xl:pt-56 2xl:pb-25 2xl:pt-[599px]">
      <div class="public-container flex flex-col items-center text-center">
        <h2 class="mb-8 max-w-sm font-heading text-3xl font-normal leading-tight text-text-public-heading sm:max-w-2xl md:mb-12 md:max-w-4xl md:text-4xl lg:mb-16 2xl:mb-28 2xl:max-w-5xl 2xl:text-5xl">
          Berdiri untuk mengabdi, bergerak dengan <span class="text-brand font-medium">legalitas resmi.</span>
        </h2>

        <p class="mb-8 line-clamp-7 max-w-sm text-justify font-sans text-base font-normal leading-relaxed text-text-public-heading sm:max-w-2xl md:mb-10 md:max-w-4xl md:text-lg lg:mb-12 lg:text-xl 2xl:mb-13 2xl:max-w-5xl 2xl:text-2xl">
          Didirikan resmi pada Maret 2026, Yayasan Mukti Daris Sasmita Cendekia (YMDSC) hadir sebagai bentuk nyata kepedulian sosial untuk membangun manusia seutuhnya. Kami berkomitmen membuka akses pendidikan kesetaraan yang inklusif, nirlaba yang berkelanjutan bagi semua kelompok usia. Menjadikan pusat pemberdayaan masyarakat yang berlandaskan nilai-nilai Pancasila untuk membangun manusia seutuhnya.
        </p>

        <NuxtLink
          to="/profil-sekolah"
          class="flex h-12 w-full max-w-72 cursor-pointer items-center justify-center rounded-full border border-border px-6 font-heading text-sm font-normal text-text-public-heading transition-colors hover:bg-gray-50 focus:outline-none md:w-auto md:min-w-68 md:max-w-none md:whitespace-nowrap 2xl:min-w-72 2xl:text-base"
        >
          Selengkapnya tentang kami
        </NuxtLink>
      </div>
    </section>

    <section class="relative flex flex-col items-center justify-center bg-white px-0 pb-16 pt-24 md:pb-20 md:pt-36 lg:pt-40 xl:pt-48 2xl:pb-25 2xl:pt-[326px]">
      <div class="public-container flex flex-col">
        <h2 class="mb-8 max-w-sm text-left font-heading text-3xl font-normal leading-tight text-text-public-heading sm:max-w-2xl md:mb-12 md:max-w-3xl md:text-4xl lg:mb-16 2xl:mb-20 2xl:max-w-4xl 2xl:text-5xl">
          Sistem belajar adaptif, tidak mengorbankan aktivitas harianmu.
        </h2>

        <div class="flex w-full flex-col border-y border-border-public-strong lg:h-80 lg:flex-row 2xl:h-[360px]">
          <!-- Left Column -->
          <div class="flex flex-1 flex-col items-center justify-center px-2 py-10 text-center md:px-4 md:py-12 lg:py-0">
            <h3 class="mb-4 font-heading text-xl font-normal text-text-public-heading md:text-2xl lg:mb-6 2xl:mb-8 2xl:text-3xl">
              Waktu Belajar Fleksibel
            </h3>
            <p class="max-w-sm font-sans text-base font-normal leading-relaxed text-text-public-heading sm:max-w-110 md:text-lg lg:text-lg 2xl:max-w-125 2xl:text-xl">
              Pilihan waktu kelas yang adaptif dan dapat disesuaikan di sela-sela kesibukan kerja atau aktivitas harianmu.
            </p>
          </div>

          <!-- Vertical Divider -->
          <div class="h-px w-full bg-border-public-strong lg:mx-6 lg:my-8 lg:h-auto lg:w-px lg:self-stretch 2xl:mx-8 2xl:my-10"></div>

          <!-- Right Column -->
          <div class="flex flex-1 flex-col items-center justify-center px-2 py-10 text-center md:px-4 md:py-12 lg:py-0">
            <h3 class="mb-4 font-heading text-xl font-normal text-text-public-heading md:text-2xl lg:mb-6 2xl:mb-8 2xl:text-3xl">
              Metode Hybrid Modern
            </h3>
            <p class="max-w-sm font-sans text-base font-normal leading-relaxed text-text-public-heading sm:max-w-110 md:text-lg lg:text-lg 2xl:max-w-125 2xl:text-xl">
              Kombinasi pembelajaran mandiri secara daring (online) yang praktis dan tatap muka berkala untuk pendalaman materi.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 4: Program / Solusi Pendidikan -->
    <section class="relative flex flex-col items-center justify-center bg-white px-0 pt-24 md:pt-36 lg:pt-40 xl:pt-48 2xl:pt-[281px]">
      <div class="public-container flex flex-col items-center">
        <!-- Headline -->
        <h2 class="mb-6 max-w-sm text-center font-heading text-3xl font-normal leading-tight text-text-public-heading sm:max-w-2xl md:mb-7 md:max-w-4xl md:text-4xl 2xl:mb-8 2xl:max-w-5xl 2xl:text-5xl">
          Kami hadir membawa <span class="text-brand">solusi pendidikan</span> kesetaraan terlengkap untukmu.
        </h2>

        <!-- Pill -->
        <div class="mb-6 flex h-8 w-48 items-center justify-center rounded-full border border-brand bg-transparent md:mb-7 2xl:mb-8 2xl:h-[33px] 2xl:w-[202px]">
          <span class="font-heading text-sm font-normal text-brand 2xl:text-base">Program Unggulan Kami</span>
        </div>

        <!-- Card -->
        <div class="group relative z-10 flex min-h-56 w-full max-w-sm cursor-pointer flex-col justify-center overflow-hidden rounded-3xl border border-border-soft bg-white px-5 py-7 text-left shadow-[0_0_8px_0_rgba(0,0,0,0.18)] transition-all sm:max-w-2xl md:min-h-72 md:max-w-[1196px] md:px-8 md:py-8 lg:h-72 lg:max-w-[980px] lg:py-0 xl:max-w-[1040px] 2xl:h-[331px] 2xl:max-w-[1196px] 2xl:px-10">
          <!-- Card Background -->
          <img src="/images/cardgradasi.png" alt="" aria-hidden="true" loading="lazy" decoding="async" class="absolute right-0 top-0 z-0 hidden h-full w-auto translate-x-24 object-cover md:block" />

          <!-- Icon Top Right -->
          <div class="absolute right-5 top-5 z-10 md:right-6 md:top-6 2xl:right-10 2xl:top-10">
            <ArrowRight class="h-6 w-6 text-brand transition-transform duration-300 group-hover:-rotate-45 md:h-7 md:w-7 md:text-white 2xl:h-8 2xl:w-8" />
          </div>

          <!-- Card Content -->
          <h3 class="relative z-10 mb-3 max-w-48 font-heading text-2xl font-medium text-text-public-heading md:max-w-none 2xl:mb-4 2xl:text-3xl">
            Kejar Paket C
          </h3>
          <p class="relative z-10 mb-8 max-w-64 whitespace-nowrap font-sans text-sm font-normal text-text-public-heading md:mb-12 md:max-w-none md:text-base md:whitespace-normal lg:mb-20 lg:text-lg 2xl:mb-[124px] 2xl:text-xl">
            Setara Sekolah Menengah Atas
          </p>
          <p class="relative z-10 max-w-[280px] font-sans text-sm font-normal leading-relaxed text-text-public-heading sm:max-w-100 md:max-w-150 md:text-lg 2xl:max-w-[700px] 2xl:text-xl">
            Raih ijazah resmi setara SMA tanpa harus mengorbankan waktu produktifmu.
          </p>
        </div>

        <!-- Note -->
        <p class="mt-5 text-center font-heading text-sm font-normal text-text-public-heading/50 md:mt-7 md:text-base">
          Program paket lainnya belum tersedia
        </p>
      </div>
    </section>

    <!-- Section 5: Alur Pendaftaran -->
    <section class="relative flex flex-col items-center justify-center bg-white px-0 pt-24 md:pt-44 lg:pt-48 xl:pt-56 2xl:pt-[370px]">
      <div class="public-container flex flex-col items-start justify-between gap-8 md:gap-12 lg:flex-row lg:gap-10 2xl:gap-10">

        <div class="w-full max-w-sm sm:max-w-120 lg:sticky lg:top-30 lg:max-w-100 xl:max-w-110 2xl:max-w-[600px]">
          <h2 class="font-heading text-3xl font-normal leading-tight text-text-public-heading md:text-4xl lg:text-4xl 2xl:text-5xl">
            Langkah mudah bergabung <br />
            <span class="text-brand">bersama kami.</span>
          </h2>
        </div>

        <div class="flex w-full max-w-[620px] flex-col 2xl:max-w-[708px]">
          <div class="border-t border-border-public-strong py-7 md:py-10 2xl:py-12">
            <div class="flex flex-col items-start justify-between gap-3 md:flex-row md:gap-10 xl:gap-12 2xl:gap-40">
              <h3 class="flex-shrink-0 text-left font-heading text-lg font-medium text-text-public-heading md:text-xl 2xl:text-2xl">
                Pendaftaran Awal
              </h3>
              <p class="text-left font-sans text-base font-normal leading-relaxed text-text-public-heading md:text-right lg:text-lg 2xl:text-xl">
                Isi formulir online data diri singkat melalui tombol PPDB.
              </p>
            </div>
          </div>

          <!-- Item 2 -->
          <div class="border-t border-border-public-strong py-7 md:py-10 2xl:py-12">
            <div class="flex flex-col items-start justify-between gap-3 md:flex-row md:gap-10 xl:gap-12 2xl:gap-40">
              <h3 class="flex-shrink-0 text-left font-heading text-lg font-medium text-text-public-heading md:text-xl 2xl:text-2xl">
                Verifikasi Pendaftaran
              </h3>
              <p class="text-left font-sans text-base font-normal leading-relaxed text-text-public-heading md:text-right lg:text-lg 2xl:text-xl">
                Tim kami akan menghubungi untuk verifikasi dokumen.
              </p>
            </div>
          </div>

          <!-- Item 3 -->
          <div class="border-y border-border-public-strong py-7 md:py-10 2xl:py-12">
            <div class="flex flex-col items-start justify-between gap-3 md:flex-row md:gap-10 xl:gap-12 2xl:gap-40">
              <h3 class="flex-shrink-0 text-left font-heading text-lg font-medium text-text-public-heading md:text-xl 2xl:text-2xl">
                Mulai Belajar
              </h3>
              <p class="text-left font-sans text-base font-normal leading-relaxed text-text-public-heading md:text-right lg:text-lg 2xl:text-xl">
                Resmi bergabung sebagai siswa.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 6: Galeri / Lingkungan -->
    <section id="galeri" class="relative flex flex-col items-center justify-center bg-white px-0 pt-24 md:pt-44 lg:pt-48 xl:pt-56 2xl:pt-[303px]">
      <div class="public-container flex flex-col">
        <!-- Baris Pertama -->
        <div class="flex w-full flex-col items-start gap-8 lg:flex-row lg:items-center lg:gap-6">
          <!-- Kolom Kiri: Gambar -->
          <ClientOnly>
            <div class="order-2 aspect-[707/342] w-full flex-shrink-0 overflow-hidden rounded-3xl bg-gray-200 lg:order-none lg:w-[56%] 2xl:w-[707px]">
              <div
                v-if="isGalleryLoading"
                class="h-full w-full animate-pulse bg-gray-200"
              ></div>
              <img
                v-else
                :src="activeGalleryItem?.gambar || '/images/logo-mds-main.png'"
                :alt="activeGalleryItem?.nama || 'Galeri Lingkungan'"
                loading="lazy"
                decoding="async"
                class="h-full w-full object-cover"
              />
            </div>
            <template #fallback>
              <div class="order-2 aspect-[707/342] w-full flex-shrink-0 overflow-hidden rounded-3xl bg-gray-200 lg:order-none lg:w-[56%] 2xl:w-[707px]">
                <div class="h-full w-full animate-pulse bg-gray-200"></div>
              </div>
            </template>
          </ClientOnly>

          <!-- Kolom Kanan: Teks -->
          <div class="order-1 flex-1 lg:order-none">
            <h2 class="max-w-sm font-heading text-3xl font-normal leading-tight text-text-public-heading sm:max-w-2xl md:text-4xl lg:max-w-none lg:text-4xl 2xl:text-5xl">
              Lingkungan belajar yang dirancang untuk tumbuh
            </h2>
          </div>
        </div>

        <!-- Baris Kedua: Carousel Foto Kecil -->
        <ClientOnly>
          <div class="mt-4 w-full md:mt-6">
            <div class="overflow-hidden">
              <div ref="galleryTrackRef" class="gallery-swipe-track flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-1 md:gap-5 xl:grid xl:grid-cols-4 xl:overflow-visible xl:pb-0 2xl:gap-6" @scroll.passive="handleGalleryScroll">
                <template v-if="isGalleryLoading">
                  <div
                    v-for="index in 3"
                    :key="`gallery-skeleton-${index}`"
                    class="gallery-thumb-card aspect-square flex-none animate-pulse overflow-hidden rounded-3xl bg-gray-200 xl:w-full"
                  ></div>
                </template>

                <div
                  v-for="(item, index) in squareGalleryItems"
                  v-else
                  :key="item.id"
                  :data-gallery-index="index"
                  class="gallery-thumb-card group relative aspect-square flex-none snap-start overflow-hidden rounded-3xl bg-gray-200 text-left xl:w-full"
                >
                  <img
                    :src="item.gambar || '/images/logo-mds-main.png'"
                    :alt="item.nama"
                    loading="lazy"
                    decoding="async"
                    class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent px-5 pb-5 pt-14 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <h3 class="truncate font-heading text-base font-semibold">
                      {{ item.nama }}
                    </h3>
                    <p class="mt-1 truncate font-sans text-sm text-white/80">
                      {{ item.deskripsi || 'Galeri lingkungan belajar MDS Cendekia' }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="squareGalleryItems.length > 1 && !isGalleryLoading" class="mt-4 flex items-center justify-center gap-1.5 md:mt-5 md:gap-2">
              <button
                v-for="(item, index) in squareGalleryItems"
                :key="`gallery-dot-${item.id}`"
                type="button"
                class="h-1.5 rounded-full transition-all md:h-2"
                :class="currentGalleryIndex === index ? 'w-5 bg-brand md:w-6' : 'w-1.5 bg-text-public-heading/20 hover:bg-brand/50 md:w-2'"
                :aria-label="`Lihat posisi galeri ${index + 1}`"
                :aria-current="currentGalleryIndex === index ? 'true' : undefined"
                @click="selectGalleryIndex(index)"
              ></button>
            </div>
          </div>
          <template #fallback>
            <div class="mt-4 w-full overflow-hidden md:mt-6">
              <div class="flex gap-4 pb-1 md:gap-5 2xl:gap-6">
                <div
                  v-for="index in 3"
                  :key="`gallery-fallback-${index}`"
                  class="gallery-thumb-card aspect-square flex-none animate-pulse overflow-hidden rounded-3xl bg-gray-200 xl:w-full"
                ></div>
              </div>
            </div>
          </template>
        </ClientOnly>
      </div>
    </section>

    <!-- Section FAQ -->
    <PublicFaqSection
      title="Pertanyaan yang sering"
      highlight="ditanyakan."
      :items="faqList"
    />

    <!-- Section 7: CTA Banner -->
    <section class="relative flex flex-col items-center justify-center bg-white px-0 pb-14 pt-24 md:pt-44 lg:pb-20 lg:pt-48 xl:pt-56 2xl:pb-25 2xl:pt-60">
      <div class="public-container">
        <div class="relative flex min-h-64 w-full flex-col items-center justify-center overflow-hidden rounded-3xl bg-brand px-4 py-9 text-center shadow-lg md:min-h-80 md:py-12 2xl:h-[356px] 2xl:rounded-4xl 2xl:py-0">
          <!-- Background Image -->
          <img src="/images/cardgradasi.png" alt="" aria-hidden="true" loading="lazy" decoding="async" class="absolute inset-0 z-0 h-full w-full scale-[2] object-cover opacity-80" />

          <!-- Content -->
          <div class="relative z-10 flex max-w-sm flex-col items-center px-3 sm:max-w-2xl md:max-w-none md:px-4">
            <h2 class="mb-4 font-heading text-2xl font-semibold leading-tight text-white md:text-4xl lg:mb-8 lg:text-4xl 2xl:mb-10 2xl:text-5xl">
              Siap mengambil kesempatan ini?
            </h2>
            <p class="mb-6 max-w-sm font-sans text-sm font-medium leading-relaxed text-white sm:max-w-2xl md:text-lg 2xl:mb-10 2xl:max-w-[800px] 2xl:text-xl">
              Kuota pendaftaran untuk siswa sangat terbatas. Mari bangun masa depan yang lebih cerah bersama kami.
            </p>
            <NuxtLink to="/ppdb" class="flex h-12 w-full max-w-[280px] cursor-pointer items-center justify-center rounded-full bg-white px-6 font-sans text-sm font-medium text-brand transition-opacity hover:opacity-90 md:h-14 md:max-w-[315px] md:text-base lg:text-lg 2xl:h-[58px] 2xl:text-xl">
              Daftarkan Diri Kamu di Sini
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 8: Berita / Blog -->
    <section id="berita" class="relative flex flex-col items-center justify-center bg-bg-public-muted px-0 py-24 md:py-32 lg:py-32 xl:py-36 2xl:py-40">
      <div class="public-container flex flex-col items-center">
        <!-- Headline -->
        <h2 class="mb-8 max-w-sm text-center font-heading text-3xl font-normal leading-tight text-text-public-heading sm:max-w-2xl md:mb-14 md:text-4xl lg:mb-16 lg:text-4xl 2xl:mb-20 2xl:text-5xl">
          Kabar terbaru dan informasi edukasi.
        </h2>

        <ClientOnly>
          <div class="grid w-full grid-cols-1 justify-center gap-5 sm:grid-cols-2 xl:grid-cols-4 2xl:gap-6">
            <template v-if="isNewsLoading">
              <div
                v-for="index in 4"
                :key="`news-skeleton-${index}`"
                class="flex animate-pulse flex-col overflow-hidden rounded-2xl bg-white shadow-sm sm:rounded-3xl 2xl:min-h-[460px] 2xl:rounded-4xl"
              >
                <div class="flex gap-3 p-3 sm:block sm:p-0">
                  <div class="h-24 w-28 shrink-0 rounded-xl bg-gray-200 sm:h-48 sm:w-full sm:rounded-none lg:h-56 2xl:h-[250px]"></div>
                  <div class="flex min-w-0 flex-1 flex-col sm:p-5 md:p-6 2xl:p-8">
                    <div class="mb-2 flex items-start justify-between gap-2 sm:mb-4 2xl:mb-6">
                      <span class="h-5 w-16 shrink-0 rounded-full bg-gray-200 sm:h-7 sm:w-24"></span>
                    </div>
                    <div class="mb-2 h-10 rounded-xl bg-gray-200 sm:mb-3 sm:h-14 sm:rounded-2xl"></div>
                    <div class="h-8 rounded-xl bg-gray-200 sm:h-12 sm:rounded-2xl"></div>
                    <div class="mt-3 border-t border-border-public-soft pt-3 sm:mt-5 sm:pt-4">
                      <span class="block h-3 w-32 rounded-full bg-gray-200 sm:h-4 sm:w-40"></span>
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <template v-else-if="visiblePublicNewsItems.length">
              <NuxtLink
                v-for="item in visiblePublicNewsItems"
                :key="item.id"
                :to="buildNewsPath(item)"
                class="flex cursor-pointer flex-col overflow-hidden transition-all hover:-translate-y-1 sm:rounded-3xl sm:bg-white sm:shadow-sm sm:hover:shadow-md 2xl:rounded-4xl"
              >
                <div class="flex gap-3 sm:block sm:p-0">
                  <div class="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl sm:h-48 sm:w-full sm:rounded-none lg:h-56 2xl:h-[250px]">
                    <img :src="item.imageUrl || '/images/logo-mds-main.png'" :alt="item.title" loading="lazy" decoding="async" class="h-full w-full object-cover" />
                    <span class="absolute left-3 top-3 hidden rounded-full border border-blue-500 bg-white/95 px-3 py-1 font-sans text-xs font-medium text-blue-500 shadow-sm sm:inline-flex md:px-4 md:text-sm">
                      {{ item.category || 'Berita' }}
                    </span>
                  </div>
                  <div class="flex min-w-0 flex-1 flex-col justify-center sm:justify-start sm:p-5 md:p-6 2xl:p-8">
                    <div class="mb-1 flex items-center gap-2 sm:hidden">
                      <span class="rounded-full border border-blue-500 px-2 py-0.5 font-sans text-[10px] font-medium leading-none text-blue-500">
                        {{ item.category || 'Berita' }}
                      </span>
                      <span class="font-sans text-[11px] leading-none text-gray-400">
                        {{ formatNewsDate(item.publishDate) }}
                      </span>
                    </div>
                    <h3 class="line-clamp-3 min-w-0 font-heading text-base font-medium leading-snug text-text-public-heading sm:mb-3 sm:line-clamp-2 sm:w-full sm:text-lg md:text-xl">
                      {{ item.title }}
                    </h3>
                    <p class="hidden w-full font-sans text-sm leading-relaxed text-gray-500 sm:line-clamp-2 sm:block">
                      {{ truncateWords(item.excerpt, 18) }}
                    </p>
                    <div class="mt-5 hidden border-t border-border-public-soft pt-4 sm:block">
                      <p class="font-sans text-[11px] leading-relaxed text-gray-400 sm:text-xs md:text-sm">
                        Terbit pada tanggal {{ formatNewsDate(item.publishDate) }}
                      </p>
                    </div>
                  </div>
                </div>
              </NuxtLink>
            </template>
            <div v-else class="col-span-full flex min-h-40 items-center justify-center px-8 text-center">
              <p class="font-sans text-lg leading-relaxed text-gray-500">
                Belum ada berita atau informasi yang dibuat
              </p>
            </div>
          </div>

          <NuxtLink
            v-if="hasMorePublicNews"
            to="/berita"
            class="mt-10 flex h-12 cursor-pointer items-center justify-center rounded-full border border-blue-500 bg-transparent px-8 font-sans text-sm font-medium text-blue-500 transition-colors hover:bg-blue-500 hover:text-white md:mt-16 md:text-base 2xl:mt-20"
          >
            Lihat Lebih Banyak
          </NuxtLink>

          <template #fallback>
            <div class="grid w-full grid-cols-1 justify-center gap-5 sm:grid-cols-2 xl:grid-cols-4 2xl:gap-6">
              <div
                v-for="index in 4"
                :key="`news-fallback-${index}`"
                class="flex animate-pulse flex-col overflow-hidden rounded-2xl bg-white shadow-sm sm:rounded-3xl 2xl:min-h-[460px] 2xl:rounded-4xl"
              >
                <div class="flex gap-3 p-3 sm:block sm:p-0">
                  <div class="h-24 w-28 shrink-0 rounded-xl bg-gray-200 sm:h-48 sm:w-full sm:rounded-none lg:h-56 2xl:h-[250px]"></div>
                  <div class="flex min-w-0 flex-1 flex-col sm:p-5 md:p-6 2xl:p-8">
                    <div class="mb-2 flex items-start justify-between gap-2 sm:mb-4 2xl:mb-6">
                      <span class="h-5 w-16 shrink-0 rounded-full bg-gray-200 sm:h-7 sm:w-24"></span>
                    </div>
                    <div class="mb-2 h-10 rounded-xl bg-gray-200 sm:mb-3 sm:h-14 sm:rounded-2xl"></div>
                    <div class="h-8 rounded-xl bg-gray-200 sm:h-12 sm:rounded-2xl"></div>
                    <div class="mt-3 border-t border-border-public-soft pt-3 sm:mt-5 sm:pt-4">
                      <span class="block h-3 w-32 rounded-full bg-gray-200 sm:h-4 sm:w-40"></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </ClientOnly>
      </div>
    </section>
  </div>
</template>

<style scoped>
.gallery-swipe-track {
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}

.gallery-swipe-track::-webkit-scrollbar {
  display: none;
}

.gallery-thumb-card {
  width: calc((100% - 1rem) / 2);
}

@media (min-width: 768px) {
  .gallery-thumb-card {
    width: 18rem;
  }
}

@media (min-width: 1280px) {
  .gallery-thumb-card {
    width: 100%;
  }
}
</style>

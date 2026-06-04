<script setup lang="ts">
import { ArrowRight, Instagram, Facebook, Youtube, MapPin, Phone, Mail } from 'lucide-vue-next'
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

const activeGalleryIndex = ref(-1)
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
const primaryGalleryIndex = computed(() => 0)
const activeGalleryItem = computed(() => {
  if (activeGalleryIndex.value >= 0) return displayGalleryItems.value[activeGalleryIndex.value] || displayGalleryItems.value[primaryGalleryIndex.value]
  return displayGalleryItems.value[primaryGalleryIndex.value] || displayGalleryItems.value[0]
})
const squareGalleryItems = computed(() => displayGalleryItems.value.filter(item => item.id !== activeGalleryItem.value?.id))

const setActiveGallery = (item: GalleryItem) => {
  const nextIndex = displayGalleryItems.value.findIndex(galleryItem => galleryItem.id === item.id)
  if (nextIndex >= 0) activeGalleryIndex.value = nextIndex
}

watch(publicGalleryItems, () => {
  activeGalleryIndex.value = -1
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

const buildNewsPath = (item: { id: string, slug?: string }) => `/berita/${encodeURIComponent(item.slug || item.id)}`
</script>

<template>
  <div class="min-h-screen bg-white font-sans">
    <section class="relative flex min-h-screen flex-col items-center justify-center overflow-hidden pt-20">
      <div class="public-navbar-container relative z-10 flex flex-col items-center text-center">
        <div class="pointer-events-none absolute left-1/2 top-1/2 -z-10 aspect-square w-420 max-w-[190vw] -translate-x-1/2 -translate-y-1/2">
          <span class="absolute inset-0 rounded-full border border-brand/10" />
          <span class="absolute inset-[10%] rounded-full border border-brand/10" />
          <span class="absolute inset-[20%] rounded-full border border-brand/10" />
          <span class="absolute inset-[40%] rounded-full border border-brand/10" />
        </div>

        <h1 class="mb-9.5 max-w-5xl font-heading text-6xl font-medium leading-tight text-text-public-heading">
          Tidak ada kata terlambat <br />
          <span class="text-brand">untuk belajar.</span>
        </h1>

        <p class="mb-14.5 max-w-3xl font-heading text-base font-normal leading-normal text-text-public-heading">
          Kami membuka pintu bagi semua usia untuk mendapatkan pendidikan kesetaraan dan vokasi resmi secara inklusif dan berkelanjutan.
        </p>

        <NuxtLink
          to="/ppdb"
          class="flex h-14 w-62.5 cursor-pointer items-center justify-center rounded-full bg-brand font-heading text-base font-medium text-white transition-colors hover:bg-brand-hover focus:outline-none"
        >
          Daftarkan Diri Kamu
        </NuxtLink>
      </div>
    </section>

    <section id="profil" class="relative flex flex-col items-center justify-center bg-white pt-[599px] pb-25 px-6">
      <div class="public-navbar-container flex flex-col items-center text-center">
        <!-- Headline -->
        <h2 class="mb-28 max-w-5xl font-heading text-5xl font-normal leading-tight text-text-public-heading">
          Berdiri untuk mengabdi, bergerak dengan <span class="text-brand font-medium">legalitas resmi.</span>
        </h2>

        <!-- Description -->
        <p class="mb-13 max-w-5xl font-sans text-2xl font-normal leading-relaxed text-text-public-heading">
          Didirikan resmi pada Maret 2026, Yayasan Mukti Daris Sasmita Cendekia (YMDSC) hadir sebagai bentuk nyata kepedulian sosial untuk membangun manusia seutuhnya. Kami berkomitmen membuka akses pendidikan kesetaraan yang inklusif, nirlaba yang berkelanjutan bagi semua kelompok usia. Menjadikan pusat pemberdayaan masyarakat yang berlandaskan nilai-nilai Pancasila untuk membangun manusia seutuhnya.
        </p>

        <!-- CTA Button -->
        <NuxtLink
          to="/profil-sekolah"
          class="flex h-12 w-[252px] cursor-pointer items-center justify-center rounded-full border border-border font-heading text-base font-normal text-text-public-heading transition-colors hover:bg-gray-50 focus:outline-none"
        >
          Selengkapnya tentang kami
        </NuxtLink>
      </div>
    </section>
    <!-- Section 3: Fitur / Sistem Belajar -->
    <section class="relative flex flex-col items-center justify-center bg-white px-6 pb-25 pt-[326px]">
      <div class="public-navbar-container flex w-full flex-col">
        <!-- Headline -->
        <h2 class="mb-20 max-w-4xl text-left font-heading text-5xl font-normal leading-tight text-text-public-heading">
          Sistem belajar adaptif, tidak mengorbankan aktivitas harianmu.
        </h2>

        <!-- Divider & Content Area -->
        <div class="flex h-[360px] w-full border-y border-border-public-strong">
          <!-- Left Column -->
          <div class="flex flex-1 flex-col items-center justify-center px-4 text-center">
            <h3 class="mb-8 font-heading text-3xl font-normal text-text-public-heading">
              Waktu Belajar Fleksibel
            </h3>
            <p class="max-w-[500px] font-sans text-xl font-normal leading-relaxed text-text-public-heading">
              Pilihan waktu kelas yang adaptif dan dapat disesuaikan di sela-sela kesibukan kerja atau aktivitas harianmu.
            </p>
          </div>

          <!-- Vertical Divider -->
          <div class="mx-8 my-10 w-px self-stretch bg-border-public-strong"></div>

          <!-- Right Column -->
          <div class="flex flex-1 flex-col items-center justify-center px-4 text-center">
            <h3 class="mb-8 font-heading text-3xl font-normal text-text-public-heading">
              Metode Hybrid Modern
            </h3>
            <p class="max-w-[500px] font-sans text-xl font-normal leading-relaxed text-text-public-heading">
              Kombinasi pembelajaran mandiri secara daring (online) yang praktis dan tatap muka berkala untuk pendalaman materi.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 4: Program / Solusi Pendidikan -->
    <section class="relative flex flex-col items-center justify-center bg-white px-6 pt-[281px]">
      <div class="public-navbar-container flex w-full flex-col items-center">
        <!-- Headline -->
        <h2 class="mb-8 max-w-5xl text-center font-heading text-5xl font-normal leading-tight text-text-public-heading">
          Kami hadir membawa <span class="text-brand">solusi pendidikan</span> kesetaraan terlengkap untukmu.
        </h2>

        <!-- Pill -->
        <div class="mb-8 flex h-[33px] w-[202px] items-center justify-center rounded-full border border-brand bg-transparent">
          <span class="font-heading text-base font-normal text-brand">Program Unggulan Kami</span>
        </div>

        <!-- Card -->
        <div class="group relative z-10 flex h-[331px] w-full max-w-[1196px] cursor-pointer flex-col justify-center overflow-hidden rounded-3xl border border-border-soft bg-white px-10 text-left shadow-[0_0_8px_0_rgba(0,0,0,0.25)] transition-all">
          <!-- Card Background -->
          <img src="/images/cardgradasi.png" alt="" aria-hidden="true" loading="lazy" decoding="async" class="absolute right-0 top-0 z-0 h-full w-auto translate-x-24 object-cover" />

          <!-- Icon Top Right -->
          <div class="absolute right-10 top-10 z-10">
            <ArrowRight class="h-8 w-8 text-white transition-transform duration-300 group-hover:-rotate-45" />
          </div>

          <!-- Card Content -->
          <h3 class="relative z-10 mb-4 font-heading text-3xl font-medium text-text-public-heading">
            Kejar Paket C
          </h3>
          <p class="relative z-10 mb-[124px] font-sans text-xl font-normal text-text-public-heading">
            Setara Sekolah Menengah Atas
          </p>
          <p class="relative z-10 max-w-[700px] font-sans text-xl font-normal text-text-public-heading">
            Raih ijazah resmi setara SMA tanpa harus mengorbankan waktu produktifmu.
          </p>
        </div>

        <!-- Note -->
        <p class="mt-7 text-center font-heading text-base font-normal text-text-public-heading/50">
          Program paket lainnya belum tersedia
        </p>
      </div>
    </section>

    <!-- Section 5: Alur Pendaftaran -->
    <section class="relative flex flex-col items-center justify-center bg-white px-6 pt-[370px]">
      <div class="public-navbar-container flex w-full items-start justify-between gap-10">

        <!-- Left Column -->
        <div class="sticky top-30 max-w-[600px]">
          <h2 class="font-heading text-5xl font-normal leading-tight text-text-public-heading">
            Langkah mudah bergabung <br />
            <span class="text-brand">bersama kami.</span>
          </h2>
        </div>

        <!-- Right Column -->
        <div class="flex w-[708px] flex-col">
          <!-- Item 1 -->
          <div class="border-t border-border-public-strong py-12">
            <div class="flex items-start justify-between gap-[162px]">
              <h3 class="flex-shrink-0 text-left font-heading text-2xl font-medium text-text-public-heading">
                Pendaftaran Awal
              </h3>
              <p class="text-right font-sans text-xl font-normal text-text-public-heading">
                Isi formulir online data diri singkat melalui tombol PPDB.
              </p>
            </div>
          </div>

          <!-- Item 2 -->
          <div class="border-t border-border-public-strong py-12">
            <div class="flex items-start justify-between gap-[162px]">
              <h3 class="flex-shrink-0 text-left font-heading text-2xl font-medium text-text-public-heading">
                Verifikasi Pendaftaran
              </h3>
              <p class="text-right font-sans text-xl font-normal text-text-public-heading">
                Tim kami akan menghubungi untuk verifikasi dokumen.
              </p>
            </div>
          </div>

          <!-- Item 3 -->
          <div class="border-y border-border-public-strong py-12">
            <div class="flex items-start justify-between gap-[162px]">
              <h3 class="flex-shrink-0 text-left font-heading text-2xl font-medium text-text-public-heading">
                Mulai Belajar
              </h3>
              <p class="text-right font-sans text-xl font-normal text-text-public-heading">
                Resmi bergabung sebagai siswa.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 6: Galeri / Lingkungan -->
    <section id="galeri" class="relative flex flex-col items-center justify-center bg-white px-6 pt-[303px]">
      <div class="public-navbar-container flex w-full flex-col">
        <!-- Baris Pertama -->
        <div class="flex w-full items-center gap-6">
          <!-- Kolom Kiri: Gambar -->
          <div class="h-[342px] w-[707px] flex-shrink-0 overflow-hidden rounded-3xl bg-gray-200">
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

          <!-- Kolom Kanan: Teks -->
          <div class="flex-1">
            <h2 class="font-heading text-5xl font-normal leading-tight text-text-public-heading">
              Lingkungan belajar yang dirancang untuk tumbuh
            </h2>
          </div>
        </div>

        <!-- Baris Kedua: Carousel Foto Kecil -->
        <div class="mt-6 w-full overflow-hidden">
          <div class="gallery-swipe-track flex gap-6 overflow-x-auto scroll-smooth pb-1">
            <template v-if="isGalleryLoading">
              <div
                v-for="index in 3"
                :key="`gallery-skeleton-${index}`"
                class="aspect-square h-[341px] w-[341px] flex-none animate-pulse overflow-hidden rounded-3xl bg-gray-200"
              ></div>
            </template>

            <button
              v-for="item in squareGalleryItems"
              v-else
              :key="item.id"
              type="button"
              class="group relative aspect-square h-[341px] w-[341px] flex-none snap-start overflow-hidden rounded-3xl bg-gray-200 text-left"
              :aria-label="`Tampilkan ${item.nama}`"
              @click="setActiveGallery(item)"
            >
              <img
                :src="item.gambar || '/images/logo-mds-main.png'"
                :alt="item.nama"
                loading="lazy"
                decoding="async"
                class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <span
                class="absolute inset-0 border-3 border-transparent transition-colors"
                :class="activeGalleryItem?.id === item.id ? 'border-brand' : 'group-hover:border-white/70'"
              ></span>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 7: CTA Banner -->
    <section class="relative flex flex-col items-center justify-center bg-white px-6 pt-60 pb-25">
      <div class="relative flex h-[356px] w-full max-w-[1435px] flex-col items-center justify-center overflow-hidden rounded-4xl bg-brand text-center shadow-lg">
        <!-- Background Image -->
        <img src="/images/cardgradasi.png" alt="" aria-hidden="true" loading="lazy" decoding="async" class="absolute inset-0 z-0 h-full w-full scale-[2] object-cover opacity-80" />

        <!-- Content -->
        <div class="relative z-10 flex flex-col items-center px-4">
          <h2 class="mb-10 font-heading text-5xl font-semibold text-white">
            Siap mengambil kesempatan ini?
          </h2>
          <p class="mb-10 max-w-[800px] font-sans text-xl font-medium text-white">
            Kuota pendaftaran untuk siswa sangat terbatas. Mari bangun masa depan yang lebih cerah bersama kami.
          </p>
          <NuxtLink to="/ppdb" class="flex h-[58px] w-[315px] cursor-pointer items-center justify-center rounded-full bg-white font-sans text-xl font-medium text-brand transition-opacity hover:opacity-90">
            Daftarkan Diri Kamu di Sini
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Section 8: Berita / Blog -->
    <section id="berita" class="relative flex flex-col items-center justify-center bg-bg-public-muted px-6 py-40">
      <div class="public-navbar-container flex w-full flex-col items-center">
        <!-- Headline -->
        <h2 class="mb-20 text-center font-heading text-5xl font-normal leading-tight text-text-public-heading">
          Kabar terbaru dan informasi edukasi.
        </h2>

        <div class="grid w-full grid-cols-4 gap-6">
          <template v-if="isNewsLoading">
            <div
              v-for="index in 4"
              :key="`news-skeleton-${index}`"
              class="flex min-h-[460px] animate-pulse flex-col overflow-hidden rounded-4xl bg-white shadow-sm"
            >
              <div class="h-[250px] w-full bg-gray-200"></div>
              <div class="flex flex-col p-8">
                <div class="mb-6 flex items-center justify-between gap-4">
                  <span class="h-7 w-24 rounded-full bg-gray-200"></span>
                  <span class="h-4 w-28 rounded-full bg-gray-200"></span>
                </div>
                <div class="mb-4 h-16 rounded-2xl bg-gray-200"></div>
                <div class="h-20 rounded-2xl bg-gray-200"></div>
              </div>
            </div>
          </template>
          <template v-else-if="visiblePublicNewsItems.length">
            <NuxtLink
              v-for="item in visiblePublicNewsItems"
              :key="item.id"
              :to="buildNewsPath(item)"
              class="flex cursor-pointer flex-col overflow-hidden rounded-4xl bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <img :src="item.imageUrl || '/images/logo-mds-main.png'" :alt="item.title" loading="lazy" decoding="async" class="h-[250px] w-full object-cover" />
              <div class="flex flex-col p-8">
                <div class="mb-6 flex items-center justify-between gap-4">
                  <span class="rounded-full border border-blue-500 px-4 py-1 font-sans text-sm font-medium text-blue-500">
                    {{ item.category || 'Berita' }}
                  </span>
                  <span class="text-right font-sans text-sm text-gray-400">
                    {{ formatNewsDate(item.publishDate) }}
                  </span>
                </div>
                <h3 class="mb-4 font-heading text-xl font-medium leading-snug text-text-public-heading">
                  {{ item.title }}
                </h3>
                <p class="font-sans text-sm leading-relaxed text-gray-500">
                  {{ item.excerpt }}
                </p>
              </div>
            </NuxtLink>
          </template>
          <div v-else class="col-span-4 flex min-h-40 items-center justify-center px-8 text-center">
            <p class="font-sans text-lg leading-relaxed text-gray-500">
              Belum ada berita atau informasi yang dibuat
            </p>
          </div>
        </div>

        <NuxtLink
          v-if="hasMorePublicNews"
          to="/berita"
          class="mt-20 flex h-12 cursor-pointer items-center justify-center rounded-full border border-blue-500 bg-transparent px-8 font-sans text-base font-medium text-blue-500 transition-colors hover:bg-blue-500 hover:text-white"
        >
          Lihat Lebih Banyak
        </NuxtLink>
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
</style>

<script setup lang="ts">
import { ArrowRight, Instagram, Facebook, Youtube, MapPin, Phone, Mail } from 'lucide-vue-next'
import type { GalleryItem } from '~/types/adminGallery'
import { usePublicGalleryService } from '~/services/usePublicGalleryService'
import { usePublicNewsService } from '~/services/usePublicNewsService'

useHead({
  title: 'Beranda | MDS Cendekia',
  meta: [
    { name: 'description', content: 'Yayasan Mukti Desa Sasmita Cendekia. Solusi pendidikan kesetaraan terbaik.' }
  ]
})

const { listPublicNews } = usePublicNewsService()
const { listPublicGallery } = usePublicGalleryService()

const { data: publicNewsItems, pending: isNewsLoading } = await useAsyncData('public-news-home', async () => {
  const { data } = await listPublicNews(5)
  return data
}, {
  default: () => []
})

const visiblePublicNewsItems = computed(() => publicNewsItems.value.slice(0, 4))
const hasMorePublicNews = computed(() => publicNewsItems.value.length > 4)

const { data: publicGalleryItems, pending: isGalleryLoading } = await useAsyncData('public-gallery-home', async () => {
  const { data } = await listPublicGallery(12)
  return data
}, {
  default: () => []
})

const activeGalleryIndex = ref(-1)
const galleryFallbackItems: GalleryItem[] = [
  {
    id: 'fallback-1',
    nama: 'Galeri Lingkungan',
    deskripsi: '',
    gambar: '/images/beranda.jpg',
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
</script>

<template>
  <div class="min-h-screen bg-[#FFFFFF] font-sans">
    <!-- Hero Section -->
    <section class="relative flex min-h-screen flex-col items-center justify-center overflow-hidden pt-[80px]">
      <div class="public-navbar-container relative z-10 flex flex-col items-center text-center">
        <div class="pointer-events-none absolute left-1/2 top-1/2 -z-10 aspect-square w-[1680px] max-w-[190vw] -translate-x-1/2 -translate-y-1/2">
          <span class="absolute inset-0 rounded-full border border-brand/10" />
          <span class="absolute inset-[10%] rounded-full border border-brand/10" />
          <span class="absolute inset-[20%] rounded-full border border-brand/10" />
          <span class="absolute inset-[40%] rounded-full border border-brand/10" />
        </div>

        <!-- Hero Headline -->
        <h1 class="mb-[38px] max-w-5xl font-heading text-[64px] font-medium leading-tight text-[#3B3B3B]">
          Tidak ada kata terlambat <br />
          <span class="text-[#A7221B]">untuk belajar.</span>
        </h1>

        <!-- Subheadline -->
        <p class="mb-[58px] max-w-3xl font-heading text-[16px] font-normal leading-normal text-[#3B3B3B]">
          Kami membuka pintu bagi semua usia untuk mendapatkan pendidikan kesetaraan dan vokasi resmi secara inklusif dan berkelanjutan.
        </p>

        <!-- CTA Button -->
        <NuxtLink
          to="/ppdb"
          class="flex h-[56px] w-[250px] cursor-pointer items-center justify-center rounded-full bg-brand font-heading text-[16px] font-medium text-white transition-colors hover:bg-brand-hover focus:outline-none"
        >
          Daftarkan Diri Kamu
        </NuxtLink>
      </div>
    </section>

    <!-- Profil / Legalitas Section -->
    <section id="profil" class="relative flex flex-col items-center justify-center bg-[#FFFFFF] pt-[599px] pb-[100px] px-6">
      <div class="public-navbar-container flex flex-col items-center text-center">
        <!-- Headline -->
        <h2 class="mb-[110px] max-w-5xl font-heading text-[48px] font-normal leading-tight text-[#3B3B3B]">
          Berdiri untuk mengabdi, bergerak dengan <span class="text-[#A7221B] font-medium">legalitas resmi.</span>
        </h2>

        <!-- Description -->
        <p class="mb-[52px] max-w-5xl font-sans text-[24px] font-normal leading-relaxed text-[#3B3B3B]">
          Didirikan resmi pada Maret 2026, Yayasan Mukti Daris Sasmita Cendekia (YMDSC) hadir sebagai bentuk nyata kepedulian sosial untuk membangun manusia seutuhnya. Kami berkomitmen membuka akses pendidikan kesetaraan yang inklusif, nirlaba yang berkelanjutan bagi semua kelompok usia. Menjadikan pusat pemberdayaan masyarakat yang berlandaskan nilai-nilai Pancasila untuk membangun manusia seutuhnya.
        </p>

        <!-- CTA Button -->
        <NuxtLink
          to="/profil-sekolah"
          class="flex h-[48px] w-[252px] cursor-pointer items-center justify-center rounded-full border border-border font-heading text-[16px] font-normal text-[#3B3B3B] transition-colors hover:bg-gray-50 focus:outline-none"
        >
          Selengkapnya tentang kami
        </NuxtLink>
      </div>
    </section>
    <!-- Section 3: Fitur / Sistem Belajar -->
    <section class="relative flex flex-col items-center justify-center bg-[#FFFFFF] px-6 pb-[100px] pt-[326px]">
      <div class="public-navbar-container flex w-full flex-col">
        <!-- Headline -->
        <h2 class="mb-[82px] max-w-4xl text-left font-heading text-[48px] font-normal leading-tight text-[#3B3B3B]">
          Sistem belajar adaptif, tidak mengorbankan aktivitas harianmu.
        </h2>

        <!-- Divider & Content Area -->
        <div class="flex h-[360px] w-full border-y border-[#3B3B3B]">
          <!-- Left Column -->
          <div class="flex flex-1 flex-col items-center justify-center px-4 text-center">
            <h3 class="mb-[32px] font-heading text-[32px] font-normal text-[#3B3B3B]">
              Waktu Belajar Fleksibel
            </h3>
            <p class="max-w-[500px] font-sans text-[20px] font-normal leading-relaxed text-[#3B3B3B]">
              Pilihan waktu kelas yang adaptif dan dapat disesuaikan di sela-sela kesibukan kerja atau aktivitas harianmu.
            </p>
          </div>

          <!-- Vertical Divider -->
          <div class="mx-[32px] my-[40px] w-[1px] self-stretch bg-[#3B3B3B]"></div>

          <!-- Right Column -->
          <div class="flex flex-1 flex-col items-center justify-center px-4 text-center">
            <h3 class="mb-[32px] font-heading text-[32px] font-normal text-[#3B3B3B]">
              Metode Hybrid Modern
            </h3>
            <p class="max-w-[500px] font-sans text-[20px] font-normal leading-relaxed text-[#3B3B3B]">
              Kombinasi pembelajaran mandiri secara daring (online) yang praktis dan tatap muka berkala untuk pendalaman materi.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 4: Program / Solusi Pendidikan -->
    <section class="relative flex flex-col items-center justify-center bg-[#FFFFFF] px-6 pt-[281px]">
      <div class="public-navbar-container flex w-full flex-col items-center">
        <!-- Headline -->
        <h2 class="mb-[32px] max-w-5xl text-center font-heading text-[48px] font-normal leading-tight text-[#3B3B3B]">
          Kami hadir membawa <span class="text-brand">solusi pendidikan</span> kesetaraan terlengkap untukmu.
        </h2>

        <!-- Pill -->
        <div class="mb-[32px] flex h-[33px] w-[202px] items-center justify-center rounded-full border border-brand bg-transparent">
          <span class="font-heading text-[16px] font-normal text-brand">Program Unggulan Kami</span>
        </div>

        <!-- Card -->
        <div class="group relative z-10 flex h-[331px] w-full max-w-[1196px] cursor-pointer flex-col justify-center overflow-hidden rounded-[24px] border border-border-soft bg-[#FFFFFF] px-[40px] text-left shadow-[0_0_8px_0_rgba(0,0,0,0.25)] transition-all">
          <!-- Card Background -->
          <img src="/images/cardgradasi.png" alt="Card Background" class="absolute right-0 top-0 z-0 h-full w-auto translate-x-24 object-cover" />
          
          <!-- Icon Top Right -->
          <div class="absolute right-[40px] top-[40px] z-10">
            <ArrowRight class="h-8 w-8 text-white transition-transform duration-300 group-hover:-rotate-45" />
          </div>

          <!-- Card Content -->
          <h3 class="relative z-10 mb-[18px] font-heading text-[32px] font-medium text-[#3B3B3B]">
            Kejar Paket C
          </h3>
          <p class="relative z-10 mb-[124px] font-sans text-[20px] font-normal text-[#3B3B3B]">
            Setara Sekolah Menengah Atas
          </p>
          <p class="relative z-10 max-w-[700px] font-sans text-[20px] font-normal text-[#3B3B3B]">
            Raih ijazah resmi setara SMA tanpa harus mengorbankan waktu produktifmu.
          </p>
        </div>

        <!-- Note -->
        <p class="mt-[28px] text-center font-heading text-[16px] font-normal text-[#3B3B3B]/50">
          Program paket lainnya belum tersedia
        </p>
      </div>
    </section>

    <!-- Section 5: Alur Pendaftaran -->
    <section class="relative flex flex-col items-center justify-center bg-[#FFFFFF] px-6 pt-[370px]">
      <div class="public-navbar-container flex w-full items-start justify-between gap-10">
        
        <!-- Left Column -->
        <div class="sticky top-[120px] max-w-[600px]">
          <h2 class="font-heading text-[48px] font-normal leading-tight text-[#3B3B3B]">
            Langkah mudah bergabung <br />
            <span class="text-brand">bersama kami.</span>
          </h2>
        </div>

        <!-- Right Column -->
        <div class="flex w-[708px] flex-col">
          <!-- Item 1 -->
          <div class="border-t border-[#3B3B3B] py-[48px]">
            <div class="flex items-start justify-between gap-[162px]">
              <h3 class="flex-shrink-0 text-left font-heading text-[26px] font-medium text-[#3B3B3B]">
                Pendaftaran Awal
              </h3>
              <p class="text-right font-sans text-[20px] font-normal text-[#3B3B3B]">
                Isi formulir online data diri singkat melalui tombol PPDB.
              </p>
            </div>
          </div>

          <!-- Item 2 -->
          <div class="border-t border-[#3B3B3B] py-[48px]">
            <div class="flex items-start justify-between gap-[162px]">
              <h3 class="flex-shrink-0 text-left font-heading text-[26px] font-medium text-[#3B3B3B]">
                Verifikasi Pendaftaran
              </h3>
              <p class="text-right font-sans text-[20px] font-normal text-[#3B3B3B]">
                Tim kami akan menghubungi untuk verifikasi dokumen.
              </p>
            </div>
          </div>

          <!-- Item 3 -->
          <div class="border-y border-[#3B3B3B] py-[48px]">
            <div class="flex items-start justify-between gap-[162px]">
              <h3 class="flex-shrink-0 text-left font-heading text-[26px] font-medium text-[#3B3B3B]">
                Mulai Belajar
              </h3>
              <p class="text-right font-sans text-[20px] font-normal text-[#3B3B3B]">
                Resmi bergabung sebagai siswa.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 6: Galeri / Lingkungan -->
    <section id="galeri" class="relative flex flex-col items-center justify-center bg-[#FFFFFF] px-6 pt-[303px]">
      <div class="public-navbar-container flex w-full flex-col">
        <!-- Baris Pertama -->
        <div class="flex w-full items-center gap-[24px]">
          <!-- Kolom Kiri: Gambar -->
          <div class="h-[342px] w-[707px] flex-shrink-0 overflow-hidden rounded-[24px] bg-gray-200">
            <div
              v-if="isGalleryLoading"
              class="h-full w-full animate-pulse bg-[#E5E7EB]"
            ></div>
            <img
              v-else
              :src="activeGalleryItem?.gambar || '/images/beranda.jpg'"
              :alt="activeGalleryItem?.nama || 'Galeri Lingkungan'"
              class="h-full w-full object-cover"
            />
          </div>
          
          <!-- Kolom Kanan: Teks -->
          <div class="flex-1">
            <h2 class="font-heading text-[48px] font-normal leading-tight text-[#3B3B3B]">
              Lingkungan belajar yang dirancang untuk tumbuh
            </h2>
          </div>
        </div>

        <!-- Baris Kedua: Carousel Foto Kecil -->
        <div class="mt-[24px] w-full overflow-hidden">
          <div class="gallery-swipe-track flex gap-[24px] overflow-x-auto scroll-smooth pb-1">
            <template v-if="isGalleryLoading">
              <div
                v-for="index in 3"
                :key="`gallery-skeleton-${index}`"
                class="aspect-square h-[341px] w-[341px] flex-none animate-pulse overflow-hidden rounded-[24px] bg-[#E5E7EB]"
              ></div>
            </template>

            <button
              v-for="item in squareGalleryItems"
              v-else
              :key="item.id"
              type="button"
              class="group relative aspect-square h-[341px] w-[341px] flex-none snap-start overflow-hidden rounded-[24px] bg-gray-200 text-left"
              :aria-label="`Tampilkan ${item.nama}`"
              @click="setActiveGallery(item)"
            >
              <img
                :src="item.gambar || '/images/beranda.jpg'"
                :alt="item.nama"
                class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <span
                class="absolute inset-0 border-[3px] border-transparent transition-colors"
                :class="activeGalleryItem?.id === item.id ? 'border-brand' : 'group-hover:border-white/70'"
              ></span>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 7: CTA Banner -->
    <section class="relative flex flex-col items-center justify-center bg-[#FFFFFF] px-6 pt-[240px] pb-[100px]">
      <div class="relative flex h-[356px] w-full max-w-[1435px] flex-col items-center justify-center overflow-hidden rounded-[32px] bg-brand text-center shadow-lg">
        <!-- Background Image -->
        <img src="/images/cardgradasi.png" alt="CTA Background" class="absolute inset-0 z-0 h-full w-full scale-[2] object-cover opacity-80" />
        
        <!-- Content -->
        <div class="relative z-10 flex flex-col items-center px-4">
          <h2 class="mb-[42px] font-heading text-[48px] font-semibold text-white">
            Siap mengambil kesempatan ini?
          </h2>
          <p class="mb-[42px] max-w-[800px] font-sans text-[20px] font-medium text-white">
            Kuota pendaftaran untuk siswa sangat terbatas. Mari bangun masa depan yang lebih cerah bersama kami.
          </p>
          <NuxtLink to="/ppdb" class="flex h-[58px] w-[315px] cursor-pointer items-center justify-center rounded-full bg-white font-sans text-[20px] font-medium text-brand transition-opacity hover:opacity-90">
            Daftarkan Dirikamu Disini
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Section 8: Berita / Blog -->
    <section id="berita" class="relative flex flex-col items-center justify-center bg-[#F8F9FA] px-6 py-[160px]">
      <div class="public-navbar-container flex w-full flex-col items-center">
        <!-- Headline -->
        <h2 class="mb-[80px] text-center font-heading text-[48px] font-normal leading-tight text-[#3B3B3B]">
          Kabar terbaru dan informasi edukasi.
        </h2>

        <div class="grid w-full grid-cols-4 gap-[24px]">
          <template v-if="isNewsLoading">
            <div
              v-for="index in 4"
              :key="`news-skeleton-${index}`"
              class="flex min-h-[460px] animate-pulse flex-col overflow-hidden rounded-[32px] bg-white shadow-sm"
            >
              <div class="h-[250px] w-full bg-[#E5E7EB]"></div>
              <div class="flex flex-col p-[32px]">
                <div class="mb-[24px] flex items-center justify-between gap-4">
                  <span class="h-7 w-24 rounded-full bg-[#E5E7EB]"></span>
                  <span class="h-4 w-28 rounded-full bg-[#E5E7EB]"></span>
                </div>
                <div class="mb-[16px] h-16 rounded-2xl bg-[#E5E7EB]"></div>
                <div class="h-20 rounded-2xl bg-[#E5E7EB]"></div>
              </div>
            </div>
          </template>
          <template v-else-if="visiblePublicNewsItems.length">
            <NuxtLink
              v-for="item in visiblePublicNewsItems"
              :key="item.id"
              :to="`/berita/${item.id}`"
              class="flex cursor-pointer flex-col overflow-hidden rounded-[32px] bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <img :src="item.imageUrl || '/images/beranda.jpg'" :alt="item.title" class="h-[250px] w-full object-cover" />
              <div class="flex flex-col p-[32px]">
                <div class="mb-[24px] flex items-center justify-between gap-4">
                  <span class="rounded-full border border-[#3B82F6] px-4 py-1 font-sans text-[14px] font-medium text-[#3B82F6]">
                    {{ item.category || 'Berita' }}
                  </span>
                  <span class="text-right font-sans text-[14px] text-[#9CA3AF]">
                    {{ formatNewsDate(item.publishDate) }}
                  </span>
                </div>
                <h3 class="mb-[16px] font-heading text-[20px] font-medium leading-snug text-[#3B3B3B]">
                  {{ item.title }}
                </h3>
                <p class="font-sans text-[14px] leading-relaxed text-[#6B7280]">
                  {{ item.excerpt }}
                </p>
              </div>
            </NuxtLink>
          </template>
          <div v-else class="col-span-4 flex min-h-[160px] items-center justify-center px-8 text-center">
            <p class="font-sans text-[18px] leading-relaxed text-[#6B7280]">
              Belum ada berita atau informasi yang dibuat
            </p>
          </div>
        </div>

        <button
          v-if="hasMorePublicNews"
          class="mt-[80px] flex h-[48px] cursor-pointer items-center justify-center rounded-full border border-[#3B82F6] bg-transparent px-8 font-sans text-[16px] font-medium text-[#3B82F6] transition-colors hover:bg-[#3B82F6] hover:text-white"
        >
          Lihat Lebih Banyak
        </button>
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

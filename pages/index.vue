<script setup lang="ts">
import { ArrowRight, Instagram, Facebook, Youtube, MapPin, Phone, Mail } from 'lucide-vue-next'

useHead({
  title: 'Beranda | MDS Cendekia',
  meta: [
    { name: 'description', content: 'Yayasan Mukti Desa Sasmita Cendekia. Solusi pendidikan kesetaraan terbaik.' }
  ]
})
</script>

<template>
  <div class="min-h-screen bg-[#FFFFFF] font-sans">
    <PublicNavbar />

    <section class="relative flex min-h-screen flex-col items-center justify-center overflow-hidden pt-[80px]">
      <div class="public-navbar-container relative z-10 flex flex-col items-center text-center">
        <div class="absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <img src="/images/aksesn bultean.png" alt="Aksen Lingkaran" class="min-w-[1200px] w-[120vw] max-w-[1600px] object-cover opacity-100 scale-110" />
        </div>

        <h1 class="mb-[38px] max-w-5xl font-heading text-[64px] font-medium leading-tight text-[#3B3B3B]">
          Tidak ada kata terlambat <br />
          <span class="text-[#A7221B]">untuk belajar.</span>
        </h1>

        <p class="mb-[58px] max-w-3xl font-heading text-[16px] font-normal leading-normal text-[#3B3B3B]">
          Kami membuka pintu bagi semua usia untuk mendapatkan pendidikan kesetaraan dan vokasi resmi secara inklusif dan berkelanjutan.
        </p>

        <button
          @click="$router.push('/ppdb')"
          class="flex h-[56px] w-[250px] items-center justify-center rounded-full bg-brand font-heading text-[16px] font-medium text-white transition-colors hover:bg-brand-hover focus:outline-none"
        >
          Daftarkan Diri Kamu
        </button>
      </div>
    </section>

    <section id="profil" class="relative flex flex-col items-center justify-center bg-[#FFFFFF] pt-[599px] pb-[100px] px-6">
      <div class="public-navbar-container flex flex-col items-center text-center">
        <h2 class="mb-[110px] max-w-5xl font-heading text-[48px] font-normal leading-tight text-[#3B3B3B]">
          Berdiri untuk mengabdi, bergerak dengan <span class="text-[#A7221B] font-medium">legalitas resmi.</span>
        </h2>

        <p class="mb-[52px] max-w-5xl font-sans text-[24px] font-normal leading-relaxed text-[#3B3B3B]">
          Didirikan resmi pada Maret 2026, Yayasan Mukti Daris Sasmita Cendekia (YMDSC) hadir sebagai bentuk nyata kepedulian sosial untuk membangun manusia seutuhnya. Kami berkomitmen membuka akses pendidikan kesetaraan yang inklusif, nirlaba yang berkelanjutan bagi semua kelompok usia. Menjadikan pusat pemberdayaan masyarakat yang berlandaskan nilai-nilai Pancasila untuk membangun manusia seutuhnya.
        </p>

        <button
          @click="$router.push('/profil-sekolah')"
          class="flex h-[48px] w-[252px] items-center justify-center rounded-full border border-border font-heading text-[16px] font-normal text-[#3B3B3B] transition-colors hover:bg-gray-50 focus:outline-none"
        >
          Selengkapnya tentang kami
        </button>
      </div>
    </section>
    <section class="relative flex flex-col items-center justify-center bg-[#FFFFFF] px-6 pb-[100px] pt-[326px]">
      <div class="public-navbar-container flex w-full flex-col">
        <h2 class="mb-[82px] max-w-4xl text-left font-heading text-[48px] font-normal leading-tight text-[#3B3B3B]">
          Sistem belajar adaptif, tidak mengorbankan aktivitas harianmu.
        </h2>

        <div class="flex h-[360px] w-full border-y border-[#3B3B3B]">
          <div class="flex flex-1 flex-col items-center justify-center px-4 text-center">
            <h3 class="mb-[32px] font-heading text-[32px] font-normal text-[#3B3B3B]">
              Waktu Belajar Fleksibel
            </h3>
            <p class="max-w-[500px] font-sans text-[20px] font-normal leading-relaxed text-[#3B3B3B]">
              Pilihan waktu kelas yang adaptif dan dapat disesuaikan di sela-sela kesibukan kerja atau aktivitas harianmu.
            </p>
          </div>

          <div class="mx-[32px] my-[40px] w-[1px] self-stretch bg-[#3B3B3B]"></div>

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

    <section class="relative flex flex-col items-center justify-center bg-[#FFFFFF] px-6 pt-[281px]">
      <div class="public-navbar-container flex w-full flex-col items-center">
        <h2 class="mb-[32px] max-w-5xl text-center font-heading text-[48px] font-normal leading-tight text-[#3B3B3B]">
          Kami hadir membawa <span class="text-brand">solusi pendidikan</span> kesetaraan terlengkap untukmu.
        </h2>

        <div class="mb-[32px] flex h-[33px] w-[202px] items-center justify-center rounded-full border border-brand bg-transparent">
          <span class="font-heading text-[16px] font-normal text-brand">Program Unggulan Kami</span>
        </div>

        <div class="group relative z-10 flex h-[331px] w-full max-w-[1196px] cursor-pointer flex-col justify-start overflow-hidden rounded-[24px] border border-border-soft bg-[#FFFFFF] px-[40px] pt-[40px] text-left shadow-[0_0_8px_0_rgba(0,0,0,0.25)] transition-all">
          <img src="/images/cardgradasi.png" alt="Card Background" class="absolute right-0 top-0 z-0 h-full w-auto translate-x-24 object-cover" />

          <div class="absolute right-[40px] top-[40px] z-10">
            <ArrowRight class="h-8 w-8 text-white transition-transform duration-300 group-hover:-rotate-45" />
          </div>

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

        <p class="mt-[28px] text-center font-heading text-[16px] font-normal text-[#3B3B3B]/50">
          Program paket lainnya belum tersedia
        </p>
      </div>
    </section>

    <section class="relative flex flex-col items-center justify-center bg-[#FFFFFF] px-6 pt-[370px]">
      <div class="public-navbar-container flex w-full items-start justify-between gap-10">

        <div class="sticky top-[120px] max-w-[600px]">
          <h2 class="font-heading text-[48px] font-normal leading-tight text-[#3B3B3B]">
            Langkah mudah bergabung <br />
            <span class="text-brand">bersama kami.</span>
          </h2>
        </div>

        <div class="flex w-[708px] flex-col">
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

    <section id="galeri" class="relative flex flex-col items-center justify-center bg-[#FFFFFF] px-6 pt-[303px]">
      <div class="public-navbar-container flex w-full flex-col">
        <div class="flex w-full items-center gap-[24px]">
          <div class="h-[342px] w-[707px] flex-shrink-0 overflow-hidden rounded-[24px] bg-gray-200">
            <img src="/images/beranda.jpg" alt="Galeri Lingkungan" class="h-full w-full object-cover" />
          </div>

          <div class="flex-1">
            <h2 class="font-heading text-[48px] font-normal leading-tight text-[#3B3B3B]">
              Lingkungan belajar yang dirancang untuk tumbuh
            </h2>
          </div>
        </div>

        <div class="mt-[24px] grid w-full grid-cols-4 gap-[24px]">
          <div class="h-[342px] w-full overflow-hidden rounded-[24px] bg-gray-200">
            <img src="/images/beranda.jpg" alt="Galeri Lingkungan 1" class="h-full w-full object-cover" />
          </div>
          <div class="h-[342px] w-full overflow-hidden rounded-[24px] bg-gray-200">
            <img src="/images/beranda.jpg" alt="Galeri Lingkungan 2" class="h-full w-full object-cover" />
          </div>
          <div class="h-[342px] w-full overflow-hidden rounded-[24px] bg-gray-200">
            <img src="/images/beranda.jpg" alt="Galeri Lingkungan 3" class="h-full w-full object-cover" />
          </div>
          <div class="h-[342px] w-full overflow-hidden rounded-[24px] bg-gray-200">
            <img src="/images/beranda.jpg" alt="Galeri Lingkungan 4" class="h-full w-full object-cover" />
          </div>
        </div>
      </div>
    </section>

    <section class="relative flex flex-col items-center justify-center bg-[#FFFFFF] px-6 pt-[240px] pb-[100px]">
      <div class="relative flex h-[356px] w-full max-w-[1435px] flex-col items-center justify-center overflow-hidden rounded-[32px] bg-brand text-center shadow-lg">
        <img src="/images/cardgradasi.png" alt="CTA Background" class="absolute inset-0 z-0 h-full w-full scale-[2] object-cover opacity-80" />

        <div class="relative z-10 flex flex-col items-center px-4">
          <h2 class="mb-[42px] font-heading text-[48px] font-semibold text-white">
            Siap mengambil kesempatan ini?
          </h2>
          <p class="mb-[42px] max-w-[800px] font-sans text-[20px] font-medium text-white">
            Kuota pendaftaran untuk siswa sangat terbatas. Mari bangun masa depan yang lebih cerah bersama kami.
          </p>
          <button class="flex h-[58px] w-[315px] items-center justify-center rounded-full bg-white font-sans text-[20px] font-medium text-brand transition-opacity hover:opacity-90">
            Daftarkan Dirikamu Disini
          </button>
        </div>
      </div>
    </section>

    <section id="berita" class="relative flex flex-col items-center justify-center bg-[#F8F9FA] px-6 py-[160px]">
      <div class="public-navbar-container flex w-full flex-col items-center">
        <h2 class="mb-[80px] text-center font-heading text-[48px] font-normal leading-tight text-[#3B3B3B]">
          Kabar terbaru dan informasi edukasi.
        </h2>

        <div class="grid w-full grid-cols-4 gap-[24px]">
          <div class="flex flex-col overflow-hidden rounded-[32px] bg-white shadow-sm transition-shadow hover:shadow-md">
            <img src="/images/beranda.jpg" alt="Berita 1" class="h-[250px] w-full object-cover" />
            <div class="flex flex-col p-[32px]">
              <div class="mb-[24px] flex items-center justify-between">
                <span class="rounded-full border border-[#3B82F6] px-4 py-1 font-sans text-[14px] font-medium text-[#3B82F6]">
                  Edukasi
                </span>
                <span class="font-sans text-[14px] text-[#9CA3AF]">
                  dibuat 23 Juli 2026
                </span>
              </div>
              <h3 class="mb-[16px] font-heading text-[20px] font-medium leading-snug text-[#3B3B3B]">
                Pentingnya Ijazah Kesetaraan Paket C untuk Melanjutkan Kuliah di Tahun 2026.
              </h3>
              <p class="font-sans text-[14px] leading-relaxed text-[#6B7280]">
                lorem ipsum dolor sit amet.lorem ipsum dolor sit amet.lorem ipsum dolor sit amet.lorem ipsum dolor sit....
              </p>
            </div>
          </div>
          <div class="flex flex-col overflow-hidden rounded-[32px] bg-white shadow-sm transition-shadow hover:shadow-md">
            <img src="/images/beranda.jpg" alt="Berita 2" class="h-[250px] w-full object-cover" />
            <div class="flex flex-col p-[32px]">
              <div class="mb-[24px] flex items-center justify-between">
                <span class="rounded-full border border-[#3B82F6] px-4 py-1 font-sans text-[14px] font-medium text-[#3B82F6]">
                  Edukasi
                </span>
                <span class="font-sans text-[14px] text-[#9CA3AF]">
                  dibuat 23 Juli 2026
                </span>
              </div>
              <h3 class="mb-[16px] font-heading text-[20px] font-medium leading-snug text-[#3B3B3B]">
                Pentingnya Ijazah Kesetaraan Paket C untuk Melanjutkan Kuliah di Tahun 2026.
              </h3>
              <p class="font-sans text-[14px] leading-relaxed text-[#6B7280]">
                lorem ipsum dolor sit amet.lorem ipsum dolor sit amet.lorem ipsum dolor sit amet.lorem ipsum dolor sit....
              </p>
            </div>
          </div>
          <div class="flex flex-col overflow-hidden rounded-[32px] bg-white shadow-sm transition-shadow hover:shadow-md">
            <img src="/images/beranda.jpg" alt="Berita 3" class="h-[250px] w-full object-cover" />
            <div class="flex flex-col p-[32px]">
              <div class="mb-[24px] flex items-center justify-between">
                <span class="rounded-full border border-[#3B82F6] px-4 py-1 font-sans text-[14px] font-medium text-[#3B82F6]">
                  Edukasi
                </span>
                <span class="font-sans text-[14px] text-[#9CA3AF]">
                  dibuat 23 Juli 2026
                </span>
              </div>
              <h3 class="mb-[16px] font-heading text-[20px] font-medium leading-snug text-[#3B3B3B]">
                Pentingnya Ijazah Kesetaraan Paket C untuk Melanjutkan Kuliah di Tahun 2026.
              </h3>
              <p class="font-sans text-[14px] leading-relaxed text-[#6B7280]">
                lorem ipsum dolor sit amet.lorem ipsum dolor sit amet.lorem ipsum dolor sit amet.lorem ipsum dolor sit....
              </p>
            </div>
          </div>
          <div class="flex flex-col overflow-hidden rounded-[32px] bg-white shadow-sm transition-shadow hover:shadow-md">
            <img src="/images/beranda.jpg" alt="Berita 4" class="h-[250px] w-full object-cover" />
            <div class="flex flex-col p-[32px]">
              <div class="mb-[24px] flex items-center justify-between">
                <span class="rounded-full border border-[#3B82F6] px-4 py-1 font-sans text-[14px] font-medium text-[#3B82F6]">
                  Edukasi
                </span>
                <span class="font-sans text-[14px] text-[#9CA3AF]">
                  dibuat 23 Juli 2026
                </span>
              </div>
              <h3 class="mb-[16px] font-heading text-[20px] font-medium leading-snug text-[#3B3B3B]">
                Pentingnya Ijazah Kesetaraan Paket C untuk Melanjutkan Kuliah di Tahun 2026.
              </h3>
              <p class="font-sans text-[14px] leading-relaxed text-[#6B7280]">
                lorem ipsum dolor sit amet.lorem ipsum dolor sit amet.lorem ipsum dolor sit amet.lorem ipsum dolor sit....
              </p>
            </div>
          </div>
        </div>

        <button class="mt-[80px] flex h-[48px] px-8 items-center justify-center rounded-full border border-[#3B82F6] bg-transparent font-sans text-[16px] font-medium text-[#3B82F6] transition-colors hover:bg-[#3B82F6] hover:text-white">
          Lihat Lebih Banyak
        </button>
      </div>
    </section>

    <PublicFooter />
  </div>
</template>

<style scoped>
</style>

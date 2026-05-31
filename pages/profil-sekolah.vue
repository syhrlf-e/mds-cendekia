<script setup lang="ts">
import { CheckCircle } from 'lucide-vue-next'

useHead({
  title: 'Profil | MDS Cendekia'
})
</script>

<template>
  <div class="min-h-screen bg-[#FFFFFF] font-sans">
    <PublicNavbar />

    <!-- Hero Section Profil -->
    <section class="relative flex min-h-screen items-center overflow-hidden bg-[#FFFFFF] px-6 pt-[80px]">
      
      <!-- Right Graphic Decoration -->
      <div class="absolute bottom-0 right-0 z-0 flex items-end justify-end pointer-events-none h-[85%] w-1/2 translate-y-[15%]">
        <img src="/images/gradasiprofile.png" alt="Aksen Merah" class="h-full w-auto object-contain object-right-bottom" />
      </div>

      <!-- Content Container -->
      <div class="public-navbar-container relative z-10 w-full">
        <div class="max-w-[750px]">
          <!-- Headline -->
          <h1 class="mb-[32px] font-heading text-[64px] font-medium leading-tight text-[#3B3B3B]">
            Dedikasi nyata untuk<br />pendidikan kesetaraan.
          </h1>

          <!-- Subheadline -->
          <p class="font-sans text-[22px] leading-relaxed text-[#525252]">
            Mengenal lebih dekat Yayasan Mukti Daris Sasmita Cendekia, wadah alternatif yang menjembatani mimpi dan masa depan tanpa batasan usia serta latar belakang.
          </p>
        </div>
      </div>
    </section>

    <!-- Seksi Visi & Misi -->
    <section class="bg-[#F8F9FA] px-6 py-[120px]">
      <div class="public-navbar-container">
        
        <!-- VISI (Z-Pattern: Foto Kiri, Teks Kanan) -->
        <div class="mb-[120px] flex w-full flex-col items-center gap-[60px] lg:flex-row lg:gap-[80px]">
          <!-- Kiri: Foto Offset -->
          <div class="relative w-full lg:w-5/12">
            <!-- Offset Shadow Merah -->
            <div class="absolute -bottom-6 -left-6 h-full w-full rounded-[32px] bg-brand"></div>
            <!-- Foto Utama -->
            <div class="relative z-10 aspect-[4/5] overflow-hidden rounded-[32px] border-4 border-[#F8F9FA] bg-gray-200">
              <img src="/images/beranda.jpg" alt="Visi MDS Cendekia" class="h-full w-full object-cover" />
            </div>
          </div>

          <!-- Kanan: Teks Visi -->
          <div class="w-full lg:w-7/12">
            <span class="mb-[24px] inline-block rounded-full border border-brand/20 bg-brand/5 px-6 py-2 font-sans text-[14px] font-semibold tracking-wider text-brand uppercase">
              Visi Kami
            </span>
            <h2 class="font-heading text-[28px] font-medium leading-relaxed text-[#3B3B3B] lg:text-[36px]">
              Berperan aktif dalam pembangunan manusia seutuhnya melalui kegiatan sosial, pendidikan, kesehatan, kebudayaan, kebangsaan, dan pemberdayaan masyarakat secara nirlaba, berkelanjutan, inklusif, dan berlandaskan nilai-nilai Pancasila, Undang-Undang Dasar Negara Republik Indonesia Tahun 1945, serta mendukung proses demokrasi dan penguatan partisipasi publik dalam pemilu.
            </h2>
          </div>
        </div>

        <!-- MISI (Grid 2 Kolom) -->
        <div class="flex flex-col items-start lg:items-center">
          <span class="mb-[40px] rounded-full border border-brand/20 bg-brand/5 px-6 py-2 font-sans text-[14px] font-semibold tracking-wider text-brand uppercase">
            Misi Kami
          </span>
          <div class="grid w-full grid-cols-1 gap-[32px] lg:grid-cols-2">
            <!-- Misi 1 -->
            <div class="flex items-start gap-5 rounded-[24px] bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
              <CheckCircle class="mt-1 h-[28px] w-[28px] flex-shrink-0 text-brand" stroke-width="2.5" />
              <p class="font-sans text-[16px] leading-relaxed text-[#525252]">
                Menyelenggarakan pendidikan formal, nonformal, dan informal pada seluruh jenjang dan kelompok usia, termasuk namun tidak terbatas pada sekolah umum dan kejuruan, pendidikan kesetaraan, pendidikan anak usia dini, pendidikan agama, pondok pesantren, madrasah, pusat kegiatan belajar masyarakat, kursus, pelatihan, serta pendidikan teologi.
              </p>
            </div>
            <!-- Misi 2 -->
            <div class="flex items-start gap-5 rounded-[24px] bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
              <CheckCircle class="mt-1 h-[28px] w-[28px] flex-shrink-0 text-brand" stroke-width="2.5" />
              <p class="font-sans text-[16px] leading-relaxed text-[#525252]">
                Menyelenggarakan kegiatan sosial dan kesejahteraan masyarakat, termasuk pendirian dan pengelolaan panti asuhan, panti jompo/wreda, serta kegiatan pendampingan dan perlindungan bagi kelompok rentan.
              </p>
            </div>
            <!-- Misi 3 -->
            <div class="flex items-start gap-5 rounded-[24px] bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
              <CheckCircle class="mt-1 h-[28px] w-[28px] flex-shrink-0 text-brand" stroke-width="2.5" />
              <p class="font-sans text-[16px] leading-relaxed text-[#525252]">
                Menyelenggarakan kegiatan keagamaan, termasuk pendirian dan pengelolaan sarana ibadah, syiar dan dakwah agama, peningkatan pemahaman dan pengamalan nilai-nilai keagamaan, serta penerimaan, pengelolaan, dan penyaluran zakat, infak, sedekah, dan wakaf sesuai dengan ketentuan peraturan perundang-undangan.
              </p>
            </div>
            <!-- Misi 4 -->
            <div class="flex items-start gap-5 rounded-[24px] bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
              <CheckCircle class="mt-1 h-[28px] w-[28px] flex-shrink-0 text-brand" stroke-width="2.5" />
              <p class="font-sans text-[16px] leading-relaxed text-[#525252]">
                Menyelenggarakan kegiatan kesehatan masyarakat yang bersifat promotif, preventif, dan edukatif, termasuk pengelolaan fasilitas pelayanan kesehatan sesuai dengan ketentuan peraturan perundang-undangan.
              </p>
            </div>
            <!-- Misi 5 -->
            <div class="flex items-start gap-5 rounded-[24px] bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
              <CheckCircle class="mt-1 h-[28px] w-[28px] flex-shrink-0 text-brand" stroke-width="2.5" />
              <p class="font-sans text-[16px] leading-relaxed text-[#525252]">
                Menyelenggarakan kegiatan penelitian, pengkajian, dan pengembangan ilmu pengetahuan, kebijakan publik, serta kajian strategis untuk kepentingan pembangunan masyarakat.
              </p>
            </div>
            <!-- Misi 6 -->
            <div class="flex items-start gap-5 rounded-[24px] bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
              <CheckCircle class="mt-1 h-[28px] w-[28px] flex-shrink-0 text-brand" stroke-width="2.5" />
              <p class="font-sans text-[16px] leading-relaxed text-[#525252]">
                Menyelenggarakan kegiatan pemberdayaan masyarakat, pengembangan kewirausahaan sosial, peningkatan kapasitas sumber daya manusia, serta pembinaan kepemudaan dan perempuan.
              </p>
            </div>
            <!-- Misi 7 -->
            <div class="flex items-start gap-5 rounded-[24px] bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
              <CheckCircle class="mt-1 h-[28px] w-[28px] flex-shrink-0 text-brand" stroke-width="2.5" />
              <p class="font-sans text-[16px] leading-relaxed text-[#525252]">
                Menjalin kerja sama dan kemitraan dengan pemerintah pusat dan daerah, Dewan Perwakilan Rakyat Republik Indonesia, Dewan Perwakilan Daerah Republik Indonesia, kementerian/lembaga, Tentara Nasional Indonesia, Kepolisian Negara Republik Indonesia, serta lembaga negara lainnya sesuai dengan ketentuan peraturan perundang-undangan.
              </p>
            </div>
            <!-- Misi 8 -->
            <div class="flex items-start gap-5 rounded-[24px] bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
              <CheckCircle class="mt-1 h-[28px] w-[28px] flex-shrink-0 text-brand" stroke-width="2.5" />
              <p class="font-sans text-[16px] leading-relaxed text-[#525252]">
                Menjalin kerja sama dengan lembaga donor, organisasi internasional, dan mitra pembangunan nasional maupun internasional dalam rangka pelaksanaan program sosial dan pembangunan berkelanjutan.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Profil Sekolah | MDS Cendekia',
  meta: [
    {
      name: 'description',
      content: 'Profil MDS Cendekia, yayasan pendidikan kesetaraan yang membuka akses belajar inklusif, adaptif, dan berkelanjutan untuk semua usia.'
    },
    {
      property: 'og:title',
      content: 'Profil Sekolah | MDS Cendekia'
    },
    {
      property: 'og:description',
      content: 'Kenali visi, misi, legalitas, dan penggerak MDS Cendekia sebagai yayasan pendidikan kesetaraan yang inklusif dan berkelanjutan.'
    },
    {
      name: 'twitter:title',
      content: 'Profil Sekolah | MDS Cendekia'
    },
    {
      name: 'twitter:description',
      content: 'Kenali visi, misi, legalitas, dan penggerak MDS Cendekia sebagai yayasan pendidikan kesetaraan yang inklusif dan berkelanjutan.'
    }
  ]
})

const profileUrl = useAbsoluteSiteUrl('/profil-sekolah')
const siteHomeUrl = useAbsoluteSiteUrl('/')

useBreadcrumbJsonLd([
  { name: 'Beranda', path: '/' },
  { name: 'Profil Sekolah', path: '/profil-sekolah' }
])

useJsonLd(() => {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'Profil Sekolah MDS Cendekia',
    description: 'Profil resmi Yayasan Mukti Daris Sasmita Cendekia, visi, misi, legalitas, dan penggerak yayasan pendidikan kesetaraan.',
    inLanguage: 'id-ID',
    about: {
      '@id': siteHomeUrl ? `${siteHomeUrl}#school` : '#school'
    },
    mainEntity: {
      '@type': 'EducationalOrganization',
      '@id': siteHomeUrl ? `${siteHomeUrl}#school` : '#school',
      name: 'MDS Cendekia',
      alternateName: 'Yayasan Mukti Daris Sasmita Cendekia',
      foundingDate: '2026-03-04',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Perum Bumi Gesya Cikarang, Desa Jayasampurna',
        addressLocality: 'Serang Baru',
        addressRegion: 'Jawa Barat',
        postalCode: '17330',
        addressCountry: 'ID'
      },
      knowsAbout: [
        'Pendidikan kesetaraan',
        'Kejar Paket C',
        'Pendidikan inklusif',
        'Pemberdayaan masyarakat'
      ]
    }
  }

  if (profileUrl) schema.url = profileUrl

  return schema
})
</script>

<template>
  <div class="min-h-screen bg-[#FFFFFF] font-sans">
    <section class="relative flex min-h-screen items-center overflow-hidden bg-[#FFFFFF] px-6 pt-[80px]">
      <div class="absolute bottom-0 right-0 z-0 flex items-end justify-end pointer-events-none h-[85%] w-1/2 translate-y-[15%]">
        <img src="/images/gradasiprofile.png" alt="" aria-hidden="true" class="h-full w-auto object-contain object-right-bottom" />
      </div>

      <div class="public-navbar-container relative z-10 w-full">
        <div class="max-w-[750px]">
          <h1 class="mb-[32px] font-heading text-[64px] font-medium leading-tight text-[#3B3B3B]">
            Dedikasi nyata untuk<br />pendidikan kesetaraan.
          </h1>
          <p class="font-sans text-[22px] leading-relaxed text-[#525252]">
            Mengenal lebih dekat Yayasan Mukti Daris Sasmita Cendekia, wadah alternatif yang menjembatani mimpi dan masa depan tanpa batasan usia serta latar belakang.
          </p>
        </div>
      </div>
    </section>
    <section class="bg-[#FFFFFF] px-6 py-[120px]">
      <div class="public-navbar-container flex flex-col items-center">
        <h2 class="mb-[100px] max-w-4xl text-center font-heading text-[40px] font-normal leading-tight text-[#3B3B3B] lg:text-[48px]">
          Membuka pintu masa depan yang lebih inklusif untuk semua.
        </h2>

        <div class="flex w-full max-w-[1000px] flex-col items-center gap-[40px] lg:flex-row lg:items-start lg:gap-[80px]">
          <div class="w-full lg:w-5/12 flex-shrink-0">
            <div class="aspect-[4/5] overflow-hidden rounded-[32px] bg-gray-200 shadow-md">
              <img src="/images/beranda.jpg" alt="Sambutan pimpinan Yayasan Mukti Daris Sasmita Cendekia untuk pendidikan kesetaraan" class="h-full w-full object-cover" />
            </div>
          </div>

          <div class="flex w-full flex-col lg:w-7/12 pt-4">
            <h3 class="mb-[24px] font-heading text-[32px] font-semibold text-[#3B3B3B]">
              Sambutan Pimpinan Kami
            </h3>
            <div class="mb-[48px] space-y-6 font-sans text-[18px] leading-relaxed text-[#525252]">
              <p>
                Selamat datang di Yayasan Mukti Daris Sasmita Cendekia. Kami percaya bahwa pendidikan adalah hak fundamental yang tidak boleh dibatasi oleh usia, waktu, maupun latar belakang ekonomi.
              </p>
              <p>
                YMDSC hadir sebagai jawaban atas tantangan zaman, menyediakan ekosistem belajar hybrid yang fleksibel namun tetap berkualitas tinggi. Melalui komitmen ini, kami siap mendampingi setiap langkah Anda untuk kembali meraih mimpi, mendapatkan legalitas pendidikan yang diakui, dan tumbuh menjadi pribadi yang berdampak di masyarakat. Mari berjalan bersama kami
              </p>
            </div>

            <div class="self-start rounded-full border border-brand px-8 py-3 font-sans text-[20px] font-medium text-brand">
              Bpk. Yusuf Mansur S.pd, NPD
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="bg-[#FFFFFF] px-6 py-[120px]">
      <div class="public-navbar-container flex flex-col items-center">
        <div class="mb-[53px] flex max-w-[1100px] flex-col items-center text-center">
          <div class="mb-[12px] flex h-[45px] w-[85px] items-center justify-center rounded-[30px] bg-brand font-heading text-[20px] font-normal text-white">
            Visi
          </div>
          <h2 class="mb-[12px] font-heading text-[48px] font-normal leading-tight text-[#3B3B3B]">
            Pembangunan Manusia Seutuhnya<br />Berlandaskan Nilai Pancasila.
          </h2>
          <p class="font-sans text-[20px] font-normal leading-relaxed text-[#525252]">
            Berperan aktif dalam pembangunan manusia seutuhnya melalui kegiatan sosial, pendidikan, kesehatan, kebudayaan, kebangsaan, dan pemberdayaan masyarakat secara nirlaba, berkelanjutan, inklusif, dan berlandaskan nilai-nilai Pancasila, Undang-Undang Dasar Negara Republik Indonesia Tahun 1945, serta mendukung proses demokrasi dan penguatan partisipasi publik dalam pemilu.
          </p>
        </div>
        <div class="flex w-full flex-col items-center">
          <div class="mb-[34px] flex h-[45px] w-[85px] items-center justify-center rounded-[30px] bg-brand font-heading text-[20px] font-normal text-white">
            Misi
          </div>

          <div class="flex w-full max-w-[1440px] flex-wrap justify-center gap-[24px]">
            <div class="flex h-[249px] w-[342px] flex-col rounded-[32px] border border-[#E5E5E5] bg-white p-6">
              <h3 class="mb-[18px] font-heading text-[20px] font-medium text-[#3B3B3B]">Pendidikan Komprehensif</h3>
              <p class="font-heading text-[12px] font-medium leading-[1.6] text-[#6B7280]">
                Menyelenggarakan pendidikan formal, nonformal, dan informal pada seluruh jenjang dan kelompok usia, termasuk namun tidak terbatas pada sekolah umum dan kejuruan, pendidikan kesetaraan, pendidikan anak usia dini, pendidikan agama, pondok pesantren, madrasah, pusat kegiatan belajar masyarakat, kursus, pelatihan, serta pendidikan teologi.
              </p>
            </div>
            <div class="flex h-[249px] w-[342px] flex-col rounded-[32px] border border-[#E5E5E5] bg-white p-6">
              <h3 class="mb-[18px] font-heading text-[20px] font-medium text-[#3B3B3B]">Kesejahteraan Sosial</h3>
              <p class="font-heading text-[12px] font-medium leading-[1.6] text-[#6B7280]">
                Menyelenggarakan kegiatan sosial dan kesejahteraan masyarakat, termasuk pendirian dan pengelolaan panti asuhan, panti jompo/wreda, serta kegiatan pendampingan dan perlindungan bagi kelompok rentan.
              </p>
            </div>
            <div class="flex h-[249px] w-[342px] flex-col rounded-[32px] border border-[#E5E5E5] bg-white p-6">
              <h3 class="mb-[18px] font-heading text-[20px] font-medium text-[#3B3B3B]">Pemberdayaan Keagamaan</h3>
              <p class="font-heading text-[12px] font-medium leading-[1.6] text-[#6B7280]">
                Menyelenggarakan kegiatan keagamaan, termasuk pendirian dan pengelolaan sarana ibadah, syiar dan dakwah agama, peningkatan pemahaman dan pengamalan nilai-nilai keagamaan, serta penerimaan, pengelolaan, dan penyaluran zakat, infak, sedekah, dan wakaf sesuai dengan ketentuan peraturan perundang-undangan.
              </p>
            </div>
            <div class="flex h-[249px] w-[342px] flex-col rounded-[32px] border border-[#E5E5E5] bg-white p-6">
              <h3 class="mb-[18px] font-heading text-[20px] font-medium text-[#3B3B3B]">Kesehatan Masyarakat</h3>
              <p class="font-heading text-[12px] font-medium leading-[1.6] text-[#6B7280]">
                Menyelenggarakan kegiatan kesehatan masyarakat yang bersifat promotif, preventif, dan edukatif, termasuk pengelolaan fasilitas pelayanan kesehatan sesuai dengan ketentuan peraturan perundang-undangan.
              </p>
            </div>
            <div class="flex h-[249px] w-[342px] flex-col rounded-[32px] border border-[#E5E5E5] bg-white p-6">
              <h3 class="mb-[18px] font-heading text-[20px] font-medium text-[#3B3B3B]">Riset & Pengkajian Publik</h3>
              <p class="font-heading text-[12px] font-medium leading-[1.6] text-[#6B7280]">
                Menyelenggarakan kegiatan penelitian, pengkajian, dan pengembangan ilmu pengetahuan, kebijakan publik, serta kajian strategis untuk kepentingan pembangunan masyarakat.
              </p>
            </div>
            <div class="flex h-[249px] w-[342px] flex-col rounded-[32px] border border-[#E5E5E5] bg-white p-6">
              <h3 class="mb-[18px] font-heading text-[20px] font-medium text-[#3B3B3B]">Pengembangan SDM</h3>
              <p class="font-heading text-[12px] font-medium leading-[1.6] text-[#6B7280]">
                Menyelenggarakan kegiatan pemberdayaan masyarakat, pengembangan kewirausahaan sosial, peningkatan kapasitas sumber daya manusia, serta pembinaan kepemudaan dan perempuan.
              </p>
            </div>
            <div class="flex h-[249px] w-[342px] flex-col rounded-[32px] border border-[#E5E5E5] bg-white p-6">
              <h3 class="mb-[18px] font-heading text-[20px] font-medium text-[#3B3B3B]">Kemitraan Strategis Negara</h3>
              <p class="font-heading text-[12px] font-medium leading-[1.6] text-[#6B7280]">
                Menjalin kerja sama dan kemitraan dengan pemerintah pusat dan daerah, Dewan Perwakilan Rakyat Republik Indonesia, Dewan Perwakilan Daerah Republik Indonesia, kementerian/lembaga, Tentara Nasional Indonesia, Kepolisian Negara Republik Indonesia, serta lembaga negara lainnya sesuai dengan ketentuan peraturan perundang-undangan.
              </p>
            </div>
            <div class="flex h-[249px] w-[342px] flex-col rounded-[32px] border border-[#E5E5E5] bg-white p-6">
              <h3 class="mb-[18px] font-heading text-[20px] font-medium text-[#3B3B3B]">Kolaborasi Global</h3>
              <p class="font-heading text-[12px] font-medium leading-[1.6] text-[#6B7280]">
                Menjalin kerja sama dengan lembaga donor, organisasi internasional, dan mitra pembangunan nasional maupun internasional dalam rangka pelaksanaan program sosial dan pembangunan berkelanjutan.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
    <section class="bg-[#FFFFFF] px-6 py-[120px] border-t border-[#E5E5E5]">
      <div class="public-navbar-container flex flex-col items-center">
        <h2 class="mb-[80px] font-heading text-[48px] font-normal leading-tight text-[#3B3B3B] text-center">
          Penggerak Yayasan Kami
        </h2>

        <div class="flex w-full flex-col items-center gap-[80px]">
          <div class="flex flex-col items-center">
            <div class="flex h-[180px] w-[180px] items-center justify-center rounded-full bg-[#F5F5F5] mb-6 overflow-hidden border border-[#E5E5E5]">
              <svg class="w-16 h-16 text-[#D4D4D4]" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </div>
            <h3 class="font-heading text-[24px] font-medium text-[#3B3B3B] text-center">Bpk. Muhammad Djody Satriani</h3>
            <p class="font-sans text-[18px] text-brand font-medium mt-2">Ketua Pembina</p>
          </div>
          <div class="flex flex-col items-center">
            <div class="flex h-[160px] w-[160px] items-center justify-center rounded-full bg-[#F5F5F5] mb-6 overflow-hidden border border-[#E5E5E5]">
              <svg class="w-12 h-12 text-[#D4D4D4]" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </div>
            <h3 class="font-heading text-[20px] font-medium text-[#3B3B3B] text-center">Bpk. Buya Hamka</h3>
            <p class="font-sans text-[16px] text-[#525252] font-medium mt-2">Ketua Pengawas</p>
          </div>
          <div class="flex w-full flex-wrap justify-center gap-[60px] pt-10 border-t border-[#E5E5E5] max-w-[1000px]">
            <div class="flex flex-col items-center w-[280px]">
              <div class="flex h-[160px] w-[160px] items-center justify-center rounded-full bg-[#F5F5F5] mb-6 overflow-hidden border border-[#E5E5E5]">
                <svg class="w-12 h-12 text-[#D4D4D4]" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
              <h3 class="font-heading text-[20px] font-medium text-[#3B3B3B] text-center">Bpk. Rio Nurfajri</h3>
              <p class="font-sans text-[16px] text-[#6B7280] mt-2">Ketua Umum</p>
            </div>

            <div class="flex flex-col items-center w-[280px]">
              <div class="flex h-[160px] w-[160px] items-center justify-center rounded-full bg-[#F5F5F5] mb-6 overflow-hidden border border-[#E5E5E5]">
                <svg class="w-12 h-12 text-[#D4D4D4]" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
              <h3 class="font-heading text-[20px] font-medium text-[#3B3B3B] text-center">Ibu Vena Adrianti Ningrum</h3>
              <p class="font-sans text-[16px] text-[#6B7280] mt-2">Sekretaris</p>
            </div>

            <div class="flex flex-col items-center w-[280px]">
              <div class="flex h-[160px] w-[160px] items-center justify-center rounded-full bg-[#F5F5F5] mb-6 overflow-hidden border border-[#E5E5E5]">
                <svg class="w-12 h-12 text-[#D4D4D4]" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
              <h3 class="font-heading text-[20px] font-medium text-[#3B3B3B] text-center">Ibu Rizalina Nurazizah</h3>
              <p class="font-sans text-[16px] text-[#6B7280] mt-2">Bendahara</p>
            </div>
          </div>

        </div>
      </div>
    </section>
    <section class="bg-[#F9FAFB] px-6 py-[120px] border-t border-[#E5E5E5]">
      <div class="public-navbar-container">
        <div class="flex flex-col lg:flex-row gap-[80px]">
          <div class="lg:w-1/3">
            <h2 class="mb-[24px] font-heading text-[48px] font-normal leading-tight text-[#3B3B3B]">
              Legalitas &<br/>Keabsahan.
            </h2>
            <p class="font-sans text-[20px] leading-relaxed text-[#525252]">
              YMDSC berdiri tegak di atas landasan hukum yang sah, menjamin keamanan dan transparansi penuh bagi seluruh ekosistem pendidikan kami.
            </p>
          </div>
          <div class="lg:w-2/3 flex flex-col justify-center lg:pl-10 xl:pl-16">

            <div class="border-b border-[#E5E5E5] pb-8 mb-8">
              <p class="font-sans text-[14px] text-[#6B7280] mb-3 uppercase font-medium">Badan Hukum</p>
              <p class="font-heading text-[32px] font-medium text-[#3B3B3B]">Yayasan Mukti Daris Sasmita Cendekia (YMDSC)</p>
            </div>

            <div class="border-b border-[#E5E5E5] pb-8 mb-8 flex flex-col md:flex-row md:justify-between gap-8 md:gap-4">
              <div class="md:w-1/2">
                <p class="font-sans text-[14px] text-[#6B7280] mb-3 uppercase font-medium">Akta Pendirian</p>
                <div class="flex items-center gap-3">
                  <CheckCircle class="h-6 w-6 text-brand" />
                  <p class="font-heading text-[32px] font-medium text-[#3B3B3B]">Nomor 25</p>
                </div>
                <p class="font-sans text-[16px] text-[#525252] mt-2">Diresmikan pada 4 Maret 2026</p>
              </div>
              <div class="md:w-1/2">
                <p class="font-sans text-[14px] text-[#6B7280] mb-3 uppercase font-medium">Pejabat Notaris</p>
                <p class="font-heading text-[32px] font-medium text-[#3B3B3B]">Hartini, S.H., M.Kn.</p>
                <p class="font-sans text-[16px] text-[#525252] mt-2">Kedudukan di Kota Cirebon</p>
              </div>
            </div>

            <div class="pb-2">
              <p class="font-sans text-[14px] text-[#6B7280] mb-3 uppercase font-medium">Kedudukan Hukum Yayasan</p>
              <p class="font-heading text-[24px] font-medium text-[#3B3B3B] leading-relaxed">
                Perum Bumi Gesya Cikarang, Desa Jayasampurna<br/>
                Kecamatan Serang Baru, Kab. Bekasi, Jawa Barat (17330)
              </p>
            </div>

          </div>

        </div>
      </div>
    </section>
  </div>
</template>

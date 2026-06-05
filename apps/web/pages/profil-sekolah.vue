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
  <div class="min-h-screen bg-white font-sans">
    <section class="relative flex min-h-svh items-center overflow-hidden bg-white px-0 pb-14 pt-24 md:min-h-[680px] md:pb-0 md:pt-20 lg:min-h-[720px] 2xl:min-h-screen">
      <div class="public-container relative z-10">
        <div class="max-w-md md:max-w-[620px] 2xl:max-w-[750px]">
          <h1 class="mb-5 font-heading text-3xl font-medium leading-tight text-text-public-heading md:mb-6 md:text-5xl lg:mb-7 lg:text-5xl 2xl:mb-8 2xl:text-6xl">
            Dedikasi nyata untuk<br />pendidikan kesetaraan.
          </h1>
          <p class="max-w-sm font-sans text-base leading-relaxed text-neutral-600 md:max-w-none md:text-xl lg:text-xl 2xl:text-2xl">
            Mengenal lebih dekat Yayasan Mukti Daris Sasmita Cendekia, wadah alternatif yang menjembatani mimpi dan masa depan tanpa batasan usia serta latar belakang.
          </p>
        </div>
      </div>
    </section>
    <section class="bg-white px-0 py-16 md:py-28 lg:py-30 2xl:py-30">
      <div class="public-container flex flex-col items-center">
        <h2 class="mb-9 max-w-sm text-center font-heading text-2xl font-normal leading-tight text-text-public-heading md:mb-14 md:max-w-3xl md:text-4xl lg:mb-16 lg:text-4xl 2xl:mb-25 2xl:max-w-4xl 2xl:text-5xl">
          Membuka pintu masa depan yang lebih inklusif untuk semua.
        </h2>

        <div class="flex w-full max-w-[920px] flex-col items-center gap-8 md:gap-10 lg:flex-row lg:items-start lg:gap-14 2xl:max-w-[1000px] 2xl:gap-20">
          <div class="w-full max-w-xs flex-shrink-0 md:max-w-none lg:w-5/12">
            <div class="aspect-[5/4] overflow-hidden rounded-2xl bg-gray-200 shadow-sm md:aspect-[4/5] md:rounded-3xl md:shadow-md 2xl:rounded-4xl">
              <img src="/images/logo-mds-main.png" alt="Logo Yayasan Mukti Daris Sasmita Cendekia" class="h-full w-full object-contain p-6 md:p-8 2xl:p-10" />
            </div>
          </div>

          <div class="flex w-full flex-col pt-0 lg:w-7/12 lg:pt-2 2xl:pt-4">
            <h3 class="mb-4 font-heading text-xl font-semibold text-text-public-heading md:mb-5 md:text-2xl 2xl:mb-6 2xl:text-3xl">
              Sambutan Pimpinan Kami
            </h3>
            <div class="mb-6 space-y-4 text-justify font-sans text-sm leading-7 text-neutral-600 md:mb-8 md:space-y-5 md:text-left md:text-base md:leading-relaxed lg:text-lg 2xl:mb-12 2xl:space-y-6">
              <p>
                Selamat datang di Yayasan Mukti Daris Sasmita Cendekia. Kami percaya bahwa pendidikan adalah hak fundamental yang tidak boleh dibatasi oleh usia, waktu, maupun latar belakang ekonomi.
              </p>
              <p>
                YMDSC hadir sebagai jawaban atas tantangan zaman, menyediakan ekosistem belajar hybrid yang fleksibel namun tetap berkualitas tinggi. Melalui komitmen ini, kami siap mendampingi setiap langkah Anda untuk kembali meraih mimpi, mendapatkan legalitas pendidikan yang diakui, dan tumbuh menjadi pribadi yang berdampak di masyarakat. Mari berjalan bersama kami
              </p>
            </div>

            <div class="self-start rounded-full border border-brand px-5 py-2 font-sans text-sm font-medium text-brand md:px-6 md:py-2.5 md:text-base 2xl:px-8 2xl:py-3 2xl:text-xl">
              Bpk. Yusuf Mansur S.pd, NPD
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="bg-white px-0 py-16 md:py-28 lg:py-30">
      <div class="public-container flex flex-col items-center">
        <div class="mb-10 flex max-w-4xl flex-col items-center text-center md:mb-12 2xl:mb-13 2xl:max-w-[1100px]">
          <div class="mb-3 flex h-8 w-16 items-center justify-center rounded-full bg-brand font-heading text-sm font-normal text-white md:h-10 md:w-20 md:text-lg 2xl:h-11 2xl:w-21 2xl:text-xl">
            Visi
          </div>
          <h2 class="mb-4 max-w-sm font-heading text-2xl font-normal leading-tight text-text-public-heading md:mb-3 md:max-w-none md:text-4xl lg:text-4xl 2xl:text-5xl">
            Pembangunan Manusia Seutuhnya<br class="hidden md:block" />Berlandaskan Nilai Pancasila.
          </h2>
          <p class="text-justify font-sans text-sm font-normal leading-7 text-neutral-600 md:text-center md:text-lg md:leading-relaxed 2xl:text-xl">
            Berperan aktif dalam pembangunan manusia seutuhnya melalui kegiatan sosial, pendidikan, kesehatan, kebudayaan, kebangsaan, dan pemberdayaan masyarakat secara nirlaba, berkelanjutan, inklusif, dan berlandaskan nilai-nilai Pancasila, Undang-Undang Dasar Negara Republik Indonesia Tahun 1945, serta mendukung proses demokrasi dan penguatan partisipasi publik dalam pemilu.
          </p>
        </div>
        <div class="flex w-full flex-col items-center">
          <div class="mb-6 flex h-8 w-16 items-center justify-center rounded-full bg-brand font-heading text-sm font-normal text-white md:mb-8 md:h-10 md:w-20 md:text-lg 2xl:h-11 2xl:w-21 2xl:text-xl">
            Misi
          </div>

          <div class="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3 2xl:grid-cols-4 2xl:gap-6">
            <div class="flex min-h-0 flex-col rounded-2xl border border-neutral-200 bg-white p-4 md:min-h-[236px] md:rounded-3xl md:p-5 2xl:min-h-[249px] 2xl:rounded-4xl 2xl:p-6">
              <h3 class="mb-3 font-heading text-base font-medium text-text-public-heading md:mb-4 md:text-lg 2xl:text-xl">Pendidikan Komprehensif</h3>
              <p class="font-sans text-xs font-medium leading-6 text-gray-500 md:font-heading md:leading-relaxed">
                Menyelenggarakan pendidikan formal, nonformal, dan informal pada seluruh jenjang dan kelompok usia, termasuk namun tidak terbatas pada sekolah umum dan kejuruan, pendidikan kesetaraan, pendidikan anak usia dini, pendidikan agama, pondok pesantren, madrasah, pusat kegiatan belajar masyarakat, kursus, pelatihan, serta pendidikan teologi.
              </p>
            </div>
            <div class="flex min-h-0 flex-col rounded-2xl border border-neutral-200 bg-white p-4 md:min-h-[236px] md:rounded-3xl md:p-5 2xl:min-h-[249px] 2xl:rounded-4xl 2xl:p-6">
              <h3 class="mb-3 font-heading text-base font-medium text-text-public-heading md:mb-4 md:text-lg 2xl:text-xl">Kesejahteraan Sosial</h3>
              <p class="font-sans text-xs font-medium leading-6 text-gray-500 md:font-heading md:leading-relaxed">
                Menyelenggarakan kegiatan sosial dan kesejahteraan masyarakat, termasuk pendirian dan pengelolaan panti asuhan, panti jompo/wreda, serta kegiatan pendampingan dan perlindungan bagi kelompok rentan.
              </p>
            </div>
            <div class="flex min-h-0 flex-col rounded-2xl border border-neutral-200 bg-white p-4 md:min-h-[236px] md:rounded-3xl md:p-5 2xl:min-h-[249px] 2xl:rounded-4xl 2xl:p-6">
              <h3 class="mb-3 font-heading text-base font-medium text-text-public-heading md:mb-4 md:text-lg 2xl:text-xl">Pemberdayaan Keagamaan</h3>
              <p class="font-sans text-xs font-medium leading-6 text-gray-500 md:font-heading md:leading-relaxed">
                Menyelenggarakan kegiatan keagamaan, termasuk pendirian dan pengelolaan sarana ibadah, syiar dan dakwah agama, peningkatan pemahaman dan pengamalan nilai-nilai keagamaan, serta penerimaan, pengelolaan, dan penyaluran zakat, infak, sedekah, dan wakaf sesuai dengan ketentuan peraturan perundang-undangan.
              </p>
            </div>
            <div class="flex min-h-0 flex-col rounded-2xl border border-neutral-200 bg-white p-4 md:min-h-[236px] md:rounded-3xl md:p-5 2xl:min-h-[249px] 2xl:rounded-4xl 2xl:p-6">
              <h3 class="mb-3 font-heading text-base font-medium text-text-public-heading md:mb-4 md:text-lg 2xl:text-xl">Kesehatan Masyarakat</h3>
              <p class="font-sans text-xs font-medium leading-6 text-gray-500 md:font-heading md:leading-relaxed">
                Menyelenggarakan kegiatan kesehatan masyarakat yang bersifat promotif, preventif, dan edukatif, termasuk pengelolaan fasilitas pelayanan kesehatan sesuai dengan ketentuan peraturan perundang-undangan.
              </p>
            </div>
            <div class="flex min-h-0 flex-col rounded-2xl border border-neutral-200 bg-white p-4 md:min-h-[236px] md:rounded-3xl md:p-5 2xl:min-h-[249px] 2xl:rounded-4xl 2xl:p-6">
              <h3 class="mb-3 font-heading text-base font-medium text-text-public-heading md:mb-4 md:text-lg 2xl:text-xl">Riset & Pengkajian Publik</h3>
              <p class="font-sans text-xs font-medium leading-6 text-gray-500 md:font-heading md:leading-relaxed">
                Menyelenggarakan kegiatan penelitian, pengkajian, dan pengembangan ilmu pengetahuan, kebijakan publik, serta kajian strategis untuk kepentingan pembangunan masyarakat.
              </p>
            </div>
            <div class="flex min-h-0 flex-col rounded-2xl border border-neutral-200 bg-white p-4 md:min-h-[236px] md:rounded-3xl md:p-5 2xl:min-h-[249px] 2xl:rounded-4xl 2xl:p-6">
              <h3 class="mb-3 font-heading text-base font-medium text-text-public-heading md:mb-4 md:text-lg 2xl:text-xl">Pengembangan SDM</h3>
              <p class="font-sans text-xs font-medium leading-6 text-gray-500 md:font-heading md:leading-relaxed">
                Menyelenggarakan kegiatan pemberdayaan masyarakat, pengembangan kewirausahaan sosial, peningkatan kapasitas sumber daya manusia, serta pembinaan kepemudaan dan perempuan.
              </p>
            </div>
            <div class="flex min-h-0 flex-col rounded-2xl border border-neutral-200 bg-white p-4 md:min-h-[236px] md:rounded-3xl md:p-5 2xl:min-h-[249px] 2xl:rounded-4xl 2xl:p-6">
              <h3 class="mb-3 font-heading text-base font-medium text-text-public-heading md:mb-4 md:text-lg 2xl:text-xl">Kemitraan Strategis Negara</h3>
              <p class="font-sans text-xs font-medium leading-6 text-gray-500 md:font-heading md:leading-relaxed">
                Menjalin kerja sama dan kemitraan dengan pemerintah pusat dan daerah, Dewan Perwakilan Rakyat Republik Indonesia, Dewan Perwakilan Daerah Republik Indonesia, kementerian/lembaga, Tentara Nasional Indonesia, Kepolisian Negara Republik Indonesia, serta lembaga negara lainnya sesuai dengan ketentuan peraturan perundang-undangan.
              </p>
            </div>
            <div class="flex min-h-0 flex-col rounded-2xl border border-neutral-200 bg-white p-4 md:min-h-[236px] md:rounded-3xl md:p-5 2xl:min-h-[249px] 2xl:rounded-4xl 2xl:p-6">
              <h3 class="mb-3 font-heading text-base font-medium text-text-public-heading md:mb-4 md:text-lg 2xl:text-xl">Kolaborasi Global</h3>
              <p class="font-sans text-xs font-medium leading-6 text-gray-500 md:font-heading md:leading-relaxed">
                Menjalin kerja sama dengan lembaga donor, organisasi internasional, dan mitra pembangunan nasional maupun internasional dalam rangka pelaksanaan program sosial dan pembangunan berkelanjutan.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
    <section class="border-t border-neutral-200 bg-white px-0 py-16 md:py-28 lg:py-30">
      <div class="public-container flex flex-col items-center">
        <h2 class="mb-10 text-center font-heading text-2xl font-normal leading-tight text-text-public-heading md:mb-14 md:text-4xl lg:mb-16 lg:text-4xl 2xl:mb-20 2xl:text-5xl">
          Penggerak Yayasan Kami
        </h2>

        <div class="flex w-full flex-col items-center gap-10 md:gap-14 2xl:gap-20">
          <div class="flex flex-col items-center">
            <div class="mb-4 flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-neutral-200 bg-neutral-100 md:mb-5 md:h-36 md:w-36 2xl:mb-6 2xl:h-[180px] 2xl:w-[180px]">
              <svg class="h-11 w-11 text-neutral-300 md:h-14 md:w-14 2xl:h-16 2xl:w-16" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </div>
            <h3 class="max-w-xs text-center font-heading text-lg font-medium text-text-public-heading md:text-xl 2xl:text-2xl">Bpk. Muhammad Djody Satriani</h3>
            <p class="mt-1.5 font-sans text-sm font-medium text-brand md:mt-2 md:text-base 2xl:text-lg">Ketua Pembina</p>
          </div>
          <div class="flex flex-col items-center">
            <div class="mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-neutral-200 bg-neutral-100 md:mb-5 md:h-32 md:w-32 2xl:mb-6 2xl:h-40 2xl:w-40">
              <svg class="h-9 w-9 text-neutral-300 md:h-11 md:w-11 2xl:h-12 2xl:w-12" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </div>
            <h3 class="text-center font-heading text-base font-medium text-text-public-heading md:text-lg 2xl:text-xl">Bpk. Buya Hamka</h3>
            <p class="mt-1.5 font-sans text-sm font-medium text-neutral-600 md:mt-2 md:text-base">Ketua Pengawas</p>
          </div>
          <div class="grid w-full max-w-[900px] grid-cols-3 gap-4 border-t border-neutral-200 pt-8 md:gap-10 md:pt-10 2xl:max-w-[1000px] 2xl:gap-15">
            <div class="flex flex-col items-center">
              <div class="mb-3 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-neutral-200 bg-neutral-100 md:mb-5 md:h-32 md:w-32 2xl:mb-6 2xl:h-40 2xl:w-40">
                <svg class="h-7 w-7 text-neutral-300 md:h-11 md:w-11 2xl:h-12 2xl:w-12" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
              <h3 class="text-center font-heading text-sm font-medium leading-snug text-text-public-heading md:text-lg 2xl:text-xl">Bpk. Rio Nurfajri</h3>
              <p class="mt-1 font-sans text-xs text-gray-500 md:mt-2 md:text-base">Ketua Umum</p>
            </div>

            <div class="flex flex-col items-center">
              <div class="mb-3 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-neutral-200 bg-neutral-100 md:mb-5 md:h-32 md:w-32 2xl:mb-6 2xl:h-40 2xl:w-40">
                <svg class="h-7 w-7 text-neutral-300 md:h-11 md:w-11 2xl:h-12 2xl:w-12" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
              <h3 class="text-center font-heading text-sm font-medium leading-snug text-text-public-heading md:text-lg 2xl:text-xl">Ibu Vena Adrianti Ningrum</h3>
              <p class="mt-1 font-sans text-xs text-gray-500 md:mt-2 md:text-base">Sekretaris</p>
            </div>

            <div class="flex flex-col items-center">
              <div class="mb-3 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-neutral-200 bg-neutral-100 md:mb-5 md:h-32 md:w-32 2xl:mb-6 2xl:h-40 2xl:w-40">
                <svg class="h-7 w-7 text-neutral-300 md:h-11 md:w-11 2xl:h-12 2xl:w-12" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
              <h3 class="text-center font-heading text-sm font-medium leading-snug text-text-public-heading md:text-lg 2xl:text-xl">Ibu Rizalina Nurazizah</h3>
              <p class="mt-1 font-sans text-xs text-gray-500 md:mt-2 md:text-base">Bendahara</p>
            </div>
          </div>

        </div>
      </div>
    </section>
    <section class="border-t border-neutral-200 bg-bg-base px-0 py-16 md:py-28 lg:py-30">
      <div class="public-container">
        <div class="flex flex-col gap-10 md:gap-12 lg:flex-row lg:gap-14 2xl:gap-20">
          <div class="lg:w-1/3">
            <h2 class="mb-4 font-heading text-2xl font-normal leading-tight text-text-public-heading md:mb-5 md:text-4xl lg:text-4xl 2xl:mb-6 2xl:text-5xl">
              Legalitas &<br/>Keabsahan.
            </h2>
            <p class="max-w-md font-sans text-sm leading-7 text-neutral-600 md:text-lg md:leading-relaxed 2xl:text-xl">
              YMDSC berdiri tegak di atas landasan hukum yang sah, menjamin keamanan dan transparansi penuh bagi seluruh ekosistem pendidikan kami.
            </p>
          </div>
          <div class="flex flex-col justify-center lg:w-2/3 lg:pl-6 xl:pl-10 2xl:pl-16">

            <div class="mb-6 border-b border-neutral-200 pb-6 md:mb-7 md:pb-7 2xl:mb-8 2xl:pb-8">
              <p class="mb-2 font-sans text-xs font-medium uppercase tracking-wide text-gray-500 md:mb-3 md:text-sm">Badan Hukum</p>
              <p class="font-heading text-xl font-medium leading-snug text-text-public-heading md:text-2xl 2xl:text-3xl">Yayasan Mukti Daris Sasmita Cendekia (YMDSC)</p>
            </div>

            <div class="mb-6 flex flex-col gap-6 border-b border-neutral-200 pb-6 md:mb-7 md:flex-row md:justify-between md:gap-4 md:pb-7 2xl:mb-8 2xl:gap-8 2xl:pb-8">
              <div class="md:w-1/2">
                <p class="mb-2 font-sans text-xs font-medium uppercase tracking-wide text-gray-500 md:mb-3 md:text-sm">Akta Pendirian</p>
                <p class="font-heading text-xl font-medium text-text-public-heading md:text-2xl 2xl:text-3xl">Nomor 25</p>
                <p class="mt-1.5 font-sans text-sm text-neutral-600 md:mt-2 md:text-base">Diresmikan pada 4 Maret 2026</p>
              </div>
              <div class="md:w-1/2">
                <p class="mb-2 font-sans text-xs font-medium uppercase tracking-wide text-gray-500 md:mb-3 md:text-sm">Pejabat Notaris</p>
                <p class="font-heading text-xl font-medium text-text-public-heading md:text-2xl 2xl:text-3xl">Hartini, S.H., M.Kn.</p>
                <p class="mt-1.5 font-sans text-sm text-neutral-600 md:mt-2 md:text-base">Kedudukan di Kota Cirebon</p>
              </div>
            </div>

            <div class="pb-2">
              <p class="mb-2 font-sans text-xs font-medium uppercase tracking-wide text-gray-500 md:mb-3 md:text-sm">Kedudukan Hukum Yayasan</p>
              <p class="font-heading text-lg font-medium leading-relaxed text-text-public-heading md:text-xl 2xl:text-2xl">
                Perum Bumi Gesya Cikarang, Desa Jayasampurna<br class="hidden md:block"/>
                Kecamatan Serang Baru, Kab. Bekasi, Jawa Barat (17330)
              </p>
            </div>

          </div>

        </div>
      </div>
    </section>
  </div>
</template>

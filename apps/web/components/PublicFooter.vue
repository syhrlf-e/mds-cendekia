<script setup lang="ts">
import { Instagram, Facebook, Youtube, MapPin, Phone, Mail } from 'lucide-vue-next'

const footerLogoSrc = '/images/logonoteks.png'
</script>

<template>
  <footer class="relative flex flex-col items-center justify-center bg-text-public-body px-0 pb-6 pt-12 text-white md:pb-8 md:pt-18 lg:pb-10 lg:pt-20 2xl:pt-25">
    <div class="public-navbar-container flex flex-col">
      <!-- Top Footer Grid -->
      <div class="grid w-full grid-cols-1 gap-9 pb-10 md:grid-cols-2 md:gap-10 md:pb-14 lg:grid-cols-12 lg:gap-8 lg:pb-16 2xl:gap-10 2xl:pb-20">
        <!-- Col 1: Branding (4 cols) -->
        <div class="flex flex-col items-start lg:col-span-4">
          <!-- White square wrapper for the icon-only logo -->
          <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white p-2 md:mb-5 md:h-20 md:w-20 2xl:mb-6 2xl:h-22 2xl:w-22">
            <img :src="footerLogoSrc" alt="Logo Yayasan Mukti Daris Sasmita Cendekia" class="h-full w-full object-contain" />
          </div>
          <p class="mb-6 max-w-sm font-sans text-sm leading-relaxed text-white/70 md:mb-7 md:text-base 2xl:mb-8">
            Membangun manusia seutuhnya melalui pendidikan kesetaraan inklusif, adaptif, dan berkelanjutan berlandaskan nilai-nilai Pancasila.
          </p>
          <div class="flex items-center gap-4 md:gap-5 2xl:gap-6" aria-label="Media sosial MDS Cendekia">
            <span class="text-white/40" aria-label="Instagram MDS Cendekia">
              <Instagram class="h-5 w-5 md:h-6 md:w-6" />
            </span>
            <span class="text-white/40" aria-label="Facebook MDS Cendekia">
              <Facebook class="h-5 w-5 md:h-6 md:w-6" />
            </span>
            <span class="text-white/40" aria-label="YouTube MDS Cendekia">
              <Youtube class="h-5 w-5 md:h-6 md:w-6" />
            </span>
          </div>
        </div>

        <!-- Col 2: Program (3 cols) -->
        <div class="flex flex-col lg:col-span-3 lg:pl-6 2xl:pl-10">
          <h4 class="mb-4 font-heading text-base font-semibold md:mb-5 md:text-lg 2xl:mb-6 2xl:text-xl">Program Kami</h4>
          <div class="grid grid-cols-2 gap-x-4 gap-y-3 md:flex md:flex-col md:gap-4">
            <NuxtLink to="/ppdb" class="font-sans text-sm text-white/70 transition-colors hover:text-brand md:text-base">Pendidikan Kesetaraan</NuxtLink>
            <NuxtLink to="/ppdb" class="font-sans text-sm text-white/70 transition-colors hover:text-brand md:text-base">Kejar Paket C</NuxtLink>
            <NuxtLink to="/ppdb" class="font-sans text-sm text-white/70 transition-colors hover:text-brand md:text-base">Informasi PPDB</NuxtLink>
            <NuxtLink to="/profil-sekolah" class="font-sans text-sm text-white/70 transition-colors hover:text-brand md:text-base">Profil Yayasan</NuxtLink>
          </div>
        </div>

        <!-- Col 3: Tautan Cepat (2 cols) -->
        <div class="flex flex-col lg:col-span-2">
          <h4 class="mb-4 font-heading text-base font-semibold md:mb-5 md:text-lg 2xl:mb-6 2xl:text-xl">Tautan</h4>
          <div class="grid grid-cols-2 gap-x-4 gap-y-3 md:flex md:flex-col md:gap-4">
            <NuxtLink to="/profil-sekolah" class="font-sans text-sm text-white/70 transition-colors hover:text-brand md:text-base">Tentang Kami</NuxtLink>
            <NuxtLink to="/#galeri" class="font-sans text-sm text-white/70 transition-colors hover:text-brand md:text-base">Galeri Sekolah</NuxtLink>
            <NuxtLink to="/#berita" class="font-sans text-sm text-white/70 transition-colors hover:text-brand md:text-base">Berita & Edukasi</NuxtLink>
            <NuxtLink to="/ppdb" class="font-sans text-sm text-white/70 transition-colors hover:text-brand md:text-base">PPDB 2026</NuxtLink>
          </div>
        </div>

        <!-- Col 4: Kontak (3 cols) -->
        <div class="flex flex-col lg:col-span-3">
          <h4 class="mb-4 font-heading text-base font-semibold md:mb-5 md:text-lg 2xl:mb-6 2xl:text-xl">Hubungi Kami</h4>
          <div class="flex flex-col gap-3 md:gap-4">
            <div class="flex items-start gap-3 font-sans text-sm leading-relaxed text-white/70 md:gap-4 md:text-base">
              <MapPin class="mt-0.5 h-4 w-4 flex-shrink-0 md:mt-1 md:h-5 md:w-5" />
              <span>Perum Bumi Gesya Cikarang, Desa Jayasampurna, Serang Baru, Kab. Bekasi, Jawa Barat 17330</span>
            </div>
            <div class="flex items-center gap-3 font-sans text-sm text-white/70 md:gap-4 md:text-base">
              <Phone class="h-4 w-4 flex-shrink-0 md:h-5 md:w-5" />
              <span>+62 812 3456 7890</span>
            </div>
            <div class="flex items-center gap-3 font-sans text-sm text-white/70 md:gap-4 md:text-base">
              <Mail class="h-4 w-4 flex-shrink-0 md:h-5 md:w-5" />
              <span>info@mdscendekia.or.id</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="flex w-full flex-col items-start justify-between gap-4 border-t border-white/10 pt-5 md:flex-row md:items-center md:pt-6 2xl:pt-8">
        <p class="font-sans text-xs leading-relaxed text-white/50 md:text-left md:text-sm">
          © 2026 Yayasan Mukti Daris Sasmita Cendekia (YMDSC). Hak Cipta Dilindungi.
        </p>
        <div class="flex flex-wrap justify-start gap-4 md:justify-end md:gap-5 2xl:gap-8">
          <span class="font-sans text-xs text-white/40 md:text-sm">Kebijakan Privasi</span>
          <span class="font-sans text-xs text-white/40 md:text-sm">Syarat & Ketentuan</span>
        </div>
      </div>
    </div>
  </footer>
</template>

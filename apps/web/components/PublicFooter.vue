<script setup lang="ts">
import { Instagram, Facebook, Youtube, MapPin, Phone, Mail } from 'lucide-vue-next'

const footerLogoSrc = '/images/logonoteks.png'
</script>

<template>
  <footer class="relative flex flex-col items-center justify-center bg-text-public-body px-0 pb-8 pt-18 text-white lg:pb-10 lg:pt-20 2xl:pt-25">
    <div class="public-navbar-container flex flex-col">
      <!-- Top Footer Grid -->
      <div class="grid w-full grid-cols-1 gap-10 pb-14 md:grid-cols-2 lg:grid-cols-12 lg:gap-8 lg:pb-16 2xl:gap-10 2xl:pb-20">
        <!-- Col 1: Branding (4 cols) -->
        <div class="flex flex-col items-start lg:col-span-4">
          <!-- White square wrapper for the icon-only logo -->
          <div class="mb-5 flex h-18 w-18 items-center justify-center rounded-2xl bg-white p-2 md:h-20 md:w-20 2xl:mb-6 2xl:h-22 2xl:w-22">
            <img :src="footerLogoSrc" alt="Logo Yayasan Mukti Daris Sasmita Cendekia" class="h-full w-full object-contain" />
          </div>
          <p class="mb-7 font-sans text-base leading-relaxed text-white/70 2xl:mb-8">
            Membangun manusia seutuhnya melalui pendidikan kesetaraan inklusif, adaptif, dan berkelanjutan berlandaskan nilai-nilai Pancasila.
          </p>
          <div class="flex items-center gap-5 2xl:gap-6" aria-label="Media sosial MDS Cendekia">
            <span class="text-white/40" aria-label="Instagram MDS Cendekia">
              <Instagram class="h-6 w-6" />
            </span>
            <span class="text-white/40" aria-label="Facebook MDS Cendekia">
              <Facebook class="h-6 w-6" />
            </span>
            <span class="text-white/40" aria-label="YouTube MDS Cendekia">
              <Youtube class="h-6 w-6" />
            </span>
          </div>
        </div>

        <!-- Col 2: Program (3 cols) -->
        <div class="flex flex-col lg:col-span-3 lg:pl-6 2xl:pl-10">
          <h4 class="mb-5 font-heading text-lg font-semibold 2xl:mb-6 2xl:text-xl">Program Kami</h4>
          <div class="flex flex-col gap-4">
            <NuxtLink to="/ppdb" class="font-sans text-base text-white/70 transition-colors hover:text-brand">Pendidikan Kesetaraan</NuxtLink>
            <NuxtLink to="/ppdb" class="font-sans text-base text-white/70 transition-colors hover:text-brand">Kejar Paket C</NuxtLink>
            <NuxtLink to="/ppdb" class="font-sans text-base text-white/70 transition-colors hover:text-brand">Informasi PPDB</NuxtLink>
            <NuxtLink to="/profil-sekolah" class="font-sans text-base text-white/70 transition-colors hover:text-brand">Profil Yayasan</NuxtLink>
          </div>
        </div>

        <!-- Col 3: Tautan Cepat (2 cols) -->
        <div class="flex flex-col lg:col-span-2">
          <h4 class="mb-5 font-heading text-lg font-semibold 2xl:mb-6 2xl:text-xl">Tautan</h4>
          <div class="flex flex-col gap-4">
            <NuxtLink to="/profil-sekolah" class="font-sans text-base text-white/70 transition-colors hover:text-brand">Tentang Kami</NuxtLink>
            <NuxtLink to="/#galeri" class="font-sans text-base text-white/70 transition-colors hover:text-brand">Galeri Sekolah</NuxtLink>
            <NuxtLink to="/#berita" class="font-sans text-base text-white/70 transition-colors hover:text-brand">Berita & Edukasi</NuxtLink>
            <NuxtLink to="/ppdb" class="font-sans text-base text-white/70 transition-colors hover:text-brand">PPDB 2026</NuxtLink>
          </div>
        </div>

        <!-- Col 4: Kontak (3 cols) -->
        <div class="flex flex-col lg:col-span-3">
          <h4 class="mb-5 font-heading text-lg font-semibold 2xl:mb-6 2xl:text-xl">Hubungi Kami</h4>
          <div class="flex flex-col gap-4">
            <div class="flex items-start gap-4 font-sans text-base text-white/70">
              <MapPin class="mt-1 h-5 w-5 flex-shrink-0" />
              <span>Perum Bumi Gesya Cikarang, Desa Jayasampurna, Serang Baru, Kab. Bekasi, Jawa Barat 17330</span>
            </div>
            <div class="flex items-center gap-4 font-sans text-base text-white/70">
              <Phone class="h-5 w-5 flex-shrink-0" />
              <span>+62 812 3456 7890</span>
            </div>
            <div class="flex items-center gap-4 font-sans text-base text-white/70">
              <Mail class="h-5 w-5 flex-shrink-0" />
              <span>info@mdscendekia.or.id</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="flex w-full flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 md:flex-row 2xl:pt-8">
        <p class="text-center font-sans text-sm text-white/50 md:text-left">
          © 2026 Yayasan Mukti Daris Sasmita Cendekia (YMDSC). Hak Cipta Dilindungi.
        </p>
        <div class="flex flex-wrap justify-center gap-5 md:justify-end 2xl:gap-8">
          <span class="font-sans text-sm text-white/40">Kebijakan Privasi</span>
          <span class="font-sans text-sm text-white/40">Syarat & Ketentuan</span>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { Instagram, Facebook, Youtube, MapPin, Phone, Mail } from 'lucide-vue-next'

const footerLogoSrc = '/images/logonoteks.png'
</script>

<template>
  <footer class="relative flex flex-col items-center justify-center bg-[#525252] px-6 pb-[40px] pt-[100px] text-white">
    <div class="public-navbar-container flex w-full flex-col">
      <!-- Top Footer Grid -->
      <div class="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-[40px] pb-[80px]">
        <!-- Col 1: Branding (4 cols) -->
        <div class="lg:col-span-4 flex flex-col items-start">
          <!-- White square wrapper for the icon-only logo -->
          <div class="mb-[24px] flex h-[88px] w-[88px] items-center justify-center rounded-[20px] bg-white p-[8px]">
            <img :src="footerLogoSrc" alt="MDS Cendekia Logo" class="h-full w-full object-contain" />
          </div>
          <p class="mb-[32px] font-sans text-[16px] leading-relaxed text-white/70">
            Membangun manusia seutuhnya melalui pendidikan kesetaraan inklusif, adaptif, dan berkelanjutan berlandaskan nilai-nilai Pancasila.
          </p>
          <div class="flex items-center gap-[24px]" aria-label="Media sosial MDS Cendekia">
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
        <div class="lg:col-span-3 flex flex-col lg:pl-[40px]">
          <h4 class="mb-[24px] font-heading text-[20px] font-semibold">Program Kami</h4>
          <div class="flex flex-col gap-[16px]">
            <NuxtLink to="/ppdb" class="font-sans text-[16px] text-white/70 transition-colors hover:text-brand">Pendidikan Kesetaraan</NuxtLink>
            <NuxtLink to="/ppdb" class="font-sans text-[16px] text-white/70 transition-colors hover:text-brand">Kejar Paket C</NuxtLink>
            <NuxtLink to="/ppdb" class="font-sans text-[16px] text-white/70 transition-colors hover:text-brand">Informasi PPDB</NuxtLink>
            <NuxtLink to="/profil-sekolah" class="font-sans text-[16px] text-white/70 transition-colors hover:text-brand">Profil Yayasan</NuxtLink>
          </div>
        </div>

        <!-- Col 3: Tautan Cepat (2 cols) -->
        <div class="lg:col-span-2 flex flex-col">
          <h4 class="mb-[24px] font-heading text-[20px] font-semibold">Tautan</h4>
          <div class="flex flex-col gap-[16px]">
            <NuxtLink to="/profil-sekolah" class="font-sans text-[16px] text-white/70 transition-colors hover:text-brand">Tentang Kami</NuxtLink>
            <NuxtLink to="/#galeri" class="font-sans text-[16px] text-white/70 transition-colors hover:text-brand">Galeri Sekolah</NuxtLink>
            <NuxtLink to="/#berita" class="font-sans text-[16px] text-white/70 transition-colors hover:text-brand">Berita & Edukasi</NuxtLink>
            <NuxtLink to="/ppdb" class="font-sans text-[16px] text-white/70 transition-colors hover:text-brand">PPDB 2026</NuxtLink>
          </div>
        </div>

        <!-- Col 4: Kontak (3 cols) -->
        <div class="lg:col-span-3 flex flex-col">
          <h4 class="mb-[24px] font-heading text-[20px] font-semibold">Hubungi Kami</h4>
          <div class="flex flex-col gap-[16px]">
            <div class="flex items-start gap-[16px] font-sans text-[16px] text-white/70">
              <MapPin class="mt-1 h-5 w-5 flex-shrink-0" />
              <span>Jl. Pendidikan No. 123, Jakarta Selatan, 12345</span>
            </div>
            <div class="flex items-center gap-[16px] font-sans text-[16px] text-white/70">
              <Phone class="h-5 w-5 flex-shrink-0" />
              <span>+62 812 3456 7890</span>
            </div>
            <div class="flex items-center gap-[16px] font-sans text-[16px] text-white/70">
              <Mail class="h-5 w-5 flex-shrink-0" />
              <span>info@mdscendekia.or.id</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="flex w-full flex-col md:flex-row items-center justify-between border-t border-white/10 pt-[32px] gap-4">
        <p class="font-sans text-[14px] text-white/50 text-center md:text-left">
          © 2026 Yayasan Mukti Daris Sasmita Cendekia (YMDSC). Hak Cipta Dilindungi.
        </p>
        <div class="flex gap-[32px]">
          <span class="font-sans text-[14px] text-white/40">Kebijakan Privasi</span>
          <span class="font-sans text-[14px] text-white/40">Syarat & Ketentuan</span>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { Instagram, Facebook, Youtube, MapPin, Phone, Mail } from 'lucide-vue-next'
</script>

<template>
  <footer class="relative flex flex-col items-center justify-center bg-[#525252] px-6 pb-[40px] pt-[100px] text-white">
    <div class="public-navbar-container flex w-full flex-col">
      <div class="grid w-full grid-cols-12 gap-[40px] pb-[80px]">
        <div class="col-span-4 flex flex-col items-start">
          <div class="mb-[24px] flex h-[88px] w-[88px] items-center justify-center rounded-[20px] bg-white p-[8px]">
            <img src="/images/logonoteks.png" alt="MDS Cendekia Logo" class="h-full w-full object-contain" />
          </div>
          <p class="mb-[32px] font-sans text-[16px] leading-relaxed text-white/70">
            Membangun manusia seutuhnya melalui pendidikan kesetaraan inklusif, adaptif, dan berkelanjutan berlandaskan nilai-nilai Pancasila.
          </p>
          <div class="flex items-center gap-[24px]">
            <a href="#" class="text-white/70 transition-colors hover:text-brand">
              <Instagram class="h-6 w-6" />
            </a>
            <a href="#" class="text-white/70 transition-colors hover:text-brand">
              <Facebook class="h-6 w-6" />
            </a>
            <a href="#" class="text-white/70 transition-colors hover:text-brand">
              <Youtube class="h-6 w-6" />
            </a>
          </div>
        </div>

        <div class="col-span-3 flex flex-col pl-[40px]">
          <h4 class="mb-[24px] font-heading text-[20px] font-semibold">Program Kami</h4>
          <div class="flex flex-col gap-[16px]">
            <a href="#" class="font-sans text-[16px] text-white/70 transition-colors hover:text-brand">Kejar Paket A</a>
            <a href="#" class="font-sans text-[16px] text-white/70 transition-colors hover:text-brand">Kejar Paket B</a>
            <a href="#" class="font-sans text-[16px] text-white/70 transition-colors hover:text-brand">Kejar Paket C</a>
            <a href="#" class="font-sans text-[16px] text-white/70 transition-colors hover:text-brand">Pelatihan Vokasi</a>
          </div>
        </div>

        <div class="col-span-2 flex flex-col">
          <h4 class="mb-[24px] font-heading text-[20px] font-semibold">Tautan</h4>
          <div class="flex flex-col gap-[16px]">
            <a href="#" class="font-sans text-[16px] text-white/70 transition-colors hover:text-brand">Tentang Kami</a>
            <a href="#" class="font-sans text-[16px] text-white/70 transition-colors hover:text-brand">Fasilitas</a>
            <a href="#" class="font-sans text-[16px] text-white/70 transition-colors hover:text-brand">Berita & Edukasi</a>
            <a href="#" class="font-sans text-[16px] text-white/70 transition-colors hover:text-brand">PPDB 2026</a>
          </div>
        </div>

        <div class="col-span-3 flex flex-col">
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

      <div class="flex w-full items-center justify-between border-t border-white/10 pt-[32px]">
        <p class="font-sans text-[14px] text-white/50">
          © 2026 Yayasan Mukti Daris Sasmita Cendekia (YMDSC). Hak Cipta Dilindungi.
        </p>
        <div class="flex gap-[32px]">
          <a href="#" class="font-sans text-[14px] text-white/50 transition-colors hover:text-white">Kebijakan Privasi</a>
          <a href="#" class="font-sans text-[14px] text-white/50 transition-colors hover:text-white">Syarat & Ketentuan</a>
        </div>
      </div>
    </div>
  </footer>
</template>

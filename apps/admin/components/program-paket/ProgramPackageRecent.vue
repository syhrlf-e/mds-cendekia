<script setup lang="ts">
import { ref } from 'vue'

const dummyData = [
  {
    nama: 'Program Paket C',
    gelombang: 'Gelombang 1',
    timeline: [
      { tgl: '29', bln: 'Des', teks: 'Pekan Pendaftaran Online' },
      { tgl: '29', bln: 'Des', teks: 'Pengumpulan Berkas Pendaftar' },
      { tgl: '29', bln: 'Des', teks: 'Pemeriksaan Data Pendaftar' },
    ]
  },
  {
    nama: 'Program Paket B',
    gelombang: 'Gelombang 1',
    timeline: [
      { tgl: '29', bln: 'Des', teks: 'Pekan Pendaftaran Online' },
      { tgl: '29', bln: 'Des', teks: 'Pengumpulan Berkas Pendaftar' },
      { tgl: '29', bln: 'Des', teks: 'Pemeriksaan Data Pendaftar' },
    ]
  },
  {
    nama: 'Program Paket A',
    gelombang: 'Gelombang 1',
    timeline: [
      { tgl: '29', bln: 'Des', teks: 'Pekan Pendaftaran Online' },
      { tgl: '29', bln: 'Des', teks: 'Pengumpulan Berkas Pendaftar' },
      { tgl: '29', bln: 'Des', teks: 'Pemeriksaan Data Pendaftar' },
    ]
  }
]
</script>

<template>
  <aside class="mb-[4px] flex w-full h-fit xl:w-[561px] flex-col rounded-[27px] bg-white p-[27px] shadow-sm">
    <h3 class="mb-[16px] font-heading text-[20px] font-semibold text-[#3b3b3b]">Pendaftaran Terkini</h3>
    <div class="flex flex-col gap-[16px]">
      <div 
        v-for="(program, index) in dummyData" 
        :key="index"
        class="flex h-fit w-full max-w-[514px] flex-col rounded-[24px] border border-border-soft bg-white p-[16px] shadow-sm"
      >
        <div class="mb-5 flex items-center justify-between">
          <h4 class="font-heading text-[16px] font-semibold text-[#3b3b3b]">{{ program.nama }}</h4>
          <span class="font-heading text-[14px] font-medium text-[#3b3b3b]">{{ program.gelombang }}</span>
        </div>
        
        <div class="flex flex-col gap-[4px]">
          <div v-for="(step, sIdx) in program.timeline" :key="sIdx" class="flex items-center gap-4">
            <div class="flex h-[42px] w-[42px] shrink-0 flex-col items-center justify-center rounded-[10px] bg-[#fdf2f2] text-brand">
              <span class="text-[16px] font-medium leading-none">{{ step.tgl }}</span>
              <span class="mt-0.5 text-[12px] font-normal leading-none">{{ step.bln }}</span>
            </div>
            <span class="text-[16px] font-normal text-[#3b3b3b]">{{ step.teks }}</span>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

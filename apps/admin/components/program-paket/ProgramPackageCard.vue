<script setup lang="ts">
import type { PaketSekolah } from '~/types/adminPaketSekolah'

defineProps<{
  item: PaketSekolah
}>()

defineEmits<{
  (event: 'detail', item: PaketSekolah): void
}>()
</script>

<template>
  <article class="flex h-[314px] w-full max-w-[510px] flex-col rounded-[27px] bg-bg-surface p-8">
    <div>
      <h2 class="font-heading text-2xl font-medium leading-none text-[#3b3b3b]">
        {{ item.nama || 'Program Paket C' }}
      </h2>
      <p class="mt-4 max-w-[452px] font-heading text-sm font-normal leading-relaxed text-[#3b3b3b]/80">
        {{ item.deskripsi || 'Program pendidikan kesetaraan jenjang SMA/SLTA sederajat' }}
      </p>
    </div>

    <div class="mt-auto flex items-center justify-between gap-4">
      <button
        type="button"
        class="rounded-[19px] px-2.5 py-2.5 font-heading text-sm font-medium leading-none text-[#3b3b3b] transition-colors hover:bg-bg-base focus:outline-none focus:ring-2 focus:ring-brand/20"
        @click="$emit('detail', item)"
      >
        Lihat Detail
      </button>

      <span
        class="inline-flex h-11 min-w-[141px] items-center justify-center rounded-full border px-4 font-heading text-sm font-medium leading-none"
        :class="item.status === 'aktif'
          ? 'border-brand text-brand'
          : 'border-[#001a9d] text-[#001a9d]'"
      >
        aktifkan pendaftaran
      </span>
    </div>
  </article>
</template>

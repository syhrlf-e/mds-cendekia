<script setup lang="ts">
import { UserRound, X } from 'lucide-vue-next'
import type { Registration } from '~/types/adminPendaftaran'

type TabKey = 'diri' | 'ortu' | 'berkas'

defineProps<{
  item: Registration
  activeTab: TabKey
  detailTabs: Array<{ key: TabKey, label: string }>
  getOutlineStatusClass: (status: string) => string
}>()

const emit = defineEmits<{
  close: []
  'update:activeTab': [tab: TabKey]
}>()
</script>

<template>
  <div class="sticky top-0 z-20 shrink-0 bg-bg-surface">
    <div class="flex items-start justify-between gap-5 border-b border-border px-8 py-5">
      <div class="flex min-w-0 items-start gap-5">
        <button
          type="button"
          class="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-bg-base hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/20"
          aria-label="Tutup detail"
          @click="emit('close')"
        >
          <X class="h-5 w-5" />
        </button>

        <div class="h-[112px] w-[84px] shrink-0 overflow-hidden rounded-2xl border border-border bg-bg-parchment">
          <img
            v-if="item.fotoUrl"
            :src="item.fotoUrl"
            :alt="`Foto ${item.nama}`"
            class="h-full w-full object-cover"
          >
          <div
            v-else
            class="flex h-full w-full flex-col items-center justify-center gap-1 px-2 text-center"
          >
            <UserRound class="h-6 w-6 text-text-muted/50" />
            <p class="text-[10px] font-medium leading-[1.3] text-text-muted">Foto belum tersedia</p>
          </div>
        </div>

        <div class="min-w-0">
          <h2 class="truncate font-heading text-[22px] font-bold leading-[1.18] tracking-[-0.3px] text-text-primary">
            {{ item.nama }}
          </h2>
          <p class="mt-1 truncate text-sm font-medium leading-[1.43] text-text-secondary">
            {{ item.id }}
            <span class="mx-1.5 opacity-40">·</span>
            {{ item.sekolah }}
          </p>
          <span v-if="item.gelombang" class="mt-3 inline-flex rounded-full border border-border-soft px-3 py-1 text-xs font-medium text-text-secondary">
            Gelombang {{ item.gelombang }}
          </span>
        </div>
      </div>

      <div class="flex shrink-0 flex-col items-end gap-2 pt-1">
        <div class="flex items-center gap-2 whitespace-nowrap">
          <span class="text-xs font-medium leading-none text-text-secondary">Status Pendaftaran :</span>
          <span
            class="inline-flex rounded-full border px-2.5 py-1 text-xs font-medium leading-none"
            :class="getOutlineStatusClass(item.statusText)"
          >
            {{ item.statusText }}
          </span>
        </div>
        <div class="flex items-center gap-2 whitespace-nowrap">
          <span class="text-xs font-medium leading-none text-text-secondary">Status Berkas :</span>
          <span
            class="inline-flex rounded-full border px-2.5 py-1 text-xs font-medium leading-none"
            :class="getOutlineStatusClass(item.statusBerkas)"
          >
            {{ item.statusBerkas }}
          </span>
        </div>
      </div>
    </div>

    <div class="flex items-center bg-bg-base px-8">
      <button
        v-for="tab in detailTabs"
        :key="tab.key"
        type="button"
        class="relative h-11 px-5 text-sm font-normal leading-none transition-colors focus:outline-none"
        :class="activeTab === tab.key
          ? 'text-brand after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:rounded-t-full after:bg-brand after:content-[\'\']'
          : 'text-text-secondary hover:text-text-primary'"
        @click="emit('update:activeTab', tab.key)"
      >
        {{ tab.label }}
      </button>
    </div>
  </div>
</template>

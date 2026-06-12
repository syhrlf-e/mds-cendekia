<script setup lang="ts">
import { MoreHorizontal, PencilLine, Plus, Trash2 } from 'lucide-vue-next'

export type ProgramPackageTimelineItem = {
  id: string
  tanggalMulai: string
  tanggalSelesai: string
  deskripsi: string
}

const props = defineProps<{
  items: ProgramPackageTimelineItem[]
}>()

const emit = defineEmits<{
  (event: 'update:items', value: ProgramPackageTimelineItem[]): void
}>()

const createTimelineItem = (): ProgramPackageTimelineItem => ({
  id: crypto.randomUUID(),
  tanggalMulai: '',
  tanggalSelesai: '',
  deskripsi: ''
})

const updateItem = (id: string, patch: Partial<ProgramPackageTimelineItem>) => {
  emit('update:items', props.items.map(item => item.id === id ? { ...item, ...patch } : item))
}

const addItem = () => {
  emit('update:items', [...props.items, createTimelineItem()])
}

const removeItem = (id: string) => {
  if (props.items.length <= 1) return
  emit('update:items', props.items.filter(item => item.id !== id))
}
</script>

<template>
  <section class="mt-6">
    <h3 class="font-heading text-xl font-normal leading-none text-[#3b3b3b]">
      Timeline Pendaftaran
    </h3>

    <div class="mt-4 flex flex-col gap-4">
      <article
        v-for="item in items"
        :key="item.id"
        class="rounded-[18px] bg-[#fbfbfb] px-6 py-5"
      >
        <div class="flex items-start gap-4">
          <div class="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-4">
            <label class="flex min-w-0 flex-col gap-2">
              <span class="font-heading text-sm font-normal text-[#3b3b3b]/70">Tanggal Mulai</span>
              <input
                :value="item.tanggalMulai"
                type="date"
                class="h-10 rounded-xl border-0 bg-[#f1f1f1] px-3 font-heading text-sm text-[#3b3b3b] outline-none focus:ring-2 focus:ring-sky-500/20"
                @input="updateItem(item.id, { tanggalMulai: ($event.target as HTMLInputElement).value })"
              >
            </label>

            <label class="flex min-w-0 flex-col gap-2">
              <span class="font-heading text-sm font-normal text-[#3b3b3b]/70">Tanggal Selesai</span>
              <input
                :value="item.tanggalSelesai"
                type="date"
                class="h-10 rounded-xl border-0 bg-[#f1f1f1] px-3 font-heading text-sm text-[#3b3b3b] outline-none focus:ring-2 focus:ring-sky-500/20"
                @input="updateItem(item.id, { tanggalSelesai: ($event.target as HTMLInputElement).value })"
              >
            </label>

            <label class="col-span-2 flex min-w-0 flex-col gap-2">
              <span class="font-heading text-sm font-normal text-[#3b3b3b]/70">Deskripsi Timeline</span>
              <input
                :value="item.deskripsi"
                type="text"
                placeholder="Pendaftaran Online"
                class="h-11 rounded-xl border-0 bg-transparent px-0 font-heading text-lg font-normal text-[#1d1d1f] outline-none placeholder:text-[#1d1d1f]"
                @input="updateItem(item.id, { deskripsi: ($event.target as HTMLInputElement).value })"
              >
            </label>
          </div>

          <div class="flex shrink-0 items-center gap-2 pt-1">
            <MoreHorizontal class="h-5 w-5 text-[#3b3b3b]/70" />
            <button
              type="button"
              class="flex h-8 w-8 items-center justify-center rounded-lg text-[#d5b700] transition-colors hover:bg-[#fff8c7]"
              aria-label="Edit timeline"
            >
              <PencilLine class="h-5 w-5" />
            </button>
            <button
              type="button"
              class="flex h-8 w-8 items-center justify-center rounded-lg text-error transition-colors hover:bg-status-rejected-bg disabled:cursor-not-allowed disabled:opacity-30"
              :disabled="items.length <= 1"
              aria-label="Hapus timeline"
              @click="removeItem(item.id)"
            >
              <Trash2 class="h-5 w-5" />
            </button>
          </div>
        </div>
      </article>
    </div>

    <button
      type="button"
      class="mt-6 inline-flex items-center gap-2 font-heading text-base font-normal text-[#3b3b3b]/70 transition-colors hover:text-[#3b3b3b] focus:outline-none focus:ring-2 focus:ring-brand/20"
      @click="addItem"
    >
      <Plus class="h-5 w-5" />
      Tambahkan timeline lainnya
    </button>
  </section>
</template>

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
  <section class="mt-4 rounded-2xl bg-bg-surface p-6">
    <div class="flex items-center justify-between gap-4">
      <div>
        <h3 class="font-heading text-lg font-semibold leading-none text-text-primary">
          Timeline Pendaftaran
        </h3>
        <p class="mt-2 font-body text-sm leading-relaxed text-text-secondary">
          Atur tahapan pendaftaran yang akan ditampilkan untuk program ini.
        </p>
      </div>

      <button
        type="button"
        class="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-brand px-4 font-heading text-sm font-semibold text-white transition-colors hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-brand/20"
        @click="addItem"
      >
        <Plus class="h-4 w-4" />
        Tambah
      </button>
    </div>

    <div class="mt-5 flex flex-col gap-3">
      <article
        v-for="item in items"
        :key="item.id"
        class="rounded-2xl border border-border-soft bg-bg-base px-5 py-4"
      >
        <div class="flex items-start gap-4">
          <div class="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
            <label class="flex min-w-0 flex-col gap-2">
              <span class="font-heading text-sm font-medium text-text-secondary">Tanggal Mulai</span>
              <input
                :value="item.tanggalMulai"
                type="date"
                class="h-10 rounded-xl border border-border bg-bg-surface px-3 font-heading text-sm text-text-primary outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
                @input="updateItem(item.id, { tanggalMulai: ($event.target as HTMLInputElement).value })"
              >
            </label>

            <label class="flex min-w-0 flex-col gap-2">
              <span class="font-heading text-sm font-medium text-text-secondary">Tanggal Selesai</span>
              <input
                :value="item.tanggalSelesai"
                type="date"
                class="h-10 rounded-xl border border-border bg-bg-surface px-3 font-heading text-sm text-text-primary outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
                @input="updateItem(item.id, { tanggalSelesai: ($event.target as HTMLInputElement).value })"
              >
            </label>

            <label class="col-span-2 flex min-w-0 flex-col gap-2">
              <span class="font-heading text-sm font-medium text-text-secondary">Deskripsi Timeline</span>
              <input
                :value="item.deskripsi"
                type="text"
                placeholder="Pendaftaran Online"
                class="h-11 rounded-xl border border-border bg-bg-surface px-3 font-heading text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-brand focus:ring-2 focus:ring-brand/20"
                @input="updateItem(item.id, { deskripsi: ($event.target as HTMLInputElement).value })"
              >
            </label>
          </div>

          <div class="flex shrink-0 items-center gap-2 pt-1">
            <MoreHorizontal class="h-5 w-5 text-text-muted" />
            <button
              type="button"
              class="flex h-9 w-9 items-center justify-center rounded-xl text-warning transition-colors hover:bg-status-pending-bg"
              aria-label="Edit timeline"
            >
              <PencilLine class="h-4.5 w-4.5" />
            </button>
            <button
              type="button"
              class="flex h-9 w-9 items-center justify-center rounded-xl text-error transition-colors hover:bg-status-rejected-bg disabled:cursor-not-allowed disabled:opacity-30"
              :disabled="items.length <= 1"
              aria-label="Hapus timeline"
              @click="removeItem(item.id)"
            >
              <Trash2 class="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

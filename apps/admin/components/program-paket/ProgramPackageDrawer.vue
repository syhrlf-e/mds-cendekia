<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { X } from 'lucide-vue-next'
import ProgramPackageTimelineEditor from './ProgramPackageTimelineEditor.vue'
import type { PaketSekolah } from '~/types/adminPaketSekolah'
import type { ProgramPackageTimelineItem } from './ProgramPackageTimelineEditor.vue'

const props = defineProps<{
  modelValue: boolean
  item: PaketSekolah | null
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void
}>()

const isRegistrationActive = ref(false)
const startedAt = ref('')
const endedAt = ref('')
const timelineItems = ref<ProgramPackageTimelineItem[]>([
  {
    id: 'timeline-default',
    tanggalMulai: '',
    tanggalSelesai: '',
    deskripsi: ''
  }
])

const packageName = computed(() => props.item?.nama || 'Program Paket C')
const packageDescription = computed(() => props.item?.deskripsi || 'Program Paket C adalah pendidikan kesetaraan setara SMA/MA yang dirancang untuk membantu peserta didik menyelesaikan jenjang pendidikan menengah secara fleksibel, terarah, dan tetap mendapatkan ijazah resmi yang diakui.')
const nextWaveLabel = computed(() => 'Gelombang 1')

const closeDrawer = () => {
  emit('update:modelValue', false)
}

watch(() => props.item, (item) => {
  isRegistrationActive.value = item?.status === 'aktif'
}, { immediate: true })
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-[opacity,backdrop-filter] duration-300 ease-out [&>aside]:transition-transform [&>aside]:duration-300 [&>aside]:ease-out"
      enter-from-class="opacity-0 backdrop-blur-none [&>aside]:translate-x-full"
      enter-to-class="opacity-100 backdrop-blur-[10px] [&>aside]:translate-x-0"
      leave-active-class="transition-[opacity,backdrop-filter] duration-250 ease-in [&>aside]:transition-transform [&>aside]:duration-250 [&>aside]:ease-in"
      leave-from-class="opacity-100 backdrop-blur-[10px] [&>aside]:translate-x-0"
      leave-to-class="opacity-0 backdrop-blur-none [&>aside]:translate-x-full"
    >
      <div
        v-if="modelValue && item"
        class="fixed inset-0 z-50 bg-black/25 backdrop-blur-[10px]"
        @click.self="closeDrawer"
      >
        <aside class="ml-auto flex h-full w-[min(792px,calc(100vw-320px))] flex-col overflow-hidden rounded-l-[26px] bg-bg-surface">
          <button
            type="button"
            class="absolute right-7 top-7 flex h-9 w-9 items-center justify-center rounded-full text-[#3b3b3b]/50 transition-colors hover:bg-bg-base hover:text-[#3b3b3b] focus:outline-none focus:ring-2 focus:ring-brand/20"
            aria-label="Tutup detail program paket"
            @click="closeDrawer"
          >
            <X class="h-5 w-5" />
          </button>

          <div class="min-h-0 grow overflow-y-auto px-[52px] py-12">
            <header class="flex items-start justify-between gap-6 pr-12">
              <div class="min-w-0">
                <h2 class="font-heading text-[32px] font-medium leading-none text-[#3b3b3b]">
                  {{ packageName }}
                </h2>
                <p class="mt-8 max-w-[640px] font-heading text-lg font-normal leading-[1.25] text-[#3b3b3b]/80">
                  {{ packageDescription }}
                </p>
              </div>

              <p
                v-if="isRegistrationActive"
                class="shrink-0 font-heading text-2xl font-normal leading-none text-[#3b3b3b]"
              >
                {{ nextWaveLabel }}
              </p>
            </header>

            <div class="mt-20 h-px bg-[#3b3b3b]" />

            <section
              class="mt-6 rounded-[18px] border border-[#3b3b3b]/80 px-6 py-5 transition-all duration-300"
              :class="isRegistrationActive ? 'pb-6' : 'pb-5'"
            >
              <div class="flex items-center gap-5">
                <h3 class="min-w-0 grow font-heading text-xl font-normal leading-none text-[#3b3b3b]">
                  Buka Pendaftaran untuk program paket C ?
                </h3>
                <button
                  type="button"
                  class="relative h-6 w-12 shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand/20"
                  :class="isRegistrationActive ? 'bg-[#b9ff91]' : 'bg-[#d8d8d8]'"
                  :aria-pressed="isRegistrationActive"
                  @click="isRegistrationActive = !isRegistrationActive"
                >
                  <span
                    class="absolute top-1 h-4 w-4 rounded-full transition-transform duration-200"
                    :class="isRegistrationActive ? 'translate-x-7 bg-[#38b000]' : 'translate-x-1 bg-[#6b6b6b]'"
                  />
                </button>
              </div>

              <div
                v-if="isRegistrationActive"
                class="mt-5 border-t border-[#3b3b3b]/80 pt-5"
              >
                <div class="grid max-w-[360px] grid-cols-[minmax(0,1fr)_16px_minmax(0,1fr)] items-end gap-3">
                  <label class="flex flex-col gap-2">
                    <span class="font-heading text-base font-normal text-[#3b3b3b]">Tanggal Mulai</span>
                    <input
                      v-model="startedAt"
                      type="date"
                      class="h-10 rounded-xl border-0 bg-[#f1f1f1] px-3 font-heading text-sm text-[#3b3b3b] outline-none focus:ring-2 focus:ring-sky-500/20"
                    >
                  </label>
                  <span class="mb-2 text-center font-heading text-lg text-[#3b3b3b]/70">-</span>
                  <label class="flex flex-col gap-2">
                    <span class="font-heading text-base font-normal text-[#3b3b3b]">Tanggal Selesai</span>
                    <input
                      v-model="endedAt"
                      type="date"
                      class="h-10 rounded-xl border-0 bg-[#f1f1f1] px-3 font-heading text-sm text-[#3b3b3b] outline-none focus:ring-2 focus:ring-sky-500/20"
                    >
                  </label>
                </div>
              </div>
            </section>

            <ProgramPackageTimelineEditor
              v-if="isRegistrationActive"
              v-model:items="timelineItems"
            />
          </div>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

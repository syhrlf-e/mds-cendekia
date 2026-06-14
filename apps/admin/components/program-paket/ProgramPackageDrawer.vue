<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { X } from 'lucide-vue-next'
import ProgramPackageTimelineEditor from './ProgramPackageTimelineEditor.vue'
import type { PaketSekolah } from '~/types/adminPaketSekolah'
import type { ProgramPackageTimelineItem } from './ProgramPackageTimelineEditor.vue'

const props = defineProps<{
  modelValue: boolean
  item: PaketSekolah | null
  mode?: 'detail' | 'registration'
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
const drawerLabel = computed(() => props.mode === 'registration' ? 'Kelola Pendaftaran' : '')

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
      enter-to-class="opacity-100 backdrop-blur-[14px] [&>aside]:translate-x-0"
      leave-active-class="transition-[opacity,backdrop-filter] duration-300 ease-in [&>aside]:transition-transform [&>aside]:duration-300 [&>aside]:ease-in"
      leave-from-class="opacity-100 backdrop-blur-[14px] [&>aside]:translate-x-0"
      leave-to-class="opacity-0 backdrop-blur-none [&>aside]:translate-x-full"
    >
      <div
        v-if="modelValue && item"
        class="fixed inset-0 z-50 bg-text-primary/20 backdrop-blur-[14px]"
        @click.self="closeDrawer"
      >
        <aside class="relative z-[40] ml-auto flex h-[calc(100%-16px)] w-[min(760px,calc(100%-320px))] flex-col overflow-hidden border-l-2 border-border bg-bg-base">
          <header class="shrink-0 border-b border-border bg-bg-surface px-8 py-6">
            <div class="flex items-start justify-between gap-6">
              <div class="min-w-0 grow">
                <p
                  v-if="drawerLabel"
                  class="mb-2 font-heading text-sm font-medium leading-none text-text-muted"
                >
                  {{ drawerLabel }}
                </p>
                <h2 class="truncate font-heading text-2xl font-semibold leading-tight text-text-primary">
                  {{ packageName }}
                </h2>
              </div>

              <div class="flex shrink-0 items-center gap-3">
                <span
                  class="rounded-full px-3 py-1.5 font-heading text-xs font-semibold"
                  :class="isRegistrationActive ? 'bg-status-approved-bg text-status-approved-text' : 'bg-bg-base text-text-secondary'"
                >
                  {{ isRegistrationActive ? 'Pendaftaran Aktif' : 'Pendaftaran Nonaktif' }}
                </span>
                <button
                  type="button"
                  class="flex h-10 w-10 items-center justify-center rounded-xl text-text-secondary transition-colors hover:bg-bg-base hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/20"
                  aria-label="Tutup detail program paket"
                  @click="closeDrawer"
                >
                  <X class="h-5 w-5" />
                </button>
              </div>
            </div>
          </header>

          <main class="min-h-0 grow overflow-y-auto">
            <div class="mx-auto w-full max-w-3xl px-8 py-6">
              <section class="rounded-2xl bg-bg-surface p-6">
                <div class="flex items-start justify-between gap-6">
                  <div class="min-w-0">
                    <h3 class="font-heading text-lg font-semibold leading-none text-text-primary">
                      Informasi Program
                    </h3>
                    <p class="mt-4 max-w-2xl font-body text-sm leading-relaxed text-text-secondary">
                      {{ packageDescription }}
                    </p>
                  </div>

                  <p
                    v-if="isRegistrationActive"
                    class="shrink-0 rounded-full bg-primary-50 px-3 py-1.5 font-heading text-xs font-semibold text-brand"
                  >
                    {{ nextWaveLabel }}
                  </p>
                </div>

              </section>

              <section
                v-if="mode !== 'detail'"
                class="mt-4 rounded-2xl bg-bg-surface p-6"
              >
                <div class="flex items-center gap-5">
                  <div class="min-w-0 grow">
                    <h3 class="font-heading text-lg font-semibold leading-none text-text-primary">
                      Pendaftaran Program
                    </h3>
                    <p class="mt-2 font-body text-sm leading-relaxed text-text-secondary">
                      Aktifkan pendaftaran dan tentukan periode pembukaan untuk program ini.
                    </p>
                  </div>
                  <button
                    type="button"
                    class="relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand/20"
                    :class="isRegistrationActive ? 'bg-status-approved-bg' : 'bg-border'"
                    :aria-pressed="isRegistrationActive"
                    @click="isRegistrationActive = !isRegistrationActive"
                  >
                    <span
                      class="absolute left-1 top-1 h-5 w-5 rounded-full bg-bg-surface shadow-sm transition-transform duration-200"
                      :class="isRegistrationActive ? 'translate-x-5' : 'translate-x-0'"
                    />
                  </button>
                </div>

                <div
                  v-if="isRegistrationActive"
                  class="mt-5 grid grid-cols-2 gap-4 border-t border-border-soft pt-5"
                >
                  <AppDateInput
                    v-model="startedAt"
                    label="Tanggal Mulai"
                    :max-year="new Date().getFullYear() + 10"
                  />
                  <AppDateInput
                    v-model="endedAt"
                    label="Tanggal Selesai"
                    :max-year="new Date().getFullYear() + 10"
                  />
                </div>
              </section>

              <ProgramPackageTimelineEditor
                v-if="mode !== 'detail' && isRegistrationActive"
                v-model:items="timelineItems"
              />
            </div>
          </main>

          <footer class="shrink-0 border-t border-border bg-bg-surface px-8 py-4">
            <div class="ml-auto flex justify-end gap-3">
              <AppButton
                variant="ghost"
                @click="closeDrawer"
              >
                {{ mode === 'detail' ? 'Tutup' : 'Batal' }}
              </AppButton>
              <AppButton
                v-if="mode !== 'detail'"
                @click="closeDrawer"
              >
                Simpan Perubahan
              </AppButton>
            </div>
          </footer>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

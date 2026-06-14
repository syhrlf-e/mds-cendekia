<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { X } from 'lucide-vue-next'
import ProgramPackageTimelineEditor from './ProgramPackageTimelineEditor.vue'
import { useAdminTimelineService } from '~/services/useAdminTimelineService'
import type { PaketGelombang, PaketSekolah } from '~/types/adminPaketSekolah'
import type { GelombangCreatePayload, GelombangUpdatePayload, TimelineCreatePayload, TimelineUpdatePayload } from '~/types/adminTimeline'
import type { ProgramPackageTimelineItem } from './ProgramPackageTimelineEditor.vue'

const props = defineProps<{
  modelValue: boolean
  item: PaketSekolah | null
  mode?: 'detail' | 'registration'
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void
  (event: 'saved'): void
}>()

const { createGelombang, updateGelombang, createTimeline, updateTimeline, deleteTimeline } = useAdminTimelineService()
const { addToast } = useToast()

const isRegistrationActive = ref(false)
const startedAt = ref('')
const endedAt = ref('')
const academicYear = ref('')
const waveOrder = ref<number | ''>('')
const quota = ref<number | ''>('')
const isSaving = ref(false)
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
const nextWaveLabel = computed(() => `Gelombang ${waveOrder.value || getNextGelombangOrder()}`)
const drawerLabel = computed(() => props.mode === 'registration' ? 'Kelola Pendaftaran' : '')
const managedGelombang = computed(() => getManagedGelombang(props.item))

const getApiErrorMessage = (err: any, fallback: string) => {
  return err?.data?.message || err?.response?._data?.message || err?.message || fallback
}

const formatIsoString = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString()
}

const formatDateForInput = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().split('T')[0] || ''
}

const getAcademicYear = (dateString: string) => {
  const date = new Date(dateString)
  const year = Number.isNaN(date.getTime()) ? new Date().getFullYear() : date.getFullYear()
  return `${year}/${year + 1}`
}

const getNextGelombangOrder = () => (props.item?.gelombangIds.length || 0) + 1
const resolveInitialAcademicYear = () => getAcademicYear(new Date().toISOString())
const getManagedGelombang = (item: PaketSekolah | null): PaketGelombang | null => {
  if (!item?.gelombang.length) return null
  return item.gelombang.find(gelombang => gelombang.status) || item.gelombang[0] || null
}

const closeDrawer = () => {
  if (isSaving.value) return
  emit('update:modelValue', false)
}

const saveRegistrationTimeline = async () => {
  if (!props.item || props.mode === 'detail') {
    closeDrawer()
    return
  }

  if (!isRegistrationActive.value) {
    closeDrawer()
    return
  }

  const filledTimelineItems = timelineItems.value.filter(item => item.deskripsi.trim())
  if (!filledTimelineItems.length) {
    addToast('Minimal satu deskripsi timeline wajib diisi.', 'warning')
    return
  }

  if (filledTimelineItems.some(item => !item.tanggalMulai)) {
    addToast('Tanggal mulai pada setiap timeline wajib diisi.', 'warning')
    return
  }

  const gelombangOrder = Number(waveOrder.value)
  const selectedGelombang = managedGelombang.value

  if (!academicYear.value.trim() || !waveOrder.value || !quota.value || !startedAt.value || !endedAt.value) {
    addToast('Tahun ajaran, gelombang, kuota, dan periode pendaftaran wajib diisi.', 'warning')
    return
  }

  isSaving.value = true

  if (selectedGelombang) {
    const gelombangPayload: GelombangUpdatePayload = {
      mulai: formatIsoString(startedAt.value),
      selesai: formatIsoString(endedAt.value),
      kuota: Number(quota.value),
      status: isRegistrationActive.value,
      tahun_ajaran: academicYear.value.trim()
    }
    const { data: gelombangData, error: gelombangError } = await updateGelombang(selectedGelombang.id, gelombangPayload)

    if (gelombangError || gelombangData?.success === false) {
      isSaving.value = false
      addToast(gelombangData?.message || getApiErrorMessage(gelombangError, 'Gelombang pendaftaran belum berhasil diperbarui.'), 'error')
      return
    }

    const existingTimelineItems = filledTimelineItems.filter(item => item.serverId)
    const newTimelineItems = filledTimelineItems.filter(item => !item.serverId)

    for (const item of existingTimelineItems) {
      const payload: TimelineUpdatePayload = {
        id_gelombang: selectedGelombang.id,
        tanggal: formatIsoString(item.tanggalMulai),
        deskripsi: item.deskripsi.trim()
      }
      const { data, error } = await updateTimeline(item.serverId as number, payload)

      if (error || data?.success === false) {
        isSaving.value = false
        addToast(data?.message || getApiErrorMessage(error, 'Timeline pendaftaran belum berhasil diperbarui.'), 'error')
        return
      }
    }

    for (const item of newTimelineItems) {
      const payload: TimelineCreatePayload = {
        id_gelombang: selectedGelombang.id,
        tanggal: formatIsoString(item.tanggalMulai),
        deskripsi: item.deskripsi.trim()
      }
      const { data, error } = await createTimeline(payload)

      if (error || data?.success === false) {
        isSaving.value = false
        addToast(data?.message || getApiErrorMessage(error, 'Timeline pendaftaran belum berhasil ditambahkan.'), 'error')
        return
      }
    }

    isSaving.value = false
    addToast('Timeline pendaftaran berhasil disimpan.', 'success')
    emit('saved')
    closeDrawer()
    return
  }

  const payload: GelombangCreatePayload = {
    id_program: props.item.id,
    order: gelombangOrder,
    mulai: formatIsoString(startedAt.value),
    selesai: formatIsoString(endedAt.value),
    kuota: Number(quota.value),
    status: true,
    tahun_ajaran: academicYear.value.trim(),
    timeline: filledTimelineItems.map(item => ({
      id_gelombang: gelombangOrder,
      tanggal: formatIsoString(item.tanggalMulai),
      deskripsi: item.deskripsi.trim()
    }))
  }

  const { data, error } = await createGelombang(payload)
  isSaving.value = false

  if (error || data?.success === false) {
    addToast(data?.message || getApiErrorMessage(error, 'Timeline pendaftaran belum berhasil disimpan.'), 'error')
    return
  }

  addToast('Timeline pendaftaran berhasil disimpan.', 'success')
  emit('saved')
  closeDrawer()
}

const deleteTimelineItem = async (item: ProgramPackageTimelineItem) => {
  if (!item.serverId) {
    timelineItems.value = timelineItems.value.filter(row => row.id !== item.id)
    return
  }

  if (!import.meta.client) return
  const confirmed = window.confirm(`Hapus timeline "${item.deskripsi}"?`)
  if (!confirmed) return

  isSaving.value = true
  const { data, error } = await deleteTimeline(item.serverId)
  isSaving.value = false

  if (error || data?.success === false) {
    addToast(data?.message || getApiErrorMessage(error, 'Timeline pendaftaran belum berhasil dihapus.'), 'error')
    return
  }

  timelineItems.value = timelineItems.value.filter(row => row.id !== item.id)
  addToast(data?.message || 'Timeline pendaftaran berhasil dihapus.', 'success')
  emit('saved')
}

watch(() => props.item, (item) => {
  const managedGelombang = getManagedGelombang(item)

  isRegistrationActive.value = Boolean(managedGelombang || item?.status === 'aktif')
  startedAt.value = formatDateForInput(managedGelombang?.mulai || '')
  endedAt.value = formatDateForInput(managedGelombang?.selesai || '')
  academicYear.value = managedGelombang?.tahunAjaran || resolveInitialAcademicYear()
  waveOrder.value = managedGelombang?.order || getNextGelombangOrder()
  quota.value = managedGelombang?.kuota || item?.kuota || ''
  timelineItems.value = managedGelombang?.timeline.length
    ? managedGelombang.timeline.map(timeline => ({
        id: `timeline-${timeline.id}`,
        serverId: timeline.id,
        gelombangId: managedGelombang.id,
        tanggalMulai: formatDateForInput(timeline.tanggal),
        tanggalSelesai: '',
        deskripsi: timeline.deskripsi
      }))
    : [
        {
          id: 'timeline-default',
          tanggalMulai: '',
          tanggalSelesai: '',
          deskripsi: ''
        }
      ]
}, { immediate: true })
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-[opacity,backdrop-filter] duration-300 ease-out [&>aside]:transition-transform [&>aside]:duration-300 [&>aside]:ease-out"
      enter-from-class="opacity-0 backdrop-blur-none [&>aside]:translate-x-full"
      enter-to-class="opacity-100 backdrop-blur-sm [&>aside]:translate-x-0"
      leave-active-class="transition-[opacity,backdrop-filter] duration-300 ease-in [&>aside]:transition-transform [&>aside]:duration-300 [&>aside]:ease-in"
      leave-from-class="opacity-100 backdrop-blur-sm [&>aside]:translate-x-0"
      leave-to-class="opacity-0 backdrop-blur-none [&>aside]:translate-x-full"
    >
      <div
        v-if="modelValue && item"
        class="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
        @click.self="closeDrawer"
      >
        <aside class="relative z-[40] ml-auto flex h-full w-[680px] flex-col overflow-hidden border-l border-border-soft bg-bg-surface shadow-2xl">
          <header class="shrink-0 border-b border-border-soft bg-bg-surface px-8 py-6">
            <div class="flex items-start justify-between gap-6">
              <div class="min-w-0 grow">
                <p
                  v-if="drawerLabel"
                  class="mb-1.5 font-heading text-sm font-medium leading-none text-text-muted"
                >
                  {{ drawerLabel }}
                </p>
                <div class="flex items-center gap-3">
                  <h2 class="truncate font-heading text-xl font-bold leading-tight text-text-primary">
                    {{ packageName }}
                  </h2>
                  <span
                    class="rounded-full px-2.5 py-1 font-heading text-xs font-semibold"
                    :class="isRegistrationActive ? 'bg-status-approved-bg text-status-approved-text' : 'bg-bg-base text-text-secondary'"
                  >
                    {{ isRegistrationActive ? 'Pendaftaran Aktif' : 'Pendaftaran Nonaktif' }}
                  </span>
                </div>
              </div>

              <div class="flex shrink-0 items-center gap-3">
                <button
                  type="button"
                  class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-bg-base hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/20"
                  aria-label="Tutup detail program paket"
                  @click="closeDrawer"
                >
                  <X class="h-5 w-5" />
                </button>
              </div>
            </div>
          </header>

          <main class="min-h-0 grow overflow-y-auto px-8 py-8">
            <div class="mx-auto w-full space-y-8">
              <!-- Card Informasi Program -->
              <section class="rounded-[24px] border border-border-soft bg-bg-base p-6 shadow-sm">
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

              <!-- Card Pendaftaran Program -->
              <section
                v-if="mode !== 'detail'"
                class="rounded-[24px] border border-border-soft bg-bg-base p-6 shadow-sm"
              >
                <div class="flex items-center justify-between gap-5">
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
                    role="switch"
                    :disabled="isSaving"
                    :aria-checked="isRegistrationActive"
                    class="relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand/20 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    :class="isRegistrationActive ? 'bg-success' : 'bg-border-soft'"
                    @click="isRegistrationActive = !isRegistrationActive"
                  >
                    <span class="sr-only">Toggle status pendaftaran</span>
                    <span
                      class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out"
                      :class="isRegistrationActive ? 'translate-x-5' : 'translate-x-0'"
                    />
                  </button>
                </div>

                <div
                  v-if="isRegistrationActive"
                  class="mt-6 grid grid-cols-2 gap-5 border-t border-border-soft pt-6"
                >
                  <label class="flex min-w-0 flex-col gap-2">
                    <span class="font-heading text-sm font-medium text-text-primary">Tahun Ajaran</span>
                    <input
                      v-model="academicYear"
                      type="text"
                      placeholder="Contoh: 2025/2026"
                      :disabled="isSaving"
                      class="h-12 rounded-xl border border-border bg-bg-surface px-4 font-heading text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:cursor-not-allowed disabled:bg-bg-base disabled:opacity-60"
                    >
                  </label>

                  <div class="grid min-w-0 grid-cols-2 gap-3">
                    <label class="flex min-w-0 flex-col gap-2">
                      <span class="font-heading text-sm font-medium text-text-primary">Gelombang Ke</span>
                      <input
                        v-model="waveOrder"
                        type="number"
                        min="1"
                        :disabled="isSaving"
                        class="h-12 rounded-xl border border-border bg-bg-surface px-4 font-heading text-sm text-text-primary outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:cursor-not-allowed disabled:bg-bg-base disabled:opacity-60"
                      >
                    </label>

                    <label class="flex min-w-0 flex-col gap-2">
                      <span class="font-heading text-sm font-medium text-text-primary">Kuota</span>
                      <input
                        v-model="quota"
                        type="number"
                        min="1"
                        placeholder="100"
                        :disabled="isSaving"
                        class="h-12 rounded-xl border border-border bg-bg-surface px-4 font-heading text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:cursor-not-allowed disabled:bg-bg-base disabled:opacity-60"
                      >
                    </label>
                  </div>

                  <AppDateInput
                    v-model="startedAt"
                    label="Tanggal Mulai"
                    placeholder="Pilih tanggal mulai"
                    required
                    :disabled="isSaving"
                    :max-year="new Date().getFullYear() + 10"
                  />
                  <AppDateInput
                    v-model="endedAt"
                    label="Tanggal Selesai"
                    placeholder="Pilih tanggal selesai"
                    required
                    :disabled="isSaving"
                    :max-year="new Date().getFullYear() + 10"
                  />
                </div>
              </section>

              <ProgramPackageTimelineEditor
                v-if="mode !== 'detail' && isRegistrationActive"
                v-model:items="timelineItems"
                @delete="deleteTimelineItem"
              />
            </div>
          </main>

          <footer class="shrink-0 border-t border-border-soft bg-bg-surface px-8 py-5">
            <div class="flex justify-end gap-3">
              <AppButton
                variant="ghost"
                :disabled="isSaving"
                @click="closeDrawer"
              >
                {{ mode === 'detail' ? 'Tutup' : 'Batal' }}
              </AppButton>
              <AppButton
                v-if="mode !== 'detail'"
                :loading="isSaving"
                :disabled="isSaving"
                @click="saveRegistrationTimeline"
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

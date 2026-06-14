<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { adminApiEndpoints } from '~/services/adminApiEndpoints'

type ProgramTimelineDto = {
  id?: number | string
  tanggal?: string
  deskripsi?: string
}

type ProgramGelombangDto = {
  id?: number | string
  order?: number | string
  status?: boolean
  mulai?: string
  selesai?: string
  timeline?: ProgramTimelineDto[]
}

type ProgramPaketDto = {
  id?: number | string
  nama?: string
  status?: boolean
  gelombang?: ProgramGelombangDto[] | ProgramGelombangDto
}

type RecentTimelineItem = {
  id: string
  day: string
  month: string
  text: string
  timestamp: number
}

type RecentProgram = {
  id: string
  nama: string
  gelombang: string
  timeline: RecentTimelineItem[]
}

const props = withDefaults(defineProps<{
  refreshKey?: number
}>(), {
  refreshKey: 0
})

const { get } = useApi()

const programs = ref<RecentProgram[]>([])
const isLoading = ref(true)

const readArrayPayload = (payload: any): ProgramPaketDto[] => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.data?.data)) return payload.data.data
  if (Array.isArray(payload?.programPaket)) return payload.programPaket
  if (Array.isArray(payload?.program_paket)) return payload.program_paket
  if (payload?.id || payload?.nama) return [payload]
  if (payload?.data?.id || payload?.data?.nama) return [payload.data]
  return []
}

const readGelombangItems = (item: ProgramPaketDto) => {
  if (Array.isArray(item.gelombang)) return item.gelombang
  if (item.gelombang && typeof item.gelombang === 'object') return [item.gelombang]
  return []
}

const parseDate = (value?: string) => {
  const date = value ? new Date(value.replace(' ', 'T')) : null
  return date && Number.isFinite(date.getTime()) ? date : null
}

const formatTimelineDate = (value?: string) => {
  const date = parseDate(value)

  if (!date) {
    return {
      day: '-',
      month: '-',
      timestamp: Number.MAX_SAFE_INTEGER
    }
  }

  return {
    day: new Intl.DateTimeFormat('id-ID', { day: '2-digit' }).format(date),
    month: new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(date),
    timestamp: date.getTime()
  }
}

const selectGelombang = (item: ProgramPaketDto) => {
  const gelombangItems = readGelombangItems(item)
  return gelombangItems.find(gelombang => gelombang.status === true) || gelombangItems[0]
}

const mapRecentPrograms = (payload: any): RecentProgram[] => {
  return readArrayPayload(payload)
    .filter(item => item.status !== false)
    .map((item, index) => {
      const gelombang = selectGelombang(item)
      const timeline = Array.isArray(gelombang?.timeline) ? gelombang.timeline : []
      const gelombangOrder = gelombang?.order || index + 1

      return {
        id: String(item.id || item.nama || index),
        nama: String(item.nama || 'Program Paket'),
        gelombang: `Gelombang ${gelombangOrder}`,
        timeline: timeline
          .map((step, stepIndex) => {
            const date = formatTimelineDate(step.tanggal)
            return {
              id: String(step.id || `${item.id || index}-${stepIndex}`),
              day: date.day,
              month: date.month,
              text: String(step.deskripsi || '-'),
              timestamp: date.timestamp
            }
          })
          .sort((first, second) => first.timestamp - second.timestamp)
          .slice(0, 3)
      }
    })
    .filter(item => item.timeline.length > 0)
    .slice(0, 3)
}

const fetchRecentPrograms = async () => {
  isLoading.value = true

  const { data } = await get<any>(adminApiEndpoints.programPaket.list, {
    showErrorToast: false
  })

  programs.value = mapRecentPrograms(data)
  isLoading.value = false
}

const hasPrograms = computed(() => programs.value.length > 0)

onMounted(() => {
  fetchRecentPrograms()
})

watch(() => props.refreshKey, () => {
  fetchRecentPrograms()
})
</script>

<template>
  <aside class="mb-[4px] flex h-fit w-full flex-col rounded-[27px] bg-white p-[27px] shadow-sm xl:w-[561px]">
    <h3 class="mb-[16px] font-heading text-[20px] font-semibold text-[#3b3b3b]">Pendaftaran Terkini</h3>

    <div v-if="isLoading" class="flex min-h-[220px] items-center justify-center rounded-[24px] border border-border-soft bg-white">
      <div class="flex items-center gap-3 font-heading text-sm font-medium text-text-secondary">
        <span class="dot-wave" aria-hidden="true">
          <span class="bg-current"></span>
          <span class="bg-current"></span>
          <span class="bg-current"></span>
        </span>
        Memuat pendaftaran...
      </div>
    </div>

    <div v-else-if="!hasPrograms" class="flex min-h-[220px] items-center justify-center rounded-[24px] border border-dashed border-border-soft bg-white px-6 text-center">
      <p class="font-body text-sm leading-relaxed text-text-secondary">
        Belum ada pendaftaran aktif dengan timeline.
      </p>
    </div>

    <div v-else class="flex flex-col gap-[16px]">
      <div
        v-for="program in programs"
        :key="program.id"
        class="flex h-fit w-full max-w-[514px] flex-col rounded-[24px] border border-border-soft bg-white p-[16px] shadow-sm"
      >
        <div class="mb-5 flex items-center justify-between gap-4">
          <h4 class="truncate font-heading text-[16px] font-semibold text-[#3b3b3b]">{{ program.nama }}</h4>
          <span class="shrink-0 font-heading text-[14px] font-medium text-[#3b3b3b]">{{ program.gelombang }}</span>
        </div>

        <div class="flex flex-col gap-[4px]">
          <div v-for="step in program.timeline" :key="step.id" class="flex items-center gap-4">
            <div class="flex h-[42px] w-[42px] shrink-0 flex-col items-center justify-center rounded-[10px] bg-[#fdf2f2] text-brand">
              <span class="text-[16px] font-medium leading-none">{{ step.day }}</span>
              <span class="mt-0.5 text-[12px] font-normal leading-none">{{ step.month }}</span>
            </div>
            <span class="line-clamp-2 text-[16px] font-normal leading-snug text-[#3b3b3b]">{{ step.text }}</span>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

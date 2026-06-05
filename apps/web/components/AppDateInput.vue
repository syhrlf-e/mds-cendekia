<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'

const props = withDefaults(defineProps<{
  modelValue?: string
  label?: string
  error?: string
  required?: boolean
  disabled?: boolean
  minYear?: number
  maxYear?: number
}>(), {
  modelValue: '',
  required: false,
  disabled: false,
  minYear: 1940
})

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
  (event: 'blur', value: FocusEvent): void
}>()

const currentYear = new Date().getFullYear()
const resolvedMaxYear = computed(() => props.maxYear ?? currentYear - 1)
const inputId = `date-input-${useId()}`

const isOpen = ref(false)
const day = ref('')
const month = ref('')
const year = ref('')
const draftDay = ref('')
const draftMonth = ref('')
const draftYear = ref('')

const dayScroller = ref<HTMLElement | null>(null)
const monthScroller = ref<HTMLElement | null>(null)
const yearScroller = ref<HTMLElement | null>(null)

const itemHeight = 44

const monthOptions = [
  { label: 'Januari', value: '01' },
  { label: 'Februari', value: '02' },
  { label: 'Maret', value: '03' },
  { label: 'April', value: '04' },
  { label: 'Mei', value: '05' },
  { label: 'Juni', value: '06' },
  { label: 'Juli', value: '07' },
  { label: 'Agustus', value: '08' },
  { label: 'September', value: '09' },
  { label: 'Oktober', value: '10' },
  { label: 'November', value: '11' },
  { label: 'Desember', value: '12' }
]

const yearOptions = computed(() => {
  const options: string[] = []
  for (let item = resolvedMaxYear.value; item >= props.minYear; item -= 1) {
    options.push(String(item))
  }
  return options
})

const daysInMonth = computed(() => {
  if (!draftMonth.value || !draftYear.value) return 31
  return new Date(Number(draftYear.value), Number(draftMonth.value), 0).getDate()
})

const dayOptions = computed(() => Array.from({ length: daysInMonth.value }, (_, index) => String(index + 1).padStart(2, '0')))

const selectedLabel = computed(() => {
  if (!day.value || !month.value || !year.value) return ''
  const monthLabel = monthOptions.find((item) => item.value === month.value)?.label
  return `${Number(day.value)} ${monthLabel} ${year.value}`
})

const syncFromModel = () => {
  const match = props.modelValue.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) {
    day.value = ''
    month.value = ''
    year.value = ''
    return
  }

  year.value = match[1] || ''
  month.value = match[2] || ''
  day.value = match[3] || ''
}

const scrollToValue = (element: HTMLElement | null, options: string[], value: string) => {
  if (!element) return
  const index = Math.max(0, options.findIndex((item) => item === value))
  element.scrollTo({ top: index * itemHeight, behavior: 'auto' })
}

const syncScrollPositions = async () => {
  await nextTick()
  scrollToValue(dayScroller.value, dayOptions.value, draftDay.value)
  scrollToValue(monthScroller.value, monthOptions.map((item) => item.value), draftMonth.value)
  scrollToValue(yearScroller.value, yearOptions.value, draftYear.value)
}

const openPicker = async () => {
  if (props.disabled) return

  draftYear.value = year.value || String(Math.min(resolvedMaxYear.value, currentYear - 12))
  draftMonth.value = month.value || '01'
  draftDay.value = day.value || '01'
  isOpen.value = true
  await syncScrollPositions()
}

const closePicker = () => {
  isOpen.value = false
}

const commitDate = () => {
  day.value = draftDay.value
  month.value = draftMonth.value
  year.value = draftYear.value
  emit('update:modelValue', `${draftYear.value}-${draftMonth.value}-${draftDay.value}`)
  closePicker()
}

const handleWheelScroll = (
  event: Event,
  options: string[],
  setter: (value: string) => void
) => {
  const element = event.target as HTMLElement
  const index = Math.min(options.length - 1, Math.max(0, Math.round(element.scrollTop / itemHeight)))
  setter(options[index] || '')
}

watch(() => props.modelValue, syncFromModel, { immediate: true })

watch([draftMonth, draftYear], () => {
  if (draftDay.value && Number(draftDay.value) > daysInMonth.value) {
    draftDay.value = String(daysInMonth.value).padStart(2, '0')
    nextTick(() => scrollToValue(dayScroller.value, dayOptions.value, draftDay.value))
  }
})

watch(isOpen, (open) => {
  if (!import.meta.client) return

  document.body.style.overflow = open ? 'hidden' : ''
})

onBeforeUnmount(() => {
  if (import.meta.client) {
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <div class="flex w-full flex-col gap-1.5">
    <label v-if="label" :for="inputId" class="text-xs font-medium text-text-primary md:text-sm">
      {{ label }}
      <span v-if="!required" class="font-normal text-text-secondary">(Opsional)</span>
    </label>

    <button
      :id="inputId"
      type="button"
      :disabled="disabled"
      :class="[
        'flex h-11 w-full items-center justify-between rounded-lg border bg-bg-surface px-4 text-left text-sm outline-none transition-colors md:text-base',
        error ? 'border-error focus:border-error focus:ring-3 focus:ring-error/10' : 'border-border focus:border-sky-500/70 focus:ring-2 focus:ring-sky-500/12',
        disabled ? 'cursor-not-allowed bg-bg-base opacity-60' : 'cursor-pointer',
        selectedLabel ? 'text-text-primary' : 'text-text-secondary'
      ]"
      @click="openPicker"
    >
      <span>{{ selectedLabel || 'Pilih tanggal lahir' }}</span>
      <span class="text-text-secondary">⌄</span>
    </button>

    <span v-if="error" class="text-xs text-error">{{ error }}</span>

    <Teleport to="body">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-80 flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      >
        <div class="w-full max-w-md rounded-t-3xl bg-bg-surface p-5 shadow-2xl sm:rounded-3xl">
          <div class="mb-5 text-center">
            <h3 class="font-heading text-lg font-semibold text-text-primary">
              {{ label || 'Pilih Tanggal' }}
            </h3>
          </div>

          <div class="relative grid h-55 grid-cols-[0.8fr_1.25fr_1fr] gap-2 overflow-hidden">
            <div class="pointer-events-none absolute left-0 right-0 top-1/2 z-0 h-11 -translate-y-1/2 rounded-xl border border-brand bg-primary-50/70"></div>
            <div class="pointer-events-none absolute inset-x-0 top-0 z-20 h-16 bg-gradient-to-b from-white to-white/0"></div>
            <div class="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-16 bg-gradient-to-t from-white to-white/0"></div>

            <div
              ref="dayScroller"
              class="relative z-10 snap-y snap-mandatory overflow-y-auto py-22 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              @scroll="handleWheelScroll($event, dayOptions, (value) => draftDay = value)"
            >
              <button
                v-for="item in dayOptions"
                :key="item"
                type="button"
                class="flex h-11 w-full snap-center items-center justify-center rounded-lg transition-all duration-150"
                :class="draftDay === item ? 'scale-105 text-lg font-medium text-brand' : 'scale-100 text-base font-normal text-text-secondary'"
                @click="draftDay = item; syncScrollPositions()"
              >
                {{ item }}
              </button>
            </div>

            <div
              ref="monthScroller"
              class="relative z-10 snap-y snap-mandatory overflow-y-auto py-22 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              @scroll="handleWheelScroll($event, monthOptions.map((item) => item.value), (value) => draftMonth = value)"
            >
              <button
                v-for="item in monthOptions"
                :key="item.value"
                type="button"
                class="flex h-11 w-full snap-center items-center justify-center rounded-lg transition-all duration-150"
                :class="draftMonth === item.value ? 'scale-105 text-lg font-medium text-brand' : 'scale-100 text-base font-normal text-text-secondary'"
                @click="draftMonth = item.value; syncScrollPositions()"
              >
                {{ item.label }}
              </button>
            </div>

            <div
              ref="yearScroller"
              class="relative z-10 snap-y snap-mandatory overflow-y-auto py-22 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              @scroll="handleWheelScroll($event, yearOptions, (value) => draftYear = value)"
            >
              <button
                v-for="item in yearOptions"
                :key="item"
                type="button"
                class="flex h-11 w-full snap-center items-center justify-center rounded-lg transition-all duration-150"
                :class="draftYear === item ? 'scale-105 text-lg font-medium text-brand' : 'scale-100 text-base font-normal text-text-secondary'"
                @click="draftYear = item; syncScrollPositions()"
              >
                {{ item }}
              </button>
            </div>
          </div>

          <div class="mt-5 flex justify-end gap-2">
            <button
              type="button"
              class="rounded-full px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-base"
              @click="closePicker"
            >
              Batal
            </button>
            <button
              type="button"
              class="rounded-full bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
              @click="commitDate"
            >
              Pilih
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

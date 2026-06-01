<script setup lang="ts">
import { Check, ChevronDown } from 'lucide-vue-next'
import { computed, onBeforeUnmount, onMounted, ref, useId } from 'vue'

const props = withDefaults(defineProps<{
  modelValue?: string | number
  label?: string
  id?: string
  error?: string
  required?: boolean
  disabled?: boolean
  options: { label: string; value: string | number }[]
  placeholder?: string
}>(), {
  modelValue: '',
  disabled: false,
  required: false,
  placeholder: 'Pilih salah satu'
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus'])

const fallbackId = useId()
const selectId = computed(() => props.id || `select-${fallbackId}`)
const selectedValue = computed(() => props.modelValue === null || props.modelValue === undefined ? '' : String(props.modelValue))
const selectedOption = computed(() => props.options.find(option => String(option.value) === selectedValue.value))
const isOpen = ref(false)
const selectRoot = ref<HTMLElement | null>(null)

const closeSelect = () => {
  if (isOpen.value) {
    isOpen.value = false
    emit('blur')
  }
}

const toggleSelect = () => {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  if (isOpen.value) emit('focus')
}

const chooseOption = (value: string | number) => {
  emit('update:modelValue', value)
  closeSelect()
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeSelect()
    return
  }

  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    toggleSelect()
  }
}

const handleClickOutside = (event: MouseEvent) => {
  if (!selectRoot.value?.contains(event.target as Node)) {
    closeSelect()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div ref="selectRoot" class="relative flex w-full flex-col gap-1.5" :class="{ 'z-50': isOpen }">
    <label v-if="label" :for="selectId" class="text-sm font-medium text-text-primary">
      {{ label }}
      <span v-if="!required" class="font-normal text-text-secondary">(Opsional)</span>
    </label>

    <button
      :id="selectId"
      type="button"
      :disabled="disabled"
      role="combobox"
      :aria-expanded="isOpen"
      :aria-controls="`${selectId}-listbox`"
      :class="[
        'flex h-11 w-full items-center justify-between rounded-lg border bg-bg-surface px-4 text-left outline-none transition-colors',
        error
          ? 'border-error focus:border-error focus:ring-[3px] focus:ring-error/10'
          : 'border-border focus:border-brand focus:ring-[3px] focus:ring-brand/12',
        disabled ? 'cursor-not-allowed bg-bg-parchment text-text-muted opacity-100' : 'cursor-pointer hover:bg-bg-base',
        selectedOption ? 'text-text-primary' : 'text-text-secondary'
      ]"
      @click.stop="toggleSelect"
      @keydown="handleKeydown"
    >
      <span class="truncate text-[17px] leading-[1.47] tracking-[-0.2px]">{{ selectedOption?.label || placeholder }}</span>
      <ChevronDown
        class="pointer-events-none h-4 w-4 shrink-0 text-text-secondary transition-transform duration-200"
        :class="isOpen ? 'rotate-180' : ''"
      />
    </button>

    <div
      v-if="isOpen && !disabled"
      :id="`${selectId}-listbox`"
      role="listbox"
      class="absolute left-0 right-0 top-full z-20 mt-2 max-h-60 overflow-y-auto rounded-xl border border-border bg-bg-surface p-1 shadow-[0_18px_50px_rgba(15,23,42,0.14)]"
    >
      <button
        v-for="opt in options"
        :key="opt.value"
        type="button"
        role="option"
        :aria-selected="String(opt.value) === selectedValue"
        :class="[
          'flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
          String(opt.value) === selectedValue ? 'bg-primary-50 font-medium text-brand' : 'text-text-primary hover:bg-bg-base'
        ]"
        @click.stop="chooseOption(opt.value)"
      >
        <span class="truncate">{{ opt.label }}</span>
        <Check
          v-if="String(opt.value) === selectedValue"
          class="h-4 w-4 shrink-0"
        />
      </button>
    </div>

    <span v-if="error" class="text-sm text-error">{{ error }}</span>
  </div>
</template>

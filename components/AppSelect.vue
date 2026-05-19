<script setup lang="ts">
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
  <div ref="selectRoot" class="relative flex flex-col gap-1.5 w-full" :class="{ 'z-50': isOpen }">
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
        'flex h-12 w-full items-center justify-between rounded-xl border bg-bg-surface px-4 text-left outline-none transition-colors',
        error 
          ? 'border-error focus:border-error focus:ring-1 focus:ring-error' 
          : 'border-border focus:border-brand focus:ring-1 focus:ring-brand',
        disabled ? 'cursor-not-allowed opacity-60 bg-bg-base' : 'cursor-pointer',
        selectedOption ? 'text-text-primary' : 'text-text-secondary'
      ]"
      @click.stop="toggleSelect"
    >
      <span class="truncate">{{ selectedOption?.label || placeholder }}</span>
      <span class="pointer-events-none text-text-secondary">⌄</span>
    </button>

    <div
      v-if="isOpen && !disabled"
      :id="`${selectId}-listbox`"
      role="listbox"
      class="absolute left-0 right-0 top-full z-20 mt-1 max-h-60 overflow-y-auto rounded-xl border border-border bg-bg-surface py-1 shadow-lg"
    >
      <button
        v-for="opt in options"
        :key="opt.value"
        type="button"
        role="option"
        :aria-selected="String(opt.value) === selectedValue"
        :class="[
          'w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-bg-base',
          String(opt.value) === selectedValue ? 'font-medium text-brand bg-bg-base' : 'text-text-primary'
        ]"
        @click.stop="chooseOption(opt.value)"
      >
        {{ opt.label }}
      </button>
    </div>

    <span v-if="error" class="text-sm text-error">{{ error }}</span>
  </div>
</template>

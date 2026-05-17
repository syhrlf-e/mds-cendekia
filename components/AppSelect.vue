<script setup lang="ts">
import { computed } from 'vue'

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

const selectId = computed(() => props.id || `select-${Math.random().toString(36).substring(2, 9)}`)
</script>

<template>
  <div class="flex flex-col gap-1.5 w-full">
    <label v-if="label" :for="selectId" class="text-sm font-medium text-text-primary">
      {{ label }} <span v-if="required" class="text-error">*</span>
    </label>
    <select
      :id="selectId"
      :value="modelValue"
      :disabled="disabled"
      :class="[
        'h-12 w-full rounded-xl border bg-bg-surface px-4 text-text-primary outline-none transition-colors appearance-none cursor-pointer',
        error 
          ? 'border-error focus:border-error focus:ring-1 focus:ring-error' 
          : 'border-border focus:border-brand focus:ring-1 focus:ring-brand',
        disabled ? 'cursor-not-allowed opacity-60 bg-bg-base' : '',
        !modelValue ? 'text-text-secondary' : ''
      ]"
      @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      @blur="emit('blur', $event)"
      @focus="emit('focus', $event)"
    >
      <option value="" disabled hidden>{{ placeholder }}</option>
      <option v-for="opt in options" :key="opt.value" :value="opt.value" class="text-text-primary">
        {{ opt.label }}
      </option>
    </select>
    <span v-if="error" class="text-sm text-error">{{ error }}</span>
  </div>
</template>

<style scoped>
select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9' /%3E%3C/svg%3E");
  background-position: right 1rem center;
  background-repeat: no-repeat;
  background-size: 1.2em 1.2em;
  padding-right: 2.5rem;
}
</style>
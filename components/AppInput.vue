<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  modelValue?: string | number
  label?: string
  id?: string
  type?: string
  placeholder?: string
  error?: string
  required?: boolean
  disabled?: boolean
}>(), {
  modelValue: '',
  type: 'text',
  disabled: false,
  required: false
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus'])

const inputId = computed(() => props.id || `input-${Math.random().toString(36).substring(2, 9)}`)
</script>

<template>
  <div class="flex flex-col gap-1.5 w-full">
    <label v-if="label" :for="inputId" class="text-sm font-medium text-text-primary">
      {{ label }} <span v-if="required" class="text-error">*</span>
    </label>
    <input
      :id="inputId"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="[
        'h-12 w-full rounded-xl border bg-bg-surface px-4 text-text-primary outline-none transition-colors placeholder:text-text-secondary',
        error 
          ? 'border-error focus:border-error focus:ring-1 focus:ring-error' 
          : 'border-border focus:border-brand focus:ring-1 focus:ring-brand',
        disabled ? 'cursor-not-allowed opacity-60 bg-bg-base' : ''
      ]"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @blur="emit('blur', $event)"
      @focus="emit('focus', $event)"
    />
    <span v-if="error" class="text-sm text-error">{{ error }}</span>
  </div>
</template>
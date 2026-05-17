<script setup lang="ts">
import { computed } from 'vue'

type InputMode = 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url'
type Sanitizer = (value: string) => string

const props = withDefaults(defineProps<{
  modelValue?: string | number
  label?: string
  id?: string
  type?: string
  inputmode?: InputMode
  maxlength?: number
  placeholder?: string
  error?: string
  required?: boolean
  disabled?: boolean
  prefix?: string
  sanitizer?: Sanitizer
}>(), {
  modelValue: '',
  type: 'text',
  disabled: false,
  required: false
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus'])

const inputId = computed(() => props.id || `input-${Math.random().toString(36).substring(2, 9)}`)

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const sanitizedValue = props.sanitizer ? props.sanitizer(target.value) : target.value

  if (target.value !== sanitizedValue) {
    target.value = sanitizedValue
  }

  emit('update:modelValue', sanitizedValue)
}
</script>

<template>
  <div class="flex flex-col gap-1.5 w-full">
    <label v-if="label" :for="inputId" class="text-sm font-medium text-text-primary">
      {{ label }}
      <span v-if="!required" class="font-normal text-text-secondary">(Opsional)</span>
    </label>
    <div class="relative flex items-center">
      <span v-if="prefix" class="absolute left-4 text-text-primary font-medium select-none pointer-events-none">
        {{ prefix }}
      </span>
      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :inputmode="inputmode"
        :maxlength="maxlength"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="[
          'h-12 w-full rounded-xl border bg-bg-surface text-text-primary outline-none transition-colors placeholder:text-text-secondary',
          prefix ? 'pl-11 pr-4' : 'px-4',
          error 
            ? 'border-error focus:border-error focus:ring-1 focus:ring-error' 
            : 'border-border focus:border-brand focus:ring-1 focus:ring-brand',
          disabled ? 'cursor-not-allowed opacity-60 bg-bg-base' : ''
        ]"
        @input="handleInput"
        @blur="emit('blur', $event)"
        @focus="emit('focus', $event)"
      />
    </div>
    <span v-if="error" class="text-sm text-error">{{ error }}</span>
  </div>
</template>

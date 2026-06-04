<script setup lang="ts">
import { computed, useId } from 'vue'

type Sanitizer = (value: string) => string

const props = withDefaults(defineProps<{
  modelValue?: string
  label?: string
  id?: string
  placeholder?: string
  maxlength?: number
  error?: string
  required?: boolean
  disabled?: boolean
  rows?: number
  sanitizer?: Sanitizer
}>(), {
  modelValue: '',
  disabled: false,
  required: false,
  rows: 4
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus'])

const fallbackId = useId()
const textareaId = computed(() => props.id || `textarea-${fallbackId}`)

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  const sanitizedValue = props.sanitizer ? props.sanitizer(target.value) : target.value

  if (target.value !== sanitizedValue) {
    target.value = sanitizedValue
  }

  emit('update:modelValue', sanitizedValue)
}
</script>

<template>
  <div class="flex flex-col gap-1.5 w-full">
    <label v-if="label" :for="textareaId" class="text-sm font-medium text-text-primary">
      {{ label }}
      <span v-if="!required" class="font-normal text-text-secondary">(Opsional)</span>
    </label>
    <textarea
      :id="textareaId"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :maxlength="maxlength"
      :rows="rows"
      :class="[
        'min-h-30 w-full resize-y rounded-lg border bg-bg-surface p-4 text-base leading-normal tracking-normal text-text-primary outline-none transition-colors placeholder:text-text-muted',
        error
          ? 'border-error focus:border-error focus:ring-3 focus:ring-error/10'
          : 'border-border focus:border-brand focus:ring-3 focus:ring-brand/12',
        disabled ? 'cursor-not-allowed bg-bg-parchment text-text-muted opacity-100' : ''
      ]"
      @input="handleInput"
      @blur="emit('blur', $event)"
      @focus="emit('focus', $event)"
    ></textarea>
    <span v-if="error" class="text-xs text-error">{{ error }}</span>
  </div>
</template>

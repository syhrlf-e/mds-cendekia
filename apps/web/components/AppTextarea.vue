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
const errorId = computed(() => `${textareaId.value}-error`)

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
  <div class="flex w-full flex-col gap-1.5">
    <label v-if="label" :for="textareaId" class="text-xs font-medium text-text-primary md:text-sm">
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
      :aria-required="required ? 'true' : undefined"
      :aria-invalid="error ? 'true' : 'false'"
      :aria-describedby="error ? errorId : undefined"
      :class="[
        'min-h-28 w-full resize-y rounded-lg border bg-bg-surface p-3.5 text-sm leading-normal tracking-normal text-text-primary outline-none transition-colors placeholder:text-text-muted md:min-h-30 md:p-4 md:text-base',
        error
          ? 'border-error focus:border-error focus:ring-3 focus:ring-error/10'
          : 'border-border focus:border-sky-500/70 focus:ring-2 focus:ring-sky-500/12',
        disabled ? 'cursor-not-allowed bg-bg-parchment text-text-muted opacity-100' : ''
      ]"
      @input="handleInput"
      @blur="emit('blur', $event)"
      @focus="emit('focus', $event)"
    ></textarea>
    <span
      v-if="error"
      :id="errorId"
      role="alert"
      aria-live="polite"
      class="text-xs text-error"
    >
      {{ error }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue'

type InputMode =
  | 'none'
  | 'text'
  | 'decimal'
  | 'numeric'
  | 'tel'
  | 'search'
  | 'email'
  | 'url'

type Sanitizer = (value: string) => string

const props = withDefaults(
  defineProps<{
    modelValue?: string | number
    label?: string
    id?: string
    name?: string
    type?: string
    inputmode?: InputMode
    maxlength?: number
    placeholder?: string
    error?: string
    required?: boolean
    disabled?: boolean
    prefix?: string
    sanitizer?: Sanitizer
  }>(),
  {
    modelValue: '',
    type: 'text',
    disabled: false,
    required: false
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'blur' | 'focus', event: FocusEvent): void
}>()

const fallbackId = useId()
const inputId = computed(() => {
  if (props.id) return props.id
  if (props.name) return `input-${props.name}`
  return `input-${fallbackId}`
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement

  const sanitizedValue = props.sanitizer
    ? props.sanitizer(target.value)
    : target.value

  if (target.value !== sanitizedValue) {
    target.value = sanitizedValue
  }

  emit('update:modelValue', sanitizedValue)
}
</script>

<template>
  <div class="flex w-full flex-col gap-1.5">
    <label
      v-if="label && inputId"
      :for="inputId"
      class="text-sm font-medium text-text-primary"
    >
      {{ label }}

      <span
        v-if="!required"
        class="font-normal text-text-secondary"
      >
        (Opsional)
      </span>
    </label>

    <div class="relative flex items-center">
      <span
        v-if="prefix"
        class="pointer-events-none absolute left-4 select-none font-medium text-text-primary"
      >
        {{ prefix }}
      </span>

      <input
        :id="inputId"
        :name="name"
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
          disabled
            ? 'cursor-not-allowed bg-bg-base opacity-60'
            : ''
        ]"
        @input="handleInput"
        @blur="emit('blur', $event)"
        @focus="emit('focus', $event)"
      />
    </div>

    <span
      v-if="error"
      class="text-sm text-error"
    >
      {{ error }}
    </span>
  </div>
</template>

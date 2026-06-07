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
    autocomplete?: string
    autocapitalize?: string
    spellcheck?: boolean
    inputmode?: InputMode
    maxlength?: number
    placeholder?: string
    error?: string
    invalid?: boolean
    required?: boolean
    disabled?: boolean
    prefix?: string
    sanitizer?: Sanitizer
  }>(),
  {
    modelValue: '',
    type: 'text',
    invalid: false,
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
const errorId = computed(() => `${inputId.value}-error`)
const isInvalid = computed(() => Boolean(props.error || props.invalid))

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

const focus = () => {
  document.getElementById(inputId.value)?.focus()
}

defineExpose({ focus })
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
        :autocomplete="autocomplete"
        :autocapitalize="autocapitalize"
        :spellcheck="spellcheck"
        :value="modelValue"
        :inputmode="inputmode"
        :maxlength="maxlength"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :aria-required="required || undefined"
        :aria-invalid="isInvalid || undefined"
        :aria-describedby="error ? errorId : undefined"
        :class="[
          'h-11 w-full rounded-lg border bg-bg-surface text-[17px] leading-[1.47] tracking-[-0.2px] text-text-primary outline-none transition-colors placeholder:text-text-muted',
          prefix ? 'pl-11 pr-4' : 'px-4',
          error || invalid
            ? 'border-error focus:border-error focus:ring-[3px] focus:ring-error/10'
            : 'border-border focus:border-sky-500/70 focus:ring-2 focus:ring-sky-500/12',
          disabled
            ? 'cursor-not-allowed bg-bg-parchment text-text-muted opacity-100'
            : ''
        ]"
        @input="handleInput"
        @blur="emit('blur', $event)"
        @focus="emit('focus', $event)"
      />
    </div>

    <span
      v-if="error"
      :id="errorId"
      role="alert"
      class="text-xs text-error"
    >
      {{ error }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  modelValue?: string
  label?: string
  id?: string
  placeholder?: string
  error?: string
  required?: boolean
  disabled?: boolean
  rows?: number
}>(), {
  modelValue: '',
  disabled: false,
  required: false,
  rows: 4
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus'])

const textareaId = computed(() => props.id || `textarea-${Math.random().toString(36).substring(2, 9)}`)
</script>

<template>
  <div class="flex flex-col gap-1.5 w-full">
    <label v-if="label" :for="textareaId" class="text-sm font-medium text-text-primary">
      {{ label }} <span v-if="required" class="text-error">*</span>
    </label>
    <textarea
      :id="textareaId"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :rows="rows"
      :class="[
        'w-full rounded-xl border bg-bg-surface p-4 text-text-primary outline-none transition-colors placeholder:text-text-secondary resize-y min-h-[100px]',
        error 
          ? 'border-error focus:border-error focus:ring-1 focus:ring-error' 
          : 'border-border focus:border-brand focus:ring-1 focus:ring-brand',
        disabled ? 'cursor-not-allowed opacity-60 bg-bg-base' : ''
      ]"
      @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
      @blur="emit('blur', $event)"
      @focus="emit('focus', $event)"
    ></textarea>
    <span v-if="error" class="text-sm text-error">{{ error }}</span>
  </div>
</template>
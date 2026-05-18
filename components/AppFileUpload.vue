<script setup lang="ts">
import { ref } from 'vue'
import { UploadCloud, File as FileIcon, X } from 'lucide-vue-next'

const props = defineProps<{
  label: string
  accept: string
  maxSize: number
  modelValue: File | null
}>()

const emit = defineEmits(['update:modelValue'])

const error = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

const handleFileChange = (event: Event) => {
  error.value = ''
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  const acceptedFormats = props.accept.split(',').map(ext => ext.trim().toLowerCase())
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
  if (!acceptedFormats.includes(fileExtension) && props.accept !== '*/*') {
    error.value = `Format file tidak didukung. Gunakan ${props.accept}`
    target.value = ''
    return
  }

  if (file.size > props.maxSize * 1024 * 1024) {
    error.value = `Ukuran file melebihi batas maksimum ${props.maxSize} MB`
    target.value = ''
    return
  }

  emit('update:modelValue', file)
}

const clearFile = () => {
  error.value = ''
  emit('update:modelValue', null)
  if (fileInput.value) fileInput.value.value = ''
}

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<template>
  <div class="flex flex-col gap-1.5 w-full">
    <label class="text-sm font-medium text-text-primary">{{ label }}</label>

    <div v-if="!modelValue" class="relative">
      <input
        ref="fileInput"
        type="file"
        :accept="accept"
        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        @change="handleFileChange"
      >
      <div :class="[
        'flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-colors bg-bg-surface',
        error ? 'border-error bg-error/5' : 'border-border hover:border-brand hover:bg-bg-base/50'
      ]">
        <UploadCloud :class="['w-8 h-8 mb-2', error ? 'text-error' : 'text-text-secondary']" />
        <p class="text-sm text-text-primary font-medium text-center">Klik atau seret file ke sini</p>
        <p class="text-xs text-text-secondary mt-1 text-center">Format: {{ accept }} (Maks. {{ maxSize }} MB)</p>
      </div>
    </div>

    <div v-else class="flex items-center justify-between p-4 border border-border rounded-xl bg-bg-base">
      <div class="flex items-center gap-3 overflow-hidden">
        <div class="p-2 bg-white rounded-lg shrink-0 text-brand shadow-sm">
          <FileIcon class="w-5 h-5" />
        </div>
        <div class="min-w-0">
          <p class="text-sm font-medium text-text-primary truncate">{{ modelValue.name }}</p>
          <p class="text-xs text-text-secondary">{{ formatSize(modelValue.size) }}</p>
        </div>
      </div>
      <button type="button" @click="clearFile" class="p-2 text-text-secondary hover:text-error hover:bg-white rounded-full transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-error">
        <X class="w-5 h-5" />
      </button>
    </div>

    <span v-if="error" class="text-sm text-error">{{ error }}</span>
  </div>
</template>

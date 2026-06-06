<script setup lang="ts">
import { ExternalLink, FileText, XCircle } from 'lucide-vue-next'
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import type { RegistrationFile } from '~/types/adminPendaftaran'

const props = defineProps<{
  modelValue: boolean
  file: RegistrationFile | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const pdfPagesRef = ref<HTMLElement | null>(null)
const isPdfRendering = ref(false)
const pdfRenderError = ref('')
const pdfPageCount = ref(0)

const previewFileType = computed(() => {
  const url = props.file?.url.toLowerCase() || ''
  const name = props.file?.name.toLowerCase() || ''
  const source = `${url} ${name}`

  if (/\.(png|jpe?g|webp|gif|bmp)(\?|#|$)/i.test(source)) return 'image'
  return 'pdf'
})

const clearPdfPreview = () => {
  pdfRenderError.value = ''
  pdfPageCount.value = 0
  if (pdfPagesRef.value) pdfPagesRef.value.innerHTML = ''
}

const closePreview = () => {
  clearPdfPreview()
  emit('update:modelValue', false)
}

const openPreviewInNewTab = () => {
  if (!import.meta.client || !props.file?.url) return
  window.open(props.file.url, '_blank', 'noopener,noreferrer')
}

const renderPdfPreview = async () => {
  if (!import.meta.client || !props.file?.url || previewFileType.value !== 'pdf') return

  await nextTick()
  const container = pdfPagesRef.value
  if (!container) return

  isPdfRendering.value = true
  clearPdfPreview()

  try {
    const pdfjs = await import('pdfjs-dist')
    pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).toString()

    const loadingTask = pdfjs.getDocument(props.file.url)
    const pdf = await loadingTask.promise
    pdfPageCount.value = pdf.numPages

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber)
      const baseViewport = page.getViewport({ scale: 1 })
      const containerWidth = Math.min(720, Math.max(320, container.clientWidth || 720))
      const scale = containerWidth / baseViewport.width
      const viewport = page.getViewport({ scale })
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')

      if (!context) throw new Error('Canvas context is not available')

      canvas.width = Math.floor(viewport.width)
      canvas.height = Math.floor(viewport.height)
      canvas.style.width = `${Math.floor(viewport.width)}px`
      canvas.style.height = `${Math.floor(viewport.height)}px`
      canvas.className = 'bg-white shadow-[0_10px_30px_rgba(15,23,42,0.16)]'

      container.appendChild(canvas)

      await page.render({
        canvas,
        canvasContext: context,
        viewport
      }).promise
    }
  } catch (error) {
    console.error('Failed to render PDF preview:', error)
    pdfRenderError.value = 'PDF belum bisa ditampilkan di preview internal.'
  } finally {
    isPdfRendering.value = false
  }
}

watch(
  () => [props.modelValue, props.file?.url],
  () => {
    clearPdfPreview()
    if (props.modelValue && props.file && previewFileType.value === 'pdf') void renderPdfPreview()
  },
  { flush: 'post' }
)

onBeforeUnmount(clearPdfPreview)
</script>

<template>
  <Transition
    enter-active-class="transition-transform duration-300 ease-out"
    enter-from-class="translate-x-full"
    enter-to-class="translate-x-0"
    leave-active-class="transition-transform duration-250 ease-in"
    leave-from-class="translate-x-0"
    leave-to-class="translate-x-full"
  >
    <aside
      v-if="modelValue && file"
      class="absolute inset-y-0 right-[var(--detail-drawer-width)] z-[30] flex w-[min(760px,calc(100%-var(--detail-drawer-width)))] flex-col border-r border-border bg-bg-surface shadow-[rgba(0,0,0,0.18)_-16px_0_40px_0]"
    >
      <header class="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border bg-bg-surface px-5">
        <div class="min-w-0">
          <p class="truncate text-sm font-semibold text-text-primary">{{ file.name }}</p>
          <p class="text-xs text-text-secondary">
            {{ previewFileType === 'pdf' && pdfPageCount ? `${pdfPageCount} halaman` : 'Preview dokumen pendaftaran' }}
          </p>
        </div>
        <div class="flex shrink-0 items-center gap-2">
          <button
            type="button"
            class="inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-bg-base hover:text-text-primary"
            aria-label="Buka di tab baru"
            @click="openPreviewInNewTab"
          >
            <ExternalLink class="h-4 w-4" />
          </button>
          <button
            type="button"
            class="inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-bg-base hover:text-text-primary"
            aria-label="Tutup preview"
            @click="closePreview"
          >
            <XCircle class="h-4 w-4" />
          </button>
        </div>
      </header>

      <div class="min-h-0 flex-1 overflow-auto bg-bg-parchment p-5">
        <div class="flex min-h-full items-start justify-center">
          <img
            v-if="previewFileType === 'image'"
            :src="file.url"
            :alt="file.name"
            class="max-h-full max-w-full object-contain"
          >
          <div v-else-if="previewFileType === 'pdf'" class="flex min-h-full w-full items-start justify-center">
            <div v-if="isPdfRendering" class="mt-24 flex flex-col items-center gap-3 text-text-secondary">
              <div class="dot-wave">
                <span class="bg-brand"></span>
                <span class="bg-brand"></span>
                <span class="bg-brand"></span>
              </div>
              <p class="text-sm font-medium">Memuat preview PDF...</p>
            </div>
            <div v-else-if="pdfRenderError" class="mt-24 flex max-w-md flex-col items-center px-6 text-center">
              <FileText class="mb-4 h-10 w-10 text-brand" />
              <p class="text-sm font-medium text-text-primary">{{ pdfRenderError }}</p>
              <p class="mt-1 text-sm leading-[1.43] text-text-secondary">
                Gunakan tombol buka di tab baru jika dokumen berasal dari server yang membatasi preview.
              </p>
            </div>
            <div
              v-show="!isPdfRendering && !pdfRenderError"
              ref="pdfPagesRef"
              class="flex w-full flex-col items-center gap-5"
            />
          </div>
        </div>
      </div>
    </aside>
  </Transition>
</template>

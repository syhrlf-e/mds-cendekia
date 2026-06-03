<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  currentPage: number
  lastPage: number
  total: number
  disabled?: boolean
}>(), {
  disabled: false
})

const emit = defineEmits<{
  pageChange: [page: number]
}>()

const safeLastPage = computed(() => Math.max(1, props.lastPage))

const pageNumbers = computed(() => {
  const pages: number[] = []
  for (let page = props.currentPage - 1; page <= props.currentPage + 1; page += 1) {
    if (page >= 1 && page <= safeLastPage.value) pages.push(page)
  }
  return pages.length ? pages : [1]
})

const goToPage = (page: number) => {
  if (props.disabled || page === props.currentPage || page < 1 || page > safeLastPage.value) return
  emit('pageChange', page)
}
</script>

<template>
  <div class="flex shrink-0 flex-col items-center justify-between gap-3 rounded-2xl border border-border bg-bg-surface px-6 py-4 shadow-sm sm:flex-row">
    <span class="text-sm font-medium text-text-secondary">
      <span class="font-bold text-text-primary">{{ total }}</span>
      data · Halaman
      <span class="font-bold text-text-primary">{{ currentPage }}</span>
      dari
      <span class="font-bold text-text-primary">{{ safeLastPage }}</span>
    </span>

    <div class="flex items-center gap-1.5">
      <button
        type="button"
        :disabled="disabled || currentPage <= 1"
        class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border-soft bg-bg-surface text-text-secondary transition-colors hover:bg-bg-base hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Halaman sebelumnya"
        @click="goToPage(currentPage - 1)"
      >
        <ChevronLeft class="h-4 w-4" />
      </button>

      <button
        v-for="page in pageNumbers"
        :key="page"
        type="button"
        :disabled="disabled"
        class="inline-flex h-8 w-8 items-center justify-center rounded-lg border text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40"
        :class="page === currentPage ? 'border-brand bg-brand text-white shadow-md shadow-brand/20' : 'border-border-soft bg-bg-surface text-text-secondary hover:bg-bg-base hover:text-text-primary'"
        @click="goToPage(page)"
      >
        {{ page }}
      </button>

      <button
        type="button"
        :disabled="disabled || currentPage >= safeLastPage"
        class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border-soft bg-bg-surface text-text-secondary transition-colors hover:bg-bg-base hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Halaman berikutnya"
        @click="goToPage(currentPage + 1)"
      >
        <ChevronRight class="h-4 w-4" />
      </button>
    </div>
  </div>
</template>

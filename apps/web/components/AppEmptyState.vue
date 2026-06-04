<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  description?: string
}>(), {
  title: 'Belum ada data di sini',
  description: ''
})
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
    <div class="text-primary-300 [&>svg]:h-12 [&>svg]:w-12">
      <slot name="icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-inbox"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
      </slot>
    </div>

    <h3 class="text-base font-semibold leading-tight tracking-normal text-text-primary">
      {{ title }}
    </h3>

    <p v-if="description" class="max-w-70 text-sm leading-snug tracking-normal text-text-secondary">
      {{ description }}
    </p>

    <div v-if="$slots.action" class="mt-6">
      <slot name="action"></slot>
    </div>
  </div>
</template>

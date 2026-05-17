<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'

defineProps<{
  title: string
  description: string
}>()

defineEmits(['click'])
</script>

<template>
  <button
    type="button"
    class="w-full group flex items-start text-left bg-bg-surface border border-border p-5 rounded-2xl transition-all duration-300 hover:border-brand hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
    @click="$emit('click', $event)"
  >
    <div class="flex-grow pr-4">
      <h3 class="text-lg font-heading font-semibold text-text-primary mb-1 group-hover:text-brand transition-colors">
        {{ title }}
      </h3>
      <p class="text-sm text-text-secondary leading-relaxed">
        {{ description }}
      </p>
    </div>
    
    <div class="shrink-0 mt-1">
      <div class="w-8 h-8 rounded-full bg-bg-base flex items-center justify-center text-text-secondary group-hover:bg-primary-50 group-hover:text-brand transition-colors">
        <ChevronRight class="w-5 h-5" />
      </div>
    </div>
  </button>
</template>
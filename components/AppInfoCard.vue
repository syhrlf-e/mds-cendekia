<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'
import type { Component } from 'vue'

defineProps<{
  title: string
  description: string
  icon?: Component
}>()

defineEmits(['click'])
</script>

<template>
  <button
    type="button"
    class="w-full group flex flex-col items-start text-left bg-bg-surface border border-border p-5 md:p-6 rounded-2xl transition-all duration-300 hover:border-brand hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 relative overflow-hidden"
    @click="$emit('click', $event)"
  >
    <!-- Background Decor -->
    <div class="absolute -right-6 -top-6 w-24 h-24 bg-primary-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

    <div class="flex items-center justify-between w-full mb-4 z-10">
      <div 
        class="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-brand group-hover:scale-110 transition-transform duration-300"
      >
        <component :is="icon" v-if="icon" class="w-6 h-6" />
        <div v-else class="w-6 h-6 bg-brand/20 rounded-full"></div>
      </div>
      <div class="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary group-hover:text-brand group-hover:translate-x-1 transition-all duration-300">
        <ChevronRight class="w-5 h-5" />
      </div>
    </div>

    <div class="z-10">
      <h3 class="text-lg font-heading font-semibold text-text-primary mb-1.5 group-hover:text-brand transition-colors">
        {{ title }}
      </h3>
      <p class="text-sm text-text-secondary leading-relaxed">
        {{ description }}
      </p>
    </div>
  </button>
</template>
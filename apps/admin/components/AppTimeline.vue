<script setup lang="ts">
import { ClipboardEdit, FileCheck, Megaphone } from 'lucide-vue-next'

const steps = [
  {
    id: 1,
    title: 'Pendaftaran',
    icon: ClipboardEdit,
    active: true
  },
  {
    id: 2,
    title: 'Seleksi Berkas',
    icon: FileCheck,
    active: false
  },
  {
    id: 3,
    title: 'Pengumuman',
    icon: Megaphone,
    active: false
  }
]
</script>

<template>
  <div class="w-full py-6">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-4 relative">
      <div class="hidden md:block absolute top-6 left-12 right-12 h-0.5 bg-border z-0"></div>
      <div class="md:hidden absolute top-6 bottom-6 left-6 w-0.5 bg-border z-0"></div>

      <div
        v-for="(step, index) in steps"
        :key="step.id"
        class="flex md:flex-col items-center gap-4 md:gap-3 z-10 w-full md:w-1/3"
      >
        <div
          :class="[
            'w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors',
            step.active
              ? 'bg-brand border-brand text-white'
              : 'bg-bg-surface border-border text-text-secondary'
          ]"
        >
          <component :is="step.icon" class="w-5 h-5" />
        </div>

        <div class="flex flex-col md:text-center md:items-center">
          <span class="text-xs font-semibold text-text-secondary mb-0.5 uppercase tracking-wider">
            Tahap {{ index + 1 }}
          </span>
          <span
            :class="[
              'font-heading font-semibold text-sm md:text-base',
              step.active ? 'text-brand' : 'text-text-primary'
            ]"
          >
            {{ step.title }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

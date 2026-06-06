<script setup lang="ts">
import { UserRound } from 'lucide-vue-next'

type InfoField = Array<string | null | undefined>

type InfoSection = {
  title: string
  fields: InfoField[]
}

defineProps<{
  sections: InfoSection[]
}>()
</script>

<template>
  <div v-if="sections.length" class="grid grid-cols-2 items-start gap-4">
    <section
      v-for="section in sections"
      :key="section.title"
      class="overflow-hidden rounded-2xl border border-border bg-bg-surface"
    >
      <div class="border-b border-border bg-bg-base px-6 py-3">
        <h3 class="text-[11px] font-bold uppercase tracking-widest text-text-muted">
          {{ section.title }}
        </h3>
      </div>
      <div class="grid grid-cols-2 gap-x-8 gap-y-5 p-6">
        <div
          v-for="(field, index) in section.fields"
          :key="field[0] || index"
        >
          <p class="mb-1 text-[11px] font-semibold uppercase tracking-wider text-text-muted">{{ field[0] }}</p>
          <p class="text-[15px] font-medium leading-[1.47] tracking-[-0.15px] text-text-primary">{{ field[1] || '-' }}</p>
        </div>
      </div>
    </section>
  </div>

  <div v-else class="flex min-h-[360px] items-center justify-center rounded-2xl border border-dashed border-border bg-bg-surface">
    <AppEmptyState
      title="Data orang tua belum tersedia"
      description="Data orang tua belum dikirim oleh endpoint admin."
    >
      <template #icon>
        <UserRound />
      </template>
    </AppEmptyState>
  </div>
</template>

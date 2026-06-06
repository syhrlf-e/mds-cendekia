<script setup lang="ts">
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
  <div class="grid grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] items-start gap-4">
    <section
      v-for="section in sections"
      :key="section.title"
      class="overflow-hidden rounded-2xl border border-border bg-bg-surface"
      :class="section.title === 'Identitas Calon Siswa' ? 'row-span-2' : ''"
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
          :class="field[2] === 'full' ? 'col-span-2' : ''"
        >
          <p class="mb-1 text-[11px] font-semibold uppercase tracking-wider text-text-muted">{{ field[0] }}</p>
          <p class="text-[15px] font-medium leading-[1.47] tracking-[-0.15px] text-text-primary">{{ field[1] || '-' }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

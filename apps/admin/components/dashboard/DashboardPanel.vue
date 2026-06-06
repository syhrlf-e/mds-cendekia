<script setup lang="ts">
defineProps<{
  title: string
  titleClass?: string
}>()
</script>

<template>
  <article class="rounded-[27px] bg-white p-4">
    <div
      class="font-heading text-base font-semibold leading-none text-dashboard-text"
      :class="titleClass"
    >
      {{ title }}
    </div>
    <div class="mt-4 h-px w-full bg-border-soft" />

    <slot />
  </article>
</template>

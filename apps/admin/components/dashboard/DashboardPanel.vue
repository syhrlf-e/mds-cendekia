<script setup lang="ts">
defineProps<{
  title: string
  titleClass?: string
}>()
</script>

<template>
  <article class="admin-dashboard-panel rounded-[27px] bg-white p-4">
    <div
      class="font-heading text-base font-semibold leading-none text-dashboard-text"
      :class="titleClass"
    >
      {{ title }}
    </div>
    <div class="admin-dashboard-panel-divider mt-4 h-px w-full bg-border-soft" />

    <slot />
  </article>
</template>

<style scoped>
@media (max-height: 820px) {
  .admin-dashboard-panel {
    padding: 14px;
  }

  .admin-dashboard-panel-divider {
    margin-top: 12px;
  }
}
</style>

<script setup lang="ts">
import type { DashboardApplicantMetric, DashboardSecondaryMetric } from '~/composables/useDashboardViewModel'

defineProps<{
  applicantMetrics: DashboardApplicantMetric[]
  secondaryMetrics: DashboardSecondaryMetric[]
  isLoading: boolean
}>()
</script>

<template>
  <section class="grid shrink-0 grid-cols-[minmax(0,3fr)_repeat(3,minmax(0,1fr))] gap-2.5">
    <article class="flex h-44 flex-col justify-between rounded-[27px] bg-white px-5 py-7">
      <p class="font-heading text-base font-medium leading-none text-dashboard-text/70">
        Data Calon Siswa
      </p>

      <div class="grid grid-cols-3 divide-x divide-border-soft">
        <div
          v-for="item in applicantMetrics"
          :key="item.label"
          class="px-8 first:pl-0 last:pr-0"
        >
          <p class="font-body text-[40px] font-medium leading-none tracking-0 text-dashboard-text">
            {{ isLoading ? '...' : item.value }}
          </p>
          <p class="mt-3 whitespace-nowrap font-heading text-base font-medium leading-none text-dashboard-text">
            {{ item.label }}
          </p>
        </div>
      </div>
    </article>

    <article
      v-for="item in secondaryMetrics"
      :key="item.label"
      class="flex h-44 flex-col justify-between rounded-[27px] bg-white px-4 py-7"
    >
      <p class="font-heading text-base font-medium leading-none text-dashboard-text/70">
        {{ item.title }}
      </p>
      <div>
        <p class="font-body text-[40px] font-medium leading-none tracking-0 text-dashboard-text">
          {{ isLoading ? '...' : item.value }}
        </p>
        <p class="mt-3 whitespace-nowrap font-heading text-base font-medium leading-none text-dashboard-text">
          {{ item.label }}
        </p>
      </div>
    </article>
  </section>
</template>

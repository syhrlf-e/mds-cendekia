<script setup lang="ts">
import type { DashboardApplicantMetric, DashboardSecondaryMetric } from '~/composables/useDashboardViewModel'

defineProps<{
  applicantMetrics: DashboardApplicantMetric[]
  secondaryMetrics: DashboardSecondaryMetric[]
  isLoading: boolean
}>()
</script>

<template>
  <section class="admin-dashboard-stats grid shrink-0 grid-cols-[minmax(0,3fr)_repeat(3,minmax(0,1fr))] gap-2.5">
    <article class="admin-dashboard-stat-card admin-dashboard-applicant-card flex h-36 flex-col justify-between rounded-[24px] bg-white px-5 py-5">
      <p class="admin-dashboard-stat-title font-heading text-base font-medium leading-none text-dashboard-text/70">
        Data Calon Siswa
      </p>

      <div class="admin-dashboard-applicant-grid grid grid-cols-3 divide-x divide-border-soft">
        <div
          v-for="item in applicantMetrics"
          :key="item.label"
          class="admin-dashboard-applicant-metric min-w-0 px-7 first:pl-0 last:pr-0"
        >
          <p class="admin-dashboard-stat-value font-body text-[34px] font-medium leading-none tracking-0 text-dashboard-text">
            {{ isLoading ? '...' : item.value }}
          </p>
          <p class="admin-dashboard-stat-label mt-2 truncate font-heading text-sm font-medium leading-none text-dashboard-text">
            {{ item.label }}
          </p>
        </div>
      </div>
    </article>

    <article
      v-for="item in secondaryMetrics"
      :key="item.label"
      class="admin-dashboard-stat-card flex h-36 flex-col justify-between rounded-[24px] bg-white px-4 py-5"
    >
      <p class="admin-dashboard-stat-title font-heading text-base font-medium leading-none text-dashboard-text/70">
        {{ item.title }}
      </p>
      <div>
        <p class="admin-dashboard-stat-value font-body text-[34px] font-medium leading-none tracking-0 text-dashboard-text">
          {{ isLoading ? '...' : item.value }}
        </p>
        <p class="admin-dashboard-stat-label mt-2 truncate font-heading text-sm font-medium leading-none text-dashboard-text">
          {{ item.label }}
        </p>
      </div>
    </article>
  </section>
</template>

<style scoped>
@media (max-width: 1439px) {
  .admin-dashboard-stats {
    grid-template-columns: minmax(0, 2.35fr) repeat(3, minmax(124px, 1fr));
    gap: 8px;
  }

  .admin-dashboard-stat-card {
    height: 128px;
    border-radius: 20px;
    padding: 18px;
  }

  .admin-dashboard-applicant-metric {
    padding-left: 14px;
    padding-right: 14px;
  }

  .admin-dashboard-stat-value {
    font-size: 30px;
  }

  .admin-dashboard-stat-title {
    font-size: 14px;
  }

  .admin-dashboard-stat-label {
    font-size: 12px;
  }
}

@media (max-height: 820px) {
  .admin-dashboard-stat-card {
    height: 112px;
    border-radius: 18px;
    padding: 14px 16px;
  }

  .admin-dashboard-applicant-card {
    padding-left: 18px;
    padding-right: 18px;
  }

  .admin-dashboard-applicant-metric {
    padding-left: 12px;
    padding-right: 12px;
  }

  .admin-dashboard-stat-title {
    font-size: 13px;
  }

  .admin-dashboard-stat-label {
    margin-top: 7px;
    font-size: 11px;
  }

  .admin-dashboard-stat-value {
    font-size: 26px;
  }
}

@media (max-width: 1279px) {
  .admin-dashboard-stats {
    grid-template-columns: minmax(0, 2.15fr) repeat(3, minmax(112px, 1fr));
  }

  .admin-dashboard-stat-card {
    padding-top: 16px;
    padding-bottom: 16px;
  }

  .admin-dashboard-applicant-metric {
    padding-left: 10px;
    padding-right: 10px;
  }

  .admin-dashboard-stat-value {
    font-size: 25px;
  }
}
</style>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

definePageMeta({
  layout: 'admin',
  middleware: ['admin-auth']
})

useHead({ title: 'Dashboard | MDS Cendekia' })

const {
  dashboardSummary: summaryData,
  dashboardSummaryLoading: isLoading,
  dashboardSummaryError,
  loadDashboardSummary
} = useAdminDataCache()

const errorMessage = ref('')

const {
  latestNews,
  latestApplicants,
  activePrograms,
  runningWaves,
  applicantMetrics,
  secondaryMetrics,
  quotaItems,
  formatRelativeDate,
  resolveAssetUrl,
  applicantStatusLabel,
  applicantStatusClass
} = useDashboardViewModel(summaryData)

const fetchDashboard = async () => {
  errorMessage.value = ''

  await loadDashboardSummary()

  errorMessage.value = dashboardSummaryError.value
}

onMounted(fetchDashboard)

watch(dashboardSummaryError, (message) => {
  errorMessage.value = message
})
</script>

<template>
  <div class="admin-dashboard flex h-full min-h-0 flex-col gap-2.5 overflow-hidden">
    <div
      v-if="errorMessage"
      class="rounded-[20px] border border-status-pending-text/20 bg-status-pending-bg px-5 py-4 text-sm font-medium text-status-pending-text"
    >
      {{ errorMessage }}
    </div>

    <DashboardStatsSection
      :applicant-metrics="applicantMetrics"
      :secondary-metrics="secondaryMetrics"
      :is-loading="isLoading"
    />

    <section class="admin-dashboard-summary grid shrink-0 grid-cols-[minmax(220px,0.8fr)_minmax(280px,1.4fr)_minmax(220px,0.8fr)_minmax(220px,0.8fr)] gap-2.5 2xl:grid-cols-[301px_minmax(0,1fr)_301px_301px]">
      <DashboardQuotaCard :items="quotaItems" />
      <DashboardWavesCard
        :waves="runningWaves"
      />
      <DashboardProgramsCard :programs="activePrograms" />
      <DashboardLatestNewsCard
        :items="latestNews"
        :format-relative-date="formatRelativeDate"
        :resolve-asset-url="resolveAssetUrl"
      />
    </section>

    <section class="admin-dashboard-main grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_minmax(240px,301px)] gap-2.5 overflow-hidden">
      <DashboardLatestApplicantsCard
        :applicants="latestApplicants"
        :applicant-status-label="applicantStatusLabel"
        :applicant-status-class="applicantStatusClass"
      />
      <DashboardActivityCard />
    </section>
  </div>
</template>

<style scoped>
@media (max-width: 1439px) {
  .admin-dashboard-summary {
    grid-template-columns: minmax(210px, 0.85fr) minmax(250px, 1.25fr) minmax(210px, 0.85fr) minmax(210px, 0.85fr);
  }

  .admin-dashboard-main {
    grid-template-columns: minmax(0, 1fr) minmax(220px, 260px);
  }
}

@media (max-height: 820px) {
  .admin-dashboard {
    gap: 8px;
  }

  .admin-dashboard-summary,
  .admin-dashboard-main {
    gap: 8px;
  }
}
</style>

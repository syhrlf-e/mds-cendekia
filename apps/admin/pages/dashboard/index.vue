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
  <div class="flex h-full min-h-0 flex-col gap-4">
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

    <section class="grid shrink-0 grid-cols-[301px_minmax(0,1fr)_301px_301px] gap-2.5">
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

    <section class="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_301px] gap-2.5">
      <DashboardLatestApplicantsCard
        :applicants="latestApplicants"
        :applicant-status-label="applicantStatusLabel"
        :applicant-status-class="applicantStatusClass"
      />
      <DashboardActivityCard />
    </section>
  </div>
</template>

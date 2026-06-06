<script setup lang="ts">
import { onMounted } from 'vue'

definePageMeta({
  layout: 'admin',
  middleware: ['admin-auth']
})

useHead({ title: 'Pendaftaran | MDS Cendekia' })

const {
  pendaftar: registrations,
  pendaftarLoading: isLoading,
  pendaftarError: loadError,
  loadPendaftar: loadCachedPendaftar,
  refreshPendaftar
} = useAdminDataCache()

const {
  searchQuery,
  filterStatus,
  sortKey,
  sortOrder,
  currentPage,
  perPage,
  statusFilterOptions,
  perPageOptions,
  filteredAndSortedData,
  totalPages,
  paginationStart,
  paginatedData,
  handleSearch,
  handleSort,
  formatDate
} = usePendaftaranList(registrations)

const {
  isFilePreviewOpen,
  previewFile,
  viewedFileIds,
  closeFilePreview,
  handleFilePreviewVisibilityChange,
  openFile
} = usePendaftaranFilePreview()

const {
  activeTab,
  selectedItem,
  isDetailModalOpen,
  isBerkasActionMenuOpen,
  detailTabs,
  isBerkasVerified,
  isBerkasRejected,
  isBerkasFinal,
  selectedBerkasFiles,
  fieldSections,
  parentSections,
  getBerkasStatusClass,
  getOutlineStatusClass,
  openDetail,
  focusBerkasTab,
  closeDetail
} = usePendaftaranDetail(isFilePreviewOpen, closeFilePreview)

const loadPendaftar = (force = false) => force ? refreshPendaftar() : loadCachedPendaftar()

const {
  isApproveModalOpen,
  isRejectModalOpen,
  isRejectGuardOpen,
  isRejectBerkasModalOpen,
  berkasDecisionMode,
  rejectReason,
  rejectBerkasReason,
  isProcessingApprove,
  isProcessingReject,
  isProcessingVerifyBerkas,
  rejectionReasons,
  berkasRejectionReasons,
  berkasDecisionCopy,
  openBerkasDecisionModal,
  promptReject,
  attemptCancelReject,
  confirmCancelReject,
  handleApprove,
  handleReject,
  handleVerifyBerkas
} = usePendaftaranActions({
  selectedItem,
  isDetailModalOpen,
  isBerkasActionMenuOpen,
  closeFilePreview,
  loadPendaftar
})

onMounted(loadPendaftar)
</script>

<template>
  <PendaftaranListPanel
    v-model:search-query="searchQuery"
    v-model:filter-status="filterStatus"
    v-model:per-page="perPage"
    v-model:current-page="currentPage"
    :status-filter-options="statusFilterOptions"
    :per-page-options="perPageOptions"
    :items="paginatedData"
    :is-loading="isLoading"
    :load-error="loadError"
    :filtered-count="filteredAndSortedData.length"
    :pagination-start="paginationStart"
    :sort-key="sortKey"
    :sort-order="sortOrder"
    :format-date="formatDate"
    :total-pages="totalPages"
    @search="handleSearch"
    @retry="loadPendaftar()"
    @sort="handleSort"
    @open-detail="openDetail"
  />

  <PendaftaranDetailDrawer
    :model-value="isDetailModalOpen"
    :item="selectedItem"
    :active-tab="activeTab"
    :detail-tabs="detailTabs"
    :get-outline-status-class="getOutlineStatusClass"
    @close="closeDetail"
    @update:active-tab="activeTab = $event"
  >
    <template v-if="selectedItem">
      <PendaftaranDetailTabs
        :active-tab="activeTab"
        :item="selectedItem"
        :field-sections="fieldSections"
        :parent-sections="parentSections"
        :selected-berkas-files="selectedBerkasFiles"
        :viewed-file-ids="viewedFileIds"
        :is-berkas-verified="isBerkasVerified"
        :is-processing-verify-berkas="isProcessingVerifyBerkas"
        :is-berkas-action-menu-open="isBerkasActionMenuOpen"
        :get-berkas-status-class="getBerkasStatusClass"
        @update:is-berkas-action-menu-open="isBerkasActionMenuOpen = $event"
        @request-revision="openBerkasDecisionModal('revision')"
        @verify-valid="handleVerifyBerkas('valid')"
        @request-reject="openBerkasDecisionModal('reject')"
        @open-file="openFile"
      />
    </template>

    <template v-if="selectedItem" #footer>
      <PendaftaranDetailFooter
        :status="selectedItem.status"
        :is-berkas-verified="isBerkasVerified"
        :is-berkas-rejected="isBerkasRejected"
        :is-berkas-final="isBerkasFinal"
        @close="closeDetail"
        @reject="promptReject"
        @approve="isApproveModalOpen = true"
        @review-berkas="focusBerkasTab"
      />
    </template>

    <template #overlay>
      <PendaftaranFilePreview
        :model-value="isFilePreviewOpen"
        :file="previewFile"
        @update:model-value="handleFilePreviewVisibilityChange"
      />
    </template>
  </PendaftaranDetailDrawer>

  <PendaftaranDecisionModals
    :approve-open="isApproveModalOpen"
    :reject-open="isRejectModalOpen"
    :reject-guard-open="isRejectGuardOpen"
    :reject-berkas-open="isRejectBerkasModalOpen"
    :reject-reason="rejectReason"
    :reject-berkas-reason="rejectBerkasReason"
    :rejection-reasons="rejectionReasons"
    :berkas-rejection-reasons="berkasRejectionReasons"
    :berkas-decision-copy="berkasDecisionCopy"
    :berkas-decision-mode="berkasDecisionMode"
    :is-processing-approve="isProcessingApprove"
    :is-processing-reject="isProcessingReject"
    :is-processing-verify-berkas="isProcessingVerifyBerkas"
    @update:approve-open="isApproveModalOpen = $event"
    @update:reject-open="attemptCancelReject"
    @update:reject-guard-open="isRejectGuardOpen = $event"
    @update:reject-berkas-open="isRejectBerkasModalOpen = $event"
    @update:reject-reason="rejectReason = $event"
    @update:reject-berkas-reason="rejectBerkasReason = $event"
    @approve="handleApprove"
    @reject="handleReject"
    @confirm-cancel-reject="confirmCancelReject"
    @verify-berkas="handleVerifyBerkas"
  />
</template>

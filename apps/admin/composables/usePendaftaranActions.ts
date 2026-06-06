import { computed, ref } from 'vue'
import type { Ref } from 'vue'
import { normalizeActionId } from '~/mappers/adminPendaftarMapper'
import { useAdminPendaftaranService } from '~/services/useAdminPendaftaranService'
import type { Registration } from '~/types/adminPendaftaran'

type BerkasDecisionMode = 'reject' | 'revision'
type BerkasDecision = BerkasDecisionMode | 'valid'

type UsePendaftaranActionsOptions = {
  selectedItem: Ref<Registration | null>
  isDetailModalOpen: Ref<boolean>
  isBerkasActionMenuOpen: Ref<boolean>
  closeFilePreview: () => void
  loadPendaftar: (force?: boolean) => Promise<unknown> | unknown
}

export const usePendaftaranActions = ({
  selectedItem,
  isDetailModalOpen,
  isBerkasActionMenuOpen,
  closeFilePreview,
  loadPendaftar
}: UsePendaftaranActionsOptions) => {
  const {
    updatePendaftarStatus,
    verifyBerkas
  } = useAdminPendaftaranService()

  const isApproveModalOpen = ref(false)
  const isRejectModalOpen = ref(false)
  const isRejectGuardOpen = ref(false)
  const isRejectBerkasModalOpen = ref(false)
  const berkasDecisionMode = ref<BerkasDecisionMode>('revision')
  const rejectReason = ref('')
  const rejectBerkasReason = ref('')
  const isProcessingApprove = ref(false)
  const isProcessingReject = ref(false)
  const isProcessingVerifyBerkas = ref(false)

  const rejectionReasons = [
    'Anda tidak memenuhi kriteria pendaftaran',
    'Kuota pendaftaran sudah terpenuhi',
    'Tidak lolos seleksi administrasi',
    'Program atau paket yang dipilih tidak tersedia',
    'Keputusan panitia penerimaan peserta didik baru'
  ]

  const berkasRejectionReasons = [
    'Berkas tidak valid',
    'Berkas pendaftaran belum lengkap',
    'Berkas tidak terbaca dengan jelas',
    'Data pada berkas tidak sesuai',
    'Format berkas tidak sesuai ketentuan'
  ]

  const berkasDecisionCopy = computed(() => {
    if (berkasDecisionMode.value === 'reject') {
      return {
        title: 'Alasan Penolakan Berkas',
        description: 'Pilih alasan berkas ditolak. Catatan ini akan dikirim ke sistem sebagai dasar penolakan.',
        emptyMessage: 'Pilih alasan penolakan berkas terlebih dahulu.',
        successStatus: 'Ditolak',
        successToast: 'Berkas pendaftar berhasil ditolak'
      }
    }

    return {
      title: 'Alasan Perbaikan Berkas',
      description: 'Pilih alasan perbaikan berkas yang akan dikirim sebagai catatan ke sistem.',
      emptyMessage: 'Pilih alasan perbaikan berkas terlebih dahulu.',
      successStatus: 'Perlu perbaikan',
      successToast: 'Permintaan perbaikan berkas berhasil dikirim'
    }
  })

  const openBerkasDecisionModal = (mode: BerkasDecisionMode) => {
    berkasDecisionMode.value = mode
    rejectBerkasReason.value = ''
    isBerkasActionMenuOpen.value = false
    isRejectBerkasModalOpen.value = true
  }

  const promptReject = () => {
    rejectReason.value = ''
    isRejectModalOpen.value = true
  }

  const attemptCancelReject = (nextValue?: boolean) => {
    if (nextValue !== false) return
    if (rejectReason.value.trim()) {
      isRejectGuardOpen.value = true
      return
    }

    isRejectModalOpen.value = false
  }

  const confirmCancelReject = () => {
    rejectReason.value = ''
    isRejectGuardOpen.value = false
    isRejectModalOpen.value = false
  }

  const handleApprove = async () => {
    if (!selectedItem.value) return

    isProcessingApprove.value = true
    const actionId = normalizeActionId(selectedItem.value.id)

    const { data, error } = await updatePendaftarStatus({
      id: actionId,
      accept: true,
      notes: ''
    })

    isProcessingApprove.value = false

    const message = data?.message || ''
    const isInternalErrorMessage = message.toLowerCase().includes('internal server error')

    if (error || isInternalErrorMessage || data?.success === false || data?.status === false) {
      const errorMessage = error?.data?.message || error?.response?._data?.message || message || 'Status pendaftar belum berhasil diubah.'
      useToast().addToast(errorMessage, 'error')
      return
    }

    selectedItem.value.status = 'approved'
    selectedItem.value.statusText = 'Diterima'
    isApproveModalOpen.value = false
    closeFilePreview()
    isDetailModalOpen.value = false
    await loadPendaftar(true)
    useToast().addToast(message || 'Pendaftar berhasil diterima', 'success')
  }

  const handleReject = async () => {
    if (!selectedItem.value) return
    const selectedReason = rejectReason.value.trim()

    if (!selectedReason) {
      useToast().addToast('Pilih alasan penolakan terlebih dahulu.', 'error')
      return
    }

    isProcessingReject.value = true
    const actionId = normalizeActionId(selectedItem.value.id)

    const { data, error } = await updatePendaftarStatus({
      id: actionId,
      accept: false,
      notes: selectedReason
    })

    isProcessingReject.value = false

    const message = data?.message || ''
    const isInternalErrorMessage = message.toLowerCase().includes('internal server error')

    if (error || isInternalErrorMessage || data?.success === false || data?.status === false) {
      const errorMessage = error?.data?.message || error?.response?._data?.message || message || 'Status pendaftar belum berhasil diubah.'
      useToast().addToast(errorMessage, 'error')
      return
    }

    selectedItem.value.status = 'rejected'
    selectedItem.value.statusText = 'Ditolak'
    isRejectModalOpen.value = false
    closeFilePreview()
    isDetailModalOpen.value = false
    await loadPendaftar(true)
    useToast().addToast(message || 'Pendaftar berhasil ditolak', 'success')
  }

  const handleVerifyBerkas = async (decision: BerkasDecision) => {
    if (!selectedItem.value) return
    const acceptValue = decision === 'valid' ? 1 : decision === 'revision' ? 2 : 0
    const selectedReason = rejectBerkasReason.value.trim()

    if (acceptValue !== 1 && !selectedReason) {
      useToast().addToast(berkasDecisionCopy.value.emptyMessage, 'error')
      return
    }

    isProcessingVerifyBerkas.value = true
    const actionId = normalizeActionId(selectedItem.value.id)

    const { data, error } = await verifyBerkas({
      id: actionId,
      accept: acceptValue,
      notes: acceptValue === 1 ? 'Berkas lengkap dan sesuai' : selectedReason
    })

    isProcessingVerifyBerkas.value = false

    const message = data?.message || ''
    const isInternalErrorMessage = message.toLowerCase().includes('internal server error')

    if (error || isInternalErrorMessage || data?.success === false || data?.status === false) {
      const errorMessage = error?.data?.message || error?.response?._data?.message || message || 'Berkas pendaftar belum berhasil diverifikasi.'
      useToast().addToast(errorMessage, 'error')
      return
    }

    selectedItem.value.statusBerkas = acceptValue === 1 ? 'Berkas sesuai' : berkasDecisionCopy.value.successStatus
    isRejectBerkasModalOpen.value = false
    rejectBerkasReason.value = ''
    await loadPendaftar(true)
    useToast().addToast(message || (acceptValue === 1 ? 'Berkas pendaftar lengkap dan sesuai' : berkasDecisionCopy.value.successToast), 'success')
  }

  return {
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
  }
}

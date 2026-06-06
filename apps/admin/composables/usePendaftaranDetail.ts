import { computed, ref } from 'vue'
import type { Ref } from 'vue'
import { defaultBerkas } from '~/mappers/adminPendaftarMapper'
import type { Registration } from '~/types/adminPendaftaran'

type TabKey = 'diri' | 'ortu' | 'berkas'

export const usePendaftaranDetail = (
  isFilePreviewOpen: Ref<boolean>,
  closeFilePreview: () => void
) => {
  const activeTab = ref<TabKey>('diri')
  const selectedItem = ref<Registration | null>(null)
  const isDetailModalOpen = ref(false)
  const isBerkasActionMenuOpen = ref(false)

  const detailTabs: Array<{ key: TabKey, label: string }> = [
    { key: 'diri', label: 'Data Diri' },
    { key: 'ortu', label: 'Orang Tua' },
    { key: 'berkas', label: 'Berkas' }
  ]

  const formatLongDate = (dateString: string) => {
    if (!dateString) return '-'

    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) return '-'

    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const isBerkasVerified = computed(() => {
    const status = selectedItem.value?.statusBerkas.toLowerCase() || ''
    const isNegative = status.includes('menunggu') || status.includes('belum') || status.includes('tidak') || status.includes('perbaikan')
    return (
      (status.includes('verifikasi') && !status.includes('menunggu')) ||
      status.includes('terverifikasi') ||
      status.includes('sesuai') ||
      status.includes('komplit') ||
      (status.includes('lengkap') && !isNegative) ||
      status.includes('diterima') ||
      status.includes('disetujui') ||
      status.includes('approved') ||
      (status.includes('valid') && !status.includes('tidak valid'))
    )
  })

  const isBerkasRejected = computed(() => {
    const status = selectedItem.value?.statusBerkas.toLowerCase() || ''
    return status.includes('tolak') || status.includes('ditolak') || status.includes('rejected') || status.includes('tidak valid') || status.includes('perbaikan')
  })

  const isBerkasFinal = computed(() => isBerkasVerified.value)

  const selectedBerkasFiles = computed(() => {
    return selectedItem.value?.berkasFiles?.length ? selectedItem.value.berkasFiles : defaultBerkas
  })

  const getBerkasStatusClass = (status: string) => {
    const normalized = status.toLowerCase()

    if (normalized.includes('tolak') || normalized.includes('ditolak') || normalized.includes('rejected') || normalized.includes('tidak valid')) {
      return 'bg-status-rejected-bg text-status-rejected-text'
    }

    if (normalized.includes('perbaikan') || normalized.includes('revisi')) {
      return 'bg-status-pending-bg text-status-pending-text'
    }

    if ((normalized.includes('verifikasi') && !normalized.includes('menunggu')) || normalized.includes('terverifikasi') || normalized.includes('sesuai') || normalized.includes('komplit') || (normalized.includes('lengkap') && !normalized.includes('belum'))) {
      return 'bg-status-approved-bg text-status-approved-text'
    }

    if (
      normalized.includes('diterima') ||
      normalized.includes('disetujui') ||
      normalized.includes('approved') ||
      (normalized.includes('valid') && !normalized.includes('tidak valid'))
    ) {
      return 'bg-status-approved-bg text-status-approved-text'
    }

    return 'bg-status-pending-bg text-status-pending-text'
  }

  const getOutlineStatusClass = (status: string) => {
    const normalized = status.toLowerCase()

    if (normalized.includes('tolak') || normalized.includes('ditolak') || normalized.includes('rejected') || normalized.includes('tidak valid')) {
      return 'border-status-rejected-text/25 bg-status-rejected-bg/60 text-status-rejected-text'
    }

    if (
      normalized.includes('diterima') ||
      normalized.includes('disetujui') ||
      normalized.includes('approved') ||
      normalized.includes('terverifikasi') ||
      normalized.includes('sesuai') ||
      normalized.includes('komplit') ||
      (normalized.includes('lengkap') && !normalized.includes('belum')) ||
      (normalized.includes('valid') && !normalized.includes('tidak valid'))
    ) {
      return 'border-status-approved-text/25 bg-status-approved-bg/60 text-status-approved-text'
    }

    return 'border-status-pending-text/25 bg-status-pending-bg/70 text-status-pending-text'
  }

  const fieldSections = computed(() => {
    if (!selectedItem.value) return []

    return [
      {
        title: 'Identitas Calon Siswa',
        fields: [
          ['Nama Lengkap', selectedItem.value.nama],
          ['NISN', selectedItem.value.nisn],
          ['NIK', selectedItem.value.nik],
          ['Tempat Lahir', selectedItem.value.tempatLahir],
          ['Tanggal Lahir', formatLongDate(selectedItem.value.tanggalLahir)],
          ['Jenis Kelamin', selectedItem.value.jenisKelamin],
          ['Agama', selectedItem.value.agama],
          ['Asal Sekolah', selectedItem.value.sekolah],
          ['Program', selectedItem.value.program],
          ['Gelombang', selectedItem.value.gelombang ? String(selectedItem.value.gelombang) : '-'],
          ['Email', selectedItem.value.email],
          ['No. HP', selectedItem.value.hp]
        ]
      },
      {
        title: 'Alamat',
        fields: [
          ['Alamat', selectedItem.value.alamat, 'full'],
          ['RT / RW', selectedItem.value.rtRw],
          ['Kode Pos', selectedItem.value.kodePos],
          ['Provinsi', selectedItem.value.provinsi],
          ['Kota/Kab', selectedItem.value.kota],
          ['Kecamatan', selectedItem.value.kecamatan],
          ['Kelurahan', selectedItem.value.kelurahan]
        ]
      },
      {
        title: 'Riwayat Pendidikan',
        fields: [
          ['Sekolah Asal', selectedItem.value.riwayatPendidikan?.nama_sekolah_asal || '-'],
          ['NPSN', selectedItem.value.riwayatPendidikan?.npsn_sekolah_asal || '-'],
          ['Tahun Lulus', selectedItem.value.riwayatPendidikan?.tahun_lulus || '-'],
          ['No. Ijazah', selectedItem.value.riwayatPendidikan?.no_ijazah || '-'],
          ['Alamat Sekolah Asal', selectedItem.value.riwayatPendidikan?.alamat_sekolah_asal || '-', 'full']
        ]
      }
    ]
  })

  const parentSections = computed(() => {
    if (!selectedItem.value) return []

    return selectedItem.value.orangTua.map(parent => ({
      title: parent.title,
      fields: [
        ['Nama Lengkap', parent.nama],
        ['NIK', parent.nik],
        ['Agama', parent.agama],
        ['Hubungan', parent.hubungan],
        ['Peran', parent.peran],
        ['No. HP', parent.hp],
        ['Email', parent.email],
        ['Pendidikan Terakhir', parent.pendidikan],
        ['Pekerjaan', parent.pekerjaan],
        ['Penghasilan Per Bulan', parent.penghasilan]
      ]
    }))
  })

  const openDetail = (item: Registration) => {
    selectedItem.value = item
    activeTab.value = 'diri'
    isDetailModalOpen.value = true
  }

  const focusBerkasTab = () => {
    activeTab.value = 'berkas'
  }

  const closeDetail = () => {
    if (isFilePreviewOpen.value) {
      closeFilePreview()
      window.setTimeout(() => {
        isDetailModalOpen.value = false
      }, 260)
      return
    }

    isDetailModalOpen.value = false
  }

  return {
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
  }
}

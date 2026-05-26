import { normalizeStatus } from '~/mappers/adminPendaftarMapper'
import { adminApiEndpoints } from '~/services/adminApiEndpoints'
import type {
  AdminDashboardData,
  AdminSummaryDto,
  DashboardRegistration,
  DashboardTimeline
} from '~/types/adminDashboard'

type DashboardRawDto = Record<string, any>

const normalizeText = (value: unknown) => String(value || '').trim()

const readArrayPayload = (payload: any): DashboardRawDto[] => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.data?.data)) return payload.data.data
  if (Array.isArray(payload?.pendaftar)) return payload.pendaftar
  if (Array.isArray(payload?.data?.pendaftar)) return payload.data.pendaftar
  if (Array.isArray(payload?.siswa)) return payload.siswa
  if (Array.isArray(payload?.data?.siswa)) return payload.data.siswa
  return []
}

const readSummaryPayload = (payload: any): AdminSummaryDto | null => {
  if (!payload) return null
  return payload.data || payload
}

const isBerkasVerifiedText = (status: string) => {
  const normalized = status.toLowerCase()
  return (
    normalized.includes('terverifikasi') ||
    normalized.includes('disetujui') ||
    normalized.includes('diterima') ||
    normalized.includes('approved') ||
    ((normalized.includes('verifikasi') || normalized.includes('valid')) && !normalized.includes('menunggu') && !normalized.includes('tidak'))
  )
}

const mapTimelineItem = (item: DashboardRawDto): DashboardTimeline => ({
  id: Number(item.id || 0),
  judul: normalizeText(item.judul || item.title || item.nama),
  deskripsi: normalizeText(item.deskripsi || item.description),
  tanggalMulai: normalizeText(item.tanggal_mulai || item.start_date || item.tanggalMulai),
  tanggalSelesai: normalizeText(item.tanggal_selesai || item.end_date || item.tanggalSelesai),
  urutan: Number(item.urutan || item.order || 0),
  status: normalizeText(item.status).toLowerCase() === 'nonaktif' ? 'nonaktif' : 'aktif',
  tampilPublik: Boolean(item.tampil_publik ?? item.is_public ?? item.tampilPublik)
})

const mapRegistration = (item: DashboardRawDto): DashboardRegistration => {
  const sekolah = normalizeText(
    item.asal_sekolah ||
    item.sekolah_asal ||
    item.nama_sekolah_asal ||
    item.riwayat_pendidikan?.nama_sekolah_asal ||
    item.riwayat_pendidikan?.asal_sekolah ||
    item.riwayat_pendidikan?.sekolah_asal
  )

  const statusText = normalizeText(item.status_pendaftaran || item.status) || 'Menunggu verifikasi'

  return {
    id: normalizeText(item.kode_pendaftaran || item.nomor_pendaftaran || item.kode || item.id),
    nama: normalizeText(item.nama),
    nisn: normalizeText(item.nisn),
    sekolah,
    program: normalizeText(item.program || item.program_paket || item.paket) || '-',
    status: normalizeStatus(statusText),
    statusText,
    statusBerkas: normalizeText(item.status_berkas) || 'Menunggu verifikasi',
    tanggal: normalizeText(item.created_at || item.tanggal_daftar || item.createdAt)
  }
}

export const useAdminDashboardService = () => {
  const { get } = useApi()

  const getDashboardData = async (): Promise<AdminDashboardData> => {
    const [
      summaryResponse,
      pendaftarResponse,
      siswaResponse,
      timelineResponse
    ] = await Promise.all([
      get<any>(adminApiEndpoints.summary, { showErrorToast: false }),
      get<any>(adminApiEndpoints.pendaftar.list, { showErrorToast: false }),
      get<any>(adminApiEndpoints.siswa.list, { showErrorToast: false }),
      get<any>(adminApiEndpoints.timelinePpdb.list, { showErrorToast: false })
    ])

    const registrations = readArrayPayload(pendaftarResponse.data).map(mapRegistration)
    const timelineItems = readArrayPayload(timelineResponse.data).map(mapTimelineItem)
    const siswaRows = readArrayPayload(siswaResponse.data)
    const summary = readSummaryPayload(summaryResponse.data)

    return {
      registrations,
      timelineItems,
      totalStudents: siswaRows.length || registrations.filter(item => item.status === 'approved').length,
      summary,
      hasCriticalError: Boolean(pendaftarResponse.error && !summary)
    }
  }

  return {
    getDashboardData
  }
}

export const isDashboardBerkasVerifiedText = isBerkasVerifiedText

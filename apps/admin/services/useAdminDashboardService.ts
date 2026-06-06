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
const normalizeNumber = (value: unknown) => {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : 0
}

const readObjectPayload = (payload: any): DashboardRawDto => {
  if (!payload) return {}
  return payload.data || payload
}

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

export const createEmptyDashboardSummary = (): AdminSummaryDto => ({
  total_menunggu_verifikasi: 0,
  total_pendaftar_diterima: 0,
  total_pendaftar_ditolak: 0,
  total_siswa: 0,
  total_galeri: 0,
  total_berita: 0,
  gelombang: [],
  program_paket: [],
  berita_terbaru: [],
  pendaftar_terbaru: []
})

const mapSummaryPayload = (payload: any): AdminSummaryDto => {
  const summary = readObjectPayload(payload)

  return {
    total_menunggu_verifikasi: normalizeNumber(summary.total_menunggu_verifikasi),
    total_pendaftar_diterima: normalizeNumber(summary.total_pendaftar_diterima),
    total_pendaftar_ditolak: normalizeNumber(summary.total_pendaftar_ditolak),
    total_siswa: normalizeNumber(summary.total_siswa),
    total_galeri: normalizeNumber(summary.total_galeri),
    total_berita: normalizeNumber(summary.total_berita),
    program_paket: readArrayPayload(summary.program_paket).map(item => ({
      nama: normalizeText(item.nama),
      status: Boolean(item.status)
    })),
    gelombang: readArrayPayload(summary.gelombang).map(item => ({
      order: normalizeNumber(item.order),
      kuota: normalizeNumber(item.kuota),
      total_pendaftar: normalizeNumber(item.total_pendaftar),
      status: Boolean(item.status)
    })),
    berita_terbaru: readArrayPayload(summary.berita_terbaru).map(item => ({
      gambar: normalizeText(item.gambar),
      created_at: normalizeText(item.created_at)
    })),
    pendaftar_terbaru: readArrayPayload(summary.pendaftar_terbaru).map(item => ({
      kode_pendaftaran: normalizeText(item.kode_pendaftaran),
      nama: normalizeText(item.nama),
      nisn: normalizeText(item.nisn),
      nama_sekolah_asal: normalizeText(item.nama_sekolah_asal),
      status: Boolean(item.status)
    }))
  }
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

  const getDashboardSummary = async () => {
    const response = await get<any>(adminApiEndpoints.summary, { showErrorToast: false })
    return {
      data: response.data ? mapSummaryPayload(response.data) : createEmptyDashboardSummary(),
      error: response.error
    }
  }

  const getDashboardData = async (): Promise<AdminDashboardData> => {
    const [
      summaryResponse,
      timelineResponse
    ] = await Promise.all([
      get<any>(adminApiEndpoints.summary, { showErrorToast: false }),
      get<any>(adminApiEndpoints.timelinePpdb.list, { showErrorToast: false })
    ])

    const summary = mapSummaryPayload(summaryResponse.data)
    const registrations = summary.pendaftar_terbaru.map(mapRegistration)
    const timelineItems = readArrayPayload(timelineResponse.data).map(mapTimelineItem)

    return {
      registrations,
      timelineItems,
      totalStudents: summary.total_siswa,
      summary,
      hasCriticalError: Boolean(summaryResponse.error)
    }
  }

  return {
    getDashboardSummary,
    getDashboardData
  }
}

export const isDashboardBerkasVerifiedText = isBerkasVerifiedText

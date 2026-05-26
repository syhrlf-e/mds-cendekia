import { adminApiEndpoints } from '~/services/adminApiEndpoints'
import type { ApiMutationResponse } from '~/types/adminPendaftaran'
import type { TimelineDto, TimelineItem, TimelinePayload, TimelineStatus } from '~/types/adminTimelinePpdb'

export const fallbackTimeline: TimelineItem[] = [
  {
    id: 1,
    judul: 'Pendaftaran Online',
    deskripsi: 'Calon siswa mengisi formulir pendaftaran dan melengkapi data diri.',
    tanggalMulai: '2026-07-01',
    tanggalSelesai: '2026-07-31',
    urutan: 1,
    status: 'aktif',
    tampilPublik: true
  },
  {
    id: 2,
    judul: 'Upload Berkas',
    deskripsi: 'Calon siswa mengunggah dokumen persyaratan PPDB.',
    tanggalMulai: '2026-07-01',
    tanggalSelesai: '2026-08-05',
    urutan: 2,
    status: 'aktif',
    tampilPublik: true
  },
  {
    id: 3,
    judul: 'Verifikasi Berkas',
    deskripsi: 'Panitia memeriksa kelengkapan dan validitas dokumen pendaftar.',
    tanggalMulai: '2026-08-06',
    tanggalSelesai: '2026-08-15',
    urutan: 3,
    status: 'aktif',
    tampilPublik: true
  },
  {
    id: 4,
    judul: 'Pengumuman Hasil',
    deskripsi: 'Hasil seleksi PPDB diumumkan kepada calon siswa.',
    tanggalMulai: '2026-08-20',
    tanggalSelesai: '2026-08-20',
    urutan: 4,
    status: 'aktif',
    tampilPublik: true
  },
  {
    id: 5,
    judul: 'Daftar Ulang',
    deskripsi: 'Siswa yang diterima menyelesaikan proses daftar ulang.',
    tanggalMulai: '2026-08-21',
    tanggalSelesai: '2026-08-31',
    urutan: 5,
    status: 'aktif',
    tampilPublik: true
  }
]

const normalizeText = (value: unknown) => String(value || '').trim()

const normalizeNumber = (value: unknown) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const readArrayPayload = (payload: any): TimelineDto[] => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.data?.data)) return payload.data.data
  if (Array.isArray(payload?.timeline)) return payload.timeline
  if (Array.isArray(payload?.data?.timeline)) return payload.data.timeline
  return []
}

const mapTimelineItem = (item: TimelineDto): TimelineItem => ({
  id: normalizeNumber(item.id),
  judul: normalizeText(item.judul || item.title || item.nama),
  deskripsi: normalizeText(item.deskripsi || item.description),
  tanggalMulai: normalizeText(item.tanggal_mulai || item.start_date || item.tanggalMulai),
  tanggalSelesai: normalizeText(item.tanggal_selesai || item.end_date || item.tanggalSelesai),
  urutan: normalizeNumber(item.urutan || item.order),
  status: normalizeText(item.status).toLowerCase() === 'nonaktif' ? 'nonaktif' : 'aktif',
  tampilPublik: Boolean(item.tampil_publik ?? item.is_public ?? item.tampilPublik)
})

export const buildTimelinePayload = (form: {
  id: number
  judul: string
  deskripsi: string
  tanggalMulai: string
  tanggalSelesai: string
  urutan: string
  status: TimelineStatus
  tampilPublik: boolean
}, fallbackOrder: number): TimelinePayload => ({
  id: form.id,
  judul: form.judul.trim(),
  deskripsi: form.deskripsi.trim(),
  tanggal_mulai: form.tanggalMulai,
  tanggal_selesai: form.tanggalSelesai,
  urutan: Number(form.urutan || fallbackOrder),
  status: form.status,
  tampil_publik: form.tampilPublik
})

export const buildTimelineUpdatePayload = (item: TimelineItem, overrides: Partial<TimelineItem> = {}): TimelinePayload => {
  const nextItem = { ...item, ...overrides }

  return {
    id: nextItem.id,
    judul: nextItem.judul,
    deskripsi: nextItem.deskripsi,
    tanggal_mulai: nextItem.tanggalMulai,
    tanggal_selesai: nextItem.tanggalSelesai,
    urutan: nextItem.urutan,
    status: nextItem.status,
    tampil_publik: nextItem.tampilPublik
  }
}

export const useAdminTimelinePpdbService = () => {
  const { get, post, put } = useApi()

  const listTimeline = async () => {
    const { data, error } = await get<any>(adminApiEndpoints.timelinePpdb.list, {
      showErrorToast: false
    })
    const rows = readArrayPayload(data)

    if (error && !rows.length) {
      return {
        data: fallbackTimeline,
        error,
        usingFallback: true
      }
    }

    return {
      data: rows.length ? rows.map(mapTimelineItem) : fallbackTimeline,
      error: null,
      usingFallback: false
    }
  }

  const saveTimeline = (payload: TimelinePayload, isEditing: boolean) => {
    return isEditing
      ? put<ApiMutationResponse>(adminApiEndpoints.timelinePpdb.list, payload, { showErrorToast: false })
      : post<ApiMutationResponse>(adminApiEndpoints.timelinePpdb.list, payload, { showErrorToast: false })
  }

  const updateTimeline = (payload: TimelinePayload) => {
    return put<ApiMutationResponse>(adminApiEndpoints.timelinePpdb.list, payload, {
      showErrorToast: false
    })
  }

  return {
    listTimeline,
    saveTimeline,
    updateTimeline
  }
}

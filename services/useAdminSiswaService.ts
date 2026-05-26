import { adminApiEndpoints } from '~/services/adminApiEndpoints'
import type { Student, StudentDto, StudentEndpoint } from '~/types/adminSiswa'

const normalizeText = (value: unknown) => String(value || '').trim()

const normalizeNumber = (value: unknown) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const isAcceptedStatus = (value: unknown) => {
  const status = normalizeText(value).toLowerCase()
  return status.includes('terima') || status.includes('diterima') || status.includes('approved')
}

const createDisplayNis = (item: StudentDto) => {
  const acceptedAt = normalizeText(item.tanggal_diterima || item.diterima_at || item.accepted_at || item.created_at)
  const date = acceptedAt ? new Date(acceptedAt) : new Date('2026-05-23T00:00:00.000Z')
  const year = Number.isNaN(date.getTime()) ? '26' : String(date.getFullYear()).slice(-2)
  const month = Number.isNaN(date.getTime()) ? '05' : String(date.getMonth() + 1).padStart(2, '0')
  const gelombang = normalizeText(item.gelombang || 1)
  const sourceId = normalizeText(item.id_pendaftaran || item.kode_pendaftaran || item.nomor_pendaftaran || item.id || item.nisn)
  const randomPart = sourceId.replace(/[^a-zA-Z0-9]/g, '').slice(-4).padStart(4, '0')

  return `${year}${month}${gelombang}${randomPart}`
}

const readArrayPayload = (payload: any): StudentDto[] => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.data?.data)) return payload.data.data
  if (Array.isArray(payload?.siswa)) return payload.siswa
  if (Array.isArray(payload?.data?.siswa)) return payload.data.siswa
  return []
}

const mapStudent = (item: StudentDto, fallbackFromPendaftar = false): Student | null => {
  if (fallbackFromPendaftar && !isAcceptedStatus(item.status_pendaftaran || item.status)) return null

  const kodePendaftaran = normalizeText(item.id_pendaftaran || item.kode_pendaftaran || item.nomor_pendaftaran || item.kode || item.id)
  const nis = normalizeText(item.nis || item.nomor_induk || item.nomor_induk_siswa || item.no_induk) || createDisplayNis(item)
  const sekolah = normalizeText(
    item.asal_sekolah ||
    item.sekolah_asal ||
    item.nama_sekolah_asal ||
    item.riwayat_pendidikan?.nama_sekolah_asal ||
    item.riwayat_pendidikan?.asal_sekolah ||
    item.riwayat_pendidikan?.sekolah_asal
  )

  if (!nis || !normalizeText(item.nama)) return null

  return {
    id: normalizeText(item.id || kodePendaftaran || nis),
    kodePendaftaran,
    nis,
    nisn: normalizeText(item.nisn),
    nama: normalizeText(item.nama),
    nik: normalizeText(item.nik),
    sekolah,
    program: normalizeText(item.program || item.program_paket || item.paket) || 'Paket C',
    gelombang: normalizeNumber(item.gelombang),
    tanggalDiterima: normalizeText(item.tanggal_diterima || item.diterima_at || item.accepted_at || item.created_at),
    jenisKelamin: normalizeText(item.jenis_kelamin),
    hp: normalizeText(item.no_telepon || item.no_hp || item.telepon || item.phone),
    email: normalizeText(item.email),
    status: normalizeText(item.status_siswa || item.status) || 'Aktif'
  }
}

export const useAdminSiswaService = () => {
  const { get } = useApi()

  const endpoints: StudentEndpoint[] = [
    { url: adminApiEndpoints.siswa.list, fallbackFromPendaftar: false },
    { url: adminApiEndpoints.pendaftar.list, fallbackFromPendaftar: true }
  ]

  const listStudents = async () => {
    for (const endpoint of endpoints) {
      const { data, error } = await get<any>(endpoint.url, { showErrorToast: false })
      const rows = readArrayPayload(data)
      const mapped = rows
        .map(item => mapStudent(item, endpoint.fallbackFromPendaftar))
        .filter((item): item is Student => Boolean(item))

      if (!error && rows.length) {
        return {
          data: mapped,
          error: null
        }
      }
    }

    return {
      data: [],
      error: new Error('Data siswa belum bisa diambil dari server.')
    }
  }

  return {
    listStudents
  }
}

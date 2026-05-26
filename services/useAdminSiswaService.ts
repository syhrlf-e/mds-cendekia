import { adminApiEndpoints } from '~/services/adminApiEndpoints'
import type { Student, StudentDto } from '~/types/adminSiswa'

const normalizeText = (value: unknown) => String(value || '').trim()

const normalizeNumber = (value: unknown) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const readArrayPayload = (payload: any): StudentDto[] => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.data?.data)) return payload.data.data
  if (Array.isArray(payload?.siswa)) return payload.siswa
  if (Array.isArray(payload?.data?.siswa)) return payload.data.siswa
  return []
}

const mapStudent = (item: StudentDto): Student | null => {
  const kodePendaftaran = normalizeText(item.id_pendaftaran || item.kode_pendaftaran || item.nomor_pendaftaran || item.kode || item.id)
  const nis = normalizeText(item.nis || item.nomor_induk || item.nomor_induk_siswa || item.no_induk)
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
    program: normalizeText(item.program || item.program_paket || item.paket) || '-',
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

  const listStudents = async () => {
    const { data, error } = await get<any>(adminApiEndpoints.siswa.list, { showErrorToast: false })
    const rows = readArrayPayload(data)

    if (error) {
      return {
        data: [],
        error
      }
    }

    return {
      data: rows.map(mapStudent).filter((item): item is Student => Boolean(item)),
      error: null
    }
  }

  return {
    listStudents
  }
}

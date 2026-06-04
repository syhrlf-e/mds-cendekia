import { adminApiEndpoints } from '~/services/adminApiEndpoints'
import type { Student, StudentDto, StudentListResponse } from '~/types/adminSiswa'

const normalizeText = (value: unknown) => String(value || '').trim()

const normalizeNumber = (value: unknown) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const mapStudent = (item: StudentDto): Student | null => {
  const kodePendaftaran = normalizeText(item.id_pendaftaran)
  const nis = normalizeText(item.nis)
  const nama = normalizeText(item.nama)
  const sekolah = normalizeText(item.riwayat_pendidikan?.nama_sekolah_asal)

  if (!nis || !nama) return null

  return {
    id: normalizeText(item.id),
    kodePendaftaran,
    nis,
    nisn: normalizeText(item.nisn),
    nama,
    fotoUrl: '',
    nik: normalizeText(item.nik),
    sekolah,
    program: normalizeText(item.program_paket) || '-',
    gelombang: normalizeNumber(item.gelombang),
    tanggalDiterima: normalizeText(item.created_at),
    jenisKelamin: normalizeText(item.jenis_kelamin),
    hp: normalizeText(item.no_telepon),
    email: normalizeText(item.email),
    status: 'Aktif',
    tempatLahir: normalizeText(item.tempat_lahir),
    tanggalLahir: normalizeText(item.tanggal_lahir),
    agama: normalizeText(item.agama),
    alamat: normalizeText(item.alamat),
    rt: normalizeText(item.rt),
    rw: normalizeText(item.rw),
    kelurahan: normalizeText(item.kelurahan),
    kecamatan: normalizeText(item.kecamatan),
    kabupatenKota: normalizeText(item.kabupaten_kota),
    provinsi: normalizeText(item.provinsi),
    kodePos: normalizeText(item.kode_pos),
    orangTua: Array.isArray(item.orang_tua) ? item.orang_tua : [],
    riwayatPendidikan: item.riwayat_pendidikan || null
  }
}

export const useAdminSiswaService = () => {
  const { get } = useApi()

  const listStudents = async () => {
    const { data, error } = await get<StudentListResponse>(adminApiEndpoints.siswa.list, { showErrorToast: false })

    if (error) {
      return {
        data: [],
        error
      }
    }

    return {
      data: (data || []).map(mapStudent).filter((item): item is Student => Boolean(item)),
      error: null
    }
  }

  return {
    listStudents
  }
}

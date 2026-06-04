export type StudentParentDto = {
  nama: string
  nik: string
  agama: string
  no_telepon?: string
  email?: string
  hubungan: string
  peran: string
  pekerjaan?: string
  pendidikan?: string
  gaji?: string
}

export type StudentEducationHistoryDto = {
  nama_sekolah_asal: string
  npsn_sekolah_asal: string
  alamat_sekolah_asal: string
  tahun_lulus: string
  no_ijazah: string
}

export type StudentDto = {
  id: number
  id_pendaftaran: string
  nis: string
  created_at: string
  nama: string
  nik: string
  tempat_lahir: string
  tanggal_lahir: string
  jenis_kelamin: string
  agama: string
  no_telepon: string
  email: string
  nisn: string
  alamat: string
  rt: string
  rw: string
  kelurahan: string
  kecamatan: string
  kabupaten_kota: string
  provinsi: string
  kode_pos: string
  updated_at: string
  gelombang: number
  program_paket: string
  orang_tua: StudentParentDto[]
  riwayat_pendidikan: StudentEducationHistoryDto
}

export type Student = {
  id: string
  kodePendaftaran: string
  nis: string
  nisn: string
  nama: string
  fotoUrl: string
  nik: string
  sekolah: string
  program: string
  gelombang: number | null
  tanggalDiterima: string
  jenisKelamin: string
  hp: string
  email: string
  status: string
  tempatLahir: string
  tanggalLahir: string
  agama: string
  alamat: string
  rt: string
  rw: string
  kelurahan: string
  kecamatan: string
  kabupatenKota: string
  provinsi: string
  kodePos: string
  orangTua: StudentParentDto[]
  riwayatPendidikan: StudentEducationHistoryDto | null
}

export type StudentListResponse = StudentDto[]

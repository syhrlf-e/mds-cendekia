export type RegistrationStatus = 'pending' | 'approved' | 'rejected'

export type RegistrationFile = {
  id: string
  name: string
  url: string
}

export type ParentData = {
  id: string
  title: string
  nama: string
  nik: string
  agama: string
  hubungan: string
  peran: string
  hp: string
  email: string
  pendidikan: string
  pekerjaan: string
  penghasilan: string
}

export type Registration = {
  id: string
  nama: string
  fotoUrl: string
  nisn: string
  sekolah: string
  tanggal: string
  status: RegistrationStatus
  statusText: string
  statusBerkas: string
  nik: string
  email: string
  hp: string
  tempatLahir: string
  tanggalLahir: string
  jenisKelamin: string
  agama: string
  alamat: string
  rtRw: string
  kodePos: string
  provinsi: string
  kota: string
  kecamatan: string
  kelurahan: string
  gelombang: number | null
  orangTua: ParentData[]
  berkasFiles: RegistrationFile[]
  riwayatPendidikan: AdminRiwayatPendidikanDto | null
  program?: string
  program_paket?: string
}

export type AdminBerkasDto = {
  jenis_berkas?: string
  jenis?: string
  tipe?: string
  kategori?: string
  nama?: string
  nama_berkas?: string
  nama_file?: string
  created_at?: string
  url?: string
  url_file?: string
  file_url?: string
  file?: string
  berkas?: string
  path?: string
  path_file?: string
  file_path?: string
  lokasi_file?: string
  data?: AdminBerkasDto
  file_data?: AdminBerkasDto
}

export type AdminOrangTuaDto = {
  nama?: string
  nik?: string
  agama?: string
  no_telepon?: string
  telepon?: string
  phone?: string
  email?: string
  hubungan?: string
  hubungan_lainnya?: string
  peran?: string
  pekerjaan?: string
  pendidikan?: string
  gaji?: string
  penghasilan?: string
}

export type AdminRiwayatPendidikanDto = {
  nama_sekolah_asal?: string
  npsn_sekolah_asal?: string
  alamat_sekolah_asal?: string
  tahun_lulus?: string
  no_ijazah?: string
}

export type AdminPendaftarDto = {
  id: string
  nama: string
  pass_photo?: string
  foto?: string
  foto_url?: string
  url_foto?: string
  pas_foto?: string
  file_foto?: string
  path_foto?: string
  berkas?: AdminBerkasDto[] | AdminBerkasDto
  berkas_pendaftaran?: AdminBerkasDto[] | AdminBerkasDto
  berkas_persyaratan?: AdminBerkasDto[] | AdminBerkasDto
  dokumen?: AdminBerkasDto[] | AdminBerkasDto
  files?: AdminBerkasDto[] | AdminBerkasDto
  nik: string
  nisn: string
  status_berkas: string
  status_pendaftaran: string
  created_at: string
  no_telepon: string
  email: string
  asal_sekolah?: string
  sekolah_asal?: string
  nama_sekolah_asal?: string
  riwayat_pendidikan?: AdminRiwayatPendidikanDto
  tempat_lahir: string
  tanggal_lahir: string
  jenis_kelamin: string
  agama?: string
  alamat: string
  rt: string
  rw: string
  kelurahan: string
  kecamatan: string
  kota?: string
  kabupaten?: string
  kota_kabupaten?: string
  kabupaten_kota?: string
  kota_kab?: string
  provinsi: string
  kode_pos: string
  gelombang: number
  program?: string
  program_paket?: string
  orang_tua?: AdminOrangTuaDto[] | AdminOrangTuaDto
  orangtua?: AdminOrangTuaDto[] | AdminOrangTuaDto
  wali?: AdminOrangTuaDto[] | AdminOrangTuaDto
}

export type AdminPendaftarListResponse =
  | AdminPendaftarDto
  | AdminPendaftarDto[]
  | {
      data?: AdminPendaftarDto | AdminPendaftarDto[]
      result?: AdminPendaftarDto | AdminPendaftarDto[]
      items?: AdminPendaftarDto[]
    }

export type ApiMutationResponse = {
  success?: boolean
  status?: boolean
  message?: string
}

export type PublicCheckStatusResponse = {
  status?: boolean
  success?: boolean
  message?: string
  data?: {
    id?: number
    kode?: string
    status?: string
    status_pendaftaran?: string
    created_at?: string
    biodata?: {
      nama?: string
      tempat_lahir?: string
      tanggal_lahir?: string
      jenis_kelamin?: string
      agama?: string
      no_telepon?: string
      email?: string
    }
    riwayat_pendidikan?: {
      nama_sekolah_asal?: string
    }
  }
}

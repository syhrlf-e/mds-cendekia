export type Student = {
  id: string
  kodePendaftaran: string
  nis: string
  nisn: string
  nama: string
  nik: string
  sekolah: string
  program: string
  gelombang: number | null
  tanggalDiterima: string
  jenisKelamin: string
  hp: string
  email: string
  status: string
}

export type StudentDto = Record<string, any>

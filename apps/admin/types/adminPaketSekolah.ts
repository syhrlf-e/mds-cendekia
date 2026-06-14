export type PaketStatus = 'aktif' | 'nonaktif'

export type PaketTimeline = {
  id: number
  tanggal: string
  deskripsi: string
}

export type PaketGelombang = {
  id: number
  idProgram: number
  order: number
  mulai: string
  selesai: string
  kuota: number
  status: boolean
  tahunAjaran: string
  timeline: PaketTimeline[]
}

export type PaketSekolah = {
  id: number
  kode: string
  nama: string
  jenjang: string
  status: PaketStatus
  kuota: number
  biayaPendaftaran: number
  deskripsi: string
  totalPendaftar: number
  totalDiterima: number
  gelombangIds: number[]
  gelombang: PaketGelombang[]
}

export type PaketSekolahDto = Record<string, any>

export type PaketSekolahPayload = {
  id: number
  kode: string
  nama: string
  jenjang: string
  status: PaketStatus
  kuota: number
  biaya_pendaftaran: number
  deskripsi: string
}

export type ProgramPaketPayload = {
  nama: string
  deskripsi: string
  status: boolean
}

export type ProgramPaketCreatePayload = ProgramPaketPayload

export type ProgramPaketUpdatePayload = ProgramPaketPayload

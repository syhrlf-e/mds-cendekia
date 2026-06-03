export type PaketStatus = 'aktif' | 'nonaktif'

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

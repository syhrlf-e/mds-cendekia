export type TimelineStatus = 'aktif' | 'nonaktif'
export type TimelineComputedStatus = 'belum_mulai' | 'berjalan' | 'selesai' | 'nonaktif'

export type TimelineItem = {
  id: number
  judul: string
  deskripsi: string
  tanggalMulai: string
  tanggalSelesai: string
  urutan: number
  status: TimelineStatus
  tampilPublik: boolean
}

export type TimelineDto = Record<string, any>

export type TimelinePayload = {
  id: number
  judul: string
  deskripsi: string
  tanggal_mulai: string
  tanggal_selesai: string
  urutan: number
  status: TimelineStatus
  tampil_publik: boolean
}

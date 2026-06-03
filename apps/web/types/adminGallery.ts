export type GalleryDto = {
  id?: string | number
  nama?: string
  deskripsi?: string
  gambar?: string
  is_utama?: boolean | number | string
  isUtama?: boolean | number | string
  utama?: boolean | number | string
  urutan?: number | string
  sort_order?: number | string
  order?: number | string
  created_at?: string
  updated_at?: string
}

export type GalleryItem = {
  id: string
  nama: string
  deskripsi: string
  gambar: string
  isUtama: boolean
  urutan: number
  createdAt: string
  updatedAt: string
}

export type GalleryFormState = {
  nama: string
  deskripsi: string
  gambar: File | null
  isUtama?: boolean
  urutan?: number
}

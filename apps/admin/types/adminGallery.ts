export type GalleryDto = {
  id: string
  nama: string
  deskripsi: string
  gambar: string
  slug: string
  order: number
  is_head: boolean
  created_at: string
  updated_at: string
}

export type CreateGalleryResponse = Omit<GalleryDto, 'slug' | 'order' | 'is_head'>

export type GalleryMutationResponse = {
  success: boolean
  message: string
}

export type GalleryItem = {
  id: string
  nama: string
  deskripsi: string
  gambar: string
  slug: string
  isHead: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export type GalleryFormState = {
  nama: string
  deskripsi: string
  gambar: File | null
}

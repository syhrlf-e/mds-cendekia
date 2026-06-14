export type TimelineStepDto = {
  id?: number
  id_gelombang?: number
  tanggal: string
  deskripsi: string
}

export type GelombangTimelineDto = {
  id: number
  order: number
  mulai: string
  selesai: string
  kuota: number
  status: boolean
  tahun_ajaran: string
  timeline: TimelineStepDto[]
}

export type TimelineCreatePayload = {
  id_gelombang: number
  tanggal: string
  deskripsi: string
}

export type TimelineUpdatePayload = {
  id_gelombang: number
  tanggal: string
  deskripsi: string
}

export type GelombangCreatePayload = {
  id_program: number
  order: number
  mulai: string
  selesai: string
  kuota: number
  status: boolean
  tahun_ajaran: string
  timeline: Array<{
    id_gelombang: number
    tanggal: string
    deskripsi: string
  }>
}

export type GelombangUpdatePayload = {
  mulai: string
  selesai: string
  kuota: number
  status: boolean
  tahun_ajaran: string
}

export type TimelineListResponse = {
  success?: boolean
  data?: GelombangTimelineDto[]
}

export type TimelineDetailResponse = {
  success?: boolean
  data?: GelombangTimelineDto
}

export type TimelineCreateResponse = {
  success?: boolean
  message?: string
  data?: {
    id?: number
  }
}

export type TimelineDeleteResponse = {
  success?: boolean
  message?: string
}

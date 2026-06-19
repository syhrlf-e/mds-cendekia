import { adminApiEndpoints } from '~/services/adminApiEndpoints'
import type { ApiMutationResponse } from '~/types/adminPendaftaran'
import type { PaketSekolah, PaketSekolahDto, PaketSekolahPayload, PaketStatus, ProgramPaketCreatePayload, ProgramPaketUpdatePayload } from '~/types/adminPaketSekolah'

const normalizeText = (value: unknown) => String(value || '').trim()

const normalizeNumber = (value: unknown) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export const createPaketKode = (name: string) => name
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '') || `paket-${Date.now()}`

const readArrayPayload = (payload: any): PaketSekolahDto[] => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.data?.data)) return payload.data.data
  if (Array.isArray(payload?.paket)) return payload.paket
  if (Array.isArray(payload?.data?.paket)) return payload.data.paket
  if (Array.isArray(payload?.programPaket)) return payload.programPaket
  if (Array.isArray(payload?.program_paket)) return payload.program_paket
  if (Array.isArray(payload?.data?.programPaket)) return payload.data.programPaket
  if (Array.isArray(payload?.data?.program_paket)) return payload.data.program_paket
  return []
}

const readGelombangItems = (item: PaketSekolahDto): PaketSekolahDto[] => {
  if (Array.isArray(item.gelombang)) return item.gelombang
  if (item.gelombang && typeof item.gelombang === 'object') return [item.gelombang]
  return []
}

const readTimelineItems = (item: PaketSekolahDto): PaketSekolahDto[] => {
  if (Array.isArray(item.timeline)) return item.timeline
  return []
}

const mapGelombang = (item: PaketSekolahDto) => ({
  id: normalizeNumber(item.id),
  idProgram: normalizeNumber(item.id_program || item.idProgram),
  order: normalizeNumber(item.order || item.id),
  mulai: normalizeText(item.mulai),
  selesai: normalizeText(item.selesai),
  kuota: normalizeNumber(item.kuota),
  status: Boolean(item.status ?? true),
  tahunAjaran: normalizeText(item.tahun_ajaran || item.tahunAjaran),
  timeline: readTimelineItems(item).map(timeline => ({
    id: normalizeNumber(timeline.id),
    tanggal: normalizeText(timeline.tanggal),
    deskripsi: normalizeText(timeline.deskripsi)
  })).filter(timeline => timeline.id || timeline.tanggal || timeline.deskripsi)
})

const mapPackage = (item: PaketSekolahDto): PaketSekolah => ({
  id: normalizeNumber(item.id),
  kode: normalizeText(item.kode || item.slug || createPaketKode(item.nama)),
  nama: normalizeText(item.nama || item.nama_paket),
  jenjang: normalizeText(item.jenjang),
  status: item.status === true || normalizeText(item.status).toLowerCase() === 'aktif' ? 'aktif' : 'nonaktif',
  kuota: normalizeNumber(item.kuota || readGelombangItems(item)[0]?.kuota),
  biayaPendaftaran: normalizeNumber(item.biaya_pendaftaran || item.biayaPendaftaran),
  deskripsi: normalizeText(item.deskripsi),
  totalPendaftar: normalizeNumber(item.total_pendaftar || item.pendaftar),
  totalDiterima: normalizeNumber(item.total_diterima || item.diterima),
  gelombangIds: readGelombangItems(item)
    .map(gelombang => normalizeNumber(gelombang.id))
    .filter(id => id > 0),
  gelombang: readGelombangItems(item)
    .map(mapGelombang)
    .filter(gelombang => gelombang.id > 0)
})

const groupGelombangByProgramId = (items: PaketSekolahDto[]) => {
  const grouped = new Map<number, PaketSekolahDto[]>()

  for (const item of items) {
    const programId = normalizeNumber(item.id_program || item.idProgram)
    if (!programId) continue
    grouped.set(programId, [...(grouped.get(programId) || []), item])
  }

  return grouped
}

export const buildPaketPayload = (form: {
  id: number
  nama: string
  jenjang: string
  status: PaketStatus
  kuota: string
  biayaPendaftaran: string
  deskripsi: string
}): PaketSekolahPayload => ({
  id: form.id,
  kode: createPaketKode(form.nama),
  nama: form.nama.trim(),
  jenjang: form.jenjang,
  status: form.status,
  kuota: Number(form.kuota || 0),
  biaya_pendaftaran: Number(form.biayaPendaftaran || 0),
  deskripsi: form.deskripsi.trim()
})

export const buildPaketStatusPayload = (item: PaketSekolah, nextStatus: PaketStatus): PaketSekolahPayload => ({
  id: item.id,
  kode: item.kode,
  nama: item.nama,
  jenjang: item.jenjang,
  status: nextStatus,
  kuota: item.kuota,
  biaya_pendaftaran: item.biayaPendaftaran,
  deskripsi: item.deskripsi
})

export const buildProgramPaketCreatePayload = (form: {
  nama: string
  deskripsi: string
  status?: boolean
}): ProgramPaketCreatePayload => ({
  nama: form.nama.trim(),
  deskripsi: form.deskripsi.trim(),
  status: form.status ?? true
})

export const buildProgramPaketUpdatePayload = (form: {
  nama: string
  deskripsi: string
  status: boolean
}): ProgramPaketUpdatePayload => ({
  nama: form.nama.trim(),
  deskripsi: form.deskripsi.trim(),
  status: form.status
})

export const useAdminPaketSekolahService = () => {
  const { get, post, put, patch, delete: deleteRequest } = useApi()

  const listPackages = async () => {
    return listProgramPaket()
  }

  const listProgramPaket = async () => {
    const [
      programResponse,
      gelombangResponse
    ] = await Promise.all([
      get<any>(adminApiEndpoints.programPaket.list, { showErrorToast: false }),
      get<any>(adminApiEndpoints.gelombang.list, { showErrorToast: false })
    ])
    const { data, error } = programResponse
    const rows = readArrayPayload(data)

    if (error) {
      return {
        data: [],
        error,
        usingFallback: false
      }
    }

    const gelombangByProgramId = groupGelombangByProgramId(readArrayPayload(gelombangResponse.data))
    const rowsWithGelombang = rows.map((item) => {
      const programId = normalizeNumber(item.id)
      const gelombang = gelombangByProgramId.get(programId)
      return gelombang ? { ...item, gelombang } : item
    })

    return {
      data: rowsWithGelombang.map(mapPackage),
      error: null,
      usingFallback: false
    }
  }

  const savePackage = (payload: PaketSekolahPayload, isEditing: boolean) => {
    return isEditing
      ? put<ApiMutationResponse>(adminApiEndpoints.paketSekolah.list, payload, { showErrorToast: false })
      : post<ApiMutationResponse>(adminApiEndpoints.paketSekolah.list, payload, { showErrorToast: false })
  }

  const updatePackageStatus = (payload: PaketSekolahPayload) => {
    return put<ApiMutationResponse>(adminApiEndpoints.paketSekolah.list, payload, {
      showErrorToast: false
    })
  }

  const createProgramPaket = (payload: ProgramPaketCreatePayload) => {
    return post<ApiMutationResponse & {
      data?: PaketSekolahDto
      result?: PaketSekolahDto
      programPaket?: PaketSekolahDto
    }>(adminApiEndpoints.programPaket.create, payload, { showErrorToast: false })
  }

  const updateProgramPaket = (id: string | number, payload: ProgramPaketUpdatePayload) => {
    return patch<ApiMutationResponse & {
      data?: { id?: number } | PaketSekolahDto
      result?: PaketSekolahDto
      programPaket?: PaketSekolahDto
    }>(adminApiEndpoints.programPaket.update(id), payload, { showErrorToast: false })
  }

  const deleteProgramPaket = (id: string | number) => {
    return deleteRequest<ApiMutationResponse>(adminApiEndpoints.programPaket.delete(id), { showErrorToast: false })
  }

  const deleteProgramPaketGelombang = (id: string | number) => {
    return deleteRequest<ApiMutationResponse>(adminApiEndpoints.gelombang.delete(id), { showErrorToast: false })
  }

  return {
    listPackages,
    listProgramPaket,
    savePackage,
    updatePackageStatus,
    createProgramPaket,
    updateProgramPaket,
    deleteProgramPaket,
    deleteProgramPaketGelombang
  }
}

import { adminApiEndpoints } from '~/services/adminApiEndpoints'
import type { GalleryDto, GalleryFormState, GalleryItem } from '~/types/adminGallery'

const normalizeText = (value: unknown) => String(value || '').trim()

const normalizeBoolean = (value: unknown) => {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value === 1

  const normalized = normalizeText(value).toLowerCase()
  return ['1', 'true', 'ya', 'yes', 'utama'].includes(normalized)
}

const normalizeNumber = (value: unknown) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const readArrayPayload = (payload: any): GalleryDto[] => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.data?.data)) return payload.data.data
  if (Array.isArray(payload?.gallery)) return payload.gallery
  if (Array.isArray(payload?.data?.gallery)) return payload.data.gallery
  return []
}

const normalizeAssetPath = (path: string) => path
  .split('/')
  .map(segment => encodeURIComponent(segment))
  .join('/')

const normalizeAssetUrl = (url: unknown, apiBaseUrl: string) => {
  const rawUrl = normalizeText(url)
  if (!rawUrl) return ''
  if (/^https?:\/\//i.test(rawUrl)) return rawUrl

  const baseUrl = apiBaseUrl.replace(/\/$/, '')
  const path = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`
  return `${baseUrl}${normalizeAssetPath(path)}`
}

const normalizeUploadFileName = (name: string) => {
  const extension = name.includes('.') ? name.split('.').pop()?.toLowerCase() : ''
  const baseName = name
    .replace(/\.[^/.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48) || 'galeri'

  return `${baseName}-${Date.now()}${extension ? `.${extension}` : ''}`
}

export const getAdminGalleryErrorMessage = (error: any, fallback: string) => {
  return error?.data?.message || error?.response?._data?.message || error?.message || fallback
}

export const mapGalleryItem = (item: GalleryDto, apiBaseUrl: string): GalleryItem | null => {
  const id = normalizeText(item.id)
  const nama = normalizeText(item.nama)

  if (!id || !nama) return null

  return {
    id,
    nama,
    deskripsi: normalizeText(item.deskripsi),
    gambar: normalizeAssetUrl(item.gambar, apiBaseUrl),
    isUtama: normalizeBoolean(item.is_utama ?? item.isUtama ?? item.utama),
    urutan: normalizeNumber(item.urutan ?? item.sort_order ?? item.order),
    createdAt: normalizeText(item.created_at),
    updatedAt: normalizeText(item.updated_at)
  }
}

export const buildGalleryFormData = (form: GalleryFormState) => {
  const formData = new FormData()

  formData.append('nama', form.nama.trim())
  formData.append('deskripsi', form.deskripsi.trim())
  formData.append('is_utama', form.isUtama ? '1' : '0')
  formData.append('urutan', String(form.urutan || 0))

  if (form.gambar) {
    formData.append('gambar', form.gambar, normalizeUploadFileName(form.gambar.name))
  }

  return formData
}

export const useAdminGalleryService = () => {
  const config = useRuntimeConfig()
  const { get, post, put, delete: deleteRequest } = useApi()

  const listGallery = async (limit = 100) => {
    const { data, error } = await get<any>(adminApiEndpoints.gallery.list, {
      query: { limit: String(limit) },
      showErrorToast: false
    })

    if (error) {
      return {
        data: [],
        error
      }
    }

    const apiBaseUrl = String(config.public.apiBaseUrl || 'https://api.oirul.com')
    const rows = readArrayPayload(data)
    const mappedRows = rows
      .map(item => mapGalleryItem(item, apiBaseUrl))
      .filter((item): item is GalleryItem => Boolean(item))
      .sort((firstItem, secondItem) => {
        if (firstItem.urutan && secondItem.urutan) return firstItem.urutan - secondItem.urutan
        if (firstItem.urutan) return -1
        if (secondItem.urutan) return 1
        return 0
      })

    return {
      data: mappedRows,
      error: null
    }
  }

  const createGallery = (formData: FormData) => post(adminApiEndpoints.gallery.create, formData, {
    showErrorToast: false
  })

  const updateGallery = (id: string, formData: FormData) => put(adminApiEndpoints.gallery.detail(id), formData, {
    showErrorToast: false
  })

  const deleteGallery = (id: string) => deleteRequest(adminApiEndpoints.gallery.detail(id), {
    showErrorToast: false
  })

  return {
    listGallery,
    createGallery,
    updateGallery,
    deleteGallery
  }
}

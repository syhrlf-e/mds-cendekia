import { publicApiEndpoints } from '~/services/publicApiEndpoints'
import type { GalleryDto, GalleryItem } from '~/types/gallery'

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

const mapPublicGalleryItem = (item: GalleryDto, apiBaseUrl: string): GalleryItem | null => {
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

export const usePublicGalleryService = () => {
  const config = useRuntimeConfig()
  const { get } = useApi()

  const listPublicGallery = async (limit = 12) => {
    const { data, error } = await get<any>(publicApiEndpoints.gallery.list, {
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
      .map(item => mapPublicGalleryItem(item, apiBaseUrl))
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

  return {
    listPublicGallery
  }
}

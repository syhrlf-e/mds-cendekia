import { publicApiEndpoints } from '~/services/publicApiEndpoints'
import type { GalleryDto, GalleryItem } from '~/types/gallery'

const normalizeText = (value: unknown) => String(value || '').trim()

const normalizeBaseUrl = (value: unknown) => String(value || 'https://api.oirul.com').trim().replace(/\/+$/, '')

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
    slug: normalizeText(item.slug),
    isHead: item.is_head,
    order: item.order,
    createdAt: normalizeText(item.created_at),
    updatedAt: normalizeText(item.updated_at)
  }
}

export const usePublicGalleryService = () => {
  const config = useRuntimeConfig()

  const listPublicGallery = async (limit = 12) => {
    try {
      const apiBaseUrl = normalizeBaseUrl(config.public.apiBaseUrl)
      const data = await $fetch<GalleryDto[]>(publicApiEndpoints.gallery.list, {
        baseURL: apiBaseUrl,
        query: { limit: String(limit) },
        retry: 0,
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      const mappedRows = data
        .map(item => mapPublicGalleryItem(item, apiBaseUrl))
        .filter((item): item is GalleryItem => Boolean(item))
        .sort((firstItem, secondItem) => firstItem.order - secondItem.order)

      return {
        data: mappedRows,
        error: null
      }
    } catch (error) {
      return {
        data: [],
        error
      }
    }
  }

  const getPublicGalleryByEndpoint = async (endpoint: string) => {
    try {
      const apiBaseUrl = normalizeBaseUrl(config.public.apiBaseUrl)
      const data = await $fetch<GalleryDto>(endpoint, {
        baseURL: apiBaseUrl,
        retry: 0
      })

      return {
        data: mapPublicGalleryItem(data, apiBaseUrl),
        error: null
      }
    } catch (error) {
      return {
        data: null,
        error
      }
    }
  }

  const getPublicGalleryById = (id: string) =>
    getPublicGalleryByEndpoint(publicApiEndpoints.gallery.detail(id))

  const getPublicGalleryBySlug = (slug: string) =>
    getPublicGalleryByEndpoint(publicApiEndpoints.gallery.detailBySlug(slug))

  return {
    listPublicGallery,
    getPublicGalleryById,
    getPublicGalleryBySlug
  }
}

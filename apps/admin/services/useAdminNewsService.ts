import { adminApiEndpoints } from '~/services/adminApiEndpoints'
import type { AdminNewsDto, AdminNewsItem } from '~/types/adminNews'

const normalizeText = (value: unknown) => String(value || '').trim()

export const generateAdminNewsSlug = (text: string) => text
  .toLowerCase()
  .replace(/[^a-z0-9\s-]/g, '')
  .replace(/\s+/g, '-')
  .replace(/-+/g, '-')
  .trim()

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

const isNewsObject = (value: any): value is AdminNewsDto => {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value) && value.id && value.judul)
}

const readRows = (payload: any): AdminNewsDto[] => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.data?.data)) return payload.data.data
  if (Array.isArray(payload?.berita)) return payload.berita
  if (Array.isArray(payload?.data?.berita)) return payload.data.berita
  if (isNewsObject(payload)) return [payload]
  if (isNewsObject(payload?.data)) return [payload.data]

  return []
}

const mapNewsItem = (item: AdminNewsDto, apiBaseUrl: string): AdminNewsItem | null => {
  const id = normalizeText(item.id)
  const title = normalizeText(item.judul)
  const content = normalizeText(item.isi)

  if (!id || !title) return null

  return {
    id,
    title,
    slug: normalizeText(item.slug) || generateAdminNewsSlug(title),
    excerpt: content.slice(0, 160),
    content,
    category: normalizeText(item.kategori || 'other'),
    tags: normalizeText(item.tags),
    author: normalizeText(item.penulis?.biodata?.nama || item.penulis?.username),
    image: normalizeAssetUrl(item.gambar, apiBaseUrl),
    created_at: normalizeText(item.created_at),
    published: item.published === false || item.status === 'draft' ? false : true,
    is_featured: Boolean(item.is_featured),
    views: Number(item.views || 0)
  }
}

export const getAdminNewsErrorMessage = (error: any, fallback: string) => {
  const responseData = error?.data || error?.response?._data
  const message = responseData?.message || responseData?.error || error?.statusMessage || error?.message

  if (Array.isArray(message)) return message.filter(Boolean).join(', ')
  return normalizeText(message) || fallback
}

export const useAdminNewsService = () => {
  const config = useRuntimeConfig()
  const { get } = useApi()

  const listNews = async (limit = 100) => {
    const { data, error } = await get<AdminNewsDto | AdminNewsDto[]>(adminApiEndpoints.berita.list, {
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
    const rows = readRows(data)

    return {
      data: rows
        .map(item => mapNewsItem(item, apiBaseUrl))
        .filter((item): item is AdminNewsItem => Boolean(item)),
      error: null
    }
  }

  return {
    listNews
  }
}

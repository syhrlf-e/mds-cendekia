import type { AdminNewsItem } from '~/types/adminNews'

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

const readRows = (payload: any): any[] => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.data?.data)) return payload.data.data
  if (Array.isArray(payload?.berita)) return payload.berita
  if (Array.isArray(payload?.data?.berita)) return payload.data.berita

  return []
}

const mapNewsItem = (item: any, apiBaseUrl: string): AdminNewsItem | null => {
  const id = normalizeText(item.id || item.berita_id)
  const title = normalizeText(item.judul || item.title)
  const content = normalizeText(item.isi || item.content || item.excerpt)

  if (!id || !title) return null

  return {
    id,
    title,
    slug: normalizeText(item.slug) || generateAdminNewsSlug(title),
    excerpt: normalizeText(item.excerpt || item.ringkasan) || content.slice(0, 160),
    content,
    category: normalizeText(item.kategori || item.category || 'other'),
    tags: Array.isArray(item.tags) ? item.tags.map(normalizeText).filter(Boolean).join(',') : normalizeText(item.tags),
    author: normalizeText(item.penulis?.biodata?.nama || item.penulis?.username || item.author),
    image: normalizeAssetUrl(item.gambar || item.image || item.imageUrl || item.image_url, apiBaseUrl),
    created_at: normalizeText(item.created_at || item.published_at || item.publish_date),
    published: item.published === false || item.status === 'draft' ? false : true,
    is_featured: Boolean(item.is_featured),
    views: Number(item.views || 0)
  }
}

export const getAdminNewsErrorMessage = (error: any, fallback: string) => {
  return error?.data?.message || error?.response?._data?.message || error?.message || fallback
}

export const useAdminNewsService = () => {
  const config = useRuntimeConfig()
  const { get } = useApi()

  const listNews = async (limit = 100) => {
    const { data, error } = await get<any>('/api/berita/all', {
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
        .map((item: any) => mapNewsItem(item, apiBaseUrl))
        .filter((item): item is AdminNewsItem => Boolean(item)),
      error: null
    }
  }

  return {
    listNews
  }
}

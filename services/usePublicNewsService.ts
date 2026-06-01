import type { NewsDto, PublicNewsItem } from '~/types/news'

export const publicNewsEndpoints = {
  list: '/api/berita/all',
  detail: '/api/berita/all'
} as const

const normalizeText = (value: unknown) => String(value || '').trim()

const stripHtml = (value: unknown) => normalizeText(value).replace(/<[^>]*>/g, ' ')

const buildContent = (item: NewsDto) => normalizeText(item.isi || item.content || item.konten || item.body)

const buildExcerpt = (item: NewsDto) => {
  const rawExcerpt = normalizeText(item.excerpt || item.ringkasan || item.summary || item.deskripsi || item.description)
  const rawContent = stripHtml(buildContent(item))
  const source = rawExcerpt || rawContent

  if (source.length <= 160) return source
  return `${source.slice(0, 157).trim()}...`
}

const buildTags = (value: unknown) => {
  if (Array.isArray(value)) return value.map(normalizeText).filter(Boolean)
  return normalizeText(value)
    .split(',')
    .map(tag => tag.trim())
    .filter(Boolean)
}

const normalizeAssetUrl = (url: unknown, apiBaseUrl: string) => {
  const rawUrl = normalizeText(url)
  if (!rawUrl) return ''
  if (/^https?:\/\//i.test(rawUrl)) return rawUrl
  const baseUrl = apiBaseUrl.replace(/\/$/, '')
  const path = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`
  const normalizedPath = path
    .split('/')
    .map(segment => encodeURIComponent(segment))
    .join('/')

  return `${baseUrl}${normalizedPath}`
}

const readArrayPayload = (payload: any): NewsDto[] => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.data?.data)) return payload.data.data
  if (Array.isArray(payload?.berita)) return payload.berita
  if (Array.isArray(payload?.news)) return payload.news
  if (Array.isArray(payload?.articles)) return payload.articles
  if (Array.isArray(payload?.data?.berita)) return payload.data.berita
  if (Array.isArray(payload?.data?.news)) return payload.data.news
  if (Array.isArray(payload?.data?.articles)) return payload.data.articles
  return []
}

const mapPublicNewsItem = (item: NewsDto, apiBaseUrl: string): PublicNewsItem | null => {
  const id = normalizeText(item.id || item.uuid || item.news_id || item.berita_id)
  const title = normalizeText(item.title || item.judul || item.nama)
  const slug = normalizeText(item.slug)

  if (!id || !title) return null

  return {
    id,
    title,
    slug,
    excerpt: buildExcerpt(item),
    content: buildContent(item),
    category: normalizeText(item.category || item.kategori || item.category_name || item.nama_kategori),
    tags: buildTags(item.tags),
    authorName: normalizeText(item.penulis?.biodata?.nama || item.penulis?.username || item.author || item.penulis),
    publishDate: normalizeText(item.publish_date || item.published_at || item.tanggal_terbit || item.created_at || item.createdAt),
    imageUrl: normalizeAssetUrl(
      item.image_url || item.imageUrl || item.thumbnail_url || item.thumbnail || item.cover_url || item.gambar || item.foto || item.image,
      apiBaseUrl
    )
  }
}

export const usePublicNewsService = () => {
  const config = useRuntimeConfig()
  const { get } = useApi()

  const listPublicNews = async (limit = 4) => {
    const { data, error } = await get<any>(publicNewsEndpoints.list, {
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
      .map(item => mapPublicNewsItem(item, apiBaseUrl))
      .filter((item): item is PublicNewsItem => Boolean(item))

    return {
      data: mappedRows,
      error: null
    }
  }

  const getPublicNewsDetail = async (id: string) => {
    const { data, error } = await get<any>(publicNewsEndpoints.detail, {
      query: { limit: '100' },
      showErrorToast: false
    })

    if (error) {
      return {
        data: null,
        error
      }
    }

    const apiBaseUrl = String(config.public.apiBaseUrl || 'https://api.oirul.com')
    const rows = readArrayPayload(data)
    const found = rows.find((item) => normalizeText(item.id || item.uuid || item.news_id || item.berita_id) === id)
    const mappedItem = found ? mapPublicNewsItem(found, apiBaseUrl) : null

    return {
      data: mappedItem,
      error: null
    }
  }

  return {
    listPublicNews,
    getPublicNewsDetail
  }
}

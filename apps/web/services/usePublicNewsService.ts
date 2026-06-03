import type { NewsDto, PublicNewsItem } from '~/types/news'
import { publicApiEndpoints } from '~/services/publicApiEndpoints'

const normalizeText = (value: unknown) => String(value || '').trim()

const normalizeIdentifier = (value: unknown) => normalizeText(value).toLowerCase()

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

  const listPublicNews = async (limit = 4) => {
    try {
      const data = await $fetch<any>(publicApiEndpoints.berita.list, {
        query: { limit: String(limit) }
      })
      const apiBaseUrl = String(config.public.apiBaseUrl || 'https://api.oirul.com')
      const rows = readArrayPayload(data)
      const mappedRows = rows
        .map(item => mapPublicNewsItem(item, apiBaseUrl))
        .filter((item): item is PublicNewsItem => Boolean(item))

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

  const getPublicNewsDetail = async (identifier: string) => {
    try {
      const data = await $fetch<any>(publicApiEndpoints.berita.detail, {
        query: { limit: '100' }
      })
      const apiBaseUrl = String(config.public.apiBaseUrl || 'https://api.oirul.com')
      const rows = readArrayPayload(data)
      const normalizedIdentifier = normalizeIdentifier(identifier)
      const found = rows.find((item) => {
        const candidates = [
          item.slug,
          item.id,
          item.uuid,
          item.news_id,
          item.berita_id
        ]

        return candidates.some(candidate => normalizeIdentifier(candidate) === normalizedIdentifier)
      })
      const mappedItem = found ? mapPublicNewsItem(found, apiBaseUrl) : null

      return {
        data: mappedItem,
        error: null
      }
    } catch (error) {
      return {
        data: null,
        error
      }
    }
  }

  return {
    listPublicNews,
    getPublicNewsDetail
  }
}

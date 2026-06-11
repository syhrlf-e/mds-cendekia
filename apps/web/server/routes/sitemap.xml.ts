import { defineEventHandler, getRequestURL, setHeader } from 'h3'

type NewsSitemapItem = {
  id?: string | number
  uuid?: string | number
  news_id?: string | number
  berita_id?: string | number
  slug?: string
  updated_at?: string
  updatedAt?: string
  publish_date?: string
  published_at?: string
  tanggal_terbit?: string
  created_at?: string
  createdAt?: string
}

const staticRoutes = [
  { loc: '/', changefreq: 'weekly', priority: '1.0' },
  { loc: '/profil-sekolah', changefreq: 'monthly', priority: '0.8' },
  { loc: '/ppdb', changefreq: 'weekly', priority: '0.9' }
]

const normalizeText = (value: unknown) => String(value || '').trim()

const normalizeSiteUrl = (siteUrl: unknown) => normalizeText(siteUrl).replace(/\/+$/, '')

const joinUrl = (siteUrl: string, path: string) => `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`

const escapeXml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;')

const normalizeDate = (value: unknown) => {
  const rawValue = normalizeText(value)
  if (!rawValue) return ''

  const date = new Date(rawValue)
  if (Number.isNaN(date.getTime())) return ''

  return date.toISOString()
}

const readArrayPayload = (payload: any): NewsSitemapItem[] => {
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

const buildUrlEntry = (siteUrl: string, path: string, changefreq: string, priority: string, lastmod = '') => {
  const lastmodEntry = lastmod ? `\n    <lastmod>${escapeXml(lastmod)}</lastmod>` : ''

  return [
    '  <url>',
    `    <loc>${escapeXml(joinUrl(siteUrl, path))}</loc>${lastmodEntry}`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>'
  ].join('\n')
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const siteUrl = normalizeSiteUrl(config.public.siteUrl) || normalizeSiteUrl(getRequestURL(event).origin)
  const apiBaseUrl = normalizeSiteUrl(config.public.apiBaseUrl)
  const urls = staticRoutes.map(route => buildUrlEntry(siteUrl, route.loc, route.changefreq, route.priority))
  const newsPaths = new Set<string>()

  try {
    if (!apiBaseUrl) {
      throw new Error('NUXT_PUBLIC_API_BASE_URL belum dikonfigurasi.')
    }

    const payload = await $fetch<any>(`${apiBaseUrl}/api/berita/all`, {
      query: { limit: '100' },
      retry: 0,
      timeout: 5000
    })

    for (const item of readArrayPayload(payload)) {
      const id = normalizeText(item.slug || item.id || item.uuid || item.news_id || item.berita_id)
      if (!id) continue
      const newsPath = `/berita/${encodeURIComponent(id)}`
      if (newsPaths.has(newsPath)) continue

      newsPaths.add(newsPath)

      urls.push(buildUrlEntry(
        siteUrl,
        newsPath,
        'monthly',
        '0.7',
        normalizeDate(item.updated_at || item.updatedAt || item.publish_date || item.published_at || item.tanggal_terbit || item.created_at || item.createdAt)
      ))
    }
  } catch {
    // Keep the sitemap available even when the news API is temporarily unreachable.
  }

  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
    ''
  ].join('\n')
})

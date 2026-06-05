import { defineEventHandler, getRequestURL, setHeader, type H3Event } from 'h3'

const normalizeSiteUrl = (siteUrl: unknown) => String(siteUrl || '').trim().replace(/\/+$/, '')

const getSiteUrl = (event: H3Event) => {
  const config = useRuntimeConfig(event)
  return normalizeSiteUrl(config.public.siteUrl) || normalizeSiteUrl(getRequestURL(event).origin)
}

export default defineEventHandler((event) => {
  const siteUrl = getSiteUrl(event)

  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')

  return [
    'User-Agent: *',
    'Disallow: /ppdb/verifikasi',
    'Disallow: /ppdb/verifikasi/',
    'Disallow: /ppdb/daftar',
    'Disallow: /ppdb/daftar/',
    'Disallow: /ppdb/cek-status',
    'Disallow: /ppdb/kartu-peserta',
    'Disallow: /ppdb/revisi-berkas',
    'Disallow: /ppdb/revisi-berkas/',
    '',
    `Sitemap: ${siteUrl}/sitemap.xml`,
    ''
  ].join('\n')
})

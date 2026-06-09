const normalizeSiteUrl = (siteUrl: unknown) => {
  const value = String(siteUrl || '').trim()
  if (!value) return ''
  return value.replace(/\/+$/, '')
}

const buildAbsoluteUrl = (siteUrl: string, path: string) => {
  if (!siteUrl) return ''
  if (/^https?:\/\//i.test(path)) return path

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${siteUrl}${normalizedPath}`
}

const noindexRoutes = [
  '/admin',
  '/ppdb/verifikasi',
  '/ppdb/verify-email',
  '/ppdb/verify',
  '/ppdb/daftar',
  '/ppdb/cek-status',
  '/ppdb/kartu-peserta',
  '/ppdb/revisi-berkas'
]

const shouldNoindex = (path: string) => noindexRoutes.some((routePath) => {
  if (path === routePath) return true
  return path.startsWith(`${routePath}/`)
})

export default defineNuxtPlugin(() => {
  const route = useRoute()
  const config = useRuntimeConfig()

  useHead(() => {
    const siteUrl = normalizeSiteUrl(config.public.siteUrl)
    const siteName = String(config.public.siteName || 'MDS Cendekia')
    const siteDescription = String(config.public.siteDescription || '')
    const siteImage = String(config.public.siteImage || '/images/logo-mds-main.png')
    const canonicalUrl = buildAbsoluteUrl(siteUrl, route.path || '/')
    const absoluteImageUrl = buildAbsoluteUrl(siteUrl, siteImage)

    const meta = [
      { property: 'og:site_name', content: siteName },
      { property: 'og:locale', content: 'id_ID' },
      { property: 'og:type', content: 'website' },
      { property: 'og:description', content: siteDescription },
      {
        name: 'robots',
        content: shouldNoindex(route.path) ? 'noindex, nofollow, noarchive' : 'index, follow'
      },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:description', content: siteDescription }
    ]

    if (canonicalUrl) {
      meta.push(
        { property: 'og:url', content: canonicalUrl },
        { name: 'twitter:url', content: canonicalUrl }
      )
    }

    if (absoluteImageUrl) {
      meta.push(
        { property: 'og:image', content: absoluteImageUrl },
        { name: 'twitter:image', content: absoluteImageUrl }
      )
    }

    return {
      link: canonicalUrl ? [{ rel: 'canonical', href: canonicalUrl }] : [],
      meta
    }
  })
})

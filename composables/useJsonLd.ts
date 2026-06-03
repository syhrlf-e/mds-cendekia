import { toValue, type MaybeRefOrGetter } from 'vue'

type JsonLdValue = Record<string, unknown> | Record<string, unknown>[] | null | undefined
type BreadcrumbJsonLdItem = {
  name: string
  path?: string
  url?: string
}

const normalizeSiteUrl = (siteUrl: unknown) => {
  const value = String(siteUrl || '').trim()
  if (!value) return ''
  return value.replace(/\/+$/, '')
}

const safeJsonStringify = (value: JsonLdValue) => {
  if (!value) return ''
  return JSON.stringify(value).replace(/</g, '\\u003c')
}

export const useAbsoluteSiteUrl = (path: string) => {
  const config = useRuntimeConfig()
  const siteUrl = normalizeSiteUrl(config.public.siteUrl)

  if (!siteUrl) return ''
  if (/^https?:\/\//i.test(path)) return path

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${siteUrl}${normalizedPath}`
}

export const useJsonLd = (schema: MaybeRefOrGetter<JsonLdValue>) => {
  useHead(() => {
    const json = safeJsonStringify(toValue(schema))

    return json
      ? {
          script: [
            {
              type: 'application/ld+json',
              children: json
            }
          ]
        }
      : {}
  })
}

export const useMdsOrganizationJsonLd = () => {
  const config = useRuntimeConfig()
  const siteUrl = useAbsoluteSiteUrl('/')
  const logoUrl = useAbsoluteSiteUrl('/images/logo-mds-main.png')

  const organization: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': ['EducationalOrganization', 'School'],
    '@id': siteUrl ? `${siteUrl}#school` : '#school',
    name: String(config.public.siteName || 'MDS Cendekia'),
    alternateName: 'Yayasan Mukti Daris Sasmita Cendekia',
    description: String(config.public.siteDescription || ''),
    inLanguage: 'id-ID',
    educationalCredentialAwarded: 'Ijazah pendidikan kesetaraan',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Perum Bumi Gesya Cikarang, Desa Jayasampurna',
      addressLocality: 'Serang Baru',
      addressRegion: 'Jawa Barat',
      postalCode: '17330',
      addressCountry: 'ID'
    },
    areaServed: [
      'Kabupaten Bekasi',
      'Jawa Barat',
      'Indonesia'
    ],
    knowsAbout: [
      'Pendidikan kesetaraan',
      'Kejar Paket C',
      'PPDB',
      'Pendidikan inklusif'
    ],
    sameAs: []
  }

  if (siteUrl) organization.url = siteUrl
  if (logoUrl) {
    organization.logo = logoUrl
    organization.image = logoUrl
  }

  useJsonLd(organization)
}

export const useWebsiteJsonLd = () => {
  const config = useRuntimeConfig()
  const siteUrl = useAbsoluteSiteUrl('/')

  if (!siteUrl) return

  useJsonLd({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}#website`,
    name: String(config.public.siteName || 'MDS Cendekia'),
    url: siteUrl,
    description: String(config.public.siteDescription || ''),
    inLanguage: 'id-ID',
    publisher: {
      '@id': `${siteUrl}#school`
    }
  })
}

export const useBreadcrumbJsonLd = (items: MaybeRefOrGetter<BreadcrumbJsonLdItem[]>) => {
  const siteUrl = useAbsoluteSiteUrl('/')
  const siteBaseUrl = siteUrl.replace(/\/$/, '')

  useJsonLd(() => {
    if (!siteBaseUrl) return null

    const itemListElement = toValue(items)
      .filter(item => item.name && (item.path || item.url))
      .map((item, index) => {
        const itemUrl = item.url || `${siteBaseUrl}${item.path?.startsWith('/') ? item.path : `/${item.path}`}`

        return {
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: itemUrl
        }
      })

    if (itemListElement.length < 2) return null

    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement
    }
  })
}

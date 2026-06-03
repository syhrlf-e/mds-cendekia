import { toValue, type MaybeRefOrGetter } from 'vue'

type JsonLdValue = Record<string, unknown> | Record<string, unknown>[] | null | undefined

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

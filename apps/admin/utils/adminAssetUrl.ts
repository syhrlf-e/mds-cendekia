type AdminAssetUrlOptions = {
  apiBaseUrl: string
  allowedOrigins?: string
  allowBlob?: boolean
}

const readUrl = (value: unknown) => String(value || '').trim()

const readOrigin = (value: string) => {
  try {
    return new URL(value).origin
  } catch {
    return ''
  }
}

const getAllowedOrigins = (apiBaseUrl: string, configuredOrigins = '') => {
  const origins = new Set<string>()
  const apiOrigin = readOrigin(apiBaseUrl)
  if (apiOrigin) origins.add(apiOrigin)

  for (const value of configuredOrigins.split(',')) {
    const origin = readOrigin(value.trim())
    if (origin) origins.add(origin)
  }

  return origins
}

export const resolveAllowedAdminAssetUrl = (
  value: unknown,
  { apiBaseUrl, allowedOrigins = '', allowBlob = false }: AdminAssetUrlOptions
) => {
  const rawUrl = readUrl(value)
  if (!rawUrl) return ''
  if (allowBlob && rawUrl.startsWith('blob:')) return rawUrl

  try {
    const baseUrl = new URL(apiBaseUrl)
    const assetUrl = new URL(rawUrl, `${baseUrl.origin}/`)
    const allowed = getAllowedOrigins(apiBaseUrl, allowedOrigins)
    const usesAllowedProtocol = assetUrl.protocol === 'https:' || assetUrl.origin === baseUrl.origin

    if (!usesAllowedProtocol || !allowed.has(assetUrl.origin)) return ''

    return assetUrl.toString()
  } catch {
    return ''
  }
}

import { getQuery, setHeader } from 'h3'

const normalizeBaseUrl = (value: unknown) => String(value || '').trim().replace(/\/+$/, '')

const normalizeLimit = (value: unknown, fallback = '12') => {
  const limit = Number(Array.isArray(value) ? value[0] : value)
  if (!Number.isFinite(limit)) return fallback

  return String(Math.min(Math.max(Math.trunc(limit), 1), 100))
}

export default defineCachedEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const query = getQuery(event)
  const apiBaseUrl = normalizeBaseUrl(config.public.apiBaseUrl || 'https://api.oirul.com')
  const limit = normalizeLimit(query.limit)

  setHeader(event, 'Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600')

  return await $fetch(`${apiBaseUrl}/api/gallery/all`, {
    query: { limit },
    retry: 0,
    timeout: 5000
  })
}, {
  maxAge: 300,
  swr: true,
  group: 'public-api',
  name: 'gallery',
  getKey: event => `limit:${normalizeLimit(getQuery(event).limit)}`
})

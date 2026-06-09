const proxyRoutes = {
  'email/request-verification': {
    method: 'POST',
    path: '/auth/email/request-verification'
  },
  'email/verify': {
    method: 'POST',
    path: '/auth/email/verify'
  },
  'email/session': {
    method: 'GET',
    path: '/auth/email/session'
  },
  'email/polling': {
    method: 'POST',
    path: '/auth/email/verify/polling'
  },
  'register/siswa': {
    method: 'POST',
    path: '/register/siswa'
  },
  'register/berkas': {
    method: 'POST',
    path: '/register/berkas'
  },
  'register/cek-status': {
    method: 'POST',
    path: '/register/cek-status'
  }
} as const

export default defineEventHandler(async (event) => {
  const routePath = getRouterParam(event, 'path') || ''
  const targetRoute = proxyRoutes[routePath as keyof typeof proxyRoutes]

  if (!targetRoute) {
    throw createError({
      statusCode: 404,
      statusMessage: 'PPDB endpoint tidak ditemukan.'
    })
  }

  if (event.method !== targetRoute.method) {
    throw createError({
      statusCode: 405,
      statusMessage: 'Metode request tidak diizinkan.'
    })
  }

  const config = useRuntimeConfig(event)
  const apiBaseUrl = String(config.apiBaseUrl || 'https://api.oirul.com').replace(/\/+$/, '')

  setResponseHeader(event, 'Cache-Control', 'no-store')

  return proxyRequest(event, `${apiBaseUrl}${targetRoute.path}`, {
    cookieDomainRewrite: { '*': '' },
    cookiePathRewrite: '/',
    onResponse: (proxyEvent) => {
      if (!import.meta.dev) return

      const setCookieHeader = getResponseHeader(proxyEvent, 'set-cookie')
      if (!setCookieHeader) return

      const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [String(setCookieHeader)]
      setResponseHeader(
        proxyEvent,
        'set-cookie',
        cookies.map(cookie => cookie.replace(/;\s*Secure/gi, ''))
      )
    }
  })
})

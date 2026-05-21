import { setResponseStatus } from 'h3'
import type { H3Event } from 'h3'

export const getUpstreamApiBase = () => {
  const config = useRuntimeConfig()
  return String(config.public.apiBaseUrl || 'https://cendekia.sekata.my.id').replace(/\/$/, '')
}

export const proxyUpstreamError = (event: H3Event, error: any) => {
  const status = error?.response?.status || error?.statusCode || 500
  setResponseStatus(event, status)

  return error?.response?._data || error?.data || {
    success: false,
    message: status >= 500
      ? 'Server pendaftaran sedang mengalami kendala.'
      : 'Permintaan pendaftaran gagal diproses.'
  }
}

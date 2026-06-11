import { navigateTo, useRequestHeaders, useRoute, useRuntimeConfig } from '#app'
import { useAdminSession } from './useAdminSession'
import { useToast } from './useToast'

let isHandlingUnauthorized = false

export const useApi = () => {
  const config = useRuntimeConfig()
  const { addToast } = useToast()
  const { clearAdminSession } = useAdminSession()

  const normalizeBaseUrl = (url: unknown) => {
    const rawUrl = String(url || '').trim()
    const markdownUrlMatch = rawUrl.match(/\((https?:\/\/[^)]+)\)/)

    const normalizedUrl = markdownUrlMatch?.[1] || rawUrl

    if (!normalizedUrl) {
      throw new Error('NUXT_PUBLIC_API_BASE_URL belum dikonfigurasi.')
    }

    return normalizedUrl.replace(/\/+$/, '')
  }

  const baseURL = normalizeBaseUrl(config.public.apiBaseUrl)
  const defaultTimeout = Number(config.public.apiTimeoutMs || 15000)

  const handleUnauthorizedResponse = async (showErrorToast: boolean) => {
    if (isHandlingUnauthorized) return

    isHandlingUnauthorized = true

    try {
      clearAdminSession()

      if (showErrorToast) {
        addToast('Sesi telah habis. Silakan login kembali.', 'error')
      }

      const route = useRoute()
      if (route.path !== '/login') {
        await navigateTo('/login', { replace: true })
      }
    } finally {
      isHandlingUnauthorized = false
    }
  }

  const customFetch = async <T>(endpoint: string, options: any = {}) => {
    const { showErrorToast = true, handleUnauthorized = true, ...fetchOptions } = options
    const reqHeaders = import.meta.server ? useRequestHeaders(['cookie']) : {}

    const headers = {
      ...reqHeaders,
      ...fetchOptions.headers
    }

    try {
      const response = await $fetch<T>(endpoint, {
        baseURL,
        credentials: 'include',
        timeout: defaultTimeout,
        ...fetchOptions,
        headers,
        async onResponseError({ response }) {
          if (!import.meta.client) return

          if (response.status === 401 && handleUnauthorized) {
            await handleUnauthorizedResponse(showErrorToast)
            return
          }

          if (showErrorToast) {
            const errorMsg = response._data?.message || response.statusText || 'Terjadi kesalahan pada server.'
            addToast(errorMsg, 'error')
          }
        }
      })

      return { data: response, error: null }
    } catch (err: any) {
      return { data: null, error: err }
    }
  }

  return {
    get: <T>(url: string, opts = {}) => customFetch<T>(url, { method: 'GET', ...opts }),
    post: <T>(url: string, body?: any, opts = {}) => customFetch<T>(url, { method: 'POST', body, ...opts }),
    put: <T>(url: string, body?: any, opts = {}) => customFetch<T>(url, { method: 'PUT', body, ...opts }),
    patch: <T>(url: string, body?: any, opts = {}) => customFetch<T>(url, { method: 'PATCH', body, ...opts }),
    delete: <T>(url: string, opts = {}) => customFetch<T>(url, { method: 'DELETE', ...opts })
  }
}

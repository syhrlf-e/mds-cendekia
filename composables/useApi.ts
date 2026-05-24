import { useRuntimeConfig, useRequestHeaders } from '#app'
import { useToast } from './useToast'
import { getAdminMockResponse, shouldUseAdminMockFallback } from './useAdminMockApi'

export const useApi = () => {
  const config = useRuntimeConfig()
  const { addToast } = useToast()

  const normalizeBaseUrl = (url: unknown) => {
    const rawUrl = String(url || '').trim()
    const markdownUrlMatch = rawUrl.match(/\((https?:\/\/[^)]+)\)/)

    return markdownUrlMatch?.[1] || rawUrl || 'https://cendekia.sekata.my.id'
  }

  const baseURL = normalizeBaseUrl(config.public.apiBaseUrl)
  const defaultTimeout = Number(config.public.apiTimeoutMs || 15000)

  const customFetch = async <T>(endpoint: string, options: any = {}) => {
    const { showErrorToast = true, ...fetchOptions } = options
    const reqHeaders = import.meta.server ? useRequestHeaders(['cookie']) : {}
    const method = String(fetchOptions.method || 'GET').toUpperCase() as 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

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
        onResponseError({ response }) {
          const willUseMock = response.status >= 500 && shouldUseAdminMockFallback(endpoint, { response })

          if (import.meta.client && showErrorToast && !willUseMock) {
            const errorMsg = response._data?.message || response.statusText || 'Terjadi kesalahan pada server.'

            if (response.status === 401) {
              addToast('Sesi telah habis. Silakan login kembali.', 'error')
            } else {
              addToast(errorMsg, 'error')
            }
          }
        }
      })

      return { data: response, error: null }
    } catch (err: any) {
      if (shouldUseAdminMockFallback(endpoint, err)) {
        const mockResponse = getAdminMockResponse<T>(endpoint, method, fetchOptions.body)

        if (mockResponse) {
          return { data: mockResponse, error: null }
        }
      }

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

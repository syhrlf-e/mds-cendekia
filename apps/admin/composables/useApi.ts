import { navigateTo, useCookie, useRequestHeaders, useRoute, useRuntimeConfig, useState } from '#app'
import { useToast } from './useToast'

let isHandlingUnauthorized = false

export const useApi = () => {
  const config = useRuntimeConfig()
  const { addToast } = useToast()

  const normalizeBaseUrl = (url: unknown) => {
    const rawUrl = String(url || '').trim()
    const markdownUrlMatch = rawUrl.match(/\((https?:\/\/[^)]+)\)/)

    return markdownUrlMatch?.[1] || rawUrl || 'https://api.oirul.com'
  }

  const baseURL = normalizeBaseUrl(config.public.apiBaseUrl)
  const defaultTimeout = Number(config.public.apiTimeoutMs || 15000)

  const clearLocalSession = () => {
    const legacyAdminToken = useCookie('admin_token')
    const localCendekiaToken = useCookie('cendekia_token')
    legacyAdminToken.value = null
    localCendekiaToken.value = null

    useState('admin-cache:pendaftar', () => []).value = []
    useState('admin-cache:pendaftar-loaded-at', () => 0).value = 0
    useState('admin-cache:pendaftar-error', () => '').value = ''
    useState('admin-cache:students', () => []).value = []
    useState('admin-cache:students-loaded-at', () => 0).value = 0
    useState('admin-cache:students-error', () => '').value = ''
    useState<number | null>('admin-auth:id', () => null).value = null
  }

  const handleUnauthorizedResponse = async (showErrorToast: boolean) => {
    if (isHandlingUnauthorized) return

    isHandlingUnauthorized = true

    try {
      clearLocalSession()

      if (showErrorToast) {
        addToast('Sesi telah habis. Silakan login kembali.', 'error')
      }

      const route = useRoute()
      if (route.path !== '/login') {
        await navigateTo('/login')
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

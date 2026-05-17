import { useRuntimeConfig, useCookie } from '#app'
import { useToast } from './useToast'

export const useApi = () => {
  const config = useRuntimeConfig()
  const { addToast } = useToast()
  
  // Base URL from Nuxt config or fallback to PRD definition
  const baseURL = config.public.apiBaseUrl || 'https://cendekia.sekata.my.id/api'

  const customFetch = async <T>(endpoint: string, options: any = {}) => {
    const adminToken = useCookie('admin_token')
    
    const headers = {
      ...options.headers,
      ...(adminToken.value ? { Authorization: `Bearer ${adminToken.value}` } : {})
    }

    try {
      const response = await $fetch<T>(endpoint, {
        baseURL,
        ...options,
        headers,
        onResponseError({ response }) {
          // Handle global error responses
          const errorMsg = response._data?.message || response.statusText || 'Terjadi kesalahan pada server.'
          
          if (response.status === 401) {
            addToast('Sesi telah habis. Silakan login kembali.', 'error')
            adminToken.value = null
            // Optional: redirect to login
          } else {
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

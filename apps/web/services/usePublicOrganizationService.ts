import { publicApiEndpoints } from '~/services/publicApiEndpoints'
import type { OrganizationDto, PublicOrganizationMember } from '~/types/organization'

const normalizeText = (value: unknown) => String(value || '').trim()

const normalizeBaseUrl = (value: unknown) => {
  const baseUrl = normalizeText(value).replace(/\/+$/, '')

  if (!baseUrl) {
    throw new Error('NUXT_PUBLIC_API_BASE_URL belum dikonfigurasi.')
  }

  return baseUrl
}

const normalizeAssetPath = (path: string) => path
  .split('/')
  .map(segment => encodeURIComponent(segment))
  .join('/')

const normalizeAssetUrl = (url: unknown, apiBaseUrl: string) => {
  const rawUrl = normalizeText(url)
  if (!rawUrl) return ''
  if (/^https?:\/\//i.test(rawUrl)) return rawUrl

  const baseUrl = apiBaseUrl.replace(/\/$/, '')
  const path = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`
  return `${baseUrl}${normalizeAssetPath(path)}`
}

const readOrganizationRows = (payload: any): OrganizationDto[] => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.data?.data)) return payload.data.data
  if (payload?.data && typeof payload.data === 'object' && payload.data.id) return [payload.data]
  if (payload && typeof payload === 'object' && payload.id) return [payload]
  return []
}

const mapOrganizationMember = (item: OrganizationDto, apiBaseUrl: string): PublicOrganizationMember | null => {
  const id = Number(item.id)
  const nama = normalizeText(item.nama)
  const jabatan = normalizeText(item.jabatan)

  if (!id || !nama || !jabatan) return null

  return {
    id,
    nama,
    jabatan,
    gambar: normalizeAssetUrl(item.gambar, apiBaseUrl),
    sambutan: normalizeText(item.sambutan),
    joinAt: normalizeText(item.join_at)
  }
}

export const usePublicOrganizationService = () => {
  const config = useRuntimeConfig()

  const listPublicOrganization = async () => {
    try {
      const apiBaseUrl = normalizeBaseUrl(config.public.apiBaseUrl)
      const data = await $fetch<any>(publicApiEndpoints.organization.list, {
        baseURL: apiBaseUrl,
        retry: 0,
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })

      return {
        data: readOrganizationRows(data)
          .map(item => mapOrganizationMember(item, apiBaseUrl))
          .filter((item): item is PublicOrganizationMember => Boolean(item)),
        error: null
      }
    } catch (error) {
      return {
        data: [],
        error
      }
    }
  }

  return {
    listPublicOrganization
  }
}

import { adminApiEndpoints } from '~/services/adminApiEndpoints'
import type {
  CreateGalleryResponse,
  GalleryDto,
  GalleryFormState,
  GalleryItem,
  GalleryMutationResponse
} from '~/types/adminGallery'
import { resolveAllowedAdminAssetUrl } from '~/utils/adminAssetUrl'

const normalizeText = (value: unknown) => String(value || '').trim()

const normalizeUploadFileName = (name: string) => {
  const extension = name.includes('.') ? name.split('.').pop()?.toLowerCase() : ''
  const baseName = name
    .replace(/\.[^/.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48) || 'galeri'

  return `${baseName}-${Date.now()}${extension ? `.${extension}` : ''}`
}

export const getAdminGalleryErrorMessage = (error: any, fallback: string) => {
  const status = Number(error?.response?.status || error?.statusCode || error?.status || 0)
  const responseData = error?.data || error?.response?._data
  const responseMessage = responseData?.message || responseData?.error

  if (status === 400) {
    const message = Array.isArray(responseMessage)
      ? responseMessage.filter(Boolean).join(', ')
      : normalizeText(responseMessage)

    return message || 'Data galeri belum valid. Periksa kembali isian dan gambar.'
  }

  if (status === 401) return 'Sesi admin tidak valid atau sudah berakhir. Silakan login kembali.'
  if (status === 403) return 'Akun ini tidak memiliki izin untuk mengelola galeri.'
  if (status === 413) return 'Ukuran gambar melebihi batas yang diterima server.'
  if (status === 415) return 'Format gambar tidak didukung server.'
  if (status >= 500) return 'Layanan galeri sedang bermasalah di server. Silakan coba kembali setelah backend diperbaiki.'

  return normalizeText(responseMessage || error?.statusMessage || error?.message) || fallback
}

export const mapGalleryItem = (item: GalleryDto, apiBaseUrl: string, allowedOrigins = ''): GalleryItem | null => {
  const id = normalizeText(item.id)
  const nama = normalizeText(item.nama)

  if (!id || !nama) return null

  return {
    id,
    nama,
    deskripsi: normalizeText(item.deskripsi),
    gambar: resolveAllowedAdminAssetUrl(item.gambar, { apiBaseUrl, allowedOrigins }),
    slug: normalizeText(item.slug),
    isHead: item.is_head,
    order: item.order,
    createdAt: normalizeText(item.created_at),
    updatedAt: normalizeText(item.updated_at)
  }
}

export const buildGalleryFormData = (form: GalleryFormState) => {
  const formData = new FormData()

  formData.append('nama', form.nama.trim())
  formData.append('deskripsi', form.deskripsi.trim())

  if (form.gambar) {
    formData.append('gambar', form.gambar, normalizeUploadFileName(form.gambar.name))
  }

  return formData
}

export const useAdminGalleryService = () => {
  const config = useRuntimeConfig()
  const { get, post, patch, delete: deleteRequest } = useApi()
  const apiBaseUrl = String(config.public.apiBaseUrl || 'https://api.oirul.com')
  const allowedOrigins = String(config.public.assetAllowedOrigins || '')

  const mapDetailResponse = (payload: GalleryDto) =>
    mapGalleryItem(payload, apiBaseUrl, allowedOrigins)

  const listGallery = async (limit = 100) => {
    const { data, error } = await get<GalleryDto[]>(adminApiEndpoints.gallery.list, {
      query: { limit: String(limit) },
      retry: 0,
      showErrorToast: false
    })

    if (error) {
      return {
        data: [],
        error
      }
    }

    const mappedRows = (data || [])
      .map(item => mapGalleryItem(item, apiBaseUrl, allowedOrigins))
      .filter((item): item is GalleryItem => Boolean(item))
      .sort((firstItem, secondItem) => firstItem.order - secondItem.order)

    return {
      data: mappedRows,
      error: null
    }
  }

  const createGallery = (formData: FormData) => post<CreateGalleryResponse>(adminApiEndpoints.gallery.create, formData, {
    showErrorToast: false
  })

  const getGalleryById = async (id: string) => {
    const { data, error } = await get<GalleryDto>(adminApiEndpoints.gallery.detail(id), {
      showErrorToast: false
    })

    return {
      data: data ? mapDetailResponse(data) : null,
      error
    }
  }

  const getGalleryBySlug = async (slug: string) => {
    const { data, error } = await get<GalleryDto>(adminApiEndpoints.gallery.detailBySlug(slug), {
      showErrorToast: false
    })

    return {
      data: data ? mapDetailResponse(data) : null,
      error
    }
  }

  const updateGallery = (id: string, formData: FormData) => patch<GalleryMutationResponse>(adminApiEndpoints.gallery.detail(id), formData, {
    showErrorToast: false
  })

  const deleteGallery = (id: string) => deleteRequest<GalleryMutationResponse>(adminApiEndpoints.gallery.detail(id), {
    showErrorToast: false
  })

  return {
    listGallery,
    getGalleryById,
    getGalleryBySlug,
    createGallery,
    updateGallery,
    deleteGallery
  }
}

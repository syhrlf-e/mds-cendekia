import type { OrganizationMember, OrganizationCreatePayload, OrganizationUpdatePayload } from '~/types/adminOrganization'
import { adminApiEndpoints } from './adminApiEndpoints'

const BASE_URL = 'https://api.mdscendekia.my.id'

type ApiResponse<T> = {
  data: T
  error: any
}

export const useAdminOrganizationService = () => {
  const { get, post, patch, delete: del } = useApi()

  const toApiDateTime = (value: string) => {
    if (!value) return value
    if (value.includes('T') || value.includes(' ')) return value
    return `${value} 00:00:00.000`
  }

  const getAllOrganization = async (): Promise<ApiResponse<OrganizationMember[]>> => {
    const { data, error } = await get<{ success: boolean; data: OrganizationMember[] }>(
      adminApiEndpoints.organization.list
    )
    return { data: data?.data ?? [], error }
  }

  const getOrganizationById = async (id: number): Promise<ApiResponse<OrganizationMember | null>> => {
    const { data, error } = await get<{ success: boolean; data: OrganizationMember[] }>(
      adminApiEndpoints.organization.detail(id)
    )
    return { data: data?.data?.[0] ?? null, error }
  }

  const createOrganization = async (payload: OrganizationCreatePayload): Promise<ApiResponse<any>> => {
    const formData = new FormData()
    formData.append('nama', payload.nama)
    formData.append('jabatan', payload.jabatan)
    formData.append('sambutan', payload.sambutan)
    formData.append('join_at', toApiDateTime(payload.join_at))
    if (payload.gambar) formData.append('gambar', payload.gambar)

    const { data, error } = await post<{ success: boolean; data: any; message?: string }>(
      adminApiEndpoints.organization.create,
      formData
    )
    return { data, error }
  }

  const updateOrganization = async (id: number, payload: OrganizationUpdatePayload): Promise<ApiResponse<any>> => {
    const formData = new FormData()
    if (payload.nama !== undefined) formData.append('nama', payload.nama)
    if (payload.jabatan !== undefined) formData.append('jabatan', payload.jabatan)
    if (payload.sambutan !== undefined) formData.append('sambutan', payload.sambutan)
    if (payload.gambar) formData.append('gambar', payload.gambar)

    const { data, error } = await patch<{ success: boolean; data: any; message?: string }>(
      adminApiEndpoints.organization.update(id),
      formData
    )
    return { data, error }
  }

  const deleteOrganization = async (id: number): Promise<ApiResponse<any>> => {
    const { data, error } = await del<{ success: boolean; message?: string }>(
      adminApiEndpoints.organization.delete(id)
    )
    return { data, error }
  }

  return {
    getAllOrganization,
    getOrganizationById,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    BASE_URL
  }
}

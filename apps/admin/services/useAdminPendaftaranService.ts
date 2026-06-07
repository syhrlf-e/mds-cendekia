import { mapPendaftarList } from '~/mappers/adminPendaftarMapper'
import { adminApiEndpoints } from '~/services/adminApiEndpoints'
import type { AdminPendaftarListResponse, ApiMutationResponse } from '~/types/adminPendaftaran'

export const useAdminPendaftaranService = () => {
  const config = useRuntimeConfig()
  const { get, post } = useApi()

  const listPendaftar = async () => {
    const { data, error } = await get<AdminPendaftarListResponse>(adminApiEndpoints.pendaftar.list, {
      showErrorToast: false
    })

    return {
      data: error
        ? []
        : mapPendaftarList(
            data,
            String(config.public.apiBaseUrl || ''),
            String(config.public.assetAllowedOrigins || '')
          ),
      error
    }
  }

  const updatePendaftarStatus = (payload: { id: string, accept: boolean, notes: string }) => {
    return post<ApiMutationResponse>(adminApiEndpoints.pendaftar.status, payload, {
      showErrorToast: false
    })
  }

  const verifyBerkas = (payload: { id: string, accept: 0 | 1 | 2, notes: string }) => {
    return post<ApiMutationResponse>(adminApiEndpoints.pendaftar.berkas, payload, {
      showErrorToast: false
    })
  }

  return {
    listPendaftar,
    updatePendaftarStatus,
    verifyBerkas
  }
}

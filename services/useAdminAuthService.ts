import { adminApiEndpoints } from '~/services/adminApiEndpoints'
import type { AdminLoginPayload, AdminLoginResponse } from '~/types/adminAuth'

export const useAdminAuthService = () => {
  const { post } = useApi()

  const login = (payload: AdminLoginPayload) => {
    return post<AdminLoginResponse>(adminApiEndpoints.auth.login, payload, {
      showErrorToast: false
    })
  }

  return {
    login
  }
}

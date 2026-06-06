import { adminApiEndpoints } from '~/services/adminApiEndpoints'
import type { AdminLoginPayload, AdminLoginResponse, AdminLogoutResponse, AdminVerifyResponse } from '~/types/adminAuth'

export const useAdminAuthService = () => {
  const { get, post } = useApi()

  const login = (payload: AdminLoginPayload) => {
    return post<AdminLoginResponse>(adminApiEndpoints.auth.login, payload, {
      handleUnauthorized: false,
      showErrorToast: false
    })
  }

  const logout = () => {
    return post<AdminLogoutResponse>(adminApiEndpoints.auth.logout, undefined, {
      handleUnauthorized: false,
      showErrorToast: false
    })
  }

  const verify = () => {
    return get<AdminVerifyResponse>(adminApiEndpoints.auth.verify, {
      handleUnauthorized: false,
      showErrorToast: false
    })
  }

  return {
    login,
    logout,
    verify
  }
}

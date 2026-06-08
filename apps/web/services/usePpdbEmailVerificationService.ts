import { publicApiEndpoints } from '~/services/publicApiEndpoints'

export type EmailVerificationStatus = 'pending' | 'verified' | 'expired' | 'failed' | 'rate_limited'

export type EmailVerificationResult = {
  success: boolean
  message?: string
  status?: EmailVerificationStatus
  expiresAt?: string
  sessionExpiresAt?: string
  token?: string
}

type RawEmailVerificationResponse = {
  success?: boolean
  status?: boolean | EmailVerificationStatus
  message?: string
  data?: {
    status?: EmailVerificationStatus
    expires_at?: string
    session_expires_at?: string
    token?: string
  }
}

const normalizeBaseUrl = (value: unknown) => String(value || 'https://api.oirul.com').trim().replace(/\/+$/, '')

const normalizeSuccess = (response?: RawEmailVerificationResponse | null) => {
  return response?.success === true || response?.status === true
}

const normalizeStatus = (response?: RawEmailVerificationResponse | null): EmailVerificationStatus | undefined => {
  if (!response) return undefined
  if (typeof response.status === 'string') return response.status
  return response.data?.status
}

const mapVerificationResponse = (response?: RawEmailVerificationResponse | null): EmailVerificationResult => {
  return {
    success: normalizeSuccess(response),
    message: response?.message,
    status: normalizeStatus(response),
    expiresAt: response?.data?.expires_at,
    sessionExpiresAt: response?.data?.session_expires_at,
    token: response?.data?.token
  }
}

const mapVerificationError = (error: any): EmailVerificationResult => {
  const statusCode = Number(error?.statusCode || error?.response?.status || 0)

  if (statusCode === 429) {
    return {
      success: false,
      status: 'rate_limited'
    }
  }

  return {
    success: false,
    status: 'failed'
  }
}

export const usePpdbEmailVerificationService = () => {
  const config = useRuntimeConfig()

  const requestEmailVerification = async (email: string) => {
    try {
      const response = await $fetch<RawEmailVerificationResponse>(publicApiEndpoints.ppdbVerification.requestEmail, {
        baseURL: normalizeBaseUrl(config.public.apiBaseUrl),
        method: 'POST',
        credentials: 'include',
        body: { email }
      })

      return mapVerificationResponse(response)
    } catch (error) {
      return mapVerificationError(error)
    }
  }

  const checkEmailVerificationStatus = async (email: string) => {
    try {
      const response = await $fetch<RawEmailVerificationResponse>(publicApiEndpoints.ppdbVerification.checkEmailStatus, {
        baseURL: normalizeBaseUrl(config.public.apiBaseUrl),
        method: 'GET',
        credentials: 'include',
        query: { email }
      })

      return mapVerificationResponse(response)
    } catch (error) {
      return mapVerificationError(error)
    }
  }

  const confirmEmailVerificationToken = async (token: string) => {
    try {
      const response = await $fetch<RawEmailVerificationResponse>(publicApiEndpoints.ppdbVerification.confirmToken, {
        baseURL: normalizeBaseUrl(config.public.apiBaseUrl),
        method: 'POST',
        credentials: 'include',
        body: { token }
      })

      return mapVerificationResponse(response)
    } catch (error) {
      return mapVerificationError(error)
    }
  }

  return {
    requestEmailVerification,
    checkEmailVerificationStatus,
    confirmEmailVerificationToken
  }
}

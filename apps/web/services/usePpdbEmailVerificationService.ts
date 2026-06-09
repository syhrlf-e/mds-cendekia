import { publicApiEndpoints } from '~/services/publicApiEndpoints'

export type EmailVerificationStatus =
  | 'pending'
  | 'verified'
  | 'unverified'
  | 'registered'
  | 'expired'
  | 'failed'
  | 'rate_limited'

export type EmailVerificationResult = {
  success: boolean
  message?: string
  status?: EmailVerificationStatus
  email?: string
  isVerified?: boolean
  isRegistered?: boolean
  expiresAt?: string
  sessionExpiresAt?: string
}

type RawEmailVerificationResponse = {
  success?: boolean
  status?: boolean | string
  message?: string
  email?: string
  is_verified?: boolean
  is_validated?: boolean
  is_registered?: boolean
  data?: {
    success?: boolean
    status?: boolean | string
    message?: string
    email?: string
    is_verified?: boolean
    is_validated?: boolean
    is_registered?: boolean
    expires_at?: string
    session_expires_at?: string
  }
}

const normalizeBaseUrl = (value: unknown) => String(value || 'https://api.oirul.com').trim().replace(/\/+$/, '')

const readBoolean = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === 'boolean') return value
    if (value === 1 || value === '1' || value === 'true') return true
    if (value === 0 || value === '0' || value === 'false') return false
  }

  return undefined
}

const normalizeStatusValue = (value: unknown): EmailVerificationStatus | undefined => {
  const normalized = String(value || '').trim().toLowerCase()
  if (!normalized) return undefined

  if (normalized.includes('register') || normalized.includes('terdaftar')) return 'registered'
  if (normalized.includes('rate') || normalized.includes('too_many')) return 'rate_limited'
  if (normalized.includes('expire') || normalized.includes('kedaluwarsa') || normalized.includes('kadaluarsa')) return 'expired'
  if (
    normalized.includes('unverified')
    || normalized.includes('not_verified')
    || normalized.includes('belum diverifikasi')
    || normalized.includes('belum terverifikasi')
    || normalized.includes('tidak diverifikasi')
    || normalized.includes('tidak terverifikasi')
  ) return 'unverified'
  if (
    normalized.includes('verified')
    || normalized.includes('validated')
    || normalized.includes('diverifikasi')
    || normalized.includes('terverifikasi')
    || normalized === 'success'
  ) return 'verified'
  if (normalized.includes('pending') || normalized.includes('waiting')) return 'pending'
  if (normalized.includes('fail') || normalized.includes('invalid') || normalized.includes('error')) return 'failed'

  return undefined
}

const mapVerificationResponse = (
  response?: RawEmailVerificationResponse | null,
  successStatus?: EmailVerificationStatus
): EmailVerificationResult => {
  const data = response?.data
  const isVerified = readBoolean(
    response?.is_verified,
    response?.is_validated,
    data?.is_verified,
    data?.is_validated
  )
  const isRegistered = readBoolean(response?.is_registered, data?.is_registered)
  const rawStatus = typeof response?.status === 'string' ? response.status : data?.status
  const status = isRegistered
    ? 'registered'
    : isVerified
      ? 'verified'
      : normalizeStatusValue(rawStatus) || normalizeStatusValue(response?.message || data?.message)
  const explicitSuccess = readBoolean(response?.success, data?.success, response?.status)
  const resolvedStatus = status || (explicitSuccess === true ? successStatus : undefined)

  return {
    success: explicitSuccess ?? (resolvedStatus === 'verified' || resolvedStatus === 'pending' || resolvedStatus === 'unverified'),
    message: response?.message || data?.message,
    status: resolvedStatus,
    email: response?.email || data?.email,
    isVerified,
    isRegistered,
    expiresAt: data?.expires_at,
    sessionExpiresAt: data?.session_expires_at
  }
}

const mapVerificationError = (error: any): EmailVerificationResult => {
  const statusCode = Number(error?.statusCode || error?.response?.status || 0)
  const responseData = error?.data || error?.response?._data
  const message = String(responseData?.message || '').trim()

  if (statusCode === 429) {
    return {
      success: false,
      status: 'rate_limited',
      message
    }
  }

  if (statusCode === 401 && /terdaftar|registered/i.test(message)) {
    return {
      success: false,
      status: 'registered',
      isRegistered: true,
      message
    }
  }

  return {
    success: false,
    status: normalizeStatusValue(responseData?.status) || normalizeStatusValue(message) || 'failed',
    message
  }
}

export const usePpdbEmailVerificationService = () => {
  const config = useRuntimeConfig()
  const route = useRoute()
  const isMockVerificationEnabled = computed(() => {
    const mockQuery = Array.isArray(route.query.mockVerification)
      ? route.query.mockVerification[0]
      : route.query.mockVerification

    return mockQuery === '1' || config.public.ppdbEmailVerificationMock === 'true'
  })

  const waitForMockResponse = () => new Promise(resolve => window.setTimeout(resolve, 450))

  const readMockStatusFromValue = (value: string): EmailVerificationStatus => {
    const normalizedValue = value.toLowerCase()
    if (normalizedValue.includes('rate') || normalizedValue.includes('too-many')) return 'rate_limited'
    if (normalizedValue.includes('expired')) return 'expired'
    if (normalizedValue.includes('fail') || normalizedValue.includes('invalid')) return 'failed'
    if (normalizedValue.includes('verified') || normalizedValue.includes('success')) return 'verified'
    return 'pending'
  }

  const createMockResult = (status: EmailVerificationStatus): EmailVerificationResult => {
    return {
      success: status === 'pending' || status === 'verified' || status === 'unverified',
      status,
      isVerified: status === 'verified',
      isRegistered: status === 'registered',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      sessionExpiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString()
    }
  }

  const requestEmailVerification = async (email: string) => {
    if (isMockVerificationEnabled.value) {
      await waitForMockResponse()
      const status = readMockStatusFromValue(email)

      return createMockResult(status === 'pending' || status === 'verified' ? 'pending' : status)
    }

    try {
      const response = await $fetch<RawEmailVerificationResponse>(publicApiEndpoints.ppdbVerification.requestEmail, {
        baseURL: normalizeBaseUrl(config.public.apiBaseUrl),
        method: 'POST',
        credentials: 'include',
        body: { email }
      })

      return mapVerificationResponse(response, 'pending')
    } catch (error) {
      return mapVerificationError(error)
    }
  }

  const checkEmailVerificationStatus = async (email: string) => {
    if (isMockVerificationEnabled.value) {
      await waitForMockResponse()
      return createMockResult('pending')
    }

    try {
      const response = await $fetch<RawEmailVerificationResponse>(publicApiEndpoints.ppdbVerification.checkValidation, {
        baseURL: normalizeBaseUrl(config.public.apiBaseUrl),
        method: 'POST',
        credentials: 'include',
        body: { email }
      })

      return mapVerificationResponse(response, 'verified')
    } catch (error) {
      return mapVerificationError(error)
    }
  }

  const confirmEmailVerificationToken = async (token: string) => {
    if (isMockVerificationEnabled.value) {
      await waitForMockResponse()
      return createMockResult(readMockStatusFromValue(token))
    }

    try {
      const response = await $fetch<RawEmailVerificationResponse>(publicApiEndpoints.ppdbVerification.verifyToken, {
        baseURL: normalizeBaseUrl(config.public.apiBaseUrl),
        method: 'POST',
        credentials: 'include',
        body: { token }
      })

      return mapVerificationResponse(response, 'verified')
    } catch (error) {
      return mapVerificationError(error)
    }
  }

  const getEmailVerificationSession = async () => {
    if (isMockVerificationEnabled.value) {
      await waitForMockResponse()
      return createMockResult('verified')
    }

    try {
      const response = await $fetch<RawEmailVerificationResponse>(publicApiEndpoints.ppdbVerification.session, {
        baseURL: normalizeBaseUrl(config.public.apiBaseUrl),
        method: 'GET',
        credentials: 'include'
      })

      return mapVerificationResponse(response, 'verified')
    } catch (error) {
      return mapVerificationError(error)
    }
  }

  return {
    isMockVerificationEnabled,
    requestEmailVerification,
    checkEmailVerificationStatus,
    confirmEmailVerificationToken,
    getEmailVerificationSession
  }
}

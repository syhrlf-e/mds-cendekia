import { getAdminSessionGeneration, useAdminSession } from './useAdminSession'
import { useAdminAuthService } from '~/services/useAdminAuthService'

type AdminIdentity = {
  id?: number
  username?: string
}

type VerifyOptions = {
  force?: boolean
  clearOnFailure?: boolean
}

const ADMIN_VERIFY_TTL_MS = 30 * 1000

let verifiedAt = 0
let verifiedGeneration = -1
let verifyRequest: Promise<boolean> | null = null

const setAdminIdentity = (identity?: AdminIdentity) => {
  useState<string>('admin-auth:username', () => '').value = identity?.username || ''
  useState<number | null>('admin-auth:id', () => null).value = identity?.id || null
}

export const useAdminSessionVerifier = () => {
  const { verify } = useAdminAuthService()
  const { activateAdminSession, clearAdminSession, isAdminSessionInvalidated } = useAdminSession()

  const markAdminSessionVerified = (identity?: AdminIdentity) => {
    activateAdminSession()
    setAdminIdentity(identity)
    verifiedGeneration = getAdminSessionGeneration()
    verifiedAt = Date.now()
  }

  const hasFreshVerification = () => {
    return verifiedGeneration === getAdminSessionGeneration()
      && verifiedAt > 0
      && Date.now() - verifiedAt < ADMIN_VERIFY_TTL_MS
  }

  const verifyAdminSession = async (options: VerifyOptions = {}) => {
    if (isAdminSessionInvalidated()) return false
    if (!options.force && hasFreshVerification()) return true

    if (!verifyRequest) {
      const requestGeneration = getAdminSessionGeneration()

      verifyRequest = (async () => {
        const { data, error } = await verify()

        if (requestGeneration !== getAdminSessionGeneration()) return false
        if (error || !data?.success) return false

        markAdminSessionVerified(data.data)
        return true
      })()
    }

    const activeRequest = verifyRequest

    try {
      const isAuthenticated = await activeRequest

      if (!isAuthenticated && options.clearOnFailure !== false && !isAdminSessionInvalidated()) {
        clearAdminSession()
      }

      return isAuthenticated
    } finally {
      if (verifyRequest === activeRequest) verifyRequest = null
    }
  }

  return {
    markAdminSessionVerified,
    verifyAdminSession
  }
}

import { PPDB_VERIFICATION_STORAGE_KEY, type PpdbVerificationSession } from '~/composables/usePpdbVerificationGate'

const hasValidVerificationSession = () => {
  try {
    const rawSession = sessionStorage.getItem(PPDB_VERIFICATION_STORAGE_KEY)
    if (!rawSession) return false

    const session = JSON.parse(rawSession) as PpdbVerificationSession
    if (!session.email || !session.verifiedAt) return false

    if (session.expiresAt && new Date(session.expiresAt).getTime() <= Date.now()) {
      sessionStorage.removeItem(PPDB_VERIFICATION_STORAGE_KEY)
      return false
    }

    return true
  } catch {
    sessionStorage.removeItem(PPDB_VERIFICATION_STORAGE_KEY)
    return false
  }
}

export default defineNuxtRouteMiddleware((to) => {
  if (hasValidVerificationSession()) return

  return navigateTo({
    path: '/ppdb/verifikasi',
    query: {
      redirect: to.fullPath
    }
  }, { replace: true })
})

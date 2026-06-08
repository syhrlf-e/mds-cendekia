export type PpdbVerificationSession = {
  nisn?: string
  email: string
  verifiedAt: string
  expiresAt?: string
  token?: string
}

export const PPDB_VERIFICATION_STORAGE_KEY = 'ppdb-verification-session'

const readSession = (): PpdbVerificationSession | null => {
  if (!import.meta.client) return null

  try {
    const rawSession = sessionStorage.getItem(PPDB_VERIFICATION_STORAGE_KEY)
    if (!rawSession) return null

    const session = JSON.parse(rawSession) as PpdbVerificationSession
    if (!session.email || !session.verifiedAt) return null

    if (session.expiresAt && new Date(session.expiresAt).getTime() <= Date.now()) {
      sessionStorage.removeItem(PPDB_VERIFICATION_STORAGE_KEY)
      return null
    }

    return session
  } catch {
    sessionStorage.removeItem(PPDB_VERIFICATION_STORAGE_KEY)
    return null
  }
}

export const usePpdbVerificationGate = () => {
  const router = useRouter()
  const route = useRoute()

  const getVerificationSession = () => readSession()

  const hasValidVerification = () => Boolean(readSession())

  const saveVerificationSession = (session: PpdbVerificationSession) => {
    if (!import.meta.client) return
    sessionStorage.setItem(PPDB_VERIFICATION_STORAGE_KEY, JSON.stringify(session))
  }

  const clearVerificationSession = () => {
    if (!import.meta.client) return
    sessionStorage.removeItem(PPDB_VERIFICATION_STORAGE_KEY)
  }

  const redirectToVerification = () => {
    const redirect = route.fullPath.startsWith('/ppdb/daftar') ? route.fullPath : '/ppdb/daftar'
    router.replace({
      path: '/ppdb/verifikasi',
      query: { redirect }
    })
  }

  const ensureVerifiedOrRedirect = () => {
    if (!import.meta.client || hasValidVerification()) return true

    redirectToVerification()
    return false
  }

  return {
    getVerificationSession,
    hasValidVerification,
    saveVerificationSession,
    clearVerificationSession,
    ensureVerifiedOrRedirect
  }
}

export type PpdbVerificationSession = {
  nisn?: string
  email: string
  status: 'verified'
  verifiedAt: string
  expiresAt: string
}

export const PPDB_VERIFICATION_STORAGE_KEY = 'ppdb-verification-session'
const PPDB_VERIFICATION_LEGACY_STORAGE_KEY = PPDB_VERIFICATION_STORAGE_KEY
const TEMPORARY_VERIFICATION_DURATION_MS = 24 * 60 * 60 * 1000

const removeStoredVerificationSession = () => {
  localStorage.removeItem(PPDB_VERIFICATION_STORAGE_KEY)
  sessionStorage.removeItem(PPDB_VERIFICATION_LEGACY_STORAGE_KEY)
}

const parseVerificationSession = (rawSession: string | null): PpdbVerificationSession | null => {
  if (!rawSession) return null

  const session = JSON.parse(rawSession) as Partial<PpdbVerificationSession>
  if (!session.email || session.status !== 'verified' || !session.verifiedAt) return null

  const expiresAt = session.expiresAt
    || new Date(new Date(session.verifiedAt).getTime() + TEMPORARY_VERIFICATION_DURATION_MS).toISOString()

  if (!Number.isFinite(new Date(expiresAt).getTime()) || new Date(expiresAt).getTime() <= Date.now()) {
    return null
  }

  return {
    ...session,
    email: session.email,
    status: 'verified',
    verifiedAt: session.verifiedAt,
    expiresAt
  }
}

export const readPpdbVerificationSession = (): PpdbVerificationSession | null => {
  if (!import.meta.client) return null

  try {
    const storedSession = parseVerificationSession(localStorage.getItem(PPDB_VERIFICATION_STORAGE_KEY))
    if (storedSession) return storedSession

    const legacySession = parseVerificationSession(sessionStorage.getItem(PPDB_VERIFICATION_LEGACY_STORAGE_KEY))
    if (legacySession) {
      localStorage.setItem(PPDB_VERIFICATION_STORAGE_KEY, JSON.stringify(legacySession))
      sessionStorage.removeItem(PPDB_VERIFICATION_LEGACY_STORAGE_KEY)
      return legacySession
    }

    removeStoredVerificationSession()
    return null
  } catch {
    removeStoredVerificationSession()
    return null
  }
}

export const hasValidPpdbVerificationSession = () => Boolean(readPpdbVerificationSession())

export const usePpdbVerificationGate = () => {
  const router = useRouter()
  const route = useRoute()

  const getVerificationSession = () => readPpdbVerificationSession()

  const hasValidVerification = () => hasValidPpdbVerificationSession()

  const saveVerificationSession = (session: PpdbVerificationSession) => {
    if (!import.meta.client) return
    localStorage.setItem(PPDB_VERIFICATION_STORAGE_KEY, JSON.stringify(session))
  }

  const saveTemporaryEmailVerification = (
    session: Omit<PpdbVerificationSession, 'status' | 'verifiedAt' | 'expiresAt'>
      & { verifiedAt?: string, expiresAt?: string }
  ) => {
    const verifiedAt = session.verifiedAt || new Date().toISOString()

    saveVerificationSession({
      ...session,
      status: 'verified',
      verifiedAt,
      expiresAt: session.expiresAt
        || new Date(new Date(verifiedAt).getTime() + TEMPORARY_VERIFICATION_DURATION_MS).toISOString()
    })
  }

  const clearVerificationSession = () => {
    if (!import.meta.client) return
    removeStoredVerificationSession()
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
    saveTemporaryEmailVerification,
    clearVerificationSession,
    ensureVerifiedOrRedirect
  }
}

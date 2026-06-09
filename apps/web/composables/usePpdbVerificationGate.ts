import { usePpdbEmailVerificationService } from '~/services/usePpdbEmailVerificationService'

const PPDB_PENDING_EMAIL_KEY = 'ppdb-pending-verification-email'
const PPDB_REGISTRATION_COMPLETED_COOKIE = 'ppdb-registration-completed'
const PPDB_VERIFICATION_TTL_MS = 15 * 1000

export const usePpdbVerificationGate = () => {
  const { getEmailVerificationSession } = usePpdbEmailVerificationService()
  const verifiedAt = useState<number>('ppdb-verification:verified-at', () => 0)
  const registrationCompleted = useCookie<string | null>(PPDB_REGISTRATION_COMPLETED_COOKIE, {
    default: () => null,
    path: '/',
    sameSite: 'lax',
    secure: !import.meta.dev
  })

  const getPendingEmail = () => {
    if (!import.meta.client) return ''
    return sessionStorage.getItem(PPDB_PENDING_EMAIL_KEY) || ''
  }

  const savePendingEmail = (email: string) => {
    if (!import.meta.client) return
    sessionStorage.setItem(PPDB_PENDING_EMAIL_KEY, email)
  }

  const clearPendingEmail = () => {
    if (!import.meta.client) return
    sessionStorage.removeItem(PPDB_PENDING_EMAIL_KEY)
  }

  const hasCompletedRegistration = () => String(registrationCompleted.value || '') === '1'

  const markRegistrationCompleted = () => {
    verifiedAt.value = 0
    registrationCompleted.value = '1'
  }

  const activateNewVerification = () => {
    registrationCompleted.value = null
    verifiedAt.value = Date.now()
  }

  const invalidateVerification = () => {
    verifiedAt.value = 0
  }

  const hasValidVerification = async () => {
    if (hasCompletedRegistration()) return false

    if (verifiedAt.value > 0 && Date.now() - verifiedAt.value < PPDB_VERIFICATION_TTL_MS) {
      return true
    }

    const session = await getEmailVerificationSession()
    const isValid = session.success
      && session.status === 'verified'
      && session.isRegistered !== true

    verifiedAt.value = isValid ? Date.now() : 0
    return isValid
  }

  return {
    getPendingEmail,
    savePendingEmail,
    clearPendingEmail,
    hasCompletedRegistration,
    markRegistrationCompleted,
    activateNewVerification,
    invalidateVerification,
    hasValidVerification
  }
}

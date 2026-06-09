import { usePpdbEmailVerificationService } from '~/services/usePpdbEmailVerificationService'

const PPDB_PENDING_EMAIL_KEY = 'ppdb-pending-verification-email'

export const usePpdbVerificationGate = () => {
  const router = useRouter()
  const route = useRoute()
  const { getEmailVerificationSession } = usePpdbEmailVerificationService()

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

  const hasValidVerification = async () => {
    const session = await getEmailVerificationSession()
    return session.success && session.status === 'verified' && session.isRegistered !== true
  }

  const redirectToVerification = async () => {
    const redirect = route.fullPath.startsWith('/ppdb/daftar') ? route.fullPath : '/ppdb/daftar'
    await router.replace({
      path: '/ppdb/verifikasi',
      query: { redirect }
    })
  }

  const ensureVerifiedOrRedirect = async () => {
    if (!import.meta.client) return false
    if (await hasValidVerification()) return true

    await redirectToVerification()
    return false
  }

  return {
    getPendingEmail,
    savePendingEmail,
    clearPendingEmail,
    hasValidVerification,
    ensureVerifiedOrRedirect
  }
}

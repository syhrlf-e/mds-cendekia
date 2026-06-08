import { hasValidPpdbVerificationSession } from '~/composables/usePpdbVerificationGate'

export default defineNuxtRouteMiddleware((to) => {
  if (hasValidPpdbVerificationSession()) return

  return navigateTo({
    path: '/ppdb/verifikasi',
    query: {
      redirect: to.fullPath
    }
  }, { replace: true })
})

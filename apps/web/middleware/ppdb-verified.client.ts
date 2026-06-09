export default defineNuxtRouteMiddleware(async (to) => {
  const { hasValidVerification } = usePpdbVerificationGate()
  if (await hasValidVerification()) return

  return navigateTo({
    path: '/ppdb/verifikasi',
    query: {
      redirect: to.fullPath
    }
  }, { replace: true })
})

export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return

  if (to.path.startsWith('/') && to.path !== '/login') {
    const { isAdminSessionInvalidated } = useAdminSession()

    if (isAdminSessionInvalidated()) {
      return navigateTo('/login', { replace: true })
    }

    const { hasVerifiedAdminSession, verifyAdminSession } = useAdminSessionVerifier()

    if (!hasVerifiedAdminSession()) {
      const isAuthenticated = await verifyAdminSession()
      if (!isAuthenticated) {
        return navigateTo('/login', { replace: true })
      }
      return
    }

    void verifyAdminSession({
      clearOnFailure: false
    })
  }
})

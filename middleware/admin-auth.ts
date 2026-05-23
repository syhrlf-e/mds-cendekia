export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return

  if (import.meta.dev) {
    if (to.path === '/admin/login') return navigateTo('/admin/dashboard')
    return
  }

  if (to.path.startsWith('/admin') && to.path !== '/admin/login') {
    const { get } = useApi()
    const { data, error } = await get<{ success?: boolean, status?: boolean }>('/auth/verify', { showErrorToast: false })

    if (error || (!data?.success && !data?.status)) {
      return navigateTo('/admin/login')
    }
  }
})

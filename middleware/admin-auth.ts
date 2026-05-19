export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path.startsWith('/admin') && to.path !== '/admin/login') {
    const { get } = useApi()
    const { data, error } = await get<{ success: boolean }>('/auth/verify', { showErrorToast: false })

    if (error || !data?.success) {
      return navigateTo('/admin/login')
    }
  }
})

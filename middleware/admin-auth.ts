import { adminApiEndpoints } from '~/services/adminApiEndpoints'

export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return

  if (to.path.startsWith('/admin') && to.path !== '/admin/login') {
    const { get } = useApi()
    const { data, error } = await get<{ success?: boolean, status?: boolean }>(adminApiEndpoints.auth.verify, { showErrorToast: false })

    if (error || (!data?.success && !data?.status)) {
      return navigateTo('/admin/login')
    }
  }
})

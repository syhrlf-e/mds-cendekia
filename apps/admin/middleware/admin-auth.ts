import { useAdminAuthService } from '~/services/useAdminAuthService'

export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return

  if (to.path.startsWith('/') && to.path !== '/login') {
    const { verify } = useAdminAuthService()
    const { clearAdminDataCache } = useAdminDataCache()
    const { data, error } = await verify()

    if (error || !data?.success) {
      clearAdminDataCache()
      return navigateTo('/login')
    }

    const adminUsername = useState<string>('admin-auth:username', () => '')
    const adminId = useState<number | null>('admin-auth:id', () => null)
    adminUsername.value = data.data?.username || ''
    adminId.value = data.data?.id || null
  }
})

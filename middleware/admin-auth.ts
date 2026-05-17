export default defineNuxtRouteMiddleware((to) => {
  const adminToken = useCookie('admin_token')
  
  if (!adminToken.value && to.path.startsWith('/admin') && to.path !== '/admin/login') {
    return navigateTo('/admin/login')
  }
})
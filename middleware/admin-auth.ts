export default defineNuxtRouteMiddleware((to) => {
  const adminToken = useCookie('admin_token')
  
  if (to.path.startsWith('/admin') && to.path !== '/admin/login') {
    if (!adminToken.value) {
      return navigateTo('/admin/login')
    }

    try {
      // Decode JWT payload (simple base64 decoding for client-side check)
      const base64Url = adminToken.value.split('.')[1]
      if (!base64Url) throw new Error('Invalid token structure')

      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      // Atob works in modern browsers and Node (ssr context handles it differently via Buffer if needed, but atob is global in Nuxt 3 nitro)
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      }).join(''))

      const payload = JSON.parse(jsonPayload)
      
      // Check expiration
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        adminToken.value = null // clear expired token
        return navigateTo('/admin/login?expired=1')
      }
    } catch (e) {
      // If token is malformed, reject
      adminToken.value = null
      return navigateTo('/admin/login')
    }
  }
})
import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('page:finish', () => {
    if (import.meta.client) {
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
  })
})

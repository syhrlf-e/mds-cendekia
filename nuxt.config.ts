import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
  srcDir: '.',
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  modules: [
    '@nuxt/eslint',
    '@nuxtjs/google-fonts',
    'nuxt-security'
  ],
  security: {
    headers: {
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: 'unsafe-none',
      crossOriginOpenerPolicy: 'same-origin',
      crossOriginResourcePolicy: 'same-origin',
      referrerPolicy: 'no-referrer',
      strictTransportSecurity: {
        maxAge: 31536000,
        includeSubdomains: true
      },
      xContentTypeOptions: 'nosniff',
      xFrameOptions: 'DENY',
      xXSSProtection: '1; mode=block'
    },
    xssValidator: {},
    corsHandler: {
      origin: '*', // Adjust to actual backend origin in production
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    }
  },
  googleFonts: {
    families: {
      'Plus+Jakarta+Sans': [600, 700],
      'Inter': [400, 500]
    },
    display: 'swap',
  }
})

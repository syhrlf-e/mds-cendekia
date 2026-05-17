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
    '@nuxtjs/google-fonts'
  ],
  googleFonts: {
    families: {
      'Plus+Jakarta+Sans': [600, 700],
      'Inter': [400, 500]
    },
    display: 'swap',
  }
})

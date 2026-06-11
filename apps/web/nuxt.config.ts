import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
  srcDir: '.',
  compatibilityDate: '2024-11-01',
  ignore: ['REFERENSI/**'],
  typescript: {
    tsConfig: {
      exclude: ['../REFERENSI/**']
    }
  },
  app: {
    head: {
      htmlAttrs: {
        lang: 'id'
      },
      title: 'MDS Cendekia | Pendidikan Kesetaraan dan PPDB Paket C',
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' }
      ],
      meta: [
        {
          name: 'description',
          content: 'MDS Cendekia menyediakan pendidikan kesetaraan inklusif, adaptif, dan berkelanjutan untuk membantu peserta didik meraih ijazah resmi melalui program Kejar Paket C.'
        },
        { name: 'theme-color', content: '#ffffff' },
        { name: 'application-name', content: 'MDS Cendekia' },
        { name: 'apple-mobile-web-app-title', content: 'MDS Cendekia' },
        { name: 'format-detection', content: 'telephone=no' },
        { property: 'og:site_name', content: 'MDS Cendekia' },
        { property: 'og:type', content: 'website' },
        { property: 'og:locale', content: 'id_ID' },
        { property: 'og:title', content: 'MDS Cendekia | Pendidikan Kesetaraan dan PPDB Paket C' },
        {
          property: 'og:description',
          content: 'Pendidikan kesetaraan inklusif dengan sistem belajar adaptif untuk membantu peserta didik meraih ijazah resmi bersama MDS Cendekia.'
        },
        { property: 'og:image', content: '/images/logo-mds-main.png' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'MDS Cendekia | Pendidikan Kesetaraan dan PPDB Paket C' },
        {
          name: 'twitter:description',
          content: 'Pendidikan kesetaraan inklusif dengan sistem belajar adaptif untuk membantu peserta didik meraih ijazah resmi bersama MDS Cendekia.'
        },
        { name: 'twitter:image', content: '/images/logo-mds-main.png' }
      ]
    }
  },

  routeRules: {
    '/': {
      prerender: true
    },
    '/profil-sekolah': {
      prerender: true
    },
    '/ppdb': {
      prerender: true
    },
    '/images/**': {
      headers: {
        'Cache-Control': 'public, max-age=604800, stale-while-revalidate=86400'
      }
    },
    '/ppdb/daftar': {
      headers: { 'X-Robots-Tag': 'noindex, nofollow, noarchive' }
    },
    '/ppdb/verifikasi': {
      headers: { 'X-Robots-Tag': 'noindex, nofollow, noarchive' }
    },
    '/ppdb/verify-email/**': {
      headers: { 'X-Robots-Tag': 'noindex, nofollow, noarchive' }
    },
    '/ppdb/verify/**': {
      headers: { 'X-Robots-Tag': 'noindex, nofollow, noarchive' }
    },
    '/ppdb/daftar/**': {
      headers: { 'X-Robots-Tag': 'noindex, nofollow, noarchive' }
    },
    '/ppdb/cek-status': {
      headers: { 'X-Robots-Tag': 'noindex, nofollow, noarchive' }
    },
    '/ppdb/kartu-peserta': {
      headers: { 'X-Robots-Tag': 'noindex, nofollow, noarchive' }
    },
    '/ppdb/revisi-berkas': {
      headers: { 'X-Robots-Tag': 'noindex, nofollow, noarchive' }
    },
    '/ppdb/revisi-berkas/**': {
      headers: { 'X-Robots-Tag': 'noindex, nofollow, noarchive' }
    }
  },

  nitro: {
    prerender: {
      crawlLinks: false,
      routes: [
        '/',
        '/profil-sekolah',
        '/ppdb'
      ]
    }
  },

  devServer: {
    host: '127.0.0.1',
    port: 3000
  },

  devtools: { enabled: true },

  runtimeConfig: {
    public: {
      apiBaseUrl: '',
      apiTimeoutMs: '15000',
      ppdbProgramId: '1',
      ppdbGelombangId: '3',
      ppdbEmailVerificationMock: '',
      whatsappNumber: '6282313380653',
      siteUrl: 'https://mdscendekia.my.id',
      siteName: 'MDS Cendekia',
      siteDescription: 'MDS Cendekia menyediakan pendidikan kesetaraan inklusif, adaptif, dan berkelanjutan untuk membantu peserta didik meraih ijazah resmi melalui program Kejar Paket C.',
      siteImage: '/images/logo-mds-main.png'
    }
  },

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

  eslint: {
    config: {
      standalone: true
    }
  },

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
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    }
  },

  googleFonts: {
    families: {
      'Plus Jakarta Sans': [400, 500, 600, 700],
      'Inter': [400, 500]
    },
    display: 'swap',
    download: true,
  }
})

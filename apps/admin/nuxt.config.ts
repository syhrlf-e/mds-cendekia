import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  srcDir: '.',
  compatibilityDate: '2024-11-01',
  app: {
    head: {
      htmlAttrs: {
        lang: 'id'
      },
      title: 'MDS Panel | MDS Cendekia',
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' }
      ],
      meta: [
        { name: 'robots', content: 'noindex, nofollow, noarchive' },
        { name: 'theme-color', content: '#ffffff' },
        { name: 'application-name', content: 'MDS Panel' },
        { name: 'apple-mobile-web-app-title', content: 'MDS Panel' }
      ]
    }
  },

  routeRules: {
    '/**': {
      headers: { 'X-Robots-Tag': 'noindex, nofollow, noarchive' }
    }
  },

  devServer: {
    host: '127.0.0.1',
    port: 3001
  },

  devtools: { enabled: import.meta.dev },

  runtimeConfig: {
    public: {
      apiBaseUrl: 'https://api.oirul.com',
      assetAllowedOrigins: '',
      apiTimeoutMs: '15000',
      ppdbProgramId: '1',
      ppdbGelombangId: '3',
      siteUrl: 'https://mdspanel.mdscendekia.oirul.com',
      siteName: 'MDS Panel',
      siteDescription: 'Panel admin MDS Cendekia.',
      siteImage: '/images/logo-mds-main.png'
    }
  },

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [
      tailwindcss()
    ]
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
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
    }
  },

  googleFonts: {
    families: {
      'Plus Jakarta Sans': [400, 500, 600, 700],
      'Inter': [400, 500]
    },
    display: 'swap',
    download: true
  }
})

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
      title: 'MDS Cendekia',
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' }
      ],
      meta: [
        { name: 'theme-color', content: '#ffffff' }
      ]
    }
  },

  // Memaksa Nuxt dev berjalan di IPv4 lokal agar tidak stuck/menolak koneksi
  devServer: {
    host: '127.0.0.1',
    port: 3000
  },

  devtools: { enabled: true },

  runtimeConfig: {
    public: {
      apiBaseUrl: 'https://api.oirul.com',
      apiTimeoutMs: '15000',
      ppdbProgramId: '1',
      ppdbGelombangId: '3'
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

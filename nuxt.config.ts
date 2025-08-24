// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt'
  ],
  app: {
    head: {
      title: 'MarvelCDC - Deck Collection Manager',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'A professional deck collection management tool for Marvel Champions LCG. Track your collection, import decks from MarvelCDB, and detect card conflicts.' },
        { name: 'theme-color', content: '#DC2626' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },
  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET,
    databaseUrl: process.env.DATABASE_URL,
    public: {
      appName: 'Marvel Champions Deck Collection'
    }
  },
  nitro: {
    experimental: {
      wasm: true
    }
  },
  // Security headers for production
  routeRules: {
    '/**': {
      headers: {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
      }
    }
  }
})

export const publicApiEndpoints = {
  berita: {
    list: '/api/berita/all',
    detail: (id: string | number) => `/api/berita/${encodeURIComponent(String(id))}`,
    detailBySlug: (slug: string) => `/api/berita/slug/${encodeURIComponent(slug)}`
  },
  gallery: {
    list: '/api/gallery/all',
    detail: (id: string) => `/api/gallery/${encodeURIComponent(id)}`,
    detailBySlug: (slug: string) => `/api/gallery/slug/${encodeURIComponent(slug)}`
  },
  ppdbVerification: {
    requestEmail: '/auth/email/request-verification',
    verifyToken: '/auth/email/verify',
    session: '/auth/email/session',
    checkValidation: '/auth/email/verify/polling'
  }
} as const

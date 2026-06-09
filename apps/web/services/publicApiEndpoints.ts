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
    requestEmail: '/api/ppdb/email/request-verification',
    verifyToken: '/api/ppdb/email/verify',
    session: '/api/ppdb/email/session',
    checkValidation: '/api/ppdb/email/polling'
  }
} as const

export const publicApiEndpoints = {
  berita: {
    list: '/api/berita/all',
    detail: (id: string | number) => `/api/berita/${encodeURIComponent(String(id))}`,
    detailBySlug: (slug: string) => `/api/berita/slug/${encodeURIComponent(slug)}`
  },
  gallery: {
    list: '/api/gallery/all'
  }
} as const

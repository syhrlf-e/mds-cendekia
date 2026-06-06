export const adminApiEndpoints = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    verify: '/auth/verify'
  },
  pendaftar: {
    list: '/api/pendaftar/data',
    status: '/api/pendaftar/status',
    berkas: '/api/pendaftar/berkas'
  },
  siswa: {
    list: '/api/siswa/data'
  },
  paketSekolah: {
    list: '/api/paket-sekolah',
    active: '/api/paket-sekolah/aktif'
  },
  timelinePpdb: {
    list: '/api/timeline/all',
    detail: '/api/timeline',
    create: '/api/timeline/create',
    delete: (id: string | number) => `/api/timeline/${id}`,
    publicList: '/api/timeline/all'
  },
  gallery: {
    list: '/api/gallery/all',
    create: '/api/gallery/create',
    detail: (id: string) => `/api/gallery/${id}`
  },
  berita: {
    list: '/api/berita/all',
    create: '/api/berita/create',
    detail: (id: string | number) => `/api/berita/${encodeURIComponent(String(id))}`,
    detailBySlug: (slug: string) => `/api/berita/slug/${encodeURIComponent(slug)}`,
    update: (id: string | number) => `/api/berita/update/${encodeURIComponent(String(id))}`,
    delete: (id: string | number) => `/api/berita/${encodeURIComponent(String(id))}`
  },
  summary: '/api/summary'
} as const

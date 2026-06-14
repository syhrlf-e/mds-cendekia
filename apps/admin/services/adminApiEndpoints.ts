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
  programPaket: {
    list: '/api/program-paket/all',
    create: '/api/program-paket/create',
    detail: (id: string | number) => `/api/program-paket/${encodeURIComponent(String(id))}`,
    update: (id: string | number) => `/api/program-paket/${encodeURIComponent(String(id))}`,
    delete: (id: string | number) => `/api/program-paket/${encodeURIComponent(String(id))}`
  },
  timelinePpdb: {
    list: '/api/timeline/all',
    detail: '/api/timeline',
    create: '/api/timeline/create',
    update: (id: string | number) => `/api/timeline/${encodeURIComponent(String(id))}`,
    delete: (id: string | number) => `/api/timeline/${id}`,
    deleteGelombang: (id: string | number) => `/api/timeline/gelombang/${encodeURIComponent(String(id))}`,
    publicList: '/api/timeline/all'
  },
  gelombang: {
    list: '/api/gelombang/all',
    create: '/api/gelombang/create',
    detail: (id: string | number) => `/api/gelombang/${encodeURIComponent(String(id))}`,
    update: (id: string | number) => `/api/gelombang/${encodeURIComponent(String(id))}`,
    delete: (id: string | number) => `/api/gelombang/${encodeURIComponent(String(id))}`
  },
  gallery: {
    list: '/api/gallery/all',
    create: '/api/gallery/create',
    detail: (id: string) => `/api/gallery/${encodeURIComponent(id)}`,
    detailBySlug: (slug: string) => `/api/gallery/slug/${encodeURIComponent(slug)}`
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

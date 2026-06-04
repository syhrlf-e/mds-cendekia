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
  summary: '/api/summary'
} as const

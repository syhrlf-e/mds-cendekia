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
    list: '/api/timeline-ppdb',
    publicList: '/api/timeline-ppdb/publik'
  },
  gallery: {
    list: '/api/gallery/all',
    create: '/api/gallery/create',
    detail: (id: string) => `/api/gallery/${id}`
  },
  summary: '/api/summary'
} as const

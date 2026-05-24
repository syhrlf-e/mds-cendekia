type AdminMockMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

type AdminMockFile = {
  jenis: string
  file_url: string
  created_at: string
}

type AdminMockParent = {
  nama: string
  nik: string
  agama: string
  no_telepon: string
  email: string
  hubungan: string
  peran: string
  pekerjaan: string
  pendidikan: string
  penghasilan: string
}

type AdminMockPendaftar = {
  id: string
  nis?: string
  diterima_at?: string
  nama: string
  nik: string
  nisn: string
  status_berkas: string
  status_pendaftaran: string
  created_at: string
  no_telepon: string
  email: string
  tempat_lahir: string
  tanggal_lahir: string
  agama: string
  jenis_kelamin: string
  alamat: string
  rt: string
  rw: string
  kelurahan: string
  kecamatan: string
  kabupaten_kota: string
  provinsi: string
  kode_pos: string
  gelombang: number
  program_paket: string
  riwayat_pendidikan: {
    nama_sekolah_asal: string
    asal_sekolah: string
    sekolah_asal: string
  }
  orang_tua: AdminMockParent[]
  berkas_persyaratan: AdminMockFile[]
}

type AdminMockPaketSekolah = {
  id: number
  kode: string
  nama: string
  jenjang: string
  status: 'aktif' | 'nonaktif'
  kuota: number
  biaya_pendaftaran: number
  deskripsi: string
  created_at: string
  updated_at: string
}

type AdminMockTimelinePpdb = {
  id: number
  judul: string
  deskripsi: string
  tanggal_mulai: string
  tanggal_selesai: string
  urutan: number
  status: 'aktif' | 'nonaktif'
  tampil_publik: boolean
  created_at: string
  updated_at: string
}

const ADMIN_MOCK_AUTH_KEY = 'mds-admin-mock-auth'
const ADMIN_MOCK_DATA_KEY = 'mds-admin-mock-pendaftar'
const ADMIN_MOCK_PAKET_KEY = 'mds-admin-mock-paket-sekolah'
const ADMIN_MOCK_TIMELINE_KEY = 'mds-admin-mock-timeline-ppdb'

const adminMockEndpoints = [
  '/auth/login',
  '/auth/verify',
  '/auth/logout',
  '/api/pendaftar/data',
  '/api/pendaftar/status',
  '/api/pendaftar/berkas',
  '/api/siswa',
  '/api/siswa/data',
  '/api/paket-sekolah',
  '/api/paket-sekolah/aktif',
  '/api/timeline-ppdb',
  '/api/timeline-ppdb/publik',
  '/api/summary',
  '/register/cek-status'
]

const createMockFiles = (prefix: string): AdminMockFile[] => [
  { jenis: 'Foto Siswa (3x4 berwarna)', file_url: '/images/logo-mds-main.png', created_at: '2026-05-23T09:15:00.000Z' },
  { jenis: 'Buku Rapor SMP', file_url: '/images/logo-mds-main.png', created_at: '2026-05-23T09:16:00.000Z' },
  { jenis: 'Surat Keterangan Nilai Rapor Semester I-V', file_url: '/images/logo-mds-main.png', created_at: '2026-05-23T09:17:00.000Z' },
  { jenis: 'Ijazah / SKL', file_url: '/images/logo-mds-main.png', created_at: '2026-05-23T09:18:00.000Z' },
  { jenis: 'Akta Kelahiran', file_url: '/images/logo-mds-main.png', created_at: '2026-05-23T09:19:00.000Z' },
  { jenis: `Kartu Keluarga ${prefix}`, file_url: '/images/logo-mds-main.png', created_at: '2026-05-23T09:20:00.000Z' }
]

const createMockParents = (lastName: string): AdminMockParent[] => [
  {
    nama: `Ayah ${lastName}`,
    nik: '3201010101700001',
    agama: 'Islam',
    no_telepon: '081234567890',
    email: `ayah.${lastName.toLowerCase()}@example.com`,
    hubungan: 'Ayah Kandung',
    peran: 'orang_tua',
    pekerjaan: 'Wiraswasta',
    pendidikan: 'SMA',
    penghasilan: 'Rp 3.000.000 - Rp 5.000.000'
  },
  {
    nama: `Ibu ${lastName}`,
    nik: '3201014101750002',
    agama: 'Islam',
    no_telepon: '081234567891',
    email: `ibu.${lastName.toLowerCase()}@example.com`,
    hubungan: 'Ibu Kandung',
    peran: 'orang_tua',
    pekerjaan: 'Ibu Rumah Tangga',
    pendidikan: 'SMA',
    penghasilan: '< Rp 3.000.000'
  }
]

const createInitialMockData = (): AdminMockPendaftar[] => [
  {
    id: 'MDS-2026-01814',
    nama: 'Syahrul Efendi',
    nik: '3201011201110001',
    nisn: '0101234567',
    status_berkas: 'Menunggu verifikasi',
    status_pendaftaran: 'Menunggu verifikasi',
    created_at: '2026-05-23T08:30:00.000Z',
    no_telepon: '081234567890',
    email: 'syahrul@example.com',
    tempat_lahir: 'Jakarta',
    tanggal_lahir: '2011-01-12',
    agama: 'Islam',
    jenis_kelamin: 'Laki-laki',
    alamat: 'Jl. Cendekia No. 12',
    rt: '001',
    rw: '002',
    kelurahan: 'Sepatan',
    kecamatan: 'Sepatan',
    kabupaten_kota: 'Tangerang',
    provinsi: 'Banten',
    kode_pos: '15520',
    gelombang: 1,
    program_paket: 'Paket C',
    riwayat_pendidikan: {
      nama_sekolah_asal: 'SMP Negeri 1 Jakarta',
      asal_sekolah: 'SMP Negeri 1 Jakarta',
      sekolah_asal: 'SMP Negeri 1 Jakarta'
    },
    orang_tua: createMockParents('Efendi'),
    berkas_persyaratan: createMockFiles('Efendi')
  },
  {
    id: 'MDS-2026-01033',
    nama: 'Ilham Candra Mukti',
    nik: '3201011802110002',
    nisn: '0058873120',
    status_berkas: 'Terverifikasi',
    status_pendaftaran: 'Menunggu verifikasi',
    created_at: '2026-05-22T10:15:00.000Z',
    no_telepon: '081298765432',
    email: 'ilham@example.com',
    tempat_lahir: 'Pekanbaru',
    tanggal_lahir: '2011-02-18',
    agama: 'Islam',
    jenis_kelamin: 'Laki-laki',
    alamat: 'Jl. Pendidikan No. 8',
    rt: '003',
    rw: '004',
    kelurahan: 'Kelawai',
    kecamatan: 'Sawangan',
    kabupaten_kota: 'Pekanbaru',
    provinsi: 'Riau',
    kode_pos: '15751',
    gelombang: 1,
    program_paket: 'Paket C',
    riwayat_pendidikan: {
      nama_sekolah_asal: 'SMP N Kelawai 2',
      asal_sekolah: 'SMP N Kelawai 2',
      sekolah_asal: 'SMP N Kelawai 2'
    },
    orang_tua: createMockParents('Mukti'),
    berkas_persyaratan: createMockFiles('Mukti')
  },
  {
    id: 'MDS-2026-00988',
    nama: 'Riswal Saputra',
    nik: '3201010502110003',
    nisn: '8922812345',
    status_berkas: 'Terverifikasi',
    status_pendaftaran: 'Diterima',
    created_at: '2026-05-21T14:20:00.000Z',
    no_telepon: '081377889900',
    email: 'riswal@example.com',
    tempat_lahir: 'Bandung',
    tanggal_lahir: '2011-02-05',
    agama: 'Islam',
    jenis_kelamin: 'Laki-laki',
    alamat: 'Jl. Melati No. 5',
    rt: '005',
    rw: '006',
    kelurahan: 'Cicendo',
    kecamatan: 'Cicendo',
    kabupaten_kota: 'Bandung',
    provinsi: 'Jawa Barat',
    kode_pos: '40171',
    gelombang: 2,
    program_paket: 'Paket C',
    riwayat_pendidikan: {
      nama_sekolah_asal: 'SMPN 88 PP',
      asal_sekolah: 'SMPN 88 PP',
      sekolah_asal: 'SMPN 88 PP'
    },
    orang_tua: createMockParents('Saputra'),
    berkas_persyaratan: createMockFiles('Saputra')
  }
]

const createInitialMockPaket = (): AdminMockPaketSekolah[] => [
  {
    id: 1,
    kode: 'paket-a',
    nama: 'Paket A',
    jenjang: 'Setara SD',
    status: 'nonaktif',
    kuota: 0,
    biaya_pendaftaran: 0,
    deskripsi: 'Program pendidikan kesetaraan setara SD.',
    created_at: '2026-05-23T08:00:00.000Z',
    updated_at: '2026-05-23T08:00:00.000Z'
  },
  {
    id: 2,
    kode: 'paket-b',
    nama: 'Paket B',
    jenjang: 'Setara SMP',
    status: 'nonaktif',
    kuota: 0,
    biaya_pendaftaran: 0,
    deskripsi: 'Program pendidikan kesetaraan setara SMP.',
    created_at: '2026-05-23T08:00:00.000Z',
    updated_at: '2026-05-23T08:00:00.000Z'
  },
  {
    id: 3,
    kode: 'paket-c',
    nama: 'Paket C',
    jenjang: 'Setara SMA',
    status: 'aktif',
    kuota: 120,
    biaya_pendaftaran: 150000,
    deskripsi: 'Program pendidikan kesetaraan setara SMA.',
    created_at: '2026-05-23T08:00:00.000Z',
    updated_at: '2026-05-23T08:00:00.000Z'
  }
]

const createInitialMockTimeline = (): AdminMockTimelinePpdb[] => [
  {
    id: 1,
    judul: 'Pendaftaran Online',
    deskripsi: 'Calon siswa mengisi formulir pendaftaran dan melengkapi data diri.',
    tanggal_mulai: '2026-07-01',
    tanggal_selesai: '2026-07-31',
    urutan: 1,
    status: 'aktif',
    tampil_publik: true,
    created_at: '2026-05-23T08:00:00.000Z',
    updated_at: '2026-05-23T08:00:00.000Z'
  },
  {
    id: 2,
    judul: 'Upload Berkas',
    deskripsi: 'Calon siswa mengunggah dokumen persyaratan PPDB.',
    tanggal_mulai: '2026-07-01',
    tanggal_selesai: '2026-08-05',
    urutan: 2,
    status: 'aktif',
    tampil_publik: true,
    created_at: '2026-05-23T08:00:00.000Z',
    updated_at: '2026-05-23T08:00:00.000Z'
  },
  {
    id: 3,
    judul: 'Verifikasi Berkas',
    deskripsi: 'Panitia memeriksa kelengkapan dan validitas dokumen pendaftar.',
    tanggal_mulai: '2026-08-06',
    tanggal_selesai: '2026-08-15',
    urutan: 3,
    status: 'aktif',
    tampil_publik: true,
    created_at: '2026-05-23T08:00:00.000Z',
    updated_at: '2026-05-23T08:00:00.000Z'
  },
  {
    id: 4,
    judul: 'Pengumuman Hasil',
    deskripsi: 'Hasil seleksi PPDB diumumkan kepada calon siswa.',
    tanggal_mulai: '2026-08-20',
    tanggal_selesai: '2026-08-20',
    urutan: 4,
    status: 'aktif',
    tampil_publik: true,
    created_at: '2026-05-23T08:00:00.000Z',
    updated_at: '2026-05-23T08:00:00.000Z'
  },
  {
    id: 5,
    judul: 'Daftar Ulang',
    deskripsi: 'Siswa yang diterima menyelesaikan proses daftar ulang.',
    tanggal_mulai: '2026-08-21',
    tanggal_selesai: '2026-08-31',
    urutan: 5,
    status: 'aktif',
    tampil_publik: true,
    created_at: '2026-05-23T08:00:00.000Z',
    updated_at: '2026-05-23T08:00:00.000Z'
  }
]

const normalizeMockId = (value: string) => value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()

const createMockNis = (item: AdminMockPendaftar) => {
  if (item.nis) return item.nis

  const acceptedDate = new Date(item.diterima_at || '2026-05-23T00:00:00.000Z')
  const year = String(acceptedDate.getFullYear()).slice(-2)
  const month = String(acceptedDate.getMonth() + 1).padStart(2, '0')
  const gelombang = String(item.gelombang || 1)
  const randomPart = normalizeMockId(item.id).slice(-4).padStart(4, '0')

  return `${year}${month}${gelombang}${randomPart}`
}

const toMockSiswa = (item: AdminMockPendaftar) => ({
  id: item.id,
  kode_pendaftaran: item.id,
  nis: createMockNis(item),
  nisn: item.nisn,
  nama: item.nama,
  nik: item.nik,
  jenis_kelamin: item.jenis_kelamin,
  no_telepon: item.no_telepon,
  email: item.email,
  asal_sekolah: item.riwayat_pendidikan?.nama_sekolah_asal || item.riwayat_pendidikan?.asal_sekolah || item.riwayat_pendidikan?.sekolah_asal || '',
  program: item.program_paket,
  program_paket: item.program_paket,
  gelombang: item.gelombang,
  tanggal_diterima: item.diterima_at || item.created_at,
  diterima_at: item.diterima_at || item.created_at,
  status: 'Aktif'
})

const readMockData = () => {
  if (!import.meta.client) return createInitialMockData()

  const raw = window.localStorage.getItem(ADMIN_MOCK_DATA_KEY)
  if (raw) {
    try {
      return JSON.parse(raw) as AdminMockPendaftar[]
    } catch {
      window.localStorage.removeItem(ADMIN_MOCK_DATA_KEY)
    }
  }

  const initialData = createInitialMockData()
  window.localStorage.setItem(ADMIN_MOCK_DATA_KEY, JSON.stringify(initialData))
  return initialData
}

const writeMockData = (data: AdminMockPendaftar[]) => {
  if (!import.meta.client) return
  window.localStorage.setItem(ADMIN_MOCK_DATA_KEY, JSON.stringify(data))
}

const readMockPaket = () => {
  if (!import.meta.client) return createInitialMockPaket()

  const raw = window.localStorage.getItem(ADMIN_MOCK_PAKET_KEY)
  if (raw) {
    try {
      return JSON.parse(raw) as AdminMockPaketSekolah[]
    } catch {
      window.localStorage.removeItem(ADMIN_MOCK_PAKET_KEY)
    }
  }

  const initialData = createInitialMockPaket()
  window.localStorage.setItem(ADMIN_MOCK_PAKET_KEY, JSON.stringify(initialData))
  return initialData
}

const writeMockPaket = (data: AdminMockPaketSekolah[]) => {
  if (!import.meta.client) return
  window.localStorage.setItem(ADMIN_MOCK_PAKET_KEY, JSON.stringify(data))
}

const readMockTimeline = () => {
  if (!import.meta.client) return createInitialMockTimeline()

  const raw = window.localStorage.getItem(ADMIN_MOCK_TIMELINE_KEY)
  if (raw) {
    try {
      return JSON.parse(raw) as AdminMockTimelinePpdb[]
    } catch {
      window.localStorage.removeItem(ADMIN_MOCK_TIMELINE_KEY)
    }
  }

  const initialData = createInitialMockTimeline()
  window.localStorage.setItem(ADMIN_MOCK_TIMELINE_KEY, JSON.stringify(initialData))
  return initialData
}

const writeMockTimeline = (data: AdminMockTimelinePpdb[]) => {
  if (!import.meta.client) return
  window.localStorage.setItem(ADMIN_MOCK_TIMELINE_KEY, JSON.stringify(data))
}

const createPaketKode = (nama: string) => nama
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '') || `paket-${Date.now()}`

const setMockAuth = (value: boolean) => {
  if (!import.meta.client) return
  window.localStorage.setItem(ADMIN_MOCK_AUTH_KEY, value ? 'true' : 'false')
}

const hasMockAuth = () => {
  if (!import.meta.client) return false
  return window.localStorage.getItem(ADMIN_MOCK_AUTH_KEY) === 'true'
}

const isAdminRouteContext = () => {
  if (!import.meta.client) return false
  return window.location.pathname.startsWith('/admin')
}

export const isAdminMockEndpoint = (endpoint: string) => {
  return adminMockEndpoints.includes(endpoint)
}

export const shouldUseAdminMockFallback = (endpoint: string, error: any) => {
  if (!isAdminRouteContext() || !isAdminMockEndpoint(endpoint)) return false

  const status = Number(error?.response?.status || error?.status || error?.statusCode || 0)
  if ((endpoint === '/api/paket-sekolah' || endpoint === '/api/paket-sekolah/aktif') && status === 404) return true
  if ((endpoint === '/api/timeline-ppdb' || endpoint === '/api/timeline-ppdb/publik') && status === 404) return true
  if (!status) return true
  return status >= 500
}

export const getAdminMockResponse = <T>(endpoint: string, method: AdminMockMethod, body?: any): T | null => {
  if (!isAdminRouteContext() || !isAdminMockEndpoint(endpoint)) return null

  if (endpoint === '/auth/login' && method === 'POST') {
    setMockAuth(true)
    return {
      status: true,
      success: true,
      message: 'Login berhasil menggunakan mock admin karena server tidak tersedia.',
      data: {
        id: 1,
        username: body?.username || 'mock_admin'
      }
    } as T
  }

  if (endpoint === '/auth/verify' && method === 'GET') {
    return {
      status: hasMockAuth(),
      success: hasMockAuth(),
      message: hasMockAuth() ? 'Mock token verified' : 'Mock token invalid',
      data: hasMockAuth() ? { id: 1, username: 'mock_admin' } : null
    } as T
  }

  if (endpoint === '/auth/logout') {
    setMockAuth(false)
    return { status: true, success: true, message: 'Logout berhasil' } as T
  }

  if (endpoint === '/api/pendaftar/data' && method === 'GET') {
    return readMockData() as T
  }

  if (endpoint === '/api/summary' && method === 'GET') {
    const data = readMockData()
    return {
      status: true,
      success: true,
      data: {
        total_pendaftar: data.length,
        diterima: data.filter(item => normalizeMockId(item.status_pendaftaran).includes('DITERIMA')).length,
        ditolak: data.filter(item => normalizeMockId(item.status_pendaftaran).includes('DITOLAK')).length,
        menunggu: data.filter(item => normalizeMockId(item.status_pendaftaran).includes('MENUNGGU')).length
      }
    } as T
  }

  if (endpoint === '/api/pendaftar/status' && method === 'POST') {
    const data = readMockData()
    const target = data.find(item => normalizeMockId(item.id) === normalizeMockId(String(body?.id || '')))
    if (target) {
      target.status_pendaftaran = body?.accept ? 'Diterima' : 'Ditolak'
      if (body?.accept) {
        target.diterima_at = new Date().toISOString()
        target.nis = createMockNis(target)
      }
    }
    writeMockData(data)
    return {
      status: true,
      success: true,
      message: body?.accept ? 'Pendaftar berhasil diterima (mock)' : 'Pendaftar berhasil ditolak (mock)'
    } as T
  }

  if ((endpoint === '/api/siswa/data' || endpoint === '/api/siswa') && method === 'GET') {
    const data = readMockData()
    return data
      .filter(item => normalizeMockId(item.status_pendaftaran).includes('DITERIMA'))
      .map(toMockSiswa) as T
  }

  if (endpoint === '/api/paket-sekolah/aktif' && method === 'GET') {
    return readMockPaket().filter(item => item.status === 'aktif') as T
  }

  if (endpoint === '/api/paket-sekolah' && method === 'GET') {
    const paket = readMockPaket()
    const pendaftar = readMockData()

    return paket.map(item => ({
      ...item,
      total_pendaftar: pendaftar.filter(registration => registration.program_paket === item.nama).length,
      total_diterima: pendaftar.filter(registration => registration.program_paket === item.nama && normalizeMockId(registration.status_pendaftaran).includes('DITERIMA')).length
    })) as T
  }

  if (endpoint === '/api/paket-sekolah' && method === 'POST') {
    const paket = readMockPaket()
    const now = new Date().toISOString()
    const nextId = Math.max(0, ...paket.map(item => item.id)) + 1
    const nextItem: AdminMockPaketSekolah = {
      id: nextId,
      kode: body?.kode || createPaketKode(String(body?.nama || `Paket ${nextId}`)),
      nama: String(body?.nama || ''),
      jenjang: String(body?.jenjang || ''),
      status: body?.status === 'aktif' ? 'aktif' : 'nonaktif',
      kuota: Number(body?.kuota || 0),
      biaya_pendaftaran: Number(body?.biaya_pendaftaran || 0),
      deskripsi: String(body?.deskripsi || ''),
      created_at: now,
      updated_at: now
    }

    paket.push(nextItem)
    writeMockPaket(paket)
    return {
      status: true,
      success: true,
      message: 'Paket sekolah berhasil ditambahkan (mock)',
      data: nextItem
    } as T
  }

  if (endpoint === '/api/paket-sekolah' && (method === 'PUT' || method === 'PATCH')) {
    const paket = readMockPaket()
    const target = paket.find(item => item.id === Number(body?.id))

    if (target) {
      target.nama = String(body?.nama ?? target.nama)
      target.kode = String(body?.kode || createPaketKode(target.nama))
      target.jenjang = String(body?.jenjang ?? target.jenjang)
      target.status = body?.status === 'aktif' ? 'aktif' : 'nonaktif'
      target.kuota = Number(body?.kuota ?? target.kuota)
      target.biaya_pendaftaran = Number(body?.biaya_pendaftaran ?? target.biaya_pendaftaran)
      target.deskripsi = String(body?.deskripsi ?? target.deskripsi)
      target.updated_at = new Date().toISOString()
    }

    writeMockPaket(paket)
    return {
      status: true,
      success: true,
      message: target ? 'Paket sekolah berhasil diperbarui (mock)' : 'Paket sekolah tidak ditemukan',
      data: target || null
    } as T
  }

  if (endpoint === '/api/paket-sekolah' && method === 'DELETE') {
    const paket = readMockPaket()
    const pendaftar = readMockData()
    const target = paket.find(item => item.id === Number(body?.id))

    if (target && pendaftar.some(item => item.program_paket === target.nama)) {
      target.status = 'nonaktif'
      target.updated_at = new Date().toISOString()
      writeMockPaket(paket)
      return {
        status: true,
        success: true,
        message: 'Paket sudah memiliki histori pendaftar, jadi dinonaktifkan (mock)'
      } as T
    }

    writeMockPaket(paket.filter(item => item.id !== Number(body?.id)))
    return {
      status: true,
      success: true,
      message: 'Paket sekolah berhasil dihapus (mock)'
    } as T
  }

  if (endpoint === '/api/timeline-ppdb/publik' && method === 'GET') {
    return readMockTimeline()
      .filter(item => item.status === 'aktif' && item.tampil_publik)
      .sort((a, b) => a.urutan - b.urutan) as T
  }

  if (endpoint === '/api/timeline-ppdb' && method === 'GET') {
    return readMockTimeline().sort((a, b) => a.urutan - b.urutan) as T
  }

  if (endpoint === '/api/timeline-ppdb' && method === 'POST') {
    const timeline = readMockTimeline()
    const now = new Date().toISOString()
    const nextId = Math.max(0, ...timeline.map(item => item.id)) + 1
    const nextItem: AdminMockTimelinePpdb = {
      id: nextId,
      judul: String(body?.judul || ''),
      deskripsi: String(body?.deskripsi || ''),
      tanggal_mulai: String(body?.tanggal_mulai || ''),
      tanggal_selesai: String(body?.tanggal_selesai || ''),
      urutan: Number(body?.urutan || timeline.length + 1),
      status: body?.status === 'nonaktif' ? 'nonaktif' : 'aktif',
      tampil_publik: Boolean(body?.tampil_publik),
      created_at: now,
      updated_at: now
    }

    timeline.push(nextItem)
    writeMockTimeline(timeline)
    return {
      status: true,
      success: true,
      message: 'Tahap timeline berhasil ditambahkan (mock)',
      data: nextItem
    } as T
  }

  if (endpoint === '/api/timeline-ppdb' && (method === 'PUT' || method === 'PATCH')) {
    const timeline = readMockTimeline()
    const target = timeline.find(item => item.id === Number(body?.id))

    if (target) {
      target.judul = String(body?.judul ?? target.judul)
      target.deskripsi = String(body?.deskripsi ?? target.deskripsi)
      target.tanggal_mulai = String(body?.tanggal_mulai ?? target.tanggal_mulai)
      target.tanggal_selesai = String(body?.tanggal_selesai ?? target.tanggal_selesai)
      target.urutan = Number(body?.urutan ?? target.urutan)
      target.status = body?.status === 'nonaktif' ? 'nonaktif' : 'aktif'
      target.tampil_publik = Boolean(body?.tampil_publik)
      target.updated_at = new Date().toISOString()
    }

    writeMockTimeline(timeline)
    return {
      status: true,
      success: true,
      message: target ? 'Tahap timeline berhasil diperbarui (mock)' : 'Tahap timeline tidak ditemukan',
      data: target || null
    } as T
  }

  if (endpoint === '/api/timeline-ppdb' && method === 'DELETE') {
    const timeline = readMockTimeline().filter(item => item.id !== Number(body?.id))
    writeMockTimeline(timeline)
    return {
      status: true,
      success: true,
      message: 'Tahap timeline berhasil dihapus (mock)'
    } as T
  }

  if (endpoint === '/api/pendaftar/berkas' && method === 'POST') {
    const data = readMockData()
    const target = data.find(item => normalizeMockId(item.id) === normalizeMockId(String(body?.id || '')))
    const acceptValue = Number(body?.accept)
    if (target) target.status_berkas = acceptValue === 1 ? 'Berkas sesuai' : acceptValue === 2 ? 'Menunggu pembaruan' : 'Ditolak'
    writeMockData(data)
    return {
      status: true,
      success: true,
      message: acceptValue === 1
        ? 'Berkas lengkap dan sesuai (mock)'
        : acceptValue === 2
          ? 'Permintaan pembaruan berkas berhasil dikirim (mock)'
          : 'Berkas berhasil ditolak (mock)'
    } as T
  }

  if (endpoint === '/register/cek-status' && method === 'POST') {
    const data = readMockData()
    const target = data.find(item => normalizeMockId(item.id) === normalizeMockId(String(body?.kode_pendaftaran || '')))

    if (!target) {
      return {
        status: false,
        success: false,
        message: 'Pendaftaran tidak ditemukan',
        data: null
      } as T
    }

    return {
      status: true,
      success: true,
      message: 'Pendaftaran ditemukan (mock)',
      data: {
        id: target.id,
        kode: target.id,
        status: target.status_pendaftaran,
        status_pendaftaran: target.status_pendaftaran,
        created_at: target.created_at
      }
    } as T
  }

  return null
}

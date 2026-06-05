import type {
  AdminBerkasDto,
  AdminOrangTuaDto,
  AdminPendaftarDto,
  ParentData,
  Registration,
  RegistrationFile,
  RegistrationStatus
} from '~/types/adminPendaftaran'

export const defaultBerkas: RegistrationFile[] = [
  { id: 'foto', name: 'Foto Siswa (3x4 berwarna)', url: '' },
  { id: 'rapor', name: 'Buku Rapor SMP', url: '' },
  { id: 'surat-nilai', name: 'Surat Keterangan Nilai Rapor Semester I-V', url: '' },
  { id: 'ijazah', name: 'Ijazah / SKL', url: '' },
  { id: 'akta', name: 'Akta Kelahiran', url: '' },
  { id: 'kk', name: 'Kartu Keluarga', url: '' }
]

const defaultPersyaratanBerkas = defaultBerkas.slice(1)

export const normalizeStatus = (status: string): RegistrationStatus => {
  const normalized = status.toLowerCase()

  if (normalized.includes('terima') || normalized.includes('diterima') || normalized.includes('approved')) return 'approved'
  if (normalized.includes('tolak') || normalized.includes('ditolak') || normalized.includes('rejected')) return 'rejected'
  return 'pending'
}

export const normalizeActionId = (id: string) => id.replace(/[^a-zA-Z0-9]/g, '')

export const ensurePendaftarArray = (response: unknown): AdminPendaftarDto[] => {
  if (Array.isArray(response)) return response as AdminPendaftarDto[]

  const data = response as {
    data?: AdminPendaftarDto | AdminPendaftarDto[]
    result?: AdminPendaftarDto | AdminPendaftarDto[]
    items?: AdminPendaftarDto[]
    id?: string
  } | null

  if (Array.isArray(data?.data)) return data.data
  if (data?.data) return [data.data]
  if (Array.isArray(data?.result)) return data.result
  if (data?.result) return [data.result]
  if (Array.isArray(data?.items)) return data.items
  if (data && typeof data === 'object' && 'id' in data) return [data as AdminPendaftarDto]
  return []
}

const normalizeAssetUrl = (url: string | undefined, apiBaseUrl: string) => {
  const rawUrl = String(url || '').trim()
  if (!rawUrl) return ''
  if (/^https?:\/\//i.test(rawUrl)) return rawUrl

  const baseUrl = apiBaseUrl.replace(/\/$/, '')
  const path = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`
  return `${baseUrl}${path}`
}

const asBerkasArray = (value?: AdminBerkasDto[] | AdminBerkasDto) => {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

const asOrangTuaArray = (value?: AdminOrangTuaDto[] | AdminOrangTuaDto) => {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

const getAllBerkas = (item: AdminPendaftarDto) => {
  return [
    ...asBerkasArray(item.berkas_persyaratan),
    ...asBerkasArray(item.berkas_pendaftaran),
    ...asBerkasArray(item.berkas),
    ...asBerkasArray(item.dokumen),
    ...asBerkasArray(item.files)
  ]
}

const getBerkasLabel = (file: AdminBerkasDto) => {
  return [
    file.jenis_berkas,
    file.jenis,
    file.tipe,
    file.kategori,
    file.nama,
    file.nama_berkas,
    file.nama_file
  ].filter(Boolean).join(' ').toLowerCase()
}

const getBerkasDisplayName = (file: AdminBerkasDto, index: number) => {
  return file.jenis_berkas ||
    file.jenis ||
    file.tipe ||
    file.kategori ||
    file.nama ||
    file.nama_berkas ||
    file.nama_file ||
    `Berkas ${index + 1}`
}

const getBerkasUrl = (file: AdminBerkasDto | undefined, apiBaseUrl: string): string => {
  if (!file) return ''

  return normalizeAssetUrl(
    file.url ||
    file.url_file ||
    file.file_url ||
    file.file ||
    file.berkas ||
    file.path ||
    file.path_file ||
    file.file_path ||
    file.lokasi_file ||
    getBerkasUrl(file.data, apiBaseUrl) ||
    getBerkasUrl(file.file_data, apiBaseUrl),
    apiBaseUrl
  )
}

const getFotoUrl = (item: AdminPendaftarDto, apiBaseUrl: string) => {
  const directUrl = item.pass_photo
  if (directUrl) return normalizeAssetUrl(directUrl, apiBaseUrl)

  const berkasList = getAllBerkas(item)
  const fotoBerkas = berkasList.find(file => {
    const label = getBerkasLabel(file)
    return label.includes('foto') || label.includes('photo') || label.includes('pas')
  })

  return getBerkasUrl(fotoBerkas, apiBaseUrl)
}

const getPendaftarBerkasFiles = (item: AdminPendaftarDto, apiBaseUrl: string): RegistrationFile[] => {
  const fotoUrl = getFotoUrl(item, apiBaseUrl)
  const fotoFile: RegistrationFile[] = fotoUrl
    ? [{
        id: 'foto',
        name: 'Foto Siswa (3x4 berwarna)',
        url: fotoUrl
      }]
    : []
  const berkasList = getAllBerkas(item)

  const uploadedFiles = berkasList
    .map((file, index) => ({
      id: `${getBerkasDisplayName(file, index)}-${index}`,
      name: getBerkasDisplayName(file, index),
      url: getBerkasUrl(file, apiBaseUrl)
    }))
    .filter(file => file.url)
    .filter(file => {
      const label = file.name.toLowerCase()
      return !label.includes('foto') && !label.includes('photo') && !label.includes('pas')
    })

  const hasJsonStringIndexedLabels = uploadedFiles.length > 1 &&
    uploadedFiles.every(file => file.name.length <= 1) &&
    (uploadedFiles[0]?.name === '[' || uploadedFiles[1]?.name === '"')

  if (hasJsonStringIndexedLabels) {
    return [
      ...fotoFile,
      ...uploadedFiles.map((file, index) => ({
      ...file,
      id: defaultPersyaratanBerkas[index]?.id || file.id,
      name: defaultPersyaratanBerkas[index]?.name || file.name
      }))
    ]
  }

  return fotoFile.length || uploadedFiles.length ? [...fotoFile, ...uploadedFiles] : defaultBerkas
}

const getParentTitle = (parent: AdminOrangTuaDto, index: number) => {
  const relation = `${parent.hubungan || ''} ${parent.peran || ''}`.toLowerCase()

  if (relation.includes('ayah')) return 'Ayah'
  if (relation.includes('ibu')) return 'Ibu'
  if (relation.includes('wali')) return 'Wali'
  return `Orang Tua ${index + 1}`
}

const getPendaftarOrangTua = (item: AdminPendaftarDto): ParentData[] => {
  return asOrangTuaArray(item.orang_tua)
    .filter(parent => Object.values(parent).some(Boolean))
    .map((parent, index) => ({
      id: `${parent.peran || 'orang-tua'}-${parent.hubungan || index}`,
      title: getParentTitle(parent, index),
      nama: parent.nama || '-',
      nik: parent.nik || '-',
      agama: parent.agama || '-',
      hubungan: parent.hubungan_lainnya || parent.hubungan || '-',
      peran: parent.peran || '-',
      hp: parent.no_telepon || parent.telepon || parent.phone || '-',
      email: parent.email || '-',
      pendidikan: parent.pendidikan || '-',
      pekerjaan: parent.pekerjaan || '-',
      penghasilan: parent.penghasilan || parent.gaji || '-'
    }))
}

export const mapPendaftar = (item: AdminPendaftarDto, apiBaseUrl: string): Registration => ({
  id: item.id,
  nama: item.nama,
  fotoUrl: getFotoUrl(item, apiBaseUrl),
  nisn: item.nisn,
  sekolah: item.riwayat_pendidikan?.nama_sekolah_asal || '-',
  tanggal: item.created_at,
  status: normalizeStatus(item.status_pendaftaran),
  statusText: item.status_pendaftaran || 'Menunggu verifikasi',
  statusBerkas: item.status_berkas || 'Menunggu verifikasi',
  nik: item.nik,
  email: item.email,
  hp: item.no_telepon,
  tempatLahir: item.tempat_lahir,
  tanggalLahir: item.tanggal_lahir,
  jenisKelamin: item.jenis_kelamin,
  agama: item.agama || '-',
  alamat: item.alamat,
  rtRw: `${item.rt || '-'} / ${item.rw || '-'}`,
  kodePos: item.kode_pos,
  provinsi: item.provinsi,
  kota: item.kabupaten_kota || '-',
  kecamatan: item.kecamatan,
  kelurahan: item.kelurahan,
  gelombang: item.gelombang ?? null,
  orangTua: getPendaftarOrangTua(item),
  berkasFiles: getPendaftarBerkasFiles(item, apiBaseUrl),
  riwayatPendidikan: item.riwayat_pendidikan || null,
  program: item.program_paket || '-'
})

export const mapPendaftarList = (response: unknown, apiBaseUrl: string): Registration[] => {
  return ensurePendaftarArray(response).map(item => mapPendaftar(item, apiBaseUrl))
}

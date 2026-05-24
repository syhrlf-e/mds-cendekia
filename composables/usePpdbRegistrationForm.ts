export const PPDB_ORANG_TUA_ROLE_CONFIG = {
  ayah: {
    hubungan: 'Ayah',
    peran: 'Wali'
  },
  ibu: {
    hubungan: 'Ibu',
    peran: 'Wali'
  },
  wali: {
    hubungan: 'Wali',
    peran: 'Wali'
  }
} as const

export type PpdbBiodataForm = {
  nama: string
  nisn: string
  nik: string
  email: string
  no_telepon: string
  tanggal_lahir: string
  tempat_lahir: string
  jenis_kelamin: string
  agama: string
  alamat: string
  rt: string
  rw: string
  provinsi: string
  kabupaten_kota: string
  kecamatan: string
  kelurahan: string
  kode_pos: string
  id_gelombang: string
  id_program: string
}

export type PpdbSekolahForm = {
  nama_sekolah_asal: string
  alamat_sekolah_asal: string
  npsn_sekolah_asal: string
  tahun_lulus: string
  no_ijazah: string
}

export type PpdbOrangTuaForm = {
  peran: string
  hubungan: string
  nama: string
  nik: string
  agama: string
  pendidikan: string
  pekerjaan: string
  gaji: string
  no_telepon: string
  email: string
  hubungan_lainnya: string
}

export type PpdbRegistrationFiles = {
  foto: File
  rapor: File
  skRapor: File
  ijazah: File
  akta: File
  kk: File
}

export type PpdbWilayahLabels = Partial<{
  provinsi: string
  kabupaten_kota: string
  kecamatan: string
  kelurahan: string
}>

const normalizeGaji = (value: string) => {
  const gajiMap: Record<string, string> = {
    '<1M': '1000000',
    '1M-2M': '2000000',
    '2M-5M': '5000000',
    '5M-10M': '10000000',
    '>10M': '10000001'
  }

  return gajiMap[value] || value
}

export const createEmptyOrangTua = (
  type: keyof typeof PPDB_ORANG_TUA_ROLE_CONFIG
): PpdbOrangTuaForm => ({
  peran: PPDB_ORANG_TUA_ROLE_CONFIG[type].peran,
  hubungan: PPDB_ORANG_TUA_ROLE_CONFIG[type].hubungan,
  nama: '',
  nik: '',
  agama: '',
  pendidikan: '',
  pekerjaan: '',
  gaji: '',
  no_telepon: '',
  email: '',
  hubungan_lainnya: ''
})

export const usePpdbRegistrationForm = () => {
  const storageKey = 'ppdb-registration-form'
  const biodata = useState<PpdbBiodataForm>('ppdb:biodata', () => ({
    nama: '',
    nisn: '',
    nik: '',
    email: '',
    no_telepon: '',
    tanggal_lahir: '',
    tempat_lahir: '',
    jenis_kelamin: '',
    agama: '',
    alamat: '',
    rt: '',
    rw: '',
    provinsi: '',
    kabupaten_kota: '',
    kecamatan: '',
    kelurahan: '',
    kode_pos: '',
    id_gelombang: '',
    id_program: ''
  }))

  const sekolah = useState<PpdbSekolahForm>('ppdb:sekolah', () => ({
    nama_sekolah_asal: '',
    alamat_sekolah_asal: '',
    npsn_sekolah_asal: '',
    tahun_lulus: '',
    no_ijazah: ''
  }))

  const orangTua = useState<PpdbOrangTuaForm[]>('ppdb:orang-tua', () => [
    createEmptyOrangTua('ayah'),
    createEmptyOrangTua('ibu')
  ])

  const isWaliBerbeda = useState<boolean>('ppdb:is-wali-berbeda', () => false)
  const isHydrated = useState<boolean>('ppdb:is-hydrated', () => false)
  const isRestoringDraft = useState<boolean>('ppdb:is-restoring-draft', () => false)

  const ensureOrangTuaShape = () => {
    if (!orangTua.value[0]) orangTua.value[0] = createEmptyOrangTua('ayah')
    if (!orangTua.value[1]) orangTua.value[1] = createEmptyOrangTua('ibu')
    if (!orangTua.value[2]) orangTua.value[2] = createEmptyOrangTua('wali')

    orangTua.value[0].hubungan = PPDB_ORANG_TUA_ROLE_CONFIG.ayah.hubungan
    orangTua.value[0].peran = PPDB_ORANG_TUA_ROLE_CONFIG.ayah.peran
    orangTua.value[1].hubungan = PPDB_ORANG_TUA_ROLE_CONFIG.ibu.hubungan
    orangTua.value[1].peran = PPDB_ORANG_TUA_ROLE_CONFIG.ibu.peran
    orangTua.value[2].peran = PPDB_ORANG_TUA_ROLE_CONFIG.wali.peran

    orangTua.value.forEach((item) => {
      item.pendidikan ||= ''
      item.pekerjaan ||= ''
      item.gaji ||= ''
      item.no_telepon ||= ''
      item.email ||= ''
      item.hubungan_lainnya ||= ''
    })
  }

  const payloadOrangTua = computed(() => {
    ensureOrangTuaShape()

    return orangTua.value
      .slice(0, isWaliBerbeda.value ? 3 : 2)
      .map((item) => ({
        peran: item.peran,
        hubungan: item.hubungan === 'Lainnya' ? item.hubungan_lainnya : item.hubungan,
        nama: item.nama,
        nik: item.nik,
        agama: item.agama,
        pendidikan: item.pendidikan,
        pekerjaan: item.pekerjaan,
        gaji: normalizeGaji(item.gaji),
        no_telepon: item.no_telepon,
        email: item.email
      }))
  })

  const buildPayload = (wilayahLabels: PpdbWilayahLabels = {}) => ({
    nisn: biodata.value.nisn,
    biodata: {
      nama: biodata.value.nama,
      nik: biodata.value.nik,
      agama: biodata.value.agama,
      tempat_lahir: biodata.value.tempat_lahir,
      tanggal_lahir: biodata.value.tanggal_lahir,
      jenis_kelamin: biodata.value.jenis_kelamin,
      no_telepon: biodata.value.no_telepon,
      email: biodata.value.email
    },
    alamat: {
      alamat: biodata.value.alamat,
      rt: biodata.value.rt,
      rw: biodata.value.rw,
      provinsi: wilayahLabels.provinsi || biodata.value.provinsi,
      kabupaten_kota: wilayahLabels.kabupaten_kota || biodata.value.kabupaten_kota,
      kecamatan: wilayahLabels.kecamatan || biodata.value.kecamatan,
      kelurahan: wilayahLabels.kelurahan || biodata.value.kelurahan,
      kode_pos: biodata.value.kode_pos
    },
    riwayat_pendidikan: sekolah.value,
    orang_tua: payloadOrangTua.value,
    id_program: Number(biodata.value.id_program || useRuntimeConfig().public.ppdbProgramId || 1),
    id_gelombang: Number(biodata.value.id_gelombang || useRuntimeConfig().public.ppdbGelombangId || 3)
  })

  const buildMultipartPayload = (files: PpdbRegistrationFiles, wilayahLabels: PpdbWilayahLabels = {}) => {
    const payload = buildPayload(wilayahLabels)
    const formData = new FormData()
    const berkasPersyaratan = [
      { jenis: 'Rapor', file: files.rapor },
      { jenis: 'SK Rapor', file: files.skRapor },
      { jenis: 'Ijazah', file: files.ijazah },
      { jenis: 'Akta', file: files.akta },
      { jenis: 'KK', file: files.kk }
    ]

    formData.append('nisn', payload.nisn)
    formData.append('biodata', JSON.stringify(payload.biodata))
    formData.append('alamat', JSON.stringify(payload.alamat))
    formData.append('riwayat_pendidikan', JSON.stringify(payload.riwayat_pendidikan))
    formData.append('orang_tua', JSON.stringify(payload.orang_tua))
    formData.append('id_program', String(payload.id_program))
    formData.append('id_gelombang', String(payload.id_gelombang))
    formData.append('pass_photo', files.foto)

    berkasPersyaratan.forEach((item) => {
      formData.append('jenis_berkas', item.jenis)
      formData.append('berkas_persyaratan', item.file)
    })

    return formData
  }

  const saveToStorage = () => {
    if (!import.meta.client || !isHydrated.value || isRestoringDraft.value) return

    localStorage.setItem(storageKey, JSON.stringify({
      biodata: biodata.value,
      sekolah: sekolah.value,
      orangTua: orangTua.value,
      isWaliBerbeda: isWaliBerbeda.value
    }))
  }

  const hydrateFromStorage = () => {
    if (!import.meta.client || isHydrated.value) return

    try {
      const raw = localStorage.getItem(storageKey)
      if (!raw) {
        isHydrated.value = true
        return
      }

      const saved = JSON.parse(raw) as Partial<{
        biodata: PpdbBiodataForm
        sekolah: PpdbSekolahForm
        orangTua: PpdbOrangTuaForm[]
        isWaliBerbeda: boolean
      }>

      isRestoringDraft.value = true
      if (saved.biodata) Object.assign(biodata.value, saved.biodata)
      if (saved.sekolah) Object.assign(sekolah.value, saved.sekolah)
      if (Array.isArray(saved.orangTua)) {
        ensureOrangTuaShape()
        saved.orangTua.forEach((item, index) => {
          if (!orangTua.value[index]) return
          Object.assign(orangTua.value[index], {
            ...item,
            gaji: item.gaji || (item as PpdbOrangTuaForm & { penghasilan?: string }).penghasilan || ''
          })
        })
      }
      if (typeof saved.isWaliBerbeda === 'boolean') isWaliBerbeda.value = saved.isWaliBerbeda
    } catch {
      localStorage.removeItem(storageKey)
    } finally {
      isHydrated.value = true
      ensureOrangTuaShape()
      nextTick(() => {
        isRestoringDraft.value = false
      })
    }
  }

  const resetForm = () => {
    Object.assign(biodata.value, {
      nama: '',
      nisn: '',
      nik: '',
      email: '',
      no_telepon: '',
      tanggal_lahir: '',
      tempat_lahir: '',
      jenis_kelamin: '',
      agama: '',
      alamat: '',
      rt: '',
      rw: '',
      provinsi: '',
      kabupaten_kota: '',
      kecamatan: '',
      kelurahan: '',
      kode_pos: '',
      id_gelombang: '',
      id_program: ''
    })

    Object.assign(sekolah.value, {
      nama_sekolah_asal: '',
      alamat_sekolah_asal: '',
      npsn_sekolah_asal: '',
      tahun_lulus: '',
      no_ijazah: ''
    })

    orangTua.value = [
      createEmptyOrangTua('ayah'),
      createEmptyOrangTua('ibu'),
      createEmptyOrangTua('wali')
    ]
    isWaliBerbeda.value = false

    if (import.meta.client) {
      localStorage.removeItem(storageKey)
    }
  }

  ensureOrangTuaShape()

  if (import.meta.client) {
    onMounted(() => {
      hydrateFromStorage()
    })
    watch([biodata, sekolah, orangTua, isWaliBerbeda], saveToStorage, { deep: true })
  }

  return {
    biodata,
    sekolah,
    orangTua,
    isWaliBerbeda,
    isRestoringDraft,
    ensureOrangTuaShape,
    payloadOrangTua,
    buildPayload,
    buildMultipartPayload,
    hydrateFromStorage,
    saveToStorage,
    resetForm
  }
}

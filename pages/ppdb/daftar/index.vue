<script setup lang="ts">
import { reactive, ref, computed, watch, onMounted } from 'vue'

useHead({ title: 'Formulir Pendaftaran | PPDB MDS Cendekia' })

// Form State Accordion 1
const form = reactive({
  nama: '',
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

const errors = reactive<Record<string, string>>({})

// Static Options
const agamaOptions = [
  { label: 'Islam', value: 'Islam' },
  { label: 'Kristen', value: 'Kristen' },
  { label: 'Katolik', value: 'Katolik' },
  { label: 'Hindu', value: 'Hindu' },
  { label: 'Buddha', value: 'Buddha' },
  { label: 'Konghucu', value: 'Konghucu' }
]

const golDarahOptions = [
  { label: 'A', value: 'A' },
  { label: 'B', value: 'B' },
  { label: 'AB', value: 'AB' },
  { label: 'O', value: 'O' },
  { label: 'Tidak Tahu', value: 'Tidak Tahu' }
]

// Form State Accordion 2
const formSekolah = reactive({
  nama_sekolah_asal: '',
  alamat_sekolah_asal: '',
  npsn_sekolah_asal: '',
  tahun_lulus: '',
  no_ijazah: ''
})

// Form State Accordion 3
const formOrtu = reactive({
  namaAyah: '',
  nikAyah: '',
  tempatLahirAyah: '',
  tanggalLahirAyah: '',
  pendidikanAyah: '',
  pekerjaanAyah: '',
  penghasilanAyah: '',
  noHpAyah: '',
  namaIbu: '',
  nikIbu: '',
  tempatLahirIbu: '',
  tanggalLahirIbu: '',
  pendidikanIbu: '',
  pekerjaanIbu: '',
  penghasilanIbu: '',
  noHpIbu: '',
  isWaliBerbeda: false,
  namaWali: '',
  hubunganWali: '',
  noHpWali: '',
  alamatWali: ''
})

const pendidikanOptions = [
  { label: 'Tidak Sekolah', value: 'Tidak Sekolah' },
  { label: 'SD/Sederajat', value: 'SD' },
  { label: 'SMP/Sederajat', value: 'SMP' },
  { label: 'SMA/Sederajat', value: 'SMA' },
  { label: 'D1/D2/D3', value: 'Diploma' },
  { label: 'S1/D4', value: 'S1' },
  { label: 'S2', value: 'S2' },
  { label: 'S3', value: 'S3' }
]

const penghasilanOptions = [
  { label: 'Kurang dari Rp 1.000.000', value: '<1M' },
  { label: 'Rp 1.000.000 - Rp 2.000.000', value: '1M-2M' },
  { label: 'Rp 2.000.000 - Rp 5.000.000', value: '2M-5M' },
  { label: 'Rp 5.000.000 - Rp 10.000.000', value: '5M-10M' },
  { label: 'Lebih dari Rp 10.000.000', value: '>10M' }
]

type StringRecord = Record<string, string>

const sanitizeDigits = (value: unknown, maxLength?: number) => {
  const sanitized = String(value ?? '').replace(/\D/g, '')
  return typeof maxLength === 'number' ? sanitized.slice(0, maxLength) : sanitized
}

const sanitizePhone = (value: unknown) => String(value ?? '')
  .replace(/[^\d+]/g, '')
  .replace(/(?!^)\+/g, '')
  .slice(0, 15)

const sanitizeIndonesianMobile = (value: unknown) => {
  const digits = sanitizeDigits(value, 13)
  if (!digits) return ''
  if (digits.startsWith('08')) return digits.slice(0, 13)
  if (digits.startsWith('8')) return `0${digits}`.slice(0, 13)
  if (digits.startsWith('0')) return digits.slice(0, 13)
  return `08${digits}`.slice(0, 13)
}

const sanitizeName = (value: unknown) => String(value ?? '')
  .replace(/[^a-zA-Z\s]/g, '')
  .replace(/\s{2,}/g, ' ')
  .slice(0, 80)

const stripControlChars = (value: string) => Array.from(value)
  .filter((char) => {
    const code = char.charCodeAt(0)
    return code >= 32 && code !== 127
  })
  .join('')

const sanitizeSafeText = (value: unknown, maxLength = 160) => stripControlChars(String(value ?? ''))
  .replace(/[<>{}`\\]/g, '')
  .replace(/\s{2,}/g, ' ')
  .slice(0, maxLength)

const sanitizeEmail = (value: unknown) => String(value ?? '')
  .trim()
  .toLowerCase()
  .replace(/\s/g, '')
  .replace(/[<>{}`\\'"]/g, '')
  .slice(0, 120)

const setSanitized = (target: StringRecord, key: string, sanitized: string) => {
  if (target[key] !== sanitized) {
    target[key] = sanitized
  }
}

// Sanitization Watchers (Global Form Input Sanitization)
watch(form, (val) => {
  const fields = val as StringRecord
  setSanitized(fields, 'nama', sanitizeName(val.nama))
  setSanitized(fields, 'nik', sanitizeDigits(val.nik, 16))
  setSanitized(fields, 'tempat_lahir', sanitizeName(val.tempat_lahir))
  setSanitized(fields, 'alamat', sanitizeSafeText(val.alamat, 220))
  setSanitized(fields, 'rt', sanitizeDigits(val.rt, 3))
  setSanitized(fields, 'rw', sanitizeDigits(val.rw, 3))
  setSanitized(fields, 'kode_pos', sanitizeDigits(val.kode_pos, 5))
  setSanitized(fields, 'no_telepon', sanitizeIndonesianMobile(val.no_telepon))
  setSanitized(fields, 'email', sanitizeEmail(val.email))
}, { deep: true })

watch(formSekolah, (val) => {
  const fields = val as StringRecord
  setSanitized(fields, 'nama_sekolah_asal', sanitizeSafeText(val.nama_sekolah_asal, 120))
  setSanitized(fields, 'npsn_sekolah_asal', sanitizeDigits(val.npsn_sekolah_asal, 8))
  setSanitized(fields, 'alamat_sekolah_asal', sanitizeSafeText(val.alamat_sekolah_asal, 220))
  setSanitized(fields, 'tahun_lulus', sanitizeDigits(val.tahun_lulus, 4))
  setSanitized(fields, 'no_ijazah', sanitizeSafeText(val.no_ijazah, 80))
}, { deep: true })

watch(formOrtu, (val) => {
  const fields = val as unknown as StringRecord
  setSanitized(fields, 'namaAyah', sanitizeName(val.namaAyah))
  setSanitized(fields, 'namaIbu', sanitizeName(val.namaIbu))
  setSanitized(fields, 'namaWali', sanitizeName(val.namaWali))
  setSanitized(fields, 'tempatLahirAyah', sanitizeName(val.tempatLahirAyah))
  setSanitized(fields, 'tempatLahirIbu', sanitizeName(val.tempatLahirIbu))
  setSanitized(fields, 'nikAyah', sanitizeDigits(val.nikAyah, 16))
  setSanitized(fields, 'nikIbu', sanitizeDigits(val.nikIbu, 16))
  setSanitized(fields, 'pekerjaanAyah', sanitizeSafeText(val.pekerjaanAyah, 80))
  setSanitized(fields, 'pekerjaanIbu', sanitizeSafeText(val.pekerjaanIbu, 80))
  setSanitized(fields, 'hubunganWali', sanitizeSafeText(val.hubunganWali, 60))
  setSanitized(fields, 'alamatWali', sanitizeSafeText(val.alamatWali, 220))
  setSanitized(fields, 'noHpAyah', sanitizePhone(val.noHpAyah))
  setSanitized(fields, 'noHpIbu', sanitizePhone(val.noHpIbu))
  setSanitized(fields, 'noHpWali', sanitizePhone(val.noHpWali))
}, { deep: true })

// Region State & Logic (Emsifa API)
type RegionOption = { label: string; value: string }
const provinsiOptions = ref<RegionOption[]>([])
const kotaOptions = ref<RegionOption[]>([])
const kecamatanOptions = ref<RegionOption[]>([])
const kelurahanOptions = ref<RegionOption[]>([])

const fetchRegion = async (url: string) => {
  try {
    const res = await fetch(url)
    const data = await res.json()
    return data.map((d: { id: string; name: string }) => ({ label: d.name, value: d.id }))
  } catch {
    return []
  }
}

onMounted(async () => {
  provinsiOptions.value = await fetchRegion('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json')
})

watch(() => form.provinsi, async (newVal) => {
  form.kabupaten_kota = ''
  form.kecamatan = ''
  form.kelurahan = ''
  kotaOptions.value = []
  kecamatanOptions.value = []
  kelurahanOptions.value = []
  if (newVal) {
    kotaOptions.value = await fetchRegion(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${newVal}.json`)
  }
  validateField('provinsi')
})

watch(() => form.kabupaten_kota, async (newVal) => {
  form.kecamatan = ''
  form.kelurahan = ''
  kecamatanOptions.value = []
  kelurahanOptions.value = []
  if (newVal) {
    kecamatanOptions.value = await fetchRegion(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${newVal}.json`)
  }
  validateField('kabupaten_kota')
})

watch(() => form.kecamatan, async (newVal) => {
  form.kelurahan = ''
  kelurahanOptions.value = []
  if (newVal) {
    kelurahanOptions.value = await fetchRegion(`https://www.emsifa.com/api-wilayah-indonesia/api/villages/${newVal}.json`)
  }
  validateField('kecamatan')
})

// Validation Logic
const validateField = (field: string) => {
  errors[field] = ''

  // Accordion 1
  if (field in form) {
    const val = String(form[field as keyof typeof form]).trim()
    switch (field) {
      case 'nama':
      case 'tempat_lahir':
        if (!val) errors[field] = 'Field ini wajib diisi'
        else if (val.length < 3) errors[field] = 'Minimal 3 karakter'
        else if (!/^[a-zA-Z\s]*$/.test(val)) errors[field] = 'Hanya boleh berisi huruf dan spasi'
        break

      case 'nik':
        if (!val) errors[field] = 'Field ini wajib diisi'
        else if (!/^\d{16}$/.test(val)) errors[field] = 'NIK harus 16 digit angka'
        else if (val === '1234567812345678') errors[field] = 'NIK ini sudah terdaftar dalam sistem'
        break

      case 'tanggal_lahir':
        if (!val) {
          errors[field] = 'Field ini wajib diisi'
        } else {
          const selectedDate = new Date(val)
          if (selectedDate > new Date()) errors[field] = 'Tanggal lahir tidak boleh di masa depan'
        }
        break

      case 'jenis_kelamin':
      case 'agama':
      case 'provinsi':
      case 'kabupaten_kota':
      case 'kecamatan':
      case 'kelurahan':
        if (!val) errors[field] = 'Field ini wajib diisi'
        break

      case 'alamat':
        if (!val) errors[field] = 'Field ini wajib diisi'
        else if (val.length < 10) errors[field] = 'Minimal 10 karakter'
        break

      case 'rt':
      case 'rw':
        if (!val) errors[field] = 'Field ini wajib diisi'
        else if (!/^\d+$/.test(val)) errors[field] = 'Harus berupa angka'
        break

      case 'kode_pos':
        if (!val) errors[field] = 'Field ini wajib diisi'
        else if (!/^\d{5}$/.test(val)) errors[field] = 'Kode pos harus 5 digit angka'
        break

      case 'no_telepon':
        if (!val) errors[field] = 'Field ini wajib diisi'
        else if (!/^(08|\+628)\d{8,11}$/.test(val)) errors[field] = 'Format nomor HP tidak valid'
        break

      case 'email':
        if (!val) errors[field] = 'Field ini wajib diisi'
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) errors[field] = 'Format email tidak valid'
        else if (val === 'test@test.com') errors[field] = 'Email ini sudah terdaftar dalam sistem'
        break
    }
  }

  // Accordion 2
  if (field in formSekolah) {
    const val = String(formSekolah[field as keyof typeof formSekolah]).trim()
    switch (field) {
      case 'nama_sekolah_asal':
        if (!val) errors[field] = 'Field ini wajib diisi'
        else if (val.length < 5) errors[field] = 'Minimal 5 karakter'
        break

      case 'npsn_sekolah_asal':
        if (!val) errors[field] = 'Field ini wajib diisi'
        else if (!/^\d{8}$/.test(val)) errors[field] = 'NPSN harus 8 digit angka'
        break

      case 'alamat_sekolah_asal':
        if (!val) errors[field] = 'Field ini wajib diisi'
        else if (val.length < 10) errors[field] = 'Minimal 10 karakter'
        break

      case 'tahun_lulus':
        if (!val) errors[field] = 'Field ini wajib diisi'
        else if (!/^\d{4}$/.test(val)) errors[field] = 'Tahun harus 4 digit angka'
        else if (Number(val) > new Date().getFullYear()) errors[field] = 'Tahun lulus tidak boleh di masa depan'
        break

      case 'no_ijazah':
        if (!val) errors[field] = 'Field ini wajib diisi'
        break
    }
  }

  // Accordion 3
  if (field in formOrtu && field !== 'isWaliBerbeda') {
    const val = String(formOrtu[field as keyof typeof formOrtu]).trim()
    const isWaliField = ['namaWali', 'hubunganWali', 'noHpWali', 'alamatWali'].includes(field)

    if (isWaliField && !formOrtu.isWaliBerbeda) {
      errors[field] = ''
    } else if (!val) {
      errors[field] = 'Field ini wajib diisi'
    } else {
      switch (field) {
        case 'namaAyah':
        case 'namaIbu':
          if (val.length < 3) errors[field] = 'Minimal 3 karakter'
          else if (!/^[a-zA-Z\s]*$/.test(val)) errors[field] = 'Hanya boleh berisi huruf dan spasi'
          break
        case 'tempatLahirAyah':
        case 'tempatLahirIbu':
        case 'pekerjaanAyah':
        case 'pekerjaanIbu':
          if (val.length < 3) errors[field] = 'Minimal 3 karakter'
          break
        case 'nikAyah':
        case 'nikIbu':
          if (!/^\d{16}$/.test(val)) errors[field] = 'NIK harus 16 digit angka'
          break
        case 'noHpAyah':
        case 'noHpIbu':
        case 'noHpWali':
          if (!/^(08|\+628)\d{8,11}$/.test(val)) errors[field] = 'Format nomor HP tidak valid'
          break
        case 'alamatWali':
          if (val.length < 10) errors[field] = 'Minimal 10 karakter'
          break
      }
    }
  }
}

// Accordion State
const isAcc1Open = ref(true)
const isAcc2Open = ref(false)
const isAcc3Open = ref(false)

const toggleAccordion = (target: 1 | 2 | 3) => {
  if (target === 2 && acc2FinalLock.value) return
  if (target === 3 && acc3FinalLock.value) return

  const willOpen = target === 1
    ? !isAcc1Open.value
    : target === 2
      ? !isAcc2Open.value
      : !isAcc3Open.value

  isAcc1Open.value = target === 1 ? willOpen : false
  isAcc2Open.value = target === 2 ? willOpen : false
  isAcc3Open.value = target === 3 ? willOpen : false
}

// Computed validity
const isAcc1Valid = computed(() => {
  const reqFields: (keyof typeof form)[] = [
    'nama', 'nik', 'email', 'no_telepon', 'tanggal_lahir',
    'tempat_lahir', 'jenis_kelamin', 'agama', 'alamat',
    'rt', 'rw', 'provinsi', 'kabupaten_kota', 'kecamatan', 'kelurahan', 'kode_pos'
  ]
  return reqFields.every(f => form[f] !== '' && !errors[f])
})

const isAcc2Valid = computed(() => {
  const reqFields: (keyof typeof formSekolah)[] = [
    'nama_sekolah_asal', 'alamat_sekolah_asal', 'npsn_sekolah_asal', 'tahun_lulus', 'no_ijazah'
  ]
  return reqFields.every(f => formSekolah[f] !== '' && !errors[f])
})

const isAcc3Valid = computed(() => {
  const reqFields: (keyof typeof formOrtu)[] = [
    'namaAyah', 'nikAyah', 'tempatLahirAyah', 'tanggalLahirAyah', 'pendidikanAyah', 'pekerjaanAyah', 'penghasilanAyah', 'noHpAyah',
    'namaIbu', 'nikIbu', 'tempatLahirIbu', 'tanggalLahirIbu', 'pendidikanIbu', 'pekerjaanIbu', 'penghasilanIbu', 'noHpIbu'
  ]
  const waliFields: (keyof typeof formOrtu)[] = ['namaWali', 'hubunganWali', 'noHpWali', 'alamatWali']

  const baseValid = reqFields.every(f => formOrtu[f] !== '' && !errors[f])
  if (!formOrtu.isWaliBerbeda) return baseValid

  const waliValid = waliFields.every(f => formOrtu[f] !== '' && !errors[f])
  return baseValid && waliValid
})

// Unlock management (Once unlocked, never locked again based on PRD: "Setelah unlock, accordion tidak bisa dikunci kembali meskipun user edit ulang")
const acc2UnlockedEver = ref(false)
watch(isAcc1Valid, (valid) => {
  if (valid && !acc2UnlockedEver.value) {
    acc2UnlockedEver.value = true
  }
})
const acc2FinalLock = computed(() => !acc2UnlockedEver.value)

const acc3UnlockedEver = ref(false)
watch(isAcc2Valid, (valid) => {
  if (valid && !acc3UnlockedEver.value) {
    acc3UnlockedEver.value = true
  }
})
const acc3FinalLock = computed(() => !acc3UnlockedEver.value)

// Phase 21 Logic
const isAllValid = computed(() => isAcc1Valid.value && isAcc2Valid.value && isAcc3Valid.value)
const isConfirmModalOpen = ref(false)
const router = useRouter()

const proceedNext = () => {
  isConfirmModalOpen.value = false
  router.push('/ppdb/daftar/berkas')
}
</script>

<template>
  <div class="min-h-screen bg-bg-base py-8 md:py-12 px-4">
    <div class="w-full lg:w-1/2 mx-auto flex flex-col gap-1">
      <div class="mb-2">
        <h1 class="text-2xl md:text-3xl font-heading font-bold text-text-primary">Formulir Pendaftaran</h1>
        <p class="text-text-secondary mt-1">Lengkapi data di bawah ini dengan benar.</p>
      </div>

      <!-- Accordion 1: Data Diri Siswa -->
      <AppAccordion
        title="Data Diri Siswa"
        :isOpen="isAcc1Open"
        :isCompleted="isAcc1Valid"
        @toggle="toggleAccordion(1)"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <AppInput v-model="form.nama" label="Nama Lengkap" required :error="errors.nama" :sanitizer="sanitizeName" :maxlength="80" @blur="validateField('nama')" />
          <AppInput v-model="form.nik" label="NIK" required :error="errors.nik" :sanitizer="(value) => sanitizeDigits(value, 16)" inputmode="numeric" :maxlength="16" @blur="validateField('nik')" placeholder="16 digit NIK" />
          <AppInput v-model="form.email" type="email" label="Email" required :error="errors.email" :sanitizer="sanitizeEmail" inputmode="email" :maxlength="120" @blur="validateField('email')" />
          <AppInput v-model="form.no_telepon" label="No. Telepon" required :error="errors.no_telepon" :sanitizer="sanitizeIndonesianMobile" inputmode="tel" :maxlength="13" @blur="validateField('no_telepon')" placeholder="08xxxxxxxxxx" />
          <AppInput v-model="form.tempat_lahir" label="Tempat Lahir" required :error="errors.tempat_lahir" :sanitizer="sanitizeName" :maxlength="80" @blur="validateField('tempat_lahir')" />
          <AppInput v-model="form.tanggal_lahir" type="date" label="Tanggal Lahir" required :error="errors.tanggal_lahir" @blur="validateField('tanggal_lahir')" />

          <div class="flex flex-col gap-1.5 w-full md:col-span-2">
            <label class="text-sm font-medium text-text-primary">Jenis Kelamin</label>
            <div class="grid grid-cols-2 gap-2 h-12">
              <button
                type="button"
                :aria-pressed="form.jenis_kelamin === 'Laki-laki'"
                :class="[
                  'h-12 rounded-xl border px-4 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand/30',
                  form.jenis_kelamin === 'Laki-laki'
                    ? 'border-brand bg-brand text-white shadow-sm'
                    : 'border-border bg-bg-surface text-text-primary hover:border-brand hover:bg-bg-base'
                ]"
                @click="form.jenis_kelamin = 'Laki-laki'; validateField('jenis_kelamin')"
              >
                Laki-laki
              </button>
              <button
                type="button"
                :aria-pressed="form.jenis_kelamin === 'Perempuan'"
                :class="[
                  'h-12 rounded-xl border px-4 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand/30',
                  form.jenis_kelamin === 'Perempuan'
                    ? 'border-brand bg-brand text-white shadow-sm'
                    : 'border-border bg-bg-surface text-text-primary hover:border-brand hover:bg-bg-base'
                ]"
                @click="form.jenis_kelamin = 'Perempuan'; validateField('jenis_kelamin')"
              >
                Perempuan
              </button>
            </div>
            <span v-if="errors.jenis_kelamin" class="text-sm text-error">{{ errors.jenis_kelamin }}</span>
          </div>

          <AppSelect v-model="form.agama" label="Agama" required :options="agamaOptions" :error="errors.agama" @blur="validateField('agama')" placeholder="Pilih agama kamu" />

          <div class="md:col-span-2">
            <AppTextarea v-model="form.alamat" label="Alamat Lengkap" required :error="errors.alamat" :sanitizer="(value) => sanitizeSafeText(value, 220)" :maxlength="220" @blur="validateField('alamat')" :rows="3" />
          </div>

          <div class="grid grid-cols-2 gap-4 md:col-span-2">
            <AppInput v-model="form.rt" label="RT" required :error="errors.rt" :sanitizer="(val) => sanitizeDigits(val, 3)" inputmode="numeric" :maxlength="3" placeholder="001" @blur="validateField('rt')" />
            <AppInput v-model="form.rw" label="RW" required :error="errors.rw" :sanitizer="(val) => sanitizeDigits(val, 3)" inputmode="numeric" :maxlength="3" placeholder="002" @blur="validateField('rw')" />
          </div>

          <!-- Cascade Dropdowns -->
          <AppSelect v-model="form.provinsi" label="Provinsi" required :options="provinsiOptions" :error="errors.provinsi" @blur="validateField('provinsi')" placeholder="Pilih Provinsi" />
          <AppSelect v-model="form.kabupaten_kota" label="Kota/Kabupaten" required :options="kotaOptions" :disabled="!form.provinsi" :error="errors.kabupaten_kota" @blur="validateField('kabupaten_kota')" placeholder="Pilih Kota/Kabupaten" />
          <AppSelect v-model="form.kecamatan" label="Kecamatan" required :options="kecamatanOptions" :disabled="!form.kabupaten_kota" :error="errors.kecamatan" @blur="validateField('kecamatan')" placeholder="Pilih Kecamatan" />
          <AppSelect v-model="form.kelurahan" label="Kelurahan" required :options="kelurahanOptions" :disabled="!form.kecamatan" :error="errors.kelurahan" @blur="validateField('kelurahan')" placeholder="Pilih Kelurahan" />

          <AppInput v-model="form.kode_pos" label="Kode Pos" required :error="errors.kode_pos" :sanitizer="(value) => sanitizeDigits(value, 5)" inputmode="numeric" :maxlength="5" @blur="validateField('kode_pos')" />
        </div>
      </AppAccordion>

      <!-- Accordion 2: Data Asal Sekolah -->
      <AppAccordion
        title="Data Asal Sekolah"
        :isOpen="isAcc2Open"
        :isLocked="acc2FinalLock"
        :isCompleted="isAcc2Valid"
        @toggle="toggleAccordion(2)"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <AppInput v-model="formSekolah.nama_sekolah_asal" label="Nama Sekolah Asal" required :error="errors.nama_sekolah_asal" :sanitizer="(value) => sanitizeSafeText(value, 120)" :maxlength="120" @blur="validateField('nama_sekolah_asal')" class="md:col-span-2" />
          <AppInput v-model="formSekolah.npsn_sekolah_asal" label="NPSN" required :error="errors.npsn_sekolah_asal" :sanitizer="(value) => sanitizeDigits(value, 8)" inputmode="numeric" :maxlength="8" @blur="validateField('npsn_sekolah_asal')" placeholder="8 digit angka" />
          <AppInput v-model="formSekolah.tahun_lulus" label="Tahun Lulus" required :error="errors.tahun_lulus" :sanitizer="(value) => sanitizeDigits(value, 4)" inputmode="numeric" :maxlength="4" @blur="validateField('tahun_lulus')" placeholder="Contoh: 2024" />
          <AppInput v-model="formSekolah.no_ijazah" label="No. Ijazah" required :error="errors.no_ijazah" :sanitizer="(value) => sanitizeSafeText(value, 80)" :maxlength="80" @blur="validateField('no_ijazah')" placeholder="Nomor ijazah" class="md:col-span-2" />

          <div class="md:col-span-2">
            <AppTextarea v-model="formSekolah.alamat_sekolah_asal" label="Alamat Sekolah Asal" required :error="errors.alamat_sekolah_asal" :sanitizer="(value) => sanitizeSafeText(value, 220)" :maxlength="220" @blur="validateField('alamat_sekolah_asal')" :rows="3" />
          </div>
        </div>
      </AppAccordion>

      <!-- Accordion 3: Data Orang Tua / Wali -->
      <AppAccordion
        title="Data Orang Tua / Wali"
        :isOpen="isAcc3Open"
        :isLocked="acc3FinalLock"
        :isCompleted="isAcc3Valid"
        @toggle="toggleAccordion(3)"
      >
        <div class="flex flex-col gap-8">
          <!-- Data Ayah -->
          <div class="flex flex-col gap-4">
            <h3 class="text-lg font-heading font-semibold text-brand border-b border-border pb-2">Data Ayah</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <AppInput v-model="formOrtu.namaAyah" label="Nama Lengkap Ayah" required :error="errors.namaAyah" :sanitizer="sanitizeName" :maxlength="80" @blur="validateField('namaAyah')" />
              <AppInput v-model="formOrtu.nikAyah" label="NIK Ayah" required :error="errors.nikAyah" :sanitizer="(value) => sanitizeDigits(value, 16)" inputmode="numeric" :maxlength="16" @blur="validateField('nikAyah')" placeholder="16 digit angka" />
              <AppInput v-model="formOrtu.tempatLahirAyah" label="Tempat Lahir" required :error="errors.tempatLahirAyah" :sanitizer="sanitizeName" :maxlength="80" @blur="validateField('tempatLahirAyah')" />
              <AppInput v-model="formOrtu.tanggalLahirAyah" type="date" label="Tanggal Lahir" required :error="errors.tanggalLahirAyah" @blur="validateField('tanggalLahirAyah')" />
              <AppSelect v-model="formOrtu.pendidikanAyah" label="Pendidikan Terakhir" required :options="pendidikanOptions" :error="errors.pendidikanAyah" @blur="validateField('pendidikanAyah')" />
              <AppInput v-model="formOrtu.pekerjaanAyah" label="Pekerjaan" required :error="errors.pekerjaanAyah" :sanitizer="(value) => sanitizeSafeText(value, 80)" :maxlength="80" @blur="validateField('pekerjaanAyah')" />
              <AppSelect v-model="formOrtu.penghasilanAyah" label="Penghasilan Per Bulan" required :options="penghasilanOptions" :error="errors.penghasilanAyah" @blur="validateField('penghasilanAyah')" />
              <AppInput v-model="formOrtu.noHpAyah" label="No. HP Ayah" required :error="errors.noHpAyah" :sanitizer="sanitizePhone" inputmode="tel" :maxlength="15" @blur="validateField('noHpAyah')" placeholder="08xx / +628xx" />
            </div>
          </div>

          <!-- Data Ibu -->
          <div class="flex flex-col gap-4">
            <h3 class="text-lg font-heading font-semibold text-brand border-b border-border pb-2">Data Ibu</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <AppInput v-model="formOrtu.namaIbu" label="Nama Lengkap Ibu" required :error="errors.namaIbu" :sanitizer="sanitizeName" :maxlength="80" @blur="validateField('namaIbu')" />
              <AppInput v-model="formOrtu.nikIbu" label="NIK Ibu" required :error="errors.nikIbu" :sanitizer="(value) => sanitizeDigits(value, 16)" inputmode="numeric" :maxlength="16" @blur="validateField('nikIbu')" placeholder="16 digit angka" />
              <AppInput v-model="formOrtu.tempatLahirIbu" label="Tempat Lahir" required :error="errors.tempatLahirIbu" :sanitizer="sanitizeName" :maxlength="80" @blur="validateField('tempatLahirIbu')" />
              <AppInput v-model="formOrtu.tanggalLahirIbu" type="date" label="Tanggal Lahir" required :error="errors.tanggalLahirIbu" @blur="validateField('tanggalLahirIbu')" />
              <AppSelect v-model="formOrtu.pendidikanIbu" label="Pendidikan Terakhir" required :options="pendidikanOptions" :error="errors.pendidikanIbu" @blur="validateField('pendidikanIbu')" />
              <AppInput v-model="formOrtu.pekerjaanIbu" label="Pekerjaan" required :error="errors.pekerjaanIbu" :sanitizer="(value) => sanitizeSafeText(value, 80)" :maxlength="80" @blur="validateField('pekerjaanIbu')" />
              <AppSelect v-model="formOrtu.penghasilanIbu" label="Penghasilan Per Bulan" required :options="penghasilanOptions" :error="errors.penghasilanIbu" @blur="validateField('penghasilanIbu')" />
              <AppInput v-model="formOrtu.noHpIbu" label="No. HP Ibu" required :error="errors.noHpIbu" :sanitizer="sanitizePhone" inputmode="tel" :maxlength="15" @blur="validateField('noHpIbu')" placeholder="08xx / +628xx" />
            </div>
          </div>

          <!-- Data Wali Checkbox -->
          <div class="flex items-center gap-3 p-4 bg-bg-surface border border-border rounded-xl">
            <input type="checkbox" id="waliCheckbox" v-model="formOrtu.isWaliBerbeda" class="w-5 h-5 rounded border-border text-brand focus:ring-brand accent-brand">
            <label for="waliCheckbox" class="text-text-primary font-medium cursor-pointer select-none">
              Wali berbeda dengan orang tua
            </label>
          </div>

          <!-- Data Wali (Conditional) -->
          <div v-if="formOrtu.isWaliBerbeda" class="flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <h3 class="text-lg font-heading font-semibold text-brand border-b border-border pb-2">Data Wali</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <AppInput v-model="formOrtu.namaWali" label="Nama Lengkap Wali" required :error="errors.namaWali" :sanitizer="sanitizeName" :maxlength="80" @blur="validateField('namaWali')" />
              <AppInput v-model="formOrtu.hubunganWali" label="Hubungan dengan Siswa" required :error="errors.hubunganWali" :sanitizer="(value) => sanitizeSafeText(value, 60)" :maxlength="60" @blur="validateField('hubunganWali')" />
              <AppInput v-model="formOrtu.noHpWali" label="No. HP Wali" required :error="errors.noHpWali" :sanitizer="sanitizePhone" inputmode="tel" :maxlength="15" @blur="validateField('noHpWali')" class="md:col-span-2" />
              <div class="md:col-span-2">
                <AppTextarea v-model="formOrtu.alamatWali" label="Alamat Wali" required :error="errors.alamatWali" :sanitizer="(value) => sanitizeSafeText(value, 220)" :maxlength="220" @blur="validateField('alamatWali')" :rows="3" />
              </div>
            </div>
          </div>
        </div>
      </AppAccordion>

      <!-- Tombol Berikutnya -->
      <div class="mt-4 flex justify-end">
        <AppButton
          variant="primary"
          :disabled="!isAllValid"
          @click="isConfirmModalOpen = true"
          class="w-full md:w-auto shadow-md"
        >
          Berikutnya
        </AppButton>
      </div>
    </div>
  </div>

  <!-- Modal Konfirmasi -->
  <AppModal v-model="isConfirmModalOpen" title="Konfirmasi">
    <p class="text-text-primary text-base">Apakah kamu yakin data yang diisikan sudah sesuai?</p>

    <template #footer>
      <AppButton variant="secondary" @click="isConfirmModalOpen = false">
        Belum
      </AppButton>
      <AppButton variant="primary" @click="proceedNext">
        Ya, Lanjut
      </AppButton>
    </template>
  </AppModal>
</template>

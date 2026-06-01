<script setup lang="ts">
import { reactive, ref, computed, watch, onMounted } from 'vue'

useHead({ title: 'Formulir Pendaftaran | PPDB MDS Cendekia' })

const {
  biodata,
  sekolah,
  orangTua,
  isWaliBerbeda,
  isRestoringDraft,
  ensureOrangTuaShape,
  resetForm
} = usePpdbRegistrationForm()

const form = biodata.value

const errors = reactive<Record<string, string>>({})

const agamaOptions = [
  { label: 'Islam', value: 'Islam' },
  { label: 'Kristen', value: 'Kristen' },
  { label: 'Katolik', value: 'Katolik' },
  { label: 'Hindu', value: 'Hindu' },
  { label: 'Buddha', value: 'Buddha' },
  { label: 'Konghucu', value: 'Konghucu' }
]

const formSekolah = sekolah.value
const ayah = orangTua.value[0]!
const ibu = orangTua.value[1]!
const wali = orangTua.value[2]!

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

const gajiOptions = [
  { label: 'Kurang dari Rp 1.000.000', value: '1000000' },
  { label: 'Rp 1.000.000 - Rp 2.000.000', value: '2000000' },
  { label: 'Rp 2.000.000 - Rp 5.000.000', value: '5000000' },
  { label: 'Rp 5.000.000 - Rp 10.000.000', value: '10000000' },
  { label: 'Lebih dari Rp 10.000.000', value: '10000001' }
]

const waliHubunganOptions = [
  { label: 'Wali', value: 'Wali' },
  { label: 'Paman', value: 'Paman' },
  { label: 'Bibi', value: 'Bibi' },
  { label: 'Kakek', value: 'Kakek' },
  { label: 'Nenek', value: 'Nenek' },
  { label: 'Kakak', value: 'Kakak' },
  { label: 'Saudara', value: 'Saudara' },
  { label: 'Orang Tua Asuh', value: 'Orang Tua Asuh' },
  { label: 'Lainnya', value: 'Lainnya' }
]

type ProgramOption = {
  label: string
  value: string
  description: string
}

const config = useRuntimeConfig()
const isLoadingPrograms = ref(false)
const defaultProgramOptions: ProgramOption[] = [
  {
    label: 'Paket C',
    value: String(config.public.ppdbProgramId || 1),
    description: 'Setara SMA'
  }
]
const programOptions = ref<ProgramOption[]>([...defaultProgramOptions])

const maxBirthYear = new Date().getFullYear() - 1

type StringRecord = Record<string, string>

const sanitizeDigits = (value: unknown, maxLength?: number) => {
  const sanitized = String(value ?? '').replace(/\D/g, '')
  return typeof maxLength === 'number' ? sanitized.slice(0, maxLength) : sanitized
}

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

const sanitizeSchoolName = (value: unknown) => String(value ?? '')
  .replace(/[^a-zA-Z0-9\s]/g, '')
  .replace(/\s{2,}/g, ' ')
  .slice(0, 120)

const sanitizeIjazahNumber = (value: unknown) => String(value ?? '')
  .replace(/[^a-zA-Z0-9/-]/g, '')
  .slice(0, 25)

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

const revalidateErroredField = (field: string) => {
  if (errors[field]) {
    validateField(field)
  }
}

const revalidateErroredOrangTuaField = (index: number, field: string) => {
  if (errors[`orangTua.${index}.${field}`]) {
    validateOrangTuaField(index, field)
  }
}

watch(form, (val) => {
  const fields = val as StringRecord
  setSanitized(fields, 'nama', sanitizeName(val.nama))
  setSanitized(fields, 'nisn', sanitizeDigits(val.nisn, 10))
  setSanitized(fields, 'nik', sanitizeDigits(val.nik, 16))
  setSanitized(fields, 'tempat_lahir', sanitizeName(val.tempat_lahir))
  setSanitized(fields, 'alamat', sanitizeSafeText(val.alamat, 220))
  setSanitized(fields, 'rt', sanitizeDigits(val.rt, 3))
  setSanitized(fields, 'rw', sanitizeDigits(val.rw, 3))
  setSanitized(fields, 'kode_pos', sanitizeDigits(val.kode_pos, 5))
  setSanitized(fields, 'no_telepon', sanitizeIndonesianMobile(val.no_telepon))
  setSanitized(fields, 'email', sanitizeEmail(val.email))

  Object.keys(val).forEach((field) => revalidateErroredField(field))
}, { deep: true })

watch(formSekolah, (val) => {
  const fields = val as StringRecord
  setSanitized(fields, 'nama_sekolah_asal', sanitizeSchoolName(val.nama_sekolah_asal))
  setSanitized(fields, 'npsn_sekolah_asal', sanitizeDigits(val.npsn_sekolah_asal, 8))
  setSanitized(fields, 'alamat_sekolah_asal', sanitizeSafeText(val.alamat_sekolah_asal, 220))
  setSanitized(fields, 'tahun_lulus', sanitizeDigits(val.tahun_lulus, 4))
  setSanitized(fields, 'no_ijazah', sanitizeIjazahNumber(val.no_ijazah))

  Object.keys(val).forEach((field) => revalidateErroredField(field))
}, { deep: true })

watch(orangTua, (items) => {
  ensureOrangTuaShape()
  items.forEach((item, index) => {
    const fields = item as unknown as StringRecord
    setSanitized(fields, 'nama', sanitizeName(item.nama))
    setSanitized(fields, 'nik', sanitizeDigits(item.nik, 16))
    setSanitized(fields, 'pekerjaan', sanitizeSafeText(item.pekerjaan, 80))
    setSanitized(fields, 'no_telepon', sanitizeIndonesianMobile(item.no_telepon))
    setSanitized(fields, 'email', sanitizeEmail(item.email))
    setSanitized(fields, 'hubungan_lainnya', sanitizeSafeText(item.hubungan_lainnya, 60))

    Object.keys(item).forEach((field) => revalidateErroredOrangTuaField(index, field))
  })
}, { deep: true })

watch(isWaliBerbeda, () => {
  ensureOrangTuaShape()
})

const {
  provinsiOptions,
  kotaOptions,
  kecamatanOptions,
  kelurahanOptions,
  loadProvinsi,
  loadKota,
  loadKecamatan,
  loadKelurahan,
  findLabel
} = useWilayahIndonesia()

const { isLookingUpKodePos, lookupKodePos } = useKodePos()

const loadSelectedRegions = async () => {
  await loadProvinsi()
  if (form.provinsi) await loadKota(form.provinsi)
  if (form.kabupaten_kota) await loadKecamatan(form.kabupaten_kota)
  if (form.kecamatan) await loadKelurahan(form.kecamatan)
}

const loadPrograms = async () => {
  isLoadingPrograms.value = true
  programOptions.value = [...defaultProgramOptions]

  if (form.id_program && !programOptions.value.some(item => item.value === form.id_program)) {
    form.id_program = ''
  }

  if (!form.id_program && programOptions.value.length === 1) {
    form.id_program = programOptions.value[0]?.value || ''
  }

  isLoadingPrograms.value = false
}

onMounted(async () => {
  await Promise.all([
    loadSelectedRegions(),
    loadPrograms()
  ])
})

watch(isRestoringDraft, async (isRestoring) => {
  if (!isRestoring) {
    await loadSelectedRegions()
  }
})

watch(() => form.provinsi, async (newVal) => {
  if (isRestoringDraft.value) return

  form.kabupaten_kota = ''
  form.kecamatan = ''
  form.kelurahan = ''
  form.kode_pos = ''
  kotaOptions.value = []
  kecamatanOptions.value = []
  kelurahanOptions.value = []
  if (newVal) {
    await loadKota(newVal)
  }
  validateField('provinsi')
})

watch(() => form.kabupaten_kota, async (newVal) => {
  if (isRestoringDraft.value) return

  form.kecamatan = ''
  form.kelurahan = ''
  form.kode_pos = ''
  kecamatanOptions.value = []
  kelurahanOptions.value = []
  if (newVal) {
    await loadKecamatan(newVal)
  }
  validateField('kabupaten_kota')
})

watch(() => form.kecamatan, async (newVal) => {
  if (isRestoringDraft.value) return

  form.kelurahan = ''
  form.kode_pos = ''
  kelurahanOptions.value = []
  if (newVal) {
    await loadKelurahan(newVal)
  }
  validateField('kecamatan')
})

watch(() => form.kelurahan, async (newVal) => {
  if (isRestoringDraft.value) return

  form.kode_pos = ''
  validateField('kelurahan')

  if (!newVal) return

  const kodePos = await lookupKodePos({
    kelurahan: findLabel(kelurahanOptions.value, form.kelurahan),
    kecamatan: findLabel(kecamatanOptions.value, form.kecamatan),
    kabupatenKota: findLabel(kotaOptions.value, form.kabupaten_kota)
  })

  if (kodePos) {
    form.kode_pos = kodePos
    validateField('kode_pos')
  }
})

const validateField = (field: string) => {
  errors[field] = ''

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

      case 'nisn':
        if (!val) errors[field] = 'Field ini wajib diisi'
        else if (!/^\d{10}$/.test(val)) errors[field] = 'NISN harus 10 digit angka'
        break

      case 'tanggal_lahir':
        if (!val) {
          errors[field] = 'Field ini wajib diisi'
        } else {
          const selectedDate = new Date(val)
          if (selectedDate > new Date()) errors[field] = 'Tanggal lahir tidak boleh di masa depan'
          else if (selectedDate.getFullYear() > maxBirthYear) errors[field] = 'Tahun lahir tidak boleh tahun ini'
        }
        break

      case 'jenis_kelamin':
      case 'agama':
      case 'id_program':
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
        else if (!/^\d{3}$/.test(val)) errors[field] = `${field.toUpperCase()} harus 3 digit angka`
        break

      case 'kode_pos':
        if (!val) errors[field] = 'Field ini wajib diisi'
        else if (!/^\d{5}$/.test(val)) errors[field] = 'Kode pos harus 5 digit angka'
        break

      case 'no_telepon':
        if (!val) errors[field] = 'Field ini wajib diisi'
        else if (!/^08\d{10,11}$/.test(val)) errors[field] = 'Nomor HP harus 12-13 digit dan diawali 08'
        break

      case 'email':
        if (!val) errors[field] = 'Field ini wajib diisi'
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) errors[field] = 'Format email tidak valid'
        else if (val === 'test@test.com') errors[field] = 'Email ini sudah terdaftar dalam sistem'
        break
    }
  }

  if (field in formSekolah) {
    const val = String(formSekolah[field as keyof typeof formSekolah]).trim()
    switch (field) {
      case 'nama_sekolah_asal':
        if (!val) errors[field] = 'Field ini wajib diisi'
        else if (val.length < 5) errors[field] = 'Minimal 5 karakter'
        else if (!/^[a-zA-Z0-9\s]+$/.test(val)) errors[field] = 'Hanya boleh berisi huruf dan angka'
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
        else if (val.length < 5) errors[field] = 'Minimal 5 karakter'
        else if (val.length > 25) errors[field] = 'Maksimal 25 karakter'
        else if (!/^[a-zA-Z0-9/-]+$/.test(val)) errors[field] = 'Hanya boleh berisi huruf, angka, tanda - dan /'
        break
    }
  }

}

const validateOrangTuaField = (index: number, field: string) => {
  const item = orangTua.value[index]
  if (!item) return

  const errorKey = `orangTua.${index}.${field}`
  errors[errorKey] = ''

  if (index === 2 && !isWaliBerbeda.value) return

  const value = item[field as keyof typeof item]
  const val = String(value ?? '').trim()
  const requiredFields = ['nama', 'nik', 'agama', 'hubungan', 'peran', 'no_telepon']
  const isRequired = index === 2
    ? requiredFields.includes(field) || (field === 'hubungan_lainnya' && item.hubungan === 'Lainnya')
    : requiredFields.includes(field)

  if (isRequired && !val) {
    errors[errorKey] = 'Field ini wajib diisi'
    return
  }

  if (!val) return

  switch (field) {
    case 'nama':
      if (val.length < 3) errors[errorKey] = 'Minimal 3 karakter'
      else if (!/^[a-zA-Z\s]*$/.test(val)) errors[errorKey] = 'Hanya boleh berisi huruf dan spasi'
      break
    case 'pekerjaan':
      if (val.length < 3) errors[errorKey] = 'Minimal 3 karakter'
      break
    case 'nik':
      if (!/^\d{16}$/.test(val)) errors[errorKey] = 'NIK harus 16 digit angka'
      break
    case 'no_telepon':
      if (!/^08\d{10,11}$/.test(val)) errors[errorKey] = 'Nomor HP harus 12-13 digit dan diawali 08'
      break
    case 'email':
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) errors[errorKey] = 'Format email tidak valid'
      break
  }
}

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

const isAcc1Valid = computed(() => {
  const reqFields: (keyof typeof form)[] = [
    'nama', 'nisn', 'nik', 'email', 'no_telepon', 'tanggal_lahir',
    'tempat_lahir', 'jenis_kelamin', 'agama', 'id_program', 'alamat',
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
  const requiredFields = ['nama', 'nik', 'agama', 'hubungan', 'peran', 'no_telepon'] as const

  const parentValid = [0, 1].every((index) => requiredFields.every((field) => {
    const item = orangTua.value[index]
    return item?.[field] !== '' && !errors[`orangTua.${index}.${field}`]
  }))

  if (!isWaliBerbeda.value) return parentValid

  const waliValid = requiredFields.every((field) => {
    const item = orangTua.value[2]
    return item?.[field] !== '' && !errors[`orangTua.2.${field}`]
  })

  return parentValid && waliValid
})

const acc2UnlockedEver = ref(false)
watch(isAcc1Valid, (valid) => {
  if (valid && !acc2UnlockedEver.value) {
    acc2UnlockedEver.value = true
  }
}, { immediate: true })
const acc2FinalLock = computed(() => !acc2UnlockedEver.value)

const acc3UnlockedEver = ref(false)
watch(isAcc2Valid, (valid) => {
  if (valid && !acc3UnlockedEver.value) {
    acc3UnlockedEver.value = true
  }
}, { immediate: true })
const acc3FinalLock = computed(() => !acc3UnlockedEver.value)

const isAllValid = computed(() => isAcc1Valid.value && isAcc2Valid.value && isAcc3Valid.value)
const router = useRouter()
const isLeaveGuardOpen = ref(false)
const pendingNavigationPath = ref('')
const allowRouteLeave = ref(false)

const hasFilledValue = (value: unknown) => String(value ?? '').trim() !== ''

const hasFilledForm = computed(() => {
  const biodataFilled = Object.values(form).some(hasFilledValue)
  const sekolahFilled = Object.values(formSekolah).some(hasFilledValue)
  const orangTuaFilled = orangTua.value.some((item) => Object.entries(item).some(([key, value]) => {
    if (key === 'peran' || key === 'hubungan') return false
    return hasFilledValue(value)
  }))

  return biodataFilled || sekolahFilled || orangTuaFilled || isWaliBerbeda.value
})

const requestLeave = (path: string) => {
  if (!hasFilledForm.value) {
    allowRouteLeave.value = true
    router.push(path)
    return
  }

  pendingNavigationPath.value = path
  isLeaveGuardOpen.value = true
}

const confirmLeave = () => {
  isLeaveGuardOpen.value = false
  const path = pendingNavigationPath.value || '/ppdb'
  pendingNavigationPath.value = ''
  resetForm()
  allowRouteLeave.value = true
  router.push(path)
}

onBeforeRouteLeave((to) => {
  if (allowRouteLeave.value || !hasFilledForm.value) return true

  pendingNavigationPath.value = to.fullPath
  isLeaveGuardOpen.value = true
  return false
})

const proceedNext = () => {
  allowRouteLeave.value = true
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

      <AppAccordion
        title="Data Diri Siswa"
        :isOpen="isAcc1Open"
        :isCompleted="isAcc1Valid"
        :status="isAcc1Valid ? 'complete' : 'incomplete'"
        showStatusText
        @toggle="toggleAccordion(1)"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <AppInput v-model="form.nama" label="Nama Lengkap" required :error="errors.nama" :sanitizer="sanitizeName" :maxlength="80" @blur="validateField('nama')" class="md:col-span-2" />
          <AppInput v-model="form.nik" label="NIK" required :error="errors.nik" :sanitizer="(value) => sanitizeDigits(value, 16)" inputmode="numeric" :maxlength="16" @blur="validateField('nik')" placeholder="16 digit NIK" />
          <AppInput v-model="form.nisn" label="NISN" required :error="errors.nisn" :sanitizer="(value) => sanitizeDigits(value, 10)" inputmode="numeric" :maxlength="10" @blur="validateField('nisn')" placeholder="10 digit NISN" />
          <AppInput v-model="form.no_telepon" label="No. Telepon" required :error="errors.no_telepon" :sanitizer="sanitizeIndonesianMobile" inputmode="tel" :maxlength="13" @blur="validateField('no_telepon')" placeholder="08xxxxxxxxxx" />
          <AppInput v-model="form.email" type="email" label="Email" required :error="errors.email" :sanitizer="sanitizeEmail" inputmode="email" :maxlength="120" @blur="validateField('email')" />
          <AppInput v-model="form.tempat_lahir" label="Tempat Lahir" required :error="errors.tempat_lahir" :sanitizer="sanitizeName" :maxlength="80" @blur="validateField('tempat_lahir')" />
          <AppDateInput v-model="form.tanggal_lahir" label="Tanggal Lahir" required :max-year="maxBirthYear" :error="errors.tanggal_lahir" @blur="validateField('tanggal_lahir')" />

          <AppSelect v-model="form.agama" label="Agama" required :options="agamaOptions" :error="errors.agama" @blur="validateField('agama')" placeholder="Pilih agama kamu" />
          <AppSelect
            v-model="form.id_program"
            label="Paket Sekolah"
            required
            :options="programOptions"
            :disabled="isLoadingPrograms"
            :error="errors.id_program"
            :placeholder="isLoadingPrograms ? 'Memuat paket...' : 'Pilih paket sekolah'"
            @blur="validateField('id_program')"
          />

          <div class="flex w-full flex-col gap-1.5">
            <label class="text-sm font-medium text-text-primary">Jenis Kelamin</label>
            <div class="grid h-11 grid-cols-2 gap-2">
              <button
                type="button"
                :aria-pressed="form.jenis_kelamin === 'Laki-laki'"
                :class="[
                  'h-11 rounded-lg border px-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand/30',
                  form.jenis_kelamin === 'Laki-laki'
                    ? 'border-brand bg-brand text-white'
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
                  'h-11 rounded-lg border px-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand/30',
                  form.jenis_kelamin === 'Perempuan'
                    ? 'border-brand bg-brand text-white'
                    : 'border-border bg-bg-surface text-text-primary hover:border-brand hover:bg-bg-base'
                ]"
                @click="form.jenis_kelamin = 'Perempuan'; validateField('jenis_kelamin')"
              >
                Perempuan
              </button>
            </div>
            <span v-if="errors.jenis_kelamin" class="text-sm text-error">{{ errors.jenis_kelamin }}</span>
          </div>

          <div class="md:col-span-2">
            <AppTextarea v-model="form.alamat" label="Alamat Lengkap" required :error="errors.alamat" :sanitizer="(value) => sanitizeSafeText(value, 220)" :maxlength="220" @blur="validateField('alamat')" :rows="3" />
          </div>

          <div class="grid grid-cols-2 gap-4 md:col-span-2">
            <AppInput v-model="form.rt" label="RT" required :error="errors.rt" :sanitizer="(val) => sanitizeDigits(val, 3)" inputmode="numeric" :maxlength="3" placeholder="001" @blur="validateField('rt')" />
            <AppInput v-model="form.rw" label="RW" required :error="errors.rw" :sanitizer="(val) => sanitizeDigits(val, 3)" inputmode="numeric" :maxlength="3" placeholder="002" @blur="validateField('rw')" />
          </div>

          <AppSelect v-model="form.provinsi" label="Provinsi" required :options="provinsiOptions" :error="errors.provinsi" @blur="validateField('provinsi')" placeholder="Pilih Provinsi" />
          <AppSelect v-model="form.kabupaten_kota" label="Kota/Kabupaten" required :options="kotaOptions" :disabled="!form.provinsi" :error="errors.kabupaten_kota" @blur="validateField('kabupaten_kota')" placeholder="Pilih Kota/Kabupaten" />
          <AppSelect v-model="form.kecamatan" label="Kecamatan" required :options="kecamatanOptions" :disabled="!form.kabupaten_kota" :error="errors.kecamatan" @blur="validateField('kecamatan')" placeholder="Pilih Kecamatan" />
          <AppSelect v-model="form.kelurahan" label="Kelurahan" required :options="kelurahanOptions" :disabled="!form.kecamatan" :error="errors.kelurahan" @blur="validateField('kelurahan')" placeholder="Pilih Kelurahan" />

          <div class="flex flex-col gap-1.5">
            <AppInput
              v-model="form.kode_pos"
              label="Kode Pos"
              required
              :disabled="isLookingUpKodePos"
              :error="errors.kode_pos"
              :sanitizer="(value) => sanitizeDigits(value, 5)"
              inputmode="numeric"
              :maxlength="5"
              @blur="validateField('kode_pos')"
            />
            <span v-if="isLookingUpKodePos" class="text-xs text-text-secondary">Mencari kode pos...</span>
          </div>
        </div>
      </AppAccordion>

      <AppAccordion
        title="Data Asal Sekolah"
        :isOpen="isAcc2Open"
        :isLocked="acc2FinalLock"
        :isCompleted="isAcc2Valid"
        :status="acc2FinalLock ? 'locked' : isAcc2Valid ? 'complete' : 'incomplete'"
        showStatusText
        @toggle="toggleAccordion(2)"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <AppInput v-model="formSekolah.nama_sekolah_asal" label="Nama Sekolah Asal" required :error="errors.nama_sekolah_asal" :sanitizer="sanitizeSchoolName" :maxlength="120" @blur="validateField('nama_sekolah_asal')" class="md:col-span-2" />
          <AppInput v-model="formSekolah.npsn_sekolah_asal" label="NPSN" required :error="errors.npsn_sekolah_asal" :sanitizer="(value) => sanitizeDigits(value, 8)" inputmode="numeric" :maxlength="8" @blur="validateField('npsn_sekolah_asal')" placeholder="8 digit NPSN" />
          <AppInput v-model="formSekolah.tahun_lulus" label="Tahun Lulus" required :error="errors.tahun_lulus" :sanitizer="(value) => sanitizeDigits(value, 4)" inputmode="numeric" :maxlength="4" @blur="validateField('tahun_lulus')" placeholder="Contoh: 2024" />
          <AppInput v-model="formSekolah.no_ijazah" label="No. Ijazah" required :error="errors.no_ijazah" :sanitizer="sanitizeIjazahNumber" :maxlength="25" @blur="validateField('no_ijazah')" placeholder="Contoh: DN-01/12345" class="md:col-span-2" />

          <div class="md:col-span-2">
            <AppTextarea v-model="formSekolah.alamat_sekolah_asal" label="Alamat Sekolah Asal" required :error="errors.alamat_sekolah_asal" :sanitizer="(value) => sanitizeSafeText(value, 220)" :maxlength="220" @blur="validateField('alamat_sekolah_asal')" :rows="3" />
          </div>
        </div>
      </AppAccordion>

      <AppAccordion
        title="Data Orang Tua / Wali"
        :isOpen="isAcc3Open"
        :isLocked="acc3FinalLock"
        :isCompleted="isAcc3Valid"
        :status="acc3FinalLock ? 'locked' : isAcc3Valid ? 'complete' : 'incomplete'"
        showStatusText
        @toggle="toggleAccordion(3)"
      >
        <div class="flex flex-col gap-8">
          <div class="flex flex-col gap-4">
            <h3 class="text-lg font-heading font-semibold text-brand border-b border-border pb-2">Data Ayah</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <AppInput v-model="ayah.nama" label="Nama Lengkap Ayah" required :error="errors['orangTua.0.nama']" :sanitizer="sanitizeName" :maxlength="80" @blur="validateOrangTuaField(0, 'nama')" />
              <AppInput v-model="ayah.nik" label="NIK Ayah" required :error="errors['orangTua.0.nik']" :sanitizer="(value) => sanitizeDigits(value, 16)" inputmode="numeric" :maxlength="16" @blur="validateOrangTuaField(0, 'nik')" placeholder="16 digit NIK" />
              <AppSelect v-model="ayah.agama" label="Agama Ayah" required :options="agamaOptions" :error="errors['orangTua.0.agama']" @blur="validateOrangTuaField(0, 'agama')" />
              <AppSelect v-model="ayah.pendidikan" label="Pendidikan Terakhir" :options="pendidikanOptions" :error="errors['orangTua.0.pendidikan']" @blur="validateOrangTuaField(0, 'pendidikan')" />
              <AppInput v-model="ayah.pekerjaan" label="Pekerjaan" :error="errors['orangTua.0.pekerjaan']" :sanitizer="(value) => sanitizeSafeText(value, 80)" :maxlength="80" @blur="validateOrangTuaField(0, 'pekerjaan')" />
              <AppSelect v-model="ayah.gaji" label="Gaji Per Bulan" :options="gajiOptions" :error="errors['orangTua.0.gaji']" @blur="validateOrangTuaField(0, 'gaji')" />
              <AppInput v-model="ayah.no_telepon" label="No. HP Ayah" required :error="errors['orangTua.0.no_telepon']" :sanitizer="sanitizeIndonesianMobile" inputmode="tel" :maxlength="13" @blur="validateOrangTuaField(0, 'no_telepon')" placeholder="08xxxxxxxxxx" />
              <AppInput v-model="ayah.email" type="email" label="Email Ayah" :error="errors['orangTua.0.email']" :sanitizer="sanitizeEmail" inputmode="email" :maxlength="120" @blur="validateOrangTuaField(0, 'email')" />
            </div>
          </div>

          <div class="flex flex-col gap-4">
            <h3 class="text-lg font-heading font-semibold text-brand border-b border-border pb-2">Data Ibu</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <AppInput v-model="ibu.nama" label="Nama Lengkap Ibu" required :error="errors['orangTua.1.nama']" :sanitizer="sanitizeName" :maxlength="80" @blur="validateOrangTuaField(1, 'nama')" />
              <AppInput v-model="ibu.nik" label="NIK Ibu" required :error="errors['orangTua.1.nik']" :sanitizer="(value) => sanitizeDigits(value, 16)" inputmode="numeric" :maxlength="16" @blur="validateOrangTuaField(1, 'nik')" placeholder="16 digit NIK" />
              <AppSelect v-model="ibu.agama" label="Agama Ibu" required :options="agamaOptions" :error="errors['orangTua.1.agama']" @blur="validateOrangTuaField(1, 'agama')" />
              <AppSelect v-model="ibu.pendidikan" label="Pendidikan Terakhir" :options="pendidikanOptions" :error="errors['orangTua.1.pendidikan']" @blur="validateOrangTuaField(1, 'pendidikan')" />
              <AppInput v-model="ibu.pekerjaan" label="Pekerjaan" :error="errors['orangTua.1.pekerjaan']" :sanitizer="(value) => sanitizeSafeText(value, 80)" :maxlength="80" @blur="validateOrangTuaField(1, 'pekerjaan')" />
              <AppSelect v-model="ibu.gaji" label="Gaji Per Bulan" :options="gajiOptions" :error="errors['orangTua.1.gaji']" @blur="validateOrangTuaField(1, 'gaji')" />
              <AppInput v-model="ibu.no_telepon" label="No. HP Ibu" required :error="errors['orangTua.1.no_telepon']" :sanitizer="sanitizeIndonesianMobile" inputmode="tel" :maxlength="13" @blur="validateOrangTuaField(1, 'no_telepon')" placeholder="08xxxxxxxxxx" />
              <AppInput v-model="ibu.email" type="email" label="Email Ibu" :error="errors['orangTua.1.email']" :sanitizer="sanitizeEmail" inputmode="email" :maxlength="120" @blur="validateOrangTuaField(1, 'email')" />
            </div>
          </div>

          <div class="flex items-center gap-3 p-4 bg-bg-surface border border-border rounded-xl">
            <input type="checkbox" id="waliCheckbox" v-model="isWaliBerbeda" class="w-5 h-5 rounded border-border text-brand focus:ring-brand accent-brand">
            <label for="waliCheckbox" class="text-text-primary font-medium cursor-pointer select-none">
              Wali berbeda dengan orang tua
            </label>
          </div>

          <div v-if="isWaliBerbeda" class="flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <h3 class="text-lg font-heading font-semibold text-brand border-b border-border pb-2">Data Wali</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <AppInput v-model="wali.nama" label="Nama Lengkap Wali" required :error="errors['orangTua.2.nama']" :sanitizer="sanitizeName" :maxlength="80" @blur="validateOrangTuaField(2, 'nama')" />
              <AppInput v-model="wali.nik" label="NIK Wali" required :error="errors['orangTua.2.nik']" :sanitizer="(value) => sanitizeDigits(value, 16)" inputmode="numeric" :maxlength="16" @blur="validateOrangTuaField(2, 'nik')" placeholder="16 digit NIK" />
              <AppSelect v-model="wali.agama" label="Agama Wali" required :options="agamaOptions" :error="errors['orangTua.2.agama']" @blur="validateOrangTuaField(2, 'agama')" />
              <AppSelect v-model="wali.hubungan" label="Hubungan dengan Siswa" required :error="errors['orangTua.2.hubungan']" :options="waliHubunganOptions" @blur="validateOrangTuaField(2, 'hubungan')" />
              <AppInput v-if="wali.hubungan === 'Lainnya'" v-model="wali.hubungan_lainnya" label="Hubungan Wali Lainnya" required :error="errors['orangTua.2.hubungan_lainnya']" :sanitizer="(value) => sanitizeSafeText(value, 60)" :maxlength="60" @blur="validateOrangTuaField(2, 'hubungan_lainnya')" />
              <AppSelect v-model="wali.pendidikan" label="Pendidikan Terakhir" :options="pendidikanOptions" :error="errors['orangTua.2.pendidikan']" @blur="validateOrangTuaField(2, 'pendidikan')" />
              <AppInput v-model="wali.pekerjaan" label="Pekerjaan" :error="errors['orangTua.2.pekerjaan']" :sanitizer="(value) => sanitizeSafeText(value, 80)" :maxlength="80" @blur="validateOrangTuaField(2, 'pekerjaan')" />
              <AppSelect v-model="wali.gaji" label="Gaji Per Bulan" :options="gajiOptions" :error="errors['orangTua.2.gaji']" @blur="validateOrangTuaField(2, 'gaji')" />
              <AppInput v-model="wali.no_telepon" label="No. HP Wali" required :error="errors['orangTua.2.no_telepon']" :sanitizer="sanitizeIndonesianMobile" inputmode="tel" :maxlength="13" @blur="validateOrangTuaField(2, 'no_telepon')" placeholder="08xxxxxxxxxx" />
              <AppInput v-model="wali.email" type="email" label="Email Wali" :error="errors['orangTua.2.email']" :sanitizer="sanitizeEmail" inputmode="email" :maxlength="120" @blur="validateOrangTuaField(2, 'email')" />
            </div>
          </div>
        </div>
      </AppAccordion>

      <div class="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <AppButton
          variant="secondary"
          class="w-full sm:w-auto"
          @click="requestLeave('/ppdb')"
        >
          Kembali
        </AppButton>
        <AppButton
          variant="primary"
          :disabled="!isAllValid"
          @click="proceedNext"
          class="w-full sm:w-auto shadow-md"
        >
          Berikutnya
        </AppButton>
      </div>
    </div>
  </div>

  <AppModal v-model="isLeaveGuardOpen" title="Formulir Belum Selesai">
    <p class="text-text-primary text-base leading-relaxed">
      Data yang sudah kamu isi belum dilanjutkan. Kalau kamu keluar sekarang, pendaftaran belum selesai.
    </p>

    <template #footer>
      <AppButton variant="secondary" @click="isLeaveGuardOpen = false">
        Tetap di Sini
      </AppButton>
      <AppButton variant="danger" @click="confirmLeave">
        Ya, Keluar
      </AppButton>
    </template>
  </AppModal>
</template>

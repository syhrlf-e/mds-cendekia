import { computed, reactive, type Ref } from 'vue'
import type { PpdbBiodataForm, PpdbOrangTuaForm, PpdbSekolahForm } from './usePpdbRegistrationForm'

type UsePpdbFormValidationParams = {
  form: PpdbBiodataForm
  formSekolah: PpdbSekolahForm
  orangTua: Ref<PpdbOrangTuaForm[]>
  isWaliBerbeda: Ref<boolean>
  maxBirthYear: number
}

export const usePpdbFormValidation = ({
  form,
  formSekolah,
  orangTua,
  isWaliBerbeda,
  maxBirthYear
}: UsePpdbFormValidationParams) => {
  const errors = reactive<Record<string, string>>({})

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

  const isAcc1Valid = computed(() => {
    const reqFields: (keyof typeof form)[] = [
      'nama', 'nisn', 'nik', 'email', 'no_telepon', 'tanggal_lahir',
      'tempat_lahir', 'jenis_kelamin', 'agama', 'id_program', 'alamat',
      'rt', 'rw', 'provinsi', 'kabupaten_kota', 'kecamatan', 'kelurahan', 'kode_pos'
    ]
    return reqFields.every(field => form[field] !== '' && !errors[field])
  })

  const isAcc2Valid = computed(() => {
    const reqFields: (keyof typeof formSekolah)[] = [
      'nama_sekolah_asal', 'alamat_sekolah_asal', 'npsn_sekolah_asal', 'tahun_lulus', 'no_ijazah'
    ]
    return reqFields.every(field => formSekolah[field] !== '' && !errors[field])
  })

  const isAcc3Valid = computed(() => {
    const requiredFields = ['nama', 'nik', 'agama', 'hubungan', 'peran', 'no_telepon'] as const

    const parentValid = [0, 1].every(index => requiredFields.every((field) => {
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

  return {
    errors,
    validateField,
    validateOrangTuaField,
    isAcc1Valid,
    isAcc2Valid,
    isAcc3Valid
  }
}

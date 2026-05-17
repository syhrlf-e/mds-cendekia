<script setup lang="ts">
import { reactive, ref, computed, watch, onMounted } from 'vue'

useHead({ title: 'Formulir Pendaftaran | PPDB MDS Cendekia' })

// Form State Accordion 1
const form = reactive({
  namaLengkap: '',
  namaPanggilan: '',
  nik: '',
  tempatLahir: '',
  tanggalLahir: '',
  jenisKelamin: '',
  agama: '',
  kewarganegaraan: 'WNI',
  anakKe: '',
  jumlahSaudara: '',
  golDarah: '',
  alamat: '',
  rtrw: '',
  provinsi: '',
  kota: '',
  kecamatan: '',
  kelurahan: '',
  kodePos: '',
  noHp: '',
  email: ''
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
  namaSekolahAsal: '',
  npsn: '',
  alamatSekolah: '',
  tahunLulus: '',
  noIjazah: ''
})

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
    return data.map((d: any) => ({ label: d.name, value: d.id }))
  } catch {
    return []
  }
}

onMounted(async () => {
  provinsiOptions.value = await fetchRegion('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json')
})

watch(() => form.provinsi, async (newVal) => {
  form.kota = ''
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

watch(() => form.kota, async (newVal) => {
  form.kecamatan = ''
  form.kelurahan = ''
  kecamatanOptions.value = []
  kelurahanOptions.value = []
  if (newVal) {
    kecamatanOptions.value = await fetchRegion(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${newVal}.json`)
  }
  validateField('kota')
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
      case 'namaLengkap':
      case 'tempatLahir':
        if (!val) errors[field] = 'Field ini wajib diisi'
        else if (val.length < 3) errors[field] = 'Minimal 3 karakter'
        else if (!/^[a-zA-Z\s]*$/.test(val)) errors[field] = 'Hanya boleh berisi huruf dan spasi'
        break
        
      case 'namaPanggilan':
        if (!val) errors[field] = 'Field ini wajib diisi'
        else if (val.length < 2) errors[field] = 'Minimal 2 karakter'
        break

      case 'nik':
        if (!val) errors[field] = 'Field ini wajib diisi'
        else if (!/^\d{16}$/.test(val)) errors[field] = 'NIK harus 16 digit angka'
        else if (val === '1234567812345678') errors[field] = 'NIK ini sudah terdaftar dalam sistem'
        break

      case 'tanggalLahir':
        if (!val) {
          errors[field] = 'Field ini wajib diisi'
        } else {
          const selectedDate = new Date(val)
          if (selectedDate > new Date()) errors[field] = 'Tanggal lahir tidak boleh di masa depan'
        }
        break

      case 'jenisKelamin':
      case 'agama':
      case 'kewarganegaraan':
      case 'provinsi':
      case 'kota':
      case 'kecamatan':
      case 'kelurahan':
        if (!val) errors[field] = 'Field ini wajib diisi'
        break

      case 'anakKe':
        if (!val) errors[field] = 'Field ini wajib diisi'
        else if (isNaN(Number(val)) || Number(val) < 1) errors[field] = 'Minimal anak ke-1'
        break

      case 'jumlahSaudara':
        if (!val && val !== '0') errors[field] = 'Field ini wajib diisi'
        else if (isNaN(Number(val)) || Number(val) < 0) errors[field] = 'Tidak boleh minus'
        break

      case 'alamat':
        if (!val) errors[field] = 'Field ini wajib diisi'
        else if (val.length < 10) errors[field] = 'Minimal 10 karakter'
        break

      case 'rtrw':
        if (!val) errors[field] = 'Field ini wajib diisi'
        else if (!/^\d{3}\/\d{3}$/.test(val)) errors[field] = 'Format harus 000/000'
        break

      case 'kodePos':
        if (!val) errors[field] = 'Field ini wajib diisi'
        else if (!/^\d{5}$/.test(val)) errors[field] = 'Kode pos harus 5 digit angka'
        break

      case 'noHp':
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
      case 'namaSekolahAsal':
        if (!val) errors[field] = 'Field ini wajib diisi'
        else if (val.length < 5) errors[field] = 'Minimal 5 karakter'
        break

      case 'npsn':
        if (!val) errors[field] = 'Field ini wajib diisi'
        else if (!/^\d{8}$/.test(val)) errors[field] = 'NPSN harus 8 digit angka'
        break

      case 'alamatSekolah':
        if (!val) errors[field] = 'Field ini wajib diisi'
        else if (val.length < 10) errors[field] = 'Minimal 10 karakter'
        break

      case 'tahunLulus':
        if (!val) errors[field] = 'Field ini wajib diisi'
        else if (!/^\d{4}$/.test(val)) errors[field] = 'Tahun harus 4 digit angka'
        else if (Number(val) > new Date().getFullYear()) errors[field] = 'Tahun lulus tidak boleh di masa depan'
        break
    }
  }
}

// Accordion State
const isAcc1Open = ref(true)
const isAcc2Open = ref(false)
const isAcc3Open = ref(false)

// Computed validity
const isAcc1Valid = computed(() => {
  const reqFields: (keyof typeof form)[] = [
    'namaLengkap', 'namaPanggilan', 'nik', 'tempatLahir', 'tanggalLahir',
    'jenisKelamin', 'agama', 'kewarganegaraan', 'anakKe', 'jumlahSaudara',
    'alamat', 'rtrw', 'provinsi', 'kota', 'kecamatan', 'kelurahan', 'kodePos', 'noHp', 'email'
  ]
  return reqFields.every(f => form[f] !== '' && !errors[f])
})

const isAcc2Valid = computed(() => {
  const reqFields: (keyof typeof formSekolah)[] = [
    'namaSekolahAsal', 'npsn', 'alamatSekolah', 'tahunLulus'
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

const isAcc2Locked = computed(() => !isAcc1Valid.value)

// Unlock management (Once unlocked, never locked again based on PRD: "Setelah unlock, accordion tidak bisa dikunci kembali meskipun user edit ulang")
const acc2UnlockedEver = ref(false)
watch(isAcc1Valid, (valid) => {
  if (valid && !acc2UnlockedEver.value) {
    acc2UnlockedEver.value = true
    isAcc1Open.value = false
    isAcc2Open.value = true
  }
})
const acc2FinalLock = computed(() => !acc2UnlockedEver.value)

const acc3UnlockedEver = ref(false)
watch(isAcc2Valid, (valid) => {
  if (valid && !acc3UnlockedEver.value) {
    acc3UnlockedEver.value = true
    isAcc2Open.value = false
    isAcc3Open.value = true
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
    <div class="w-full lg:w-1/2 mx-auto flex flex-col gap-6">
      
      <div class="mb-2">
        <h1 class="text-2xl md:text-3xl font-heading font-bold text-text-primary">Formulir Pendaftaran</h1>
        <p class="text-text-secondary mt-1">Lengkapi data di bawah ini dengan benar.</p>
      </div>

      <!-- Accordion 1: Data Diri Siswa -->
      <AppAccordion 
        title="1. Data Diri Siswa" 
        :isOpen="isAcc1Open"
        :isCompleted="isAcc1Valid"
        @toggle="isAcc1Open = !isAcc1Open"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <AppInput v-model="form.namaLengkap" label="Nama Lengkap" required :error="errors.namaLengkap" @blur="validateField('namaLengkap')" />
          <AppInput v-model="form.namaPanggilan" label="Nama Panggilan" required :error="errors.namaPanggilan" @blur="validateField('namaPanggilan')" />
          <AppInput v-model="form.nik" label="NIK" required :error="errors.nik" @blur="validateField('nik')" placeholder="16 digit NIK" />
          <AppInput v-model="form.tempatLahir" label="Tempat Lahir" required :error="errors.tempatLahir" @blur="validateField('tempatLahir')" />
          <AppInput v-model="form.tanggalLahir" type="date" label="Tanggal Lahir" required :error="errors.tanggalLahir" @blur="validateField('tanggalLahir')" />
          
          <div class="flex flex-col gap-1.5 w-full">
            <label class="text-sm font-medium text-text-primary">Jenis Kelamin <span class="text-error">*</span></label>
            <div class="flex items-center gap-4 h-12">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" v-model="form.jenisKelamin" value="Laki-laki" class="w-4 h-4 text-brand focus:ring-brand accent-brand" @change="validateField('jenisKelamin')">
                <span class="text-text-primary">Laki-laki</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" v-model="form.jenisKelamin" value="Perempuan" class="w-4 h-4 text-brand focus:ring-brand accent-brand" @change="validateField('jenisKelamin')">
                <span class="text-text-primary">Perempuan</span>
              </label>
            </div>
            <span v-if="errors.jenisKelamin" class="text-sm text-error">{{ errors.jenisKelamin }}</span>
          </div>

          <AppSelect v-model="form.agama" label="Agama" required :options="agamaOptions" :error="errors.agama" @blur="validateField('agama')" />
          <AppInput v-model="form.kewarganegaraan" label="Kewarganegaraan" required :error="errors.kewarganegaraan" @blur="validateField('kewarganegaraan')" />
          <AppInput v-model="form.anakKe" type="number" label="Anak ke-" required :error="errors.anakKe" @blur="validateField('anakKe')" />
          <AppInput v-model="form.jumlahSaudara" type="number" label="Jumlah Saudara" required :error="errors.jumlahSaudara" @blur="validateField('jumlahSaudara')" />
          <AppSelect v-model="form.golDarah" label="Golongan Darah" :options="golDarahOptions" :error="errors.golDarah" @blur="validateField('golDarah')" placeholder="Pilih (Opsional)" />
          
          <div class="md:col-span-2">
            <AppTextarea v-model="form.alamat" label="Alamat Lengkap" required :error="errors.alamat" @blur="validateField('alamat')" rows="3" />
          </div>

          <AppInput v-model="form.rtrw" label="RT / RW" required :error="errors.rtrw" @blur="validateField('rtrw')" placeholder="Contoh: 001/002" />
          
          <!-- Cascade Dropdowns -->
          <AppSelect v-model="form.provinsi" label="Provinsi" required :options="provinsiOptions" :error="errors.provinsi" @blur="validateField('provinsi')" placeholder="Pilih Provinsi" />
          <AppSelect v-model="form.kota" label="Kota/Kabupaten" required :options="kotaOptions" :disabled="!form.provinsi" :error="errors.kota" @blur="validateField('kota')" placeholder="Pilih Kota/Kabupaten" />
          <AppSelect v-model="form.kecamatan" label="Kecamatan" required :options="kecamatanOptions" :disabled="!form.kota" :error="errors.kecamatan" @blur="validateField('kecamatan')" placeholder="Pilih Kecamatan" />
          <AppSelect v-model="form.kelurahan" label="Kelurahan" required :options="kelurahanOptions" :disabled="!form.kecamatan" :error="errors.kelurahan" @blur="validateField('kelurahan')" placeholder="Pilih Kelurahan" />
          
          <AppInput v-model="form.kodePos" label="Kode Pos" required :error="errors.kodePos" @blur="validateField('kodePos')" />
          <AppInput v-model="form.noHp" label="No. HP Siswa" required :error="errors.noHp" @blur="validateField('noHp')" placeholder="08xx / +628xx" />
          <AppInput v-model="form.email" type="email" label="Email" required :error="errors.email" @blur="validateField('email')" />
        </div>
      </AppAccordion>

      <!-- Accordion 2: Data Asal Sekolah -->
      <AppAccordion 
        title="2. Data Asal Sekolah" 
        :isOpen="isAcc2Open"
        :isLocked="acc2FinalLock"
        :isCompleted="isAcc2Valid"
        @toggle="isAcc2Open = !isAcc2Open"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <AppInput v-model="formSekolah.namaSekolahAsal" label="Nama Sekolah Asal" required :error="errors.namaSekolahAsal" @blur="validateField('namaSekolahAsal')" class="md:col-span-2" />
          <AppInput v-model="formSekolah.npsn" label="NPSN" required :error="errors.npsn" @blur="validateField('npsn')" placeholder="8 digit angka" />
          <AppInput v-model="formSekolah.tahunLulus" type="number" label="Tahun Lulus" required :error="errors.tahunLulus" @blur="validateField('tahunLulus')" placeholder="Contoh: 2024" />
          <AppInput v-model="formSekolah.noIjazah" label="No. Ijazah / SKHUN" :error="errors.noIjazah" @blur="validateField('noIjazah')" placeholder="Opsional" class="md:col-span-2" />
          
          <div class="md:col-span-2">
            <AppTextarea v-model="formSekolah.alamatSekolah" label="Alamat Sekolah Asal" required :error="errors.alamatSekolah" @blur="validateField('alamatSekolah')" rows="3" />
          </div>
        </div>
      </AppAccordion>

      <!-- Accordion 3: Data Orang Tua / Wali -->
      <AppAccordion 
        title="3. Data Orang Tua / Wali" 
        :isOpen="isAcc3Open"
        :isLocked="acc3FinalLock"
        :isCompleted="isAcc3Valid"
        @toggle="isAcc3Open = !isAcc3Open"
      >
        <div class="flex flex-col gap-8">
          <!-- Data Ayah -->
          <div class="flex flex-col gap-4">
            <h3 class="text-lg font-heading font-semibold text-brand border-b border-border pb-2">Data Ayah</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <AppInput v-model="formOrtu.namaAyah" label="Nama Lengkap Ayah" required :error="errors.namaAyah" @blur="validateField('namaAyah')" />
              <AppInput v-model="formOrtu.nikAyah" label="NIK Ayah" required :error="errors.nikAyah" @blur="validateField('nikAyah')" placeholder="16 digit angka" />
              <AppInput v-model="formOrtu.tempatLahirAyah" label="Tempat Lahir" required :error="errors.tempatLahirAyah" @blur="validateField('tempatLahirAyah')" />
              <AppInput v-model="formOrtu.tanggalLahirAyah" type="date" label="Tanggal Lahir" required :error="errors.tanggalLahirAyah" @blur="validateField('tanggalLahirAyah')" />
              <AppSelect v-model="formOrtu.pendidikanAyah" label="Pendidikan Terakhir" required :options="pendidikanOptions" :error="errors.pendidikanAyah" @blur="validateField('pendidikanAyah')" />
              <AppInput v-model="formOrtu.pekerjaanAyah" label="Pekerjaan" required :error="errors.pekerjaanAyah" @blur="validateField('pekerjaanAyah')" />
              <AppSelect v-model="formOrtu.penghasilanAyah" label="Penghasilan Per Bulan" required :options="penghasilanOptions" :error="errors.penghasilanAyah" @blur="validateField('penghasilanAyah')" />
              <AppInput v-model="formOrtu.noHpAyah" label="No. HP Ayah" required :error="errors.noHpAyah" @blur="validateField('noHpAyah')" placeholder="08xx / +628xx" />
            </div>
          </div>

          <!-- Data Ibu -->
          <div class="flex flex-col gap-4">
            <h3 class="text-lg font-heading font-semibold text-brand border-b border-border pb-2">Data Ibu</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <AppInput v-model="formOrtu.namaIbu" label="Nama Lengkap Ibu" required :error="errors.namaIbu" @blur="validateField('namaIbu')" />
              <AppInput v-model="formOrtu.nikIbu" label="NIK Ibu" required :error="errors.nikIbu" @blur="validateField('nikIbu')" placeholder="16 digit angka" />
              <AppInput v-model="formOrtu.tempatLahirIbu" label="Tempat Lahir" required :error="errors.tempatLahirIbu" @blur="validateField('tempatLahirIbu')" />
              <AppInput v-model="formOrtu.tanggalLahirIbu" type="date" label="Tanggal Lahir" required :error="errors.tanggalLahirIbu" @blur="validateField('tanggalLahirIbu')" />
              <AppSelect v-model="formOrtu.pendidikanIbu" label="Pendidikan Terakhir" required :options="pendidikanOptions" :error="errors.pendidikanIbu" @blur="validateField('pendidikanIbu')" />
              <AppInput v-model="formOrtu.pekerjaanIbu" label="Pekerjaan" required :error="errors.pekerjaanIbu" @blur="validateField('pekerjaanIbu')" />
              <AppSelect v-model="formOrtu.penghasilanIbu" label="Penghasilan Per Bulan" required :options="penghasilanOptions" :error="errors.penghasilanIbu" @blur="validateField('penghasilanIbu')" />
              <AppInput v-model="formOrtu.noHpIbu" label="No. HP Ibu" required :error="errors.noHpIbu" @blur="validateField('noHpIbu')" placeholder="08xx / +628xx" />
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
              <AppInput v-model="formOrtu.namaWali" label="Nama Lengkap Wali" required :error="errors.namaWali" @blur="validateField('namaWali')" />
              <AppInput v-model="formOrtu.hubunganWali" label="Hubungan dengan Siswa" required :error="errors.hubunganWali" @blur="validateField('hubunganWali')" />
              <AppInput v-model="formOrtu.noHpWali" label="No. HP Wali" required :error="errors.noHpWali" @blur="validateField('noHpWali')" class="md:col-span-2" />
              <div class="md:col-span-2">
                <AppTextarea v-model="formOrtu.alamatWali" label="Alamat Wali" required :error="errors.alamatWali" @blur="validateField('alamatWali')" rows="3" />
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
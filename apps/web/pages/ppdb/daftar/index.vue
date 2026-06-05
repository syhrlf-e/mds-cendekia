<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import {
  agamaOptions,
  createDefaultProgramOptions,
  gajiOptions,
  pendidikanOptions,
  waliHubunganOptions,
  type ProgramOption
} from '~/composables/usePpdbFormOptions'
import {
  sanitizeDigits,
  sanitizeEmail,
  sanitizeIjazahNumber,
  sanitizeIndonesianMobile,
  sanitizeName,
  sanitizeSafeText,
  sanitizeSchoolName,
  setSanitized,
  type StringRecord
} from '~/composables/usePpdbFormSanitizers'

useHead({ title: 'Formulir Pendaftaran | PPDB MDS Cendekia' })

definePageMeta({ layout: 'ppdb-form' })

const {
  biodata,
  sekolah,
  orangTua,
  isWaliBerbeda,
  isRestoringDraft,
  ensureOrangTuaShape,
  resetForm
} = usePpdbRegistrationForm()
const { ensureVerifiedOrRedirect } = usePpdbVerificationGate()

const form = biodata.value

const formSekolah = sekolah.value
const ayah = orangTua.value[0]!
const ibu = orangTua.value[1]!
const wali = orangTua.value[2]!

const config = useRuntimeConfig()
const isLoadingPrograms = ref(false)
const defaultProgramOptions: ProgramOption[] = createDefaultProgramOptions(config.public.ppdbProgramId)
const programOptions = ref<ProgramOption[]>([...defaultProgramOptions])

const maxBirthYear = new Date().getFullYear() - 1

const {
  errors,
  validateField,
  validateOrangTuaField,
  isAcc1Valid,
  isAcc2Valid,
  isAcc3Valid
} = usePpdbFormValidation({
  form,
  formSekolah,
  orangTua,
  isWaliBerbeda,
  maxBirthYear
})

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

const {
  provinsiOptions,
  kotaOptions,
  kecamatanOptions,
  kelurahanOptions,
  isLookingUpKodePos,
  loadSelectedRegions
} = usePpdbRegionCascade({
  form,
  isRestoringDraft,
  validateField
})

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
  if (!ensureVerifiedOrRedirect()) return

  await Promise.all([
    loadSelectedRegions(),
    loadPrograms()
  ])
})

const {
  isAcc1Open,
  isAcc2Open,
  isAcc3Open,
  acc2FinalLock,
  acc3FinalLock,
  toggleAccordion
} = usePpdbAccordionFlow({
  isAcc1Valid,
  isAcc2Valid
})

const isAllValid = computed(() => isAcc1Valid.value && isAcc2Valid.value && isAcc3Valid.value)

const {
  isLeaveGuardOpen,
  requestLeave,
  confirmLeave,
  proceedNext
} = usePpdbFormNavigationGuard({
  form,
  formSekolah,
  orangTua,
  isWaliBerbeda,
  resetForm,
  nextPath: '/ppdb/daftar/berkas',
  fallbackPath: '/ppdb'
})
</script>

<template>
  <div class="min-h-screen bg-bg-base py-6 md:py-10 xl:py-12">
    <div class="public-navbar-container">
      <div class="mx-auto flex w-full max-w-6xl flex-col gap-2">
        <div class="mb-4 md:mb-5">
          <h1 class="font-heading text-2xl font-bold leading-tight text-text-primary md:text-3xl">Formulir Pendaftaran</h1>
          <p class="mt-1.5 max-w-md text-sm leading-6 text-text-secondary md:max-w-2xl md:text-base md:leading-relaxed">Lengkapi data di bawah ini dengan benar.</p>
        </div>

      <AppAccordion
        title="Data Diri Siswa"
        :isOpen="isAcc1Open"
        :isCompleted="isAcc1Valid"
        :status="isAcc1Valid ? 'complete' : 'incomplete'"
        showStatusText
        @toggle="toggleAccordion(1)"
      >
        <div class="grid grid-cols-1 gap-3.5 md:grid-cols-2 md:gap-5">
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
            <label class="text-xs font-medium text-text-primary md:text-sm">Jenis Kelamin</label>
            <div class="grid min-h-11 grid-cols-2 gap-2">
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
            <span v-if="errors.jenis_kelamin" class="text-xs text-error">{{ errors.jenis_kelamin }}</span>
          </div>

          <div class="md:col-span-2">
            <AppTextarea v-model="form.alamat" label="Alamat Lengkap" required :error="errors.alamat" :sanitizer="(value) => sanitizeSafeText(value, 220)" :maxlength="220" @blur="validateField('alamat')" :rows="3" />
          </div>

          <div class="grid grid-cols-2 gap-3 md:col-span-2 md:gap-4">
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
        lockedText="Lengkapi data siswa dulu"
        @toggle="toggleAccordion(2)"
      >
        <div class="grid grid-cols-1 gap-3.5 md:grid-cols-2 md:gap-5">
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
        lockedText="Lengkapi data sekolah dulu"
        @toggle="toggleAccordion(3)"
      >
        <div class="flex flex-col gap-6 md:gap-8">
          <div class="flex flex-col gap-3.5 md:gap-4">
            <h3 class="border-b border-border pb-2 font-heading text-sm font-semibold text-brand md:text-lg">Data Ayah</h3>
            <div class="grid grid-cols-1 gap-3.5 md:grid-cols-2 md:gap-5">
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

          <div class="flex flex-col gap-3.5 md:gap-4">
            <h3 class="border-b border-border pb-2 font-heading text-sm font-semibold text-brand md:text-lg">Data Ibu</h3>
            <div class="grid grid-cols-1 gap-3.5 md:grid-cols-2 md:gap-5">
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

          <div class="flex items-start gap-3 rounded-xl border border-border bg-bg-surface p-3.5 sm:items-center md:p-4">
            <input type="checkbox" id="waliCheckbox" v-model="isWaliBerbeda" class="mt-0.5 h-5 w-5 shrink-0 rounded border-border text-brand accent-brand focus:ring-brand sm:mt-0">
            <label for="waliCheckbox" class="cursor-pointer select-none text-sm font-medium leading-relaxed text-text-primary md:text-base">
              Wali berbeda dengan orang tua
            </label>
          </div>

          <div v-if="isWaliBerbeda" class="flex flex-col gap-3.5 animate-in fade-in slide-in-from-top-4 duration-300 md:gap-4">
            <h3 class="border-b border-border pb-2 font-heading text-sm font-semibold text-brand md:text-lg">Data Wali</h3>
            <div class="grid grid-cols-1 gap-3.5 md:grid-cols-2 md:gap-5">
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

      <div class="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
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

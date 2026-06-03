<script setup lang="ts">
import { reactive, ref, computed, onMounted, onUnmounted } from 'vue'
import { Check } from 'lucide-vue-next'

useHead({ title: 'Upload Berkas | PPDB MDS Cendekia' })

const router = useRouter()
const route = useRoute()
const config = useRuntimeConfig()
const { biodata, buildPayload, resetForm } = usePpdbRegistrationForm()
const { addToast } = useToast()
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

const berkasPersyaratanJenis = {
  rapor: 'Rapor',
  skRapor: 'SK Rapor',
  ijazah: 'Ijazah',
  akta: 'Akta',
  kk: 'KK'
} as const

const berkas = reactive({
  foto: null as File | null,
  rapor: null as File | null,
  skRapor: null as File | null,
  ijazah: null as File | null,
  akta: null as File | null,
  kk: null as File | null
})

const isAllUploaded = computed(() => {
  return berkas.foto && berkas.rapor && berkas.skRapor && berkas.ijazah && berkas.akta && berkas.kk
})

const isConfirmModalOpen = ref(false)
const isLeaveGuardOpen = ref(false)
const isSubmitting = ref(false)
const submitErrorMessage = ref('')
const isSuccessSheetOpen = ref(false)
const nomorPendaftaran = ref('')
const pendingNavigationPath = ref('')
const allowRouteLeave = ref(false)
const pendingRegistrationStorageKey = 'ppdb-pending-registration'
const pendingRegistration = ref<{ id: number, kode: string } | null>(null)
type SubmitStage = 'idle' | 'registration' | 'files' | 'finishing'
const submitStage = ref<SubmitStage>('idle')

const isMobile = ref(true)

const confirmModalModel = computed({
  get: () => isConfirmModalOpen.value,
  set: (value: boolean) => {
    if (isSubmitting.value && !value) return
    isConfirmModalOpen.value = value
  }
})

const submitProgressCopy = computed(() => {
  if (submitStage.value === 'registration') {
    return {
      title: 'Mengirim Data Pendaftaran',
      description: 'Lagi ngirim data diri, data sekolah, dan data orang tua. Mohon tunggu sebentar ya.'
    }
  }

  if (submitStage.value === 'files') {
    return {
      title: 'Mengunggah Berkas Persyaratan',
      description: 'Lagi ngirim foto dan dokumen persyaratan. Proses ini bisa sedikit lebih lama, tetap di halaman ini ya.'
    }
  }

  if (submitStage.value === 'finishing') {
    return {
      title: 'Menyelesaikan Pendaftaran',
      description: 'Data sudah diterima, kami sedang merapikan hasil pendaftaran kamu.'
    }
  }

  return {
    title: 'Konfirmasi',
    description: 'Apakah kamu yakin data dan berkas yang diunggah sudah sesuai?'
  }
})

const submitProgressSteps = computed(() => [
  {
    label: 'Data diri, sekolah, dan orang tua',
    active: submitStage.value === 'registration',
    done: submitStage.value === 'files' || submitStage.value === 'finishing'
  },
  {
    label: 'Berkas persyaratan',
    active: submitStage.value === 'files',
    done: submitStage.value === 'finishing'
  },
  {
    label: 'Finalisasi',
    active: submitStage.value === 'finishing',
    done: false
  }
])

const apiBaseUrl = computed(() => {
  return String(config.public.apiBaseUrl || 'https://api.oirul.com').replace(/\/$/, '')
})

const berkasUploadEndpoint = computed(() => {
  return `${apiBaseUrl.value}/register/berkas`
})

const registrationSubmitEndpoint = computed(() => {
  return `${apiBaseUrl.value}/register/siswa`
})

const registrationStatusEndpoint = computed(() => {
  return `${apiBaseUrl.value}/register/cek-status`
})

const updateDeviceType = () => {
  isMobile.value = window.innerWidth < 768
}

const openSuccessPreview = () => {
  if (!import.meta.dev || route.query.previewSuccess !== '1') return

  const previewNomor = Array.isArray(route.query.nomor) ? route.query.nomor[0] : route.query.nomor
  nomorPendaftaran.value = previewNomor || 'MDS-PREVIEW-001'
  isSuccessSheetOpen.value = true
}

onMounted(() => {
  updateDeviceType()
  openSuccessPreview()

  if (import.meta.client) {
    const rawPendingRegistration = localStorage.getItem(pendingRegistrationStorageKey)
    if (rawPendingRegistration) {
      try {
        const parsed = JSON.parse(rawPendingRegistration) as { id?: number | string, kode?: string }
        const parsedId = toPositiveNumber(parsed.id)
        if (parsedId) {
          pendingRegistration.value = {
            id: parsedId,
            kode: parsed.kode || String(parsedId)
          }
        } else {
          localStorage.removeItem(pendingRegistrationStorageKey)
        }
      } catch {
        localStorage.removeItem(pendingRegistrationStorageKey)
      }
    }
  }
  window.addEventListener('resize', updateDeviceType)
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateDeviceType)
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

const hasUploadedFiles = computed(() => Object.values(berkas).some(Boolean))

const handleBeforeUnload = (event: BeforeUnloadEvent) => {
  if (!hasUploadedFiles.value || isSubmitting.value || isSuccessSheetOpen.value) return

  event.preventDefault()
  event.returnValue = ''
}

const requestLeave = (path: string) => {
  if (!hasUploadedFiles.value) {
    allowRouteLeave.value = true
    router.push(path)
    return
  }

  pendingNavigationPath.value = path
  isLeaveGuardOpen.value = true
}

const confirmLeave = () => {
  isLeaveGuardOpen.value = false
  const path = pendingNavigationPath.value || '/ppdb/daftar'
  pendingNavigationPath.value = ''
  allowRouteLeave.value = true
  router.push(path)
}

onBeforeRouteLeave((to) => {
  if (allowRouteLeave.value || !hasUploadedFiles.value || isSubmitting.value || isSuccessSheetOpen.value) {
    return true
  }

  pendingNavigationPath.value = to.fullPath
  isLeaveGuardOpen.value = true
  return false
})

const proceedSubmit = () => {
  submitErrorMessage.value = ''
  submitStage.value = 'idle'
  isConfirmModalOpen.value = true
}

const getSubmitErrorMessage = (error: any, fallbackMessage?: string) => {
  if (fallbackMessage) return fallbackMessage
  if (import.meta.client && !navigator.onLine) {
    return 'Koneksi internet kamu sedang offline. Sambungkan internet, lalu coba kirim ulang.'
  }

  const status = error?.response?.status
  const serverMessage = error?.data?.message || error?.response?._data?.message || error?.response?._data?.error || error?.statusMessage

  if (status >= 400 && status < 500) {
    return serverMessage || 'Data pendaftaran belum sesuai dengan ketentuan server. Periksa kembali data dan berkas kamu.'
  }

  const rawMessage = String(error?.message || error?.cause?.message || '').toLowerCase()
  const isNetworkProblem = rawMessage.includes('timeout') ||
    rawMessage.includes('timed out') ||
    rawMessage.includes('abort') ||
    rawMessage.includes('failed to fetch') ||
    rawMessage.includes('fetch failed') ||
    rawMessage.includes('network')

  if (isNetworkProblem || !status) {
    return 'Terjadi gangguan saat mengirim pendaftaran. Silakan coba lagi.'
  }

  return 'Pendaftaran gagal dikirim karena server mengalami kendala. Silakan coba lagi beberapa saat lagi.'
}

const postRegistrationApi = async <T,>(endpoint: string, body: any, timeout: number) => {
  try {
    const data = await $fetch<T>(endpoint, {
      method: 'POST',
      body,
      timeout
    })

    return { data, error: null }
  } catch (error: any) {
    if (import.meta.dev && endpoint.includes('/register/siswa')) {
      console.error('Register siswa gagal:', {
        status: error?.response?.status,
        message: error?.data?.message || error?.response?._data?.message || error?.message,
        payloadSummary: {
          nisnLength: String(body?.nisn || '').length,
          biodataKeys: Object.keys(body?.biodata || {}),
          alamatKeys: Object.keys(body?.alamat || {}),
          riwayatPendidikanKeys: Object.keys(body?.riwayat_pendidikan || {}),
          orangTuaCount: Array.isArray(body?.orang_tua) ? body.orang_tua.length : 0,
          id_program: body?.id_program,
          id_gelombang: body?.id_gelombang
        }
      })
    }

    return { data: null, error }
  }
}

const logBerkasUploadError = (registrationId: number, error: any, data: any, formData: FormData) => {
  if (!import.meta.dev) return

  const jenisBerkas = formData.getAll('jenis_berkas').map(String)
  const berkasFiles = formData.getAll('berkas_persyaratan')

  console.error('Upload berkas gagal:', {
    status: error?.response?.status,
    message: data?.message || error?.data?.message || error?.response?._data?.message || error?.message,
    payloadSummary: {
      id_pendaftaran: registrationId,
      hasPassPhoto: formData.has('pass_photo'),
      jenis_berkas: jenisBerkas,
      berkasCount: berkasFiles.length
    }
  })
}

const getMissingRegistrationFields = (payload: any) => {
  const requiredChecks = [
    ['NISN', payload.nisn],
    ['Nama lengkap', payload.biodata?.nama],
    ['NIK', payload.biodata?.nik],
    ['Agama', payload.biodata?.agama],
    ['Tempat lahir', payload.biodata?.tempat_lahir],
    ['Tanggal lahir', payload.biodata?.tanggal_lahir],
    ['Jenis kelamin', payload.biodata?.jenis_kelamin],
    ['No. telepon', payload.biodata?.no_telepon],
    ['Email', payload.biodata?.email],
    ['Alamat', payload.alamat?.alamat],
    ['RT', payload.alamat?.rt],
    ['RW', payload.alamat?.rw],
    ['Provinsi', payload.alamat?.provinsi],
    ['Kota/Kabupaten', payload.alamat?.kabupaten_kota],
    ['Kecamatan', payload.alamat?.kecamatan],
    ['Kelurahan', payload.alamat?.kelurahan],
    ['Kode pos', payload.alamat?.kode_pos],
    ['Nama sekolah asal', payload.riwayat_pendidikan?.nama_sekolah_asal],
    ['NPSN sekolah asal', payload.riwayat_pendidikan?.npsn_sekolah_asal],
    ['Alamat sekolah asal', payload.riwayat_pendidikan?.alamat_sekolah_asal],
    ['Tahun lulus', payload.riwayat_pendidikan?.tahun_lulus],
    ['No. ijazah', payload.riwayat_pendidikan?.no_ijazah],
    ['Program paket', payload.id_program],
    ['Gelombang', payload.id_gelombang]
  ]

  const missing = requiredChecks
    .filter(([, value]) => String(value ?? '').trim() === '')
    .map(([label]) => label)

  if (!Array.isArray(payload.orang_tua) || payload.orang_tua.length < 2) {
    missing.push('Data orang tua')
  } else {
    payload.orang_tua.slice(0, 2).forEach((parent: any, index: number) => {
      const title = index === 0 ? 'ayah' : 'ibu'
      const parentChecks: [string, string][] = [
        ['nama', `Nama ${title}`],
        ['nik', `NIK ${title}`],
        ['agama', `Agama ${title}`],
        ['hubungan', `Hubungan ${title}`],
        ['peran', `Peran ${title}`],
        ['no_telepon', `No. telepon ${title}`]
      ]

      parentChecks.forEach(([key, label]) => {
        if (!String(parent?.[key] ?? '').trim()) missing.push(label)
      })
    })
  }

  return missing
}

const buildBerkasFormData = (idPendaftaran: number) => {
  const formData = new FormData()
  const selectedBerkas: { jenis: string, file: File }[] = []

  Object.entries(berkasPersyaratanJenis).forEach(([key, jenis]) => {
    const file = berkas[key as keyof typeof berkas]
    if (file) {
      selectedBerkas.push({ jenis, file })
    }
  })

  formData.append('id_pendaftaran', String(idPendaftaran))

  if (berkas.foto) {
    formData.append('pass_photo', berkas.foto)
  }

  selectedBerkas.forEach((item) => {
    formData.append('jenis_berkas', item.jenis)
    formData.append('berkas_persyaratan', item.file)
  })

  return formData
}

type RegistrationSubmitResponse = {
  success?: boolean
  status?: boolean
  message?: string
  data?: {
    id?: number | string
    id_pendaftaran?: number | string
    kode?: string
    kode_pendaftaran?: string
    nomor_pendaftaran?: string
  }
}

type CheckStatusLookupResponse = {
  success?: boolean
  status?: boolean
  message?: string
  data?: {
    id?: number
    kode?: string
    nomor_pendaftaran?: string
  }
}

const isSuccessResponse = (response?: { success?: boolean, status?: boolean } | null) => {
  return response?.success === true || response?.status === true
}

const isFailedResponse = (response?: { success?: boolean, status?: boolean } | null) => {
  return response?.success === false || response?.status === false
}

const toPositiveNumber = (value: unknown) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
}

const getRegistrationId = (response?: RegistrationSubmitResponse | null) => {
  return toPositiveNumber(response?.data?.id) || toPositiveNumber(response?.data?.id_pendaftaran)
}

const getRegistrationCode = (response?: RegistrationSubmitResponse | null) => {
  const idPendaftaran = String(response?.data?.id_pendaftaran || '').trim()
  const idPendaftaranCode = toPositiveNumber(idPendaftaran) ? '' : idPendaftaran

  return response?.data?.nomor_pendaftaran || response?.data?.kode_pendaftaran || response?.data?.kode || idPendaftaranCode
}

const lookupRegistrationId = async (nomorPendaftaran: string) => {
  if (!nomorPendaftaran || !biodata.value.nisn) return 0

  const { data, error } = await postRegistrationApi<CheckStatusLookupResponse>(registrationStatusEndpoint.value, {
    kode_pendaftaran: nomorPendaftaran,
    nisn: biodata.value.nisn
  }, 15000)

  if (error || !isSuccessResponse(data)) return 0

  return data?.data?.id || 0
}

const savePendingRegistration = (registration: { id: number, kode: string }) => {
  pendingRegistration.value = registration
  if (import.meta.client) {
    localStorage.setItem(pendingRegistrationStorageKey, JSON.stringify(registration))
  }
}

const clearPendingRegistration = () => {
  pendingRegistration.value = null
  if (import.meta.client) {
    localStorage.removeItem(pendingRegistrationStorageKey)
  }
}

const submitRegistrationData = async () => {
  if (pendingRegistration.value) return pendingRegistration.value

  const form = biodata.value
  await loadProvinsi()
  if (form.provinsi) await loadKota(form.provinsi)
  if (form.kabupaten_kota) await loadKecamatan(form.kabupaten_kota)
  if (form.kecamatan) await loadKelurahan(form.kecamatan)

  const registrationPayload = buildPayload({
    provinsi: findLabel(provinsiOptions.value, form.provinsi),
    kabupaten_kota: findLabel(kotaOptions.value, form.kabupaten_kota),
    kecamatan: findLabel(kecamatanOptions.value, form.kecamatan),
    kelurahan: findLabel(kelurahanOptions.value, form.kelurahan)
  })
  const missingFields = getMissingRegistrationFields(registrationPayload)

  if (missingFields.length) {
    throw new Error(`Data pendaftaran belum lengkap: ${missingFields.slice(0, 5).join(', ')}${missingFields.length > 5 ? ', dan lainnya' : ''}. Silakan kembali ke form pendaftaran.`)
  }

  const { data, error } = await postRegistrationApi<RegistrationSubmitResponse>(registrationSubmitEndpoint.value, registrationPayload, 15000)

  const registrationCode = getRegistrationCode(data)
  const registrationId = getRegistrationId(data) || await lookupRegistrationId(registrationCode)

  if (error || !isSuccessResponse(data) || !registrationId) {
    const failedMessage = isFailedResponse(data)
      ? data?.message
      : data && !registrationId
        ? 'Register berhasil, tetapi ID pendaftaran belum bisa ditemukan untuk upload berkas. Silakan coba beberapa saat lagi.'
        : undefined
    throw new Error(getSubmitErrorMessage(error, failedMessage))
  }

  const registration = {
    id: registrationId,
    kode: registrationCode || String(registrationId)
  }
  savePendingRegistration(registration)

  return registration
}

const submitForm = async () => {
  if (!isAllUploaded.value) return

  isSubmitting.value = true
  submitErrorMessage.value = ''
  submitStage.value = 'registration'

  let registration: { id: number, kode: string }
  try {
    registration = await submitRegistrationData()
  } catch (error) {
    isSubmitting.value = false
    submitStage.value = 'idle'
    submitErrorMessage.value = error instanceof Error
      ? error.message
      : 'Registrasi gagal. Periksa kembali data pendaftaran kamu.'
    addToast('Pendaftaran belum terkirim.', 'error')
    return
  }

  submitStage.value = 'files'
  const berkasFormData = buildBerkasFormData(registration.id)
  const { data: berkasData, error: berkasError } = await postRegistrationApi<{
    success?: boolean
    status?: boolean
    message: string
  }>(berkasUploadEndpoint.value, berkasFormData, 30000)

  const isBerkasUploaded = berkasData?.success === true || berkasData?.status === true

  if (berkasError || !isBerkasUploaded) {
    isSubmitting.value = false
    submitStage.value = 'idle'
    logBerkasUploadError(registration.id, berkasError, berkasData, berkasFormData)
    const failedMessage = berkasData?.success === false || berkasData?.status === false
      ? berkasData.message
      : undefined
    submitErrorMessage.value = getSubmitErrorMessage(berkasError, failedMessage) || 'Berkas pendaftaran belum berhasil diunggah.'
    addToast('Berkas belum terkirim.', 'error')
    return
  }

  submitStage.value = 'finishing'
  isConfirmModalOpen.value = false
  nomorPendaftaran.value = registration.kode
  clearPendingRegistration()
  resetForm()
  isSubmitting.value = false
  submitStage.value = 'idle'
  isSuccessSheetOpen.value = true
}
</script>

<template>
  <div class="min-h-screen bg-bg-base py-8 md:py-12 px-4">
    <div class="w-full lg:w-1/2 mx-auto flex flex-col gap-6">

      <div class="mb-2">
        <h1 class="text-2xl md:text-3xl font-heading font-bold text-text-primary">Upload Berkas</h1>
        <p class="text-text-secondary mt-1">Unggah dokumen persyaratan untuk menyelesaikan pendaftaran.</p>
      </div>

      <div class="bg-bg-surface border border-border rounded-2xl p-5 md:p-8 flex flex-col gap-6 shadow-sm">
        <AppFileUpload v-model="berkas.foto" label="1. Foto Siswa (3x4 berwarna)" accept=".jpg,.png" :maxSize="1" />
        <AppFileUpload v-model="berkas.rapor" label="2. Buku Rapor SMP" accept=".pdf" :maxSize="2" />
        <AppFileUpload v-model="berkas.skRapor" label="3. Surat Keterangan Nilai Rapor Semester I–V" accept=".pdf" :maxSize="2" />
        <AppFileUpload v-model="berkas.ijazah" label="4. Ijazah / SKL" accept=".pdf" :maxSize="2" />
        <AppFileUpload v-model="berkas.akta" label="5. Akta Kelahiran" accept=".pdf" :maxSize="2" />
        <AppFileUpload v-model="berkas.kk" label="6. Kartu Keluarga" accept=".pdf" :maxSize="2" />
      </div>

      <div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <AppButton
          variant="secondary"
          class="w-full sm:w-auto"
          @click="requestLeave('/ppdb/daftar')"
        >
          Kembali
        </AppButton>

        <AppButton
          variant="primary"
          :disabled="!isAllUploaded"
          @click="proceedSubmit"
          class="w-full sm:w-auto shadow-md"
        >
          Kirim Pendaftaran
        </AppButton>
      </div>

    </div>
  </div>

  <AppModal
    v-model="confirmModalModel"
    :title="submitErrorMessage ? 'Pendaftaran Belum Terkirim' : submitProgressCopy.title"
  >
    <div class="space-y-4">
      <template v-if="isSubmitting">
        <div class="flex items-start gap-4 rounded-xl border border-brand/10 bg-bg-base p-4">
          <div class="mt-0.5 h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-brand/20 border-t-brand"></div>
          <div>
            <p class="text-sm font-medium text-text-primary">{{ submitProgressCopy.title }}</p>
            <p class="mt-1 text-sm leading-relaxed text-text-secondary">{{ submitProgressCopy.description }}</p>
          </div>
        </div>

        <div class="space-y-2">
          <div
            v-for="step in submitProgressSteps"
            :key="step.label"
            class="flex items-center gap-3 text-sm"
          >
            <span
              class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold"
              :class="[
                step.done
                  ? 'border-success bg-status-approved-bg text-status-approved-text'
                  : step.active
                    ? 'border-brand bg-primary-50 text-brand'
                    : 'border-border bg-bg-surface text-text-muted'
              ]"
            >
              <span v-if="step.done">✓</span>
              <span v-else-if="step.active" class="h-1.5 w-1.5 rounded-full bg-current"></span>
            </span>
            <span
              :class="step.done || step.active ? 'text-text-primary' : 'text-text-secondary'"
            >
              {{ step.label }}
            </span>
          </div>
        </div>
      </template>

      <p v-else-if="!submitErrorMessage" class="text-text-primary text-base">{{ submitProgressCopy.description }}</p>

      <p v-if="submitErrorMessage" class="text-sm text-text-primary">
        {{ submitErrorMessage }}
      </p>
    </div>

    <template #footer>
      <AppButton variant="secondary" @click="isConfirmModalOpen = false" :disabled="isSubmitting">
        {{ submitErrorMessage ? 'Tutup' : 'Belum' }}
      </AppButton>
      <AppButton v-if="!isSubmitting" variant="primary" @click="submitForm">
        {{ submitErrorMessage ? 'Coba Lagi' : 'Ya, Kirim' }}
      </AppButton>
    </template>
  </AppModal>

  <AppModal v-model="isLeaveGuardOpen" title="Berkas Belum Dikirim">
    <p class="text-text-primary text-base leading-relaxed">
      Kamu yakin mau meninggalkan halaman ini? File yang sudah kamu unggah kemungkinan akan hilang dan perlu diunggah ulang.
    </p>

    <template #footer>
      <AppButton variant="secondary" @click="isLeaveGuardOpen = false">
        Tetap di Halaman
      </AppButton>
      <AppButton variant="danger" @click="confirmLeave">
        Ya, Tinggalkan
      </AppButton>
    </template>
  </AppModal>

  <template v-if="isSuccessSheetOpen">
    <AppModal
      v-if="!isMobile"
      v-model="isSuccessSheetOpen"
      :close-on-backdrop="false"
      :close-on-escape="false"
      :show-close-button="false"
      :show-header="false"
      @close="$router.push('/ppdb')"
    >
      <div class="flex flex-col items-center text-center pt-2 font-heading">
        <div class="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-success/10 text-success ring-8 ring-success/5">
          <Check class="h-10 w-10 stroke-[2.5]" />
        </div>

        <h3 class="text-2xl font-heading font-bold text-text-primary mb-2">Pendaftaran Diterima!</h3>
        <p class="text-text-secondary mb-3">
          Cek email kamu. Kami sudah mengirim nomor pendaftaran dan NISN untuk cek status pendaftaran.
        </p>
        <a
          href="mailto:info@mdscendekia.or.id?subject=Belum%20Menerima%20Email%20Pendaftaran"
          class="mb-8 inline-flex text-sm font-normal text-brand transition-colors hover:text-brand-hover"
        >
          Belum menerima email?
        </a>

        <div class="w-full flex flex-col gap-3">
          <AppButton
            variant="primary"
            class="w-full"
            @click="$router.push('/ppdb')"
          >
            Selesai
          </AppButton>
        </div>
      </div>
    </AppModal>

    <AppBottomSheet
      v-else
      v-model="isSuccessSheetOpen"
      :close-on-backdrop="false"
      :close-on-escape="false"
      @close="$router.push('/ppdb')"
    >
      <div class="flex flex-col items-center text-center pt-6 font-heading">
        <div class="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-success/10 text-success ring-8 ring-success/5">
          <Check class="h-10 w-10 stroke-[2.5]" />
        </div>

        <h3 class="text-2xl font-heading font-bold text-text-primary mb-2">Pendaftaran Diterima!</h3>
        <p class="text-text-secondary mb-3">
          Cek email kamu. Kami sudah mengirim nomor pendaftaran dan NISN untuk cek status pendaftaran.
        </p>
        <a
          href="mailto:info@mdscendekia.or.id?subject=Belum%20Menerima%20Email%20Pendaftaran"
          class="mb-8 inline-flex text-sm font-normal text-brand transition-colors hover:text-brand-hover"
        >
          Belum menerima email?
        </a>

        <div class="w-full flex flex-col gap-3 pb-4">
          <AppButton
            variant="primary"
            class="w-full"
            @click="$router.push('/ppdb')"
          >
            Selesai
          </AppButton>
        </div>
      </div>
    </AppBottomSheet>
  </template>
</template>

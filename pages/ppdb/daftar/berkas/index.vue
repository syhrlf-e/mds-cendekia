<script setup lang="ts">
import { reactive, ref, computed, onMounted, onUnmounted } from 'vue'
import { Copy, Check } from 'lucide-vue-next'

useHead({ title: 'Upload Berkas | PPDB MDS Cendekia' })

const router = useRouter()
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

const isMobile = ref(true)
const isCopied = ref(false)

const apiBaseUrl = computed(() => {
  return String(config.public.apiBaseUrl || 'https://cendekia.sekata.my.id').replace(/\/$/, '')
})

const berkasUploadEndpoint = computed(() => {
  return `${apiBaseUrl.value}/register/berkas`
})

const updateDeviceType = () => {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  updateDeviceType()
  if (import.meta.client) {
    const rawPendingRegistration = localStorage.getItem(pendingRegistrationStorageKey)
    if (rawPendingRegistration) {
      try {
        const parsed = JSON.parse(rawPendingRegistration) as { id?: number, kode?: string }
        if (parsed.id) {
          pendingRegistration.value = {
            id: parsed.id,
            kode: parsed.kode || String(parsed.id)
          }
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

const copyNomor = async () => {
  try {
    await navigator.clipboard.writeText(nomorPendaftaran.value)
    isCopied.value = true
    setTimeout(() => {
      isCopied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy', err)
  }
}

const proceedSubmit = () => {
  submitErrorMessage.value = ''
  isConfirmModalOpen.value = true
}

const getSubmitErrorMessage = (error: any, fallbackMessage?: string) => {
  if (fallbackMessage) return fallbackMessage
  if (import.meta.client && !navigator.onLine) {
    return 'Koneksi internet kamu sedang offline. Sambungkan internet, lalu coba kirim ulang.'
  }

  const status = error?.response?.status
  if (status >= 400 && status < 500) {
    return error?.response?._data?.message || 'Data pendaftaran belum sesuai dengan ketentuan server. Periksa kembali data dan berkas kamu.'
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
    return { data: null, error }
  }
}

const buildBerkasFormData = (idPendaftaran: number) => {
  const formData = new FormData()

  formData.append('id_pendaftaran', String(idPendaftaran))

  if (berkas.foto) {
    formData.append('pass_photo', berkas.foto)
  }

  Object.entries(berkasPersyaratanJenis).forEach(([key, jenis]) => {
    const file = berkas[key as keyof typeof berkas]
    if (!file) return

    formData.append('jenis_berkas', jenis)
    formData.append('berkas_persyaratan', file)
  })

  return formData
}

type RegistrationSubmitResponse = {
  success?: boolean
  status?: boolean
  message?: string
  data?: {
    id?: number
    id_pendaftaran?: number
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

const getRegistrationId = (response?: RegistrationSubmitResponse | null) => {
  return response?.data?.id_pendaftaran || response?.data?.id || 0
}

const getRegistrationCode = (response?: RegistrationSubmitResponse | null) => {
  return response?.data?.nomor_pendaftaran || response?.data?.kode_pendaftaran || response?.data?.kode || ''
}

const lookupRegistrationId = async (nomorPendaftaran: string) => {
  if (!nomorPendaftaran || !biodata.value.nisn) return 0

  const { data, error } = await postRegistrationApi<CheckStatusLookupResponse>('/api/register/cek-status', {
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

  const { data, error } = await postRegistrationApi<RegistrationSubmitResponse>('/api/register/siswa', registrationPayload, 15000)

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

  let registration: { id: number, kode: string }
  try {
    registration = await submitRegistrationData()
  } catch (error) {
    isSubmitting.value = false
    submitErrorMessage.value = error instanceof Error
      ? error.message
      : 'Registrasi gagal. Periksa kembali data pendaftaran kamu.'
    addToast('Pendaftaran belum terkirim.', 'error')
    return
  }

  const { data: berkasData, error: berkasError } = await postRegistrationApi<{
    success?: boolean
    status?: boolean
    message: string
  }>(berkasUploadEndpoint.value, buildBerkasFormData(registration.id), 30000)

  isSubmitting.value = false

  const isBerkasUploaded = berkasData?.success === true || berkasData?.status === true

  if (berkasError || !isBerkasUploaded) {
    const failedMessage = berkasData?.success === false || berkasData?.status === false
      ? berkasData.message
      : undefined
    submitErrorMessage.value = getSubmitErrorMessage(berkasError, failedMessage)
    addToast('Pendaftaran belum terkirim.', 'error')
    return
  }

  isConfirmModalOpen.value = false
  nomorPendaftaran.value = registration.kode
  clearPendingRegistration()
  resetForm()
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
    v-model="isConfirmModalOpen"
    :title="submitErrorMessage ? 'Pendaftaran Belum Terkirim' : 'Konfirmasi'"
  >
    <div class="space-y-4">
      <p v-if="!submitErrorMessage" class="text-text-primary text-base">Apakah kamu yakin data dan berkas yang diunggah sudah sesuai?</p>

      <p v-if="submitErrorMessage" class="text-sm text-text-primary">
        {{ submitErrorMessage }}
      </p>
    </div>

    <template #footer>
      <AppButton variant="secondary" @click="isConfirmModalOpen = false" :disabled="isSubmitting">
        {{ submitErrorMessage ? 'Tutup' : 'Belum' }}
      </AppButton>
      <AppButton variant="primary" @click="submitForm" :loading="isSubmitting">
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
    <AppModal v-if="!isMobile" v-model="isSuccessSheetOpen" @close="$router.push('/ppdb')">
      <template #header><div></div></template>
      <div class="flex flex-col items-center text-center pt-2">
        <div class="w-16 h-16 bg-status-approved text-white rounded-full flex items-center justify-center mb-5 shadow-lg shadow-success/30">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check"><polyline points="20 6 9 17 4 12"/></svg>
        </div>

        <h3 class="text-2xl font-heading font-bold text-text-primary mb-2">Pendaftaran Berhasil!</h3>
        <p class="text-text-secondary mb-8">Pendaftaran berhasil! Cek email kamu untuk informasi lebih lanjut.</p>

        <div class="w-full bg-bg-base border border-border rounded-xl p-5 mb-8 flex items-center justify-between">
          <div class="text-left">
            <p class="text-sm font-medium text-text-secondary mb-1">Nomor Pendaftaran</p>
            <p class="text-2xl font-heading font-bold text-brand tracking-wider">{{ nomorPendaftaran }}</p>
          </div>
          <button @click="copyNomor" class="w-10 h-10 bg-bg-surface hover:bg-border rounded-lg border border-border flex items-center justify-center text-text-secondary hover:text-brand transition-colors" title="Salin Nomor">
            <Check v-if="isCopied" class="w-5 h-5 text-success" />
            <Copy v-else class="w-5 h-5" />
          </button>
        </div>

        <div class="w-full flex flex-col gap-3">
          <AppButton
            variant="primary"
            class="w-full"
            @click="$router.push('/ppdb/cek-status')"
          >
            Cek Status Pendaftaran
          </AppButton>
          <AppButton
            variant="secondary"
            class="w-full"
            @click="$router.push('/ppdb')"
          >
            Selesai
          </AppButton>
        </div>
      </div>
    </AppModal>

    <AppBottomSheet v-else v-model="isSuccessSheetOpen" @close="$router.push('/ppdb')">
      <div class="flex flex-col items-center text-center pt-6">
        <div class="w-16 h-16 bg-status-approved text-white rounded-full flex items-center justify-center mb-5 shadow-lg shadow-success/30">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check"><polyline points="20 6 9 17 4 12"/></svg>
        </div>

        <h3 class="text-2xl font-heading font-bold text-text-primary mb-2">Pendaftaran Berhasil!</h3>
        <p class="text-text-secondary mb-8">Pendaftaran berhasil! Cek email kamu untuk informasi lebih lanjut.</p>

        <div class="w-full bg-bg-base border border-border rounded-xl p-5 mb-8 flex items-center justify-between">
          <div class="text-left">
            <p class="text-sm font-medium text-text-secondary mb-1">Nomor Pendaftaran</p>
            <p class="text-2xl font-heading font-bold text-brand tracking-wider">{{ nomorPendaftaran }}</p>
          </div>
          <button @click="copyNomor" class="w-10 h-10 bg-bg-surface hover:bg-border rounded-lg border border-border flex items-center justify-center text-text-secondary hover:text-brand transition-colors" title="Salin Nomor">
            <Check v-if="isCopied" class="w-5 h-5 text-success" />
            <Copy v-else class="w-5 h-5" />
          </button>
        </div>

        <div class="w-full flex flex-col gap-3 pb-4">
          <AppButton
            variant="primary"
            class="w-full"
            @click="$router.push('/ppdb/cek-status')"
          >
            Cek Status Pendaftaran
          </AppButton>
          <AppButton
            variant="secondary"
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

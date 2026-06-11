<script setup lang="ts">
import { AlertCircle, RefreshCw, Upload } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'

useHead({ title: 'Revisi Berkas | PPDB MDS Cendekia' })

definePageMeta({
  layout: 'ppdb-form',
  ppdbHeaderTitle: 'Revisi Berkas',
  ppdbBackPath: '/ppdb'
})

type MagicUrlState = 'loading' | 'valid' | 'invalid'

type RevisionDocumentType = {
  nama: string
  format: string
}

type MagicUrlValidateResponse = {
  success?: boolean
  message?: string
  data?: {
    id_pendaftaran?: number | string
    jenis_berkas?: RevisionDocumentType[]
    pendaftaran?: {
      id?: number | string
      id_pendaftaran?: number | string
    }
  }
}

const route = useRoute()
const config = useRuntimeConfig()
const { get } = useApi()
const { addToast } = useToast()

const token = computed(() => String(route.params.token || '').trim())
const state = ref<MagicUrlState>('loading')
const errorMessage = ref('')
const documentTypes = ref<RevisionDocumentType[]>([])
const nisn = ref('')
const idPendaftaran = ref('')
const selectedDocumentName = ref('')
const selectedFile = ref<File | null>(null)
const isSubmitting = ref(false)
const fieldErrors = ref({
  nisn: '',
  documentName: '',
  file: ''
})

const apiBaseUrl = computed(() => {
  return String(config.public.apiBaseUrl || '').replace(/\/$/, '')
})

const berkasUploadEndpoint = computed(() => {
  return `${apiBaseUrl.value}/register/berkas`
})

const selectedDocumentType = computed(() => {
  return documentTypes.value.find(item => item.nama === selectedDocumentName.value) || null
})

const documentTypeOptions = computed(() => {
  return documentTypes.value.map(item => ({ label: item.nama, value: item.nama }))
})

const postRevisionApi = async <T,>(endpoint: string, body: FormData, timeout: number) => {
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

const normalizeDocumentName = (value: string) => {
  return value.toLowerCase().replace(/[\s_-]+/g, '')
}

const isPassPhotoDocument = (value: string) => {
  const normalized = normalizeDocumentName(value)
  return normalized.includes('foto') || normalized.includes('photo') || normalized.includes('pasfoto') || normalized.includes('passphoto')
}

const buildRevisionFormData = () => {
  const formData = new FormData()

  if (idPendaftaran.value) {
    formData.append('id_pendaftaran', idPendaftaran.value)
  }

  if (selectedFile.value) {
    if (isPassPhotoDocument(selectedDocumentName.value)) {
      formData.append('pass_photo', selectedFile.value)
    } else {
      formData.append('jenis_berkas', selectedDocumentName.value)
      formData.append('berkas_persyaratan', selectedFile.value)
    }
  }

  return formData
}

const getAcceptAttribute = (format: string) => {
  return format
    .split(',')
    .map(item => item.trim().toLowerCase())
    .filter(Boolean)
    .map(formatItem => `.${formatItem}`)
    .join(',')
}

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  selectedFile.value = input.files?.[0] || null
  if (selectedFile.value) fieldErrors.value.file = ''
}

const handleDocumentChange = () => {
  selectedFile.value = null
  fieldErrors.value.documentName = ''
  fieldErrors.value.file = ''
}

const validateRevisionForm = () => {
  fieldErrors.value.nisn = nisn.value.trim()
    ? nisn.value.trim().length >= 8
      ? ''
      : 'NISN minimal terdiri dari 8 digit.'
    : 'NISN wajib diisi.'
  fieldErrors.value.documentName = selectedDocumentName.value
    ? ''
    : 'Jenis berkas wajib dipilih.'
  fieldErrors.value.file = selectedFile.value
    ? ''
    : 'Dokumen revisi wajib diunggah.'

  return !fieldErrors.value.nisn && !fieldErrors.value.documentName && !fieldErrors.value.file
}

const validateMagicUrl = async () => {
  if (!token.value) {
    state.value = 'invalid'
    errorMessage.value = 'Token revisi berkas tidak ditemukan.'
    return
  }

  state.value = 'loading'
  errorMessage.value = ''

  const { data, error } = await get<MagicUrlValidateResponse>(`/api/url/validate/${encodeURIComponent(token.value)}`, {
    showErrorToast: false
  })

  if (error || !data?.success || !data.data) {
    state.value = 'invalid'
    errorMessage.value = data?.message || 'Link revisi berkas tidak valid atau sudah tidak aktif.'
    return
  }

  idPendaftaran.value = String(data.data.id_pendaftaran || data.data.pendaftaran?.id_pendaftaran || data.data.pendaftaran?.id || '').trim()
  documentTypes.value = data.data.jenis_berkas || []
  selectedDocumentName.value = documentTypes.value[0]?.nama || ''

  state.value = 'valid'
}

const handleSubmit = async () => {
  if (isSubmitting.value || !validateRevisionForm()) return

  isSubmitting.value = true

  const { data, error } = await postRevisionApi<{ success?: boolean, status?: boolean, message?: string }>(
    berkasUploadEndpoint.value,
    buildRevisionFormData(),
    30000
  )

  isSubmitting.value = false

  const isSuccess = data?.success === true || data?.status === true

  if (error || !isSuccess) {
    const message = data?.message || error?.response?._data?.message || 'Berkas revisi belum berhasil dikirim.'
    addToast(message, 'error')
    return
  }

  selectedFile.value = null
  addToast(data?.message || 'Berkas revisi berhasil dikirim.', 'success')
}

onMounted(validateMagicUrl)
</script>

<template>
  <div class="min-h-screen bg-bg-base px-4 py-8 md:py-12">
    <div class="mx-auto flex min-h-[calc(100vh-96px)] w-full max-w-160 flex-col justify-center">
      <div class="mb-8 text-center">
        <h1 class="mb-3 font-heading text-3xl font-semibold text-text-primary">
          Revisi Berkas Pendaftaran
        </h1>
        <p class="text-text-secondary">
          Masukkan NISN untuk mengunggah ulang dokumen.
        </p>
      </div>

      <section v-if="state === 'loading'" class="flex justify-center rounded-2xl border border-border bg-bg-surface p-8">
        <div class="flex flex-col items-center gap-4 text-center">
          <AppLoadingDotWave />
          <p class="text-sm font-medium text-text-secondary">Memvalidasi link revisi berkas...</p>
        </div>
      </section>

      <section v-else-if="state === 'invalid'" class="rounded-2xl border border-border bg-bg-surface p-8">
        <div class="mx-auto flex max-w-120 flex-col items-center text-center">
          <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-status-rejected-bg text-error">
            <AlertCircle class="h-6 w-6" />
          </div>
          <h2 class="mb-2 font-heading text-xl font-semibold text-text-primary">
            Link Tidak Valid
          </h2>
          <p class="mb-6 text-sm leading-relaxed text-text-secondary">
            {{ errorMessage }}
          </p>
          <AppButton variant="secondary" @click="validateMagicUrl">
            <RefreshCw class="mr-2 h-4 w-4" />
            Coba Lagi
          </AppButton>
        </div>
      </section>

      <form v-else class="flex flex-col gap-5" @submit.prevent="handleSubmit">
        <AppInput
          v-model="nisn"
          label="NISN"
          placeholder="Masukkan NISN"
          required
          inputmode="numeric"
          :maxlength="10"
          :sanitizer="(value) => String(value ?? '').replace(/\\D/g, '').slice(0, 10)"
          :error="fieldErrors.nisn"
          @blur="validateRevisionForm"
          @focus="fieldErrors.nisn = ''"
        />

        <AppSelect
          v-model="selectedDocumentName"
          label="Jenis Berkas"
          required
          :options="documentTypeOptions"
          placeholder="Pilih jenis berkas"
          :error="fieldErrors.documentName"
          @update:model-value="handleDocumentChange"
          @blur="validateRevisionForm"
        />

        <div>
          <p class="mb-2 text-sm font-medium leading-snug tracking-normal text-text-primary">
            Dokumen Revisi
          </p>
          <label
            class="group flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-border-soft bg-bg-surface px-5 py-7 text-center transition-colors hover:border-brand/40 hover:bg-primary-50"
            :class="!selectedDocumentType ? 'pointer-events-none opacity-50' : ''"
          >
            <Upload class="mb-3 h-6 w-6 text-text-secondary group-hover:text-brand" />
            <span class="text-sm font-medium text-text-primary">
              {{ selectedFile?.name || 'Pilih dokumen' }}
            </span>
            <span class="mt-1 text-xs text-text-secondary">
              {{ selectedFile ? 'File siap dikirim' : selectedDocumentType ? `.${selectedDocumentType.format.replaceAll(',', ', .')}` : 'Pilih jenis berkas dahulu' }}
            </span>
            <input
              type="file"
              class="sr-only"
              :accept="selectedDocumentType ? getAcceptAttribute(selectedDocumentType.format) : ''"
              :disabled="!selectedDocumentType"
              @change="handleFileChange"
            >
          </label>
          <p
            v-if="fieldErrors.file"
            role="alert"
            aria-live="polite"
            class="mt-1.5 text-xs text-error"
          >
            {{ fieldErrors.file }}
          </p>
        </div>

        <AppButton :disabled="isSubmitting" :loading="isSubmitting" class="w-full" @click="handleSubmit">
          Kirim Revisi
        </AppButton>
      </form>
    </div>
  </div>
</template>

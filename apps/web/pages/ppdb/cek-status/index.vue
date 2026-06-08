<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { SearchX } from 'lucide-vue-next'

useHead({ title: 'Cek Status | PPDB MDS Cendekia' })

definePageMeta({
  layout: 'ppdb-form',
  ppdbHeaderTitle: 'Cek Status',
  ppdbBackPath: '/ppdb'
})

type CheckState = 'initial' | 'loading' | 'success' | 'not-found'
type StatusResult = {
  nomor: string
  nisn: string
  tanggal: string
  nama: string
  ttl: string
  jenisKelamin: string
  sekolah: string
  email: string
  noHp: string
  status: 'pending' | 'approved' | 'rejected'
  alasanPenolakan: string
}

type CheckStatusResponse = {
  status?: boolean
  success?: boolean
  message?: string
  data?: {
    id: number | string
    kode?: string
    status?: string
    status_pendaftaran?: string
    status_berkas?: string
    created_at: string
    biodata?: {
      nama?: string
      tempat_lahir?: string
      tanggal_lahir?: string
      jenis_kelamin?: string
      agama?: string
      no_telepon?: string
      email?: string
    }
    riwayat_pendidikan?: {
      nama_sekolah_asal?: string
    }
  }
}

const router = useRouter()
const nomorPendaftaran = ref('')
const nisn = ref('')
const state = ref<CheckState>('initial')
const resultData = ref<StatusResult | null>(null)
const isMobile = ref(false)
const isClosingResult = ref(false)
const errors = ref({
  nomorPendaftaran: '',
  nisn: ''
})

const checkMobile = () => {
  isMobile.value = window.innerWidth < 1024
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

const hasResult = computed(() => state.value === 'success' || state.value === 'not-found' || isClosingResult.value)
const isChecking = computed(() => state.value === 'loading')
const rightButtonLabel = computed(() => hasResult.value ? 'Cek Pendaftaran Lainnya' : 'Cek Sekarang')

const { post } = useApi()

const getStatusResultCopy = (status: StatusResult['status']) => {
  if (status === 'approved') {
    return {
      title: 'Pendaftaran Kamu Diterima',
      description: 'Selamat, pendaftaran kamu sudah disetujui oleh panitia.'
    }
  }

  if (status === 'rejected') {
    return {
      title: 'Pendaftaran Kamu Belum Diterima',
      description: 'Pendaftaran kamu belum dapat disetujui. Silakan cek detail atau informasi lanjutan dari panitia.'
    }
  }

  return {
    title: 'Pendaftaran Kamu Sedang Divalidasi',
    description: 'Data dan berkas kamu sedang diperiksa oleh panitia. Cek kembali secara berkala untuk melihat pembaruan status.'
  }
}

const getStatusResultClass = (status: StatusResult['status']) => {
  if (status === 'approved') return 'border-status-approved-text/20 bg-status-approved-bg text-status-approved-text'
  if (status === 'rejected') return 'border-status-rejected-text/20 bg-status-rejected-bg text-status-rejected-text'
  return 'border-status-pending-text/20 bg-status-pending-bg text-status-pending-text'
}

const mapRegistrationStatus = (status?: string): StatusResult['status'] => {
  const normalized = String(status || '').toLowerCase()

  if (normalized.includes('diterima') || normalized.includes('approved') || normalized.includes('lulus')) return 'approved'
  if (normalized.includes('ditolak') || normalized.includes('rejected')) return 'rejected'
  return 'pending'
}

const normalizeNomorPendaftaran = (value: string) => {
  return value.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '')
}

const stripNomorPendaftaran = (value: string) => normalizeNomorPendaftaran(value).replace(/-/g, '')

const formatNomorPendaftaran = (value: string) => {
  const normalized = normalizeNomorPendaftaran(value)
  if (!normalized || normalized.includes('-')) return normalized

  const match = normalized.match(/^([A-Z]+)(\d{4})(\d+)$/)
  if (!match) return normalized

  return `${match[1]}-${match[2]}-${match[3]}`
}

const getNomorPendaftaranLookupVariants = (value: string) => {
  const stripped = stripNomorPendaftaran(value)
  const formatted = formatNomorPendaftaran(stripped)

  return Array.from(new Set([stripped, formatted].filter(Boolean)))
}

const validateInputs = () => {
  errors.value.nomorPendaftaran = nomorPendaftaran.value.trim()
    ? ''
    : 'Nomor pendaftaran wajib diisi.'
  errors.value.nisn = nisn.value.trim()
    ? nisn.value.trim().length === 10
      ? ''
      : 'NISN harus terdiri dari 10 digit.'
    : 'NISN wajib diisi.'

  return !errors.value.nomorPendaftaran && !errors.value.nisn
}

const clearFieldError = (field: keyof typeof errors.value) => {
  errors.value[field] = ''
}

const formatDate = (dateString?: string) => {
  if (!dateString) return '-'

  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const handleCheck = async () => {
  if (hasResult.value) {
    checkAnother()
    return
  }

  if (!validateInputs()) return

  state.value = 'loading'
  resultData.value = null

  const normalizedNumber = normalizeNomorPendaftaran(nomorPendaftaran.value)
  const normalizedNisn = nisn.value.trim()
  const lookupNumbers = getNomorPendaftaranLookupVariants(normalizedNumber)

  let foundData: CheckStatusResponse | null = null

  for (const kodePendaftaran of lookupNumbers) {
    const { data, error } = await post<CheckStatusResponse>('/register/cek-status', {
      kode_pendaftaran: kodePendaftaran,
      nisn: normalizedNisn
    }, { showErrorToast: false })

    if (!error && data?.status && data.data) {
      foundData = data
      break
    }
  }

  if (!foundData?.status || !foundData.data) {
    state.value = 'not-found'
    return
  }

  const biodata = foundData.data.biodata || {}
  const tanggalLahir = formatDate(biodata.tanggal_lahir)
  const resultNumber = String(foundData.data.kode || foundData.data.id || normalizedNumber)

  resultData.value = {
    nomor: formatNomorPendaftaran(resultNumber),
    nisn: normalizedNisn,
    tanggal: formatDate(foundData.data.created_at),
    nama: biodata.nama || '-',
    ttl: `${biodata.tempat_lahir || '-'}, ${tanggalLahir}`,
    jenisKelamin: biodata.jenis_kelamin || '-',
    sekolah: foundData.data.riwayat_pendidikan?.nama_sekolah_asal || '-',
    email: biodata.email || '-',
    noHp: biodata.no_telepon || '-',
    status: mapRegistrationStatus(foundData.data.status_pendaftaran || foundData.data.status),
    alasanPenolakan: foundData.message || ''
  }

  state.value = 'success'
}

const checkAnother = () => {
  if (isClosingResult.value) return

  isClosingResult.value = true
  state.value = 'initial'
  window.setTimeout(() => {
    resultData.value = null
    nomorPendaftaran.value = ''
    nisn.value = ''
    errors.value.nomorPendaftaran = ''
    errors.value.nisn = ''
    isClosingResult.value = false
  }, 300)
}
</script>

<template>
  <div class="h-[calc(100vh-116px)] overflow-hidden bg-bg-base pb-28 pt-[68px] md:h-[calc(100vh-132px)] md:py-8">
    <div class="public-navbar-container h-full">
      <div class="mx-auto flex h-full w-full max-w-160 flex-col justify-start md:justify-center">
        <div class="mb-7 text-center md:mb-8">
          <h1 class="mb-2.5 font-heading text-2xl font-semibold leading-tight text-text-primary md:mb-3 md:text-3xl">
            Cek Status Pendaftaran
          </h1>
          <p class="mx-auto max-w-sm text-sm leading-6 text-text-secondary md:max-w-none md:text-base md:leading-relaxed">
            Masukkan nomor pendaftaran dan NISN untuk melihat hasil seleksi.
          </p>
        </div>

        <form class="flex flex-col gap-4 md:gap-5" @submit.prevent="handleCheck">
          <div class="grid gap-4 sm:grid-cols-2 md:gap-5">
            <AppInput
              v-model="nomorPendaftaran"
              label="Nomor Pendaftaran"
              placeholder="Contoh: MDS-2025-0001"
              required
              :error="errors.nomorPendaftaran"
              :disabled="isChecking || hasResult"
              @blur="validateInputs"
              @focus="clearFieldError('nomorPendaftaran')"
            />
            <AppInput
              v-model="nisn"
              label="NISN"
              placeholder="Contoh: 0101234567"
              required
              inputmode="numeric"
              :maxlength="10"
              :sanitizer="(value) => String(value ?? '').replace(/\\D/g, '').slice(0, 10)"
              :error="errors.nisn"
              :disabled="isChecking || hasResult"
              @blur="validateInputs"
              @focus="clearFieldError('nisn')"
            />
          </div>

        <div
          class="hidden lg:grid transition-all duration-300 ease-out"
          :class="state !== 'initial' ? 'opacity-100 grid-rows-[1fr]' : 'opacity-0 grid-rows-[0fr]'"
        >
          <div class="overflow-hidden">
            <div v-if="isChecking" class="flex justify-center rounded-2xl border border-border bg-bg-surface p-8">
              <AppLoadingDotWave />
            </div>

            <div v-else-if="state === 'success' && resultData" class="rounded-2xl border border-border bg-bg-surface p-6">
              <div
                class="mb-6 rounded-xl border p-4"
                :class="getStatusResultClass(resultData.status)"
              >
                <p class="text-base font-medium text-current">
                  {{ getStatusResultCopy(resultData.status).title }}
                </p>
                <p class="mt-1 text-sm leading-relaxed text-current/80">
                  {{ getStatusResultCopy(resultData.status).description }}
                </p>
              </div>

              <div v-if="resultData.status === 'rejected'" class="mb-6 rounded-xl border border-red-100 bg-red-50 p-4">
                <p class="mb-1 text-sm font-semibold text-error">Alasan Penolakan</p>
                <p class="text-sm text-text-primary">{{ resultData.alasanPenolakan }}</p>
              </div>

              <div class="space-y-6">
                <section>
                  <h2 class="mb-3 border-b border-border pb-2 text-xs font-semibold uppercase tracking-wider text-text-secondary">Informasi Pendaftaran</h2>
                  <div class="grid grid-cols-3 gap-y-2 text-sm">
                    <span class="text-text-secondary">Nomor Pendaftaran</span>
                    <span class="col-span-2 font-medium text-text-primary">{{ resultData.nomor }}</span>
                    <span class="text-text-secondary">NISN</span>
                    <span class="col-span-2 font-medium text-text-primary">{{ resultData.nisn }}</span>
                    <span class="text-text-secondary">Tanggal Daftar</span>
                    <span class="col-span-2 font-medium text-text-primary">{{ resultData.tanggal }}</span>
                  </div>
                </section>

                <section>
                  <h2 class="mb-3 border-b border-border pb-2 text-xs font-semibold uppercase tracking-wider text-text-secondary">Identitas Calon Siswa</h2>
                  <div class="grid grid-cols-3 gap-y-2 text-sm">
                    <span class="text-text-secondary">Nama Lengkap</span>
                    <span class="col-span-2 font-medium text-text-primary">{{ resultData.nama }}</span>
                    <span class="text-text-secondary">Tempat, Tgl Lahir</span>
                    <span class="col-span-2 font-medium text-text-primary">{{ resultData.ttl }}</span>
                    <span class="text-text-secondary">Jenis Kelamin</span>
                    <span class="col-span-2 font-medium text-text-primary">{{ resultData.jenisKelamin }}</span>
                    <span class="text-text-secondary">Asal Sekolah</span>
                    <span class="col-span-2 font-medium text-text-primary">{{ resultData.sekolah }}</span>
                    <span class="text-text-secondary">Email</span>
                    <span class="col-span-2 font-medium text-text-primary">{{ resultData.email }}</span>
                    <span class="text-text-secondary">No. HP</span>
                    <span class="col-span-2 font-medium text-text-primary">{{ resultData.noHp }}</span>
                  </div>
                </section>
              </div>
            </div>

            <AppEmptyState
              v-else-if="state === 'not-found'"
              title="Nomor pendaftaran tidak ditemukan"
              description="Periksa kembali nomor pendaftaran kamu dan pastikan tidak ada kesalahan penulisan."
              class="rounded-2xl border border-border bg-bg-surface"
            >
              <template #icon>
                <SearchX class="h-10 w-10 text-gray-300" />
              </template>
            </AppEmptyState>
          </div>
        </div>

          <div class="hidden gap-3 pt-1 sm:flex sm:justify-between md:pt-0">
            <AppButton
              variant="secondary"
              type="button"
              class="sm:w-auto"
              @click="router.push('/ppdb')"
            >
              Kembali
            </AppButton>

            <AppButton
              type="submit"
              variant="primary"
              :disabled="isChecking"
              :loading="isChecking"
              class="sm:w-auto"
            >
              {{ rightButtonLabel }}
            </AppButton>
          </div>

          <div
            v-if="!hasResult"
            class="fixed inset-x-0 bottom-12 z-50 border-t border-border bg-white/95 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur sm:hidden"
          >
            <AppButton
              type="submit"
              variant="primary"
              :disabled="isChecking"
              :loading="isChecking"
              class="mx-auto flex w-full max-w-xl"
            >
              {{ rightButtonLabel }}
            </AppButton>
          </div>
        </form>
      </div>
    </div>
  </div>

  <AppBottomSheet v-if="isMobile && hasResult" :modelValue="hasResult" @update:modelValue="checkAnother">
    <div v-if="state === 'success' && resultData" class="flex flex-col pt-2 font-heading">
      <div
        class="mb-5 rounded-xl border p-3.5"
        :class="getStatusResultClass(resultData.status)"
      >
        <p class="text-sm font-semibold leading-5 text-current">
          {{ getStatusResultCopy(resultData.status).title }}
        </p>
        <p class="mt-1 text-xs leading-5 text-current/80">
          {{ getStatusResultCopy(resultData.status).description }}
        </p>
      </div>

      <div v-if="resultData.status === 'rejected'" class="mb-5 rounded-xl border border-red-100 bg-red-50 p-3.5">
        <p class="mb-1 text-sm font-semibold text-error">Alasan Penolakan</p>
        <p class="text-sm leading-6 text-text-primary">{{ resultData.alasanPenolakan }}</p>
      </div>

      <div class="space-y-5">
        <section>
          <h2 class="mb-2.5 border-b border-border pb-2 text-xs font-semibold uppercase text-text-secondary">Informasi Pendaftaran</h2>
          <div class="divide-y divide-border text-sm">
            <div class="flex items-start justify-between gap-4 py-2.5">
              <span class="shrink-0 text-text-secondary">Nomor</span>
              <span class="text-right font-medium text-text-primary">{{ resultData.nomor }}</span>
            </div>
            <div class="flex items-start justify-between gap-4 py-2.5">
              <span class="shrink-0 text-text-secondary">NISN</span>
              <span class="text-right font-medium text-text-primary">{{ resultData.nisn }}</span>
            </div>
            <div class="flex items-start justify-between gap-4 py-2.5">
              <span class="shrink-0 text-text-secondary">Tanggal</span>
              <span class="text-right font-medium text-text-primary">{{ resultData.tanggal }}</span>
            </div>
          </div>
        </section>

        <section>
          <h2 class="mb-2.5 border-b border-border pb-2 text-xs font-semibold uppercase text-text-secondary">Identitas Calon Siswa</h2>
          <div class="divide-y divide-border text-sm">
            <div class="flex items-start justify-between gap-4 py-2.5">
              <span class="shrink-0 text-text-secondary">Nama</span>
              <span class="text-right font-medium text-text-primary">{{ resultData.nama }}</span>
            </div>
            <div class="flex items-start justify-between gap-4 py-2.5">
              <span class="shrink-0 text-text-secondary">TTL</span>
              <span class="text-right font-medium text-text-primary">{{ resultData.ttl }}</span>
            </div>
            <div class="flex items-start justify-between gap-4 py-2.5">
              <span class="shrink-0 text-text-secondary">J. Kelamin</span>
              <span class="text-right font-medium text-text-primary">{{ resultData.jenisKelamin }}</span>
            </div>
            <div class="flex items-start justify-between gap-4 py-2.5">
              <span class="shrink-0 text-text-secondary">Asal Sekolah</span>
              <span class="text-right font-medium text-text-primary">{{ resultData.sekolah }}</span>
            </div>
            <div class="flex items-start justify-between gap-4 py-2.5">
              <span class="shrink-0 text-text-secondary">Email</span>
              <span class="min-w-0 truncate text-right font-medium text-text-primary">{{ resultData.email }}</span>
            </div>
            <div class="flex items-start justify-between gap-4 py-2.5">
              <span class="shrink-0 text-text-secondary">No. HP</span>
              <span class="text-right font-medium text-text-primary">{{ resultData.noHp }}</span>
            </div>
          </div>
        </section>

        <AppButton class="w-full" @click="checkAnother">
          Cek Pendaftaran Lainnya
        </AppButton>
      </div>
    </div>

    <AppEmptyState
      v-else
      title="Nomor pendaftaran tidak ditemukan"
      description="Periksa kembali nomor pendaftaran kamu dan pastikan tidak ada kesalahan penulisan."
    >
      <template #icon>
        <SearchX class="h-10 w-10 text-gray-300" />
      </template>
      <template #action>
        <AppButton class="w-full" @click="checkAnother">
          Cek Pendaftaran Lainnya
        </AppButton>
      </template>
    </AppEmptyState>
  </AppBottomSheet>
</template>

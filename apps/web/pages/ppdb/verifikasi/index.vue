<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { sanitizeEmail } from '~/composables/usePpdbFormSanitizers'
import type { EmailVerificationResult } from '~/services/usePpdbEmailVerificationService'
import { usePpdbEmailVerificationService } from '~/services/usePpdbEmailVerificationService'

useHead({ title: 'Verifikasi Email | PPDB MDS Cendekia' })

definePageMeta({
  layout: 'ppdb-form',
  ppdbHeaderTitle: 'Verifikasi Email',
  ppdbBackPath: '/ppdb'
})

type VerificationViewState = 'idle' | 'sent' | 'success' | 'expired' | 'failed'

const router = useRouter()
const route = useRoute()
const {
  getPendingEmail,
  savePendingEmail,
  clearPendingEmail,
  hasCompletedRegistration,
  activateNewVerification
} = usePpdbVerificationGate()
const { biodata } = usePpdbRegistrationForm()
const {
  isMockVerificationEnabled,
  requestEmailVerification,
  checkEmailVerificationStatus,
  getEmailVerificationSession
} = usePpdbEmailVerificationService()

const email = ref('')
const viewState = ref<VerificationViewState>('idle')
const isSubmitting = ref(false)
const formError = ref('')
const verificationExpiresAt = ref('')
let pollingTimer: ReturnType<typeof setInterval> | null = null
let pollingRequestActive = false

const normalizedEmail = computed(() => sanitizeEmail(email.value))
const isEmailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail.value))
const canRequestVerification = computed(() => !isSubmitting.value)
const hasEmailError = computed(() => Boolean(formError.value && viewState.value === 'idle'))

const spamFolderMessage = 'Belum terlihat? Cek folder Spam, Promosi, atau tab Pembaruan.'
const rateLimitedMessage = 'Permintaan verifikasi terlalu sering. Tunggu beberapa saat, lalu coba lagi.'

const redirectTarget = computed(() => {
  const redirect = Array.isArray(route.query.redirect) ? route.query.redirect[0] : route.query.redirect
  return redirect && redirect.startsWith('/ppdb/daftar') ? redirect : '/ppdb/daftar'
})

const setFormError = (message: string) => {
  formError.value = message
}

const activateVerifiedState = (response?: EmailVerificationResult | null) => {
  if (!normalizedEmail.value) return

  stopPolling()
  clearPendingEmail()
  activateNewVerification()
  biodata.value.email = normalizedEmail.value
  viewState.value = 'success'
  formError.value = ''

  window.setTimeout(() => {
    router.replace(redirectTarget.value)
  }, response?.sessionExpiresAt ? 500 : 800)
}

const stopPolling = () => {
  if (!pollingTimer) return
  clearInterval(pollingTimer)
  pollingTimer = null
}

const handleVerificationStatus = (response: EmailVerificationResult) => {
  if (response.email && !normalizedEmail.value) {
    email.value = sanitizeEmail(response.email)
  }

  if (response.status === 'verified' || response.isVerified) {
    activateVerifiedState(response)
    return true
  }

  if (response.status === 'registered' || response.isRegistered) {
    stopPolling()
    clearPendingEmail()
    viewState.value = 'idle'
    setFormError(response.message || 'Email ini sudah terdaftar. Gunakan email lain untuk pendaftaran baru.')
    return true
  }

  if (response.status === 'expired') {
    stopPolling()
    viewState.value = 'expired'
    return true
  }

  return false
}

const pollVerificationStatus = async () => {
  if (pollingRequestActive || viewState.value !== 'sent') return

  if (verificationExpiresAt.value) {
    const expiresAt = new Date(verificationExpiresAt.value).getTime()
    if (Number.isFinite(expiresAt) && expiresAt <= Date.now()) {
      stopPolling()
      viewState.value = 'expired'
      return
    }
  }

  pollingRequestActive = true

  try {
    handleVerificationStatus(await checkEmailVerificationStatus(normalizedEmail.value))
  } finally {
    pollingRequestActive = false
  }
}

const startPolling = () => {
  stopPolling()
  void pollVerificationStatus()
  pollingTimer = setInterval(() => {
    void pollVerificationStatus()
  }, 3000)
}

const requestVerificationEmail = async () => {
  if (!canRequestVerification.value) return

  formError.value = ''

  if (!normalizedEmail.value) {
    setFormError('Email aktif wajib diisi.')
    return
  }

  if (!isEmailValid.value) {
    setFormError('Masukkan format email yang valid, contoh nama@email.com.')
    return
  }

  isSubmitting.value = true

  try {
    const response = await requestEmailVerification(normalizedEmail.value)

    if (!response.success) {
      if (response.status === 'registered' || response.isRegistered) {
        setFormError(response.message || 'Email ini sudah terdaftar. Gunakan email lain untuk pendaftaran baru.')
        return
      }

      if (response.status === 'rate_limited') {
        setFormError(rateLimitedMessage)
        return
      }

      setFormError('Tautan verifikasi belum bisa dikirim. Periksa kembali alamat email Anda, lalu coba lagi.')
      return
    }

    if (handleVerificationStatus(response)) return

    biodata.value.email = normalizedEmail.value
    savePendingEmail(normalizedEmail.value)
    verificationExpiresAt.value = response.expiresAt || new Date(Date.now() + 10 * 60 * 1000).toISOString()
    viewState.value = 'sent'
    startPolling()
  } catch {
    setFormError('Tautan verifikasi belum bisa dikirim. Silakan periksa email dan coba lagi.')
  } finally {
    isSubmitting.value = false
  }
}

const continueToForm = () => {
  router.push(redirectTarget.value)
}

const changeVerificationEmail = () => {
  stopPolling()
  clearPendingEmail()
  verificationExpiresAt.value = ''
  email.value = ''
  biodata.value.email = ''
  formError.value = ''
  viewState.value = 'idle'

  nextTick(() => {
    document.getElementById('ppdb-verification-email')?.focus()
  })
}

const simulateVerifiedEmail = () => {
  activateVerifiedState({
    success: true,
    status: 'verified',
    isVerified: true
  })
}

const simulateExpiredToken = () => {
  viewState.value = 'expired'
  formError.value = ''
}

const simulateFailedVerification = () => {
  viewState.value = 'failed'
  formError.value = ''
}

onMounted(async () => {
  const reverify = Array.isArray(route.query.reverify) ? route.query.reverify[0] : route.query.reverify

  if (!hasCompletedRegistration() && reverify !== '1') {
    const activeSession = await getEmailVerificationSession()
    if (activeSession.success && activeSession.status === 'verified' && !activeSession.isRegistered) {
      if (activeSession.email) biodata.value.email = sanitizeEmail(activeSession.email)
      await router.replace(redirectTarget.value)
      return
    }
  }

  const queryEmail = Array.isArray(route.query.email) ? route.query.email[0] : route.query.email
  email.value = sanitizeEmail(queryEmail || getPendingEmail() || biodata.value.email)
  const statusQuery = Array.isArray(route.query.status) ? route.query.status[0] : route.query.status

  if (statusQuery === 'expired' || statusQuery === 'token_expired') {
    viewState.value = 'expired'
    return
  }

  if (statusQuery === 'rate_limited' || statusQuery === 'too_many_requests') {
    setFormError(rateLimitedMessage)
    return
  }

  if (statusQuery === 'failed') {
    viewState.value = 'failed'
    return
  }

  if (email.value) {
    viewState.value = 'sent'
    verificationExpiresAt.value = new Date(Date.now() + 10 * 60 * 1000).toISOString()
    startPolling()
  }
})

onBeforeUnmount(stopPolling)
</script>

<template>
  <div class="min-h-[calc(100vh-116px)] bg-white pb-28 pt-[68px] md:min-h-[calc(100vh-132px)] md:py-14">
    <div class="public-navbar-container flex min-h-[calc(100vh-200px)] items-start justify-center md:min-h-[calc(100vh-244px)] md:items-center">
      <section class="w-full max-w-xl">

        <!-- ── STATE: IDLE ── -->
        <div v-if="viewState === 'idle'" class="rounded-[2rem] bg-bg-base px-6 py-8 md:px-10 md:py-10">
          <div class="mb-7 text-center">
            <h1 class="mb-3 font-heading text-2xl font-semibold leading-tight text-text-primary md:text-3xl">
              Masukkan Email Aktif Anda
            </h1>
            <p class="mx-auto max-w-md text-base leading-6 text-text-secondary md:text-base md:leading-relaxed">
              Kami akan mengirimkan tautan verifikasi sebelum Anda melanjutkan ke formulir PPDB.
            </p>
          </div>

          <form class="flex flex-col gap-5" @submit.prevent="requestVerificationEmail">
            <AppInput
              v-model="email"
              id="ppdb-verification-email"
              name="email"
              label="Email aktif untuk verifikasi"
              size="comfortable"
              placeholder="nama@email.com"
              required
              type="email"
              inputmode="email"
              autocomplete="email"
              autocapitalize="none"
              spellcheck="false"
              :invalid="hasEmailError"
              :error="hasEmailError ? formError : ''"
              described-by="ppdb-verification-error"
              :sanitizer="sanitizeEmail"
            />

            <p
              v-if="formError"
              id="ppdb-verification-error"
              role="alert"
              aria-live="assertive"
              class="sr-only"
            >
              {{ formError }}
            </p>

            <div class="hidden gap-3 pt-1 sm:flex sm:justify-between">
              <AppButton variant="secondary" type="button" class="sm:w-auto" @click="router.push('/ppdb')">
                Kembali
              </AppButton>
              <AppButton type="submit" variant="primary" class="sm:w-auto" :disabled="isSubmitting" :loading="isSubmitting" :aria-busy="isSubmitting ? 'true' : undefined">
                Kirim Tautan Verifikasi
              </AppButton>
            </div>

            <div class="fixed inset-x-0 bottom-12 z-50 border-t border-border bg-white/95 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur sm:hidden">
              <AppButton
                type="submit"
                variant="primary"
                class="mx-auto flex w-full max-w-xl"
                :disabled="isSubmitting"
                :loading="isSubmitting"
                :aria-busy="isSubmitting ? 'true' : undefined"
              >
                Kirim Tautan Verifikasi
              </AppButton>
            </div>
          </form>
        </div>

        <!-- ── STATE: SENT ── -->
        <div v-else-if="viewState === 'sent'" class="rounded-[2rem] bg-bg-base px-6 py-8 md:px-10 md:py-10">

          <!-- Header -->
          <div class="mb-6">
            <h1 class="font-heading text-xl font-semibold leading-snug text-text-primary md:text-2xl">
              Tautan verifikasi telah kami kirim ke {{ normalizedEmail }}
            </h1>
            <p class="mt-2 text-sm leading-relaxed text-text-secondary">
              Tautan verifikasi berlaku selama 10 menit. Halaman ini akan melanjutkan otomatis setelah email berhasil diverifikasi.
            </p>
          </div>

          <!-- Divider -->
          <div class="mb-5 h-px bg-border" />

          <!-- Steps -->
          <ol class="mb-5 flex flex-col gap-3">
            <li class="flex items-start gap-3">
              <span class="shrink-0 text-sm font-semibold text-text-primary">1.</span>
              <p class="text-sm leading-relaxed text-text-secondary">
                Buka inbox email Anda dan cari pesan dari <span class="font-medium text-text-primary">MDS Cendekia</span>.
              </p>
            </li>
            <li class="flex items-start gap-3">
              <span class="shrink-0 text-sm font-semibold text-text-primary">2.</span>
              <p class="text-sm leading-relaxed text-text-secondary">
                Klik tombol verifikasi di dalam email tersebut. Anda tidak perlu menutup halaman ini.
              </p>
            </li>
            <li class="flex items-start gap-3">
              <span class="shrink-0 text-sm font-semibold text-text-primary">3.</span>
              <p class="text-sm leading-relaxed text-text-secondary">
                {{ spamFolderMessage }}
              </p>
            </li>
          </ol>

          <div class="mb-5 border-t border-border pt-5">
            <p class="mb-3 text-sm leading-relaxed text-text-secondary">
              Alamat email salah atau ingin menggunakan email lain?
            </p>
            <AppButton variant="secondary" class="w-full sm:w-auto" @click="changeVerificationEmail">
              Ganti Email
            </AppButton>
          </div>

          <!-- Dummy FE panel -->
          <div v-if="isMockVerificationEnabled" class="rounded-xl border border-dashed border-border bg-white p-4">
            <p class="mb-3 text-xs font-semibold uppercase tracking-wide text-text-secondary">
              Mode Dummy FE
            </p>
            <div class="flex flex-col gap-2 sm:flex-row">
              <AppButton variant="primary" class="w-full sm:w-auto" @click="simulateVerifiedEmail">
                Simulasi Berhasil
              </AppButton>
              <AppButton variant="ghost" class="w-full sm:w-auto" @click="simulateExpiredToken">
                Simulasi Expired
              </AppButton>
              <AppButton variant="ghost" class="w-full sm:w-auto" @click="simulateFailedVerification">
                Simulasi Gagal
              </AppButton>
            </div>
          </div>
        </div>

        <!-- ── STATE: SUCCESS ── -->
        <div v-else-if="viewState === 'success'" class="rounded-[2rem] bg-bg-base px-6 py-8 text-center md:px-10 md:py-10">
          <h1 class="mb-3 font-heading text-2xl font-semibold leading-tight text-text-primary md:text-3xl">
            Email Anda berhasil diverifikasi.
          </h1>
          <p class="mx-auto mb-7 max-w-md text-sm leading-6 text-text-secondary md:text-base md:leading-relaxed">
            Anda sekarang dapat melanjutkan pengisian formulir pendaftaran. Pastikan seluruh data yang diisi sesuai dengan dokumen resmi.
          </p>
          <div class="hidden sm:block">
            <AppButton variant="primary" class="sm:w-auto" @click="continueToForm">
              Lanjut ke Formulir Pendaftaran
            </AppButton>
          </div>
          <div class="fixed inset-x-0 bottom-12 z-50 border-t border-border bg-white/95 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur sm:hidden">
            <AppButton variant="primary" class="mx-auto flex w-full max-w-xl" @click="continueToForm">
              Lanjut ke Formulir Pendaftaran
            </AppButton>
          </div>
        </div>

        <!-- ── STATE: EXPIRED ── -->
        <div v-else-if="viewState === 'expired'" class="rounded-[2rem] bg-bg-base px-6 py-8 text-center md:px-10 md:py-10">
          <h1 class="mb-3 font-heading text-2xl font-semibold leading-tight text-text-primary md:text-3xl">
            Tautan verifikasi sudah kedaluwarsa.
          </h1>
          <p class="mx-auto mb-6 max-w-md text-sm leading-6 text-text-secondary md:text-base md:leading-relaxed">
            Demi keamanan, tautan verifikasi hanya berlaku selama 10 menit. Silakan kirim ulang tautan menggunakan email yang sama.
          </p>
          <p
            v-if="formError"
            ref="errorAlert"
            role="alert"
            aria-live="assertive"
            tabindex="-1"
            class="mx-auto mb-5 max-w-md rounded-xl border border-error/20 bg-status-rejected-bg px-4 py-3 text-sm leading-6 text-error outline-none focus:ring-2 focus:ring-error/20"
          >
            {{ formError }}
          </p>
          <div class="hidden sm:block">
            <AppButton variant="primary" class="sm:w-auto" :disabled="!canRequestVerification" :loading="isSubmitting" :aria-busy="isSubmitting ? 'true' : undefined" @click="requestVerificationEmail">
              Kirim Ulang Tautan Verifikasi
            </AppButton>
          </div>
          <div class="fixed inset-x-0 bottom-12 z-50 border-t border-border bg-white/95 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur sm:hidden">
            <AppButton
              variant="primary"
              class="mx-auto flex w-full max-w-xl"
              :disabled="isSubmitting"
              :loading="isSubmitting"
              :aria-busy="isSubmitting ? 'true' : undefined"
              @click="requestVerificationEmail"
            >
              Kirim Ulang Tautan Verifikasi
            </AppButton>
          </div>
        </div>

        <!-- ── STATE: FAILED ── -->
        <div v-else class="rounded-[2rem] bg-bg-base px-6 py-8 text-center md:px-10 md:py-10">
          <h1 class="mb-3 font-heading text-2xl font-semibold leading-tight text-text-primary md:text-3xl">
            Verifikasi email tidak berhasil.
          </h1>
          <p class="mx-auto mb-7 max-w-md text-sm leading-6 text-text-secondary md:text-base md:leading-relaxed">
            Tautan yang Anda buka tidak valid atau sudah pernah digunakan. Silakan kembali dan minta tautan verifikasi yang baru.
          </p>
          <div class="hidden sm:block">
            <AppButton variant="primary" class="sm:w-auto" @click="viewState = 'idle'">
              Kembali ke Verifikasi Email
            </AppButton>
          </div>
          <div class="fixed inset-x-0 bottom-12 z-50 border-t border-border bg-white/95 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur sm:hidden">
            <AppButton variant="primary" class="mx-auto flex w-full max-w-xl" @click="viewState = 'idle'">
              Kembali ke Verifikasi Email
            </AppButton>
          </div>
        </div>

      </section>
    </div>
  </div>
</template>

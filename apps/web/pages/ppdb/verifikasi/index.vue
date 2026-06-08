<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import { sanitizeEmail } from '~/composables/usePpdbFormSanitizers'
import type { EmailVerificationResult } from '~/services/usePpdbEmailVerificationService'
import { usePpdbEmailVerificationService } from '~/services/usePpdbEmailVerificationService'

useHead({ title: 'Verifikasi Email | PPDB MDS Cendekia' })

definePageMeta({ layout: 'ppdb-form' })

type VerificationViewState = 'idle' | 'sent' | 'success' | 'expired' | 'failed'

const router = useRouter()
const route = useRoute()
const { getVerificationSession, saveTemporaryEmailVerification } = usePpdbVerificationGate()
const { biodata } = usePpdbRegistrationForm()
const { isMockVerificationEnabled, requestEmailVerification } = usePpdbEmailVerificationService()

const email = ref('')
const viewState = ref<VerificationViewState>('idle')
const isSubmitting = ref(false)
const formError = ref('')

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

  saveTemporaryEmailVerification({
    email: normalizedEmail.value,
    expiresAt: response?.sessionExpiresAt
  })

  biodata.value.email = normalizedEmail.value
  viewState.value = 'success'
  formError.value = ''
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
      if (response.status === 'rate_limited') {
        setFormError(rateLimitedMessage)
        return
      }

      setFormError('Tautan verifikasi belum bisa dikirim. Periksa kembali alamat email Anda, lalu coba lagi.')
      return
    }

    biodata.value.email = normalizedEmail.value
    viewState.value = 'sent'
  } catch {
    setFormError('Tautan verifikasi belum bisa dikirim. Silakan periksa email dan coba lagi.')
  } finally {
    isSubmitting.value = false
  }
}

const continueToForm = () => {
  router.push(redirectTarget.value)
}

const simulateVerifiedEmail = () => {
  activateVerifiedState({
    success: true,
    status: 'verified',
    token: 'mock-email-verification-token'
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

onMounted(() => {
  const activeVerification = getVerificationSession()
  if (activeVerification) {
    biodata.value.email = activeVerification.email
    router.replace(redirectTarget.value)
    return
  }

  const queryEmail = Array.isArray(route.query.email) ? route.query.email[0] : route.query.email
  email.value = sanitizeEmail(queryEmail || biodata.value.email)

  const verifiedQuery = Array.isArray(route.query.verified) ? route.query.verified[0] : route.query.verified
  const statusQuery = Array.isArray(route.query.status) ? route.query.status[0] : route.query.status

  if ((verifiedQuery === '1' || statusQuery === 'success' || statusQuery === 'verified') && isEmailValid.value) {
    activateVerifiedState()
    return
  }

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
  }
})
</script>

<template>
  <div class="min-h-[calc(100vh-116px)] bg-white pb-28 pt-10 md:min-h-[calc(100vh-132px)] md:py-14">
    <button
      v-if="viewState === 'idle'"
      type="button"
      class="fixed left-4 top-[76px] z-40 inline-flex min-h-11 items-center gap-2 rounded-full bg-white/90 px-3 text-sm font-medium text-text-primary shadow-sm backdrop-blur transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300 sm:hidden"
      @click="router.push('/ppdb')"
    >
      <ArrowLeft class="h-4 w-4" />
      Kembali
    </button>

    <div class="public-navbar-container flex min-h-[calc(100vh-196px)] items-center justify-center md:min-h-[calc(100vh-244px)]">
      <section class="w-full max-w-xl">

        <!-- ── STATE: IDLE ── -->
        <div v-if="viewState === 'idle'" class="rounded-[2rem] bg-bg-base px-6 py-8 md:px-10 md:py-10">
          <div class="mb-7 text-center">
            <h1 class="mb-3 font-heading text-2xl font-semibold leading-tight text-text-primary md:text-3xl">
              Verifikasi Email Pendaftaran
            </h1>
            <p class="mx-auto max-w-md text-sm leading-6 text-text-secondary md:text-base md:leading-relaxed">
              Masukkan email aktif Anda. Kami akan mengirimkan tautan verifikasi sebelum Anda melanjutkan ke formulir PPDB.
            </p>
          </div>

          <form class="flex flex-col gap-5" @submit.prevent="requestVerificationEmail">
            <AppInput
              v-model="email"
              id="ppdb-verification-email"
              name="email"
              label="Email aktif untuk verifikasi"
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
              Tautan verifikasi berlaku selama 10 menit sejak email dikirim.
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
                Klik tautan verifikasi di dalam email tersebut untuk mengkonfirmasi alamat email Anda.
              </p>
            </li>
            <li class="flex items-start gap-3">
              <span class="shrink-0 text-sm font-semibold text-text-primary">3.</span>
              <p class="text-sm leading-relaxed text-text-secondary">
                {{ spamFolderMessage }}
              </p>
            </li>
          </ol>

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

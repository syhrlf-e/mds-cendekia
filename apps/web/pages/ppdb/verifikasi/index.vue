<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { ArrowRight } from 'lucide-vue-next'
import { sanitizeEmail } from '~/composables/usePpdbFormSanitizers'
import type { EmailVerificationResult } from '~/services/usePpdbEmailVerificationService'
import { usePpdbEmailVerificationService } from '~/services/usePpdbEmailVerificationService'

useHead({ title: 'Verifikasi Email | PPDB MDS Cendekia' })

definePageMeta({ layout: 'ppdb-form' })

type VerificationViewState = 'idle' | 'sent' | 'success' | 'expired' | 'failed'

const router = useRouter()
const route = useRoute()
const { saveTemporaryEmailVerification } = usePpdbVerificationGate()
const { biodata } = usePpdbRegistrationForm()
const { isMockVerificationEnabled, requestEmailVerification } = usePpdbEmailVerificationService()

const email = ref('')
const viewState = ref<VerificationViewState>('idle')
const isSubmitting = ref(false)
const formError = ref('')
const errorAlert = ref<HTMLElement | null>(null)

const normalizedEmail = computed(() => sanitizeEmail(email.value))
const isEmailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail.value))
const canRequestVerification = computed(() => isEmailValid.value && !isSubmitting.value)
const hasEmailError = computed(() => Boolean(formError.value && viewState.value === 'idle'))

const emailSentMessage = 'Link verifikasi sudah kami kirim ke email kamu.'
const spamFolderMessage = 'Belum terlihat? Cek folder spam, promosi, atau tab pembaruan di email kamu.'
const expiredMessage = 'Link verifikasi sudah kedaluwarsa.'
const failedMessage = 'Verifikasi email belum berhasil.'
const rateLimitedMessage = 'Permintaan verifikasi terlalu sering. Tunggu beberapa saat, lalu coba lagi.'

const redirectTarget = computed(() => {
  const redirect = Array.isArray(route.query.redirect) ? route.query.redirect[0] : route.query.redirect
  return redirect && redirect.startsWith('/ppdb/daftar') ? redirect : '/ppdb/daftar'
})

const setFormError = async (message: string) => {
  formError.value = message
  await nextTick()
  errorAlert.value?.focus()
}

const activateVerifiedState = (response?: EmailVerificationResult | null) => {
  if (!normalizedEmail.value) return

  saveTemporaryEmailVerification({
    email: normalizedEmail.value,
    expiresAt: response?.sessionExpiresAt || response?.expiresAt,
    token: response?.token
  })

  biodata.value.email = normalizedEmail.value
  viewState.value = 'success'
  formError.value = ''
}

const requestVerificationEmail = async () => {
  if (!canRequestVerification.value) return

  formError.value = ''
  isSubmitting.value = true

  try {
    const response = await requestEmailVerification(normalizedEmail.value)

    if (!response.success) {
      if (response.status === 'rate_limited') {
        await setFormError(rateLimitedMessage)
        return
      }

      await setFormError('Link verifikasi belum bisa dikirim. Periksa kembali email kamu, lalu coba lagi.')
      return
    }

    biodata.value.email = normalizedEmail.value
    viewState.value = 'sent'
  } catch {
    await setFormError('Link verifikasi belum bisa dikirim. Silakan periksa email dan coba lagi.')
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
  <div class="min-h-[calc(100vh-116px)] bg-white py-10 md:min-h-[calc(100vh-132px)] md:py-14">
    <div class="public-navbar-container flex min-h-[calc(100vh-196px)] items-center justify-center md:min-h-[calc(100vh-244px)]">
      <section class="w-full max-w-xl">
        <div v-if="viewState === 'idle'" class="rounded-[2rem] bg-bg-base px-6 py-8 md:px-10 md:py-10">
          <div class="mb-7 text-center">
            <h1 class="mb-3 font-heading text-2xl font-semibold leading-tight text-text-primary md:text-3xl">
              Verifikasi Email Pendaftaran
            </h1>
            <p class="mx-auto max-w-md text-sm leading-6 text-text-secondary md:text-base md:leading-relaxed">
              Masukkan email aktif kamu. Kami akan mengirimkan link verifikasi sebelum kamu melanjutkan ke formulir PPDB.
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
              described-by="ppdb-verification-error"
              :sanitizer="sanitizeEmail"
            />

            <p
              v-if="formError"
              ref="errorAlert"
              id="ppdb-verification-error"
              role="alert"
              aria-live="assertive"
              tabindex="-1"
              class="rounded-xl border border-error/20 bg-status-rejected-bg px-4 py-3 text-sm leading-6 text-error outline-none focus:ring-2 focus:ring-error/20"
            >
              {{ formError }}
            </p>

            <div class="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-between">
              <AppButton
                variant="secondary"
                type="button"
                class="w-full sm:w-auto"
                @click="router.push('/ppdb')"
              >
                Kembali
              </AppButton>
              <AppButton
                type="submit"
                variant="primary"
                class="w-full sm:w-auto"
                :disabled="!canRequestVerification"
                :loading="isSubmitting"
                :aria-busy="isSubmitting ? 'true' : undefined"
              >
                Verifikasi Email
              </AppButton>
            </div>
          </form>
        </div>

        <div v-else-if="viewState === 'sent'" class="mx-auto max-w-lg text-center">
          <h1 class="mb-3 font-heading text-2xl font-semibold leading-tight text-text-primary md:text-3xl">
            {{ emailSentMessage }}
          </h1>
          <p class="mx-auto max-w-md text-sm leading-6 text-text-secondary md:text-base md:leading-relaxed">
            Buka email dari MDS Cendekia, lalu klik tombol verifikasi yang tersedia.
          </p>
          <p class="mx-auto mt-3 max-w-md text-sm leading-6 text-text-secondary md:text-base md:leading-relaxed">
            {{ spamFolderMessage }}
          </p>
          <p class="mt-5 rounded-2xl bg-bg-base px-4 py-3 text-sm font-medium text-text-primary">
            {{ normalizedEmail }}
          </p>
          <div v-if="isMockVerificationEnabled" class="mt-6 rounded-2xl bg-bg-base p-4 text-left">
            <p class="mb-3 text-xs font-semibold uppercase tracking-wide text-text-secondary">
              Mode dummy FE
            </p>
            <div class="flex flex-col gap-2 sm:flex-row">
              <AppButton variant="primary" class="w-full sm:w-auto" @click="simulateVerifiedEmail">
                Simulasi berhasil
              </AppButton>
              <AppButton variant="ghost" class="w-full sm:w-auto" @click="simulateExpiredToken">
                Simulasi expired
              </AppButton>
              <AppButton variant="ghost" class="w-full sm:w-auto" @click="simulateFailedVerification">
                Simulasi gagal
              </AppButton>
            </div>
          </div>
        </div>

        <div v-else-if="viewState === 'success'" class="mx-auto max-w-lg text-center">
          <h1 class="mb-3 font-heading text-2xl font-semibold leading-tight text-text-primary md:text-3xl">
            Terima kasih, email kamu sudah diverifikasi.
          </h1>
          <p class="mx-auto mb-7 max-w-md text-sm leading-6 text-text-secondary md:text-base md:leading-relaxed">
            Kamu sekarang bisa melanjutkan pengisian formulir pendaftaran. Pastikan data yang diisi sesuai dengan dokumen resmi.
          </p>
          <AppButton variant="primary" class="w-full sm:w-auto" @click="continueToForm">
            Lanjut mengisi formulir pendaftaran
            <ArrowRight class="ml-2 h-4 w-4" />
          </AppButton>
        </div>

        <div v-else-if="viewState === 'expired'" class="mx-auto max-w-lg text-center">
          <h1 class="mb-3 font-heading text-2xl font-semibold leading-tight text-text-primary md:text-3xl">
            {{ expiredMessage }}
          </h1>
          <p class="mx-auto mb-7 max-w-md text-sm leading-6 text-text-secondary md:text-base md:leading-relaxed">
            Untuk keamanan, link verifikasi hanya berlaku sementara. Silakan kirim ulang link verifikasi memakai email yang sama.
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
          <AppButton variant="primary" class="w-full sm:w-auto" :disabled="!canRequestVerification" :loading="isSubmitting" :aria-busy="isSubmitting ? 'true' : undefined" @click="requestVerificationEmail">
            Kirim ulang link verifikasi
          </AppButton>
        </div>

        <div v-else class="mx-auto max-w-lg text-center">
          <h1 class="mb-3 font-heading text-2xl font-semibold leading-tight text-text-primary md:text-3xl">
            {{ failedMessage }}
          </h1>
          <p class="mx-auto mb-7 max-w-md text-sm leading-6 text-text-secondary md:text-base md:leading-relaxed">
            Link yang kamu buka tidak valid atau sudah digunakan. Silakan kembali ke halaman verifikasi dan minta link baru.
          </p>
          <AppButton variant="primary" class="w-full sm:w-auto" @click="viewState = 'idle'">
            Kembali ke verifikasi email
          </AppButton>
        </div>
      </section>
    </div>
  </div>
</template>

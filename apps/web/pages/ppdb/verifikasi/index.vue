<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { Check, MailCheck } from 'lucide-vue-next'
import { sanitizeDigits, sanitizeEmail } from '~/composables/usePpdbFormSanitizers'

useHead({ title: 'Verifikasi Pendaftaran | PPDB MDS Cendekia' })

definePageMeta({ layout: 'ppdb-form' })

type VerificationResponse = {
  success?: boolean
  status?: boolean
  message?: string
  expires_in?: number
  data?: {
    expires_in?: number
    expires_at?: string
    session_expires_at?: string
    token?: string
  }
}

const config = useRuntimeConfig()
const router = useRouter()
const route = useRoute()
const { saveVerificationSession } = usePpdbVerificationGate()
const { biodata } = usePpdbRegistrationForm()

const nisn = ref('')
const email = ref('')
const code = ref('')
const hasRequestedCode = ref(false)
const isRequestingCode = ref(false)
const isVerifyingCode = ref(false)
const isInfoModalOpen = ref(false)
const formError = ref('')
const cooldownSeconds = ref(0)
let cooldownTimer: ReturnType<typeof window.setInterval> | null = null

const apiBaseUrl = computed(() => String(config.public.apiBaseUrl || 'https://api.oirul.com').replace(/\/$/, ''))
const requestCodeEndpoint = computed(() => `${apiBaseUrl.value}/register/verification/request`)
const verifyCodeEndpoint = computed(() => `${apiBaseUrl.value}/register/verification/verify`)

const normalizedNisn = computed(() => sanitizeDigits(nisn.value, 10))
const normalizedEmail = computed(() => sanitizeEmail(email.value))
const normalizedCode = computed(() => sanitizeDigits(code.value, 8))
const isIdentityValid = computed(() => normalizedNisn.value.length === 10 && /.+@.+\..+/.test(normalizedEmail.value))
const isCodeValid = computed(() => normalizedCode.value.length >= 4)
const canRequestCode = computed(() => isIdentityValid.value && !isRequestingCode.value && cooldownSeconds.value <= 0)
const canVerifyCode = computed(() => hasRequestedCode.value && isCodeValid.value && !isVerifyingCode.value)

const requestButtonLabel = computed(() => {
  if (isRequestingCode.value) return 'Mengirim Kode'
  if (cooldownSeconds.value > 0) return `Kirim Ulang ${cooldownSeconds.value}s`
  return hasRequestedCode.value ? 'Kirim Ulang Kode' : 'Dapatkan Kode'
})

const readErrorMessage = (error: any, fallback: string) => {
  return error?.data?.message ||
    error?.response?._data?.message ||
    error?.message ||
    fallback
}

const isSuccessResponse = (response?: VerificationResponse | null) => {
  return response?.success === true || response?.status === true
}

const startCooldown = (seconds = 60) => {
  cooldownSeconds.value = seconds
  if (cooldownTimer) window.clearInterval(cooldownTimer)

  cooldownTimer = window.setInterval(() => {
    cooldownSeconds.value = Math.max(0, cooldownSeconds.value - 1)
    if (cooldownSeconds.value <= 0 && cooldownTimer) {
      window.clearInterval(cooldownTimer)
      cooldownTimer = null
    }
  }, 1000)
}

const requestCode = async () => {
  if (!canRequestCode.value) return

  formError.value = ''
  isRequestingCode.value = true

  try {
    const response = await $fetch<VerificationResponse>(requestCodeEndpoint.value, {
      method: 'POST',
      credentials: 'include',
      body: {
        nisn: normalizedNisn.value,
        email: normalizedEmail.value
      }
    })

    if (!isSuccessResponse(response)) {
      throw new Error(response?.message || 'Kode verifikasi belum bisa dikirim.')
    }

    hasRequestedCode.value = true
    code.value = ''
    isInfoModalOpen.value = true
    startCooldown(response.data?.expires_in || response.expires_in || 60)
  } catch (error) {
    formError.value = readErrorMessage(error, 'Kode verifikasi belum bisa dikirim. Silakan coba lagi.')
  } finally {
    isRequestingCode.value = false
  }
}

const verifyCode = async () => {
  if (!canVerifyCode.value) return

  formError.value = ''
  isVerifyingCode.value = true

  try {
    const response = await $fetch<VerificationResponse>(verifyCodeEndpoint.value, {
      method: 'POST',
      credentials: 'include',
      body: {
        nisn: normalizedNisn.value,
        email: normalizedEmail.value,
        code: normalizedCode.value
      }
    })

    if (!isSuccessResponse(response)) {
      throw new Error(response?.message || 'Kode verifikasi belum sesuai.')
    }

    saveVerificationSession({
      nisn: normalizedNisn.value,
      email: normalizedEmail.value,
      verifiedAt: new Date().toISOString(),
      expiresAt: response.data?.session_expires_at || response.data?.expires_at,
      token: response.data?.token
    })

    biodata.value.nisn = normalizedNisn.value
    biodata.value.email = normalizedEmail.value

    const redirect = Array.isArray(route.query.redirect) ? route.query.redirect[0] : route.query.redirect
    router.push(redirect && redirect.startsWith('/ppdb/daftar') ? redirect : '/ppdb/daftar')
  } catch (error) {
    formError.value = readErrorMessage(error, 'Kode verifikasi belum sesuai atau sudah kedaluwarsa.')
  } finally {
    isVerifyingCode.value = false
  }
}

onMounted(() => {
  nisn.value = sanitizeDigits(biodata.value.nisn, 10)
  email.value = sanitizeEmail(biodata.value.email)
})

onUnmounted(() => {
  if (cooldownTimer) window.clearInterval(cooldownTimer)
})
</script>

<template>
  <div class="h-[calc(100vh-116px)] overflow-hidden bg-bg-base py-6 md:h-[calc(100vh-132px)] md:py-8">
    <div class="public-navbar-container h-full">
      <div class="mx-auto flex h-full w-full max-w-160 flex-col justify-center">
        <div class="mb-7 text-center md:mb-8">
          <h1 class="mb-2.5 font-heading text-2xl font-semibold leading-tight text-text-primary md:mb-3 md:text-3xl">
            Verifikasi Sebelum Mendaftar
          </h1>
          <p class="mx-auto max-w-sm text-sm leading-6 text-text-secondary md:max-w-lg md:text-base md:leading-relaxed">
            Masukkan NISN dan email untuk mendapatkan kode verifikasi sebelum mengisi formulir.
          </p>
        </div>

        <form
          class="flex flex-col gap-4 md:gap-5"
          @submit.prevent="hasRequestedCode ? verifyCode() : requestCode()"
        >
          <div class="grid gap-4 sm:grid-cols-2 md:gap-5">
            <AppInput
              v-model="nisn"
              label="NISN"
              placeholder="10 digit NISN"
              required
              inputmode="numeric"
              :maxlength="10"
              :disabled="hasRequestedCode"
              :sanitizer="(value) => sanitizeDigits(value, 10)"
            />
            <AppInput
              v-model="email"
              label="Email"
              placeholder="nama@email.com"
              required
              type="email"
              inputmode="email"
              autocomplete="email"
              :disabled="hasRequestedCode"
              :sanitizer="sanitizeEmail"
            />

            <Transition name="code-field">
              <AppInput
                v-if="hasRequestedCode"
                v-model="code"
                label="Kode Verifikasi"
                placeholder="Masukkan kode dari email"
                required
                inputmode="numeric"
                :maxlength="8"
                :sanitizer="(value) => sanitizeDigits(value, 8)"
                class="sm:col-span-2"
              />
            </Transition>
          </div>

          <p v-if="formError" class="rounded-xl border border-error/20 bg-status-rejected-bg px-4 py-3 text-sm leading-6 text-error">
            {{ formError }}
          </p>

          <div class="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-between md:pt-0">
              <AppButton
                variant="secondary"
                type="button"
                class="w-full sm:w-auto"
                @click="router.push('/ppdb')"
              >
                Kembali
              </AppButton>

              <div class="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <AppButton
                  type="button"
                  variant="ghost"
                  class="w-full sm:w-auto"
                  :disabled="!isIdentityValid || isRequestingCode || cooldownSeconds > 0"
                  :loading="isRequestingCode"
                  @click="requestCode"
                >
                  {{ requestButtonLabel }}
                </AppButton>
                <AppButton
                  v-if="hasRequestedCode"
                  type="submit"
                  variant="primary"
                  class="w-full sm:w-auto"
                  :disabled="!canVerifyCode"
                  :loading="isVerifyingCode"
                >
                  Verifikasi
                </AppButton>
              </div>
          </div>
        </form>
      </div>
    </div>
  </div>

  <AppModal v-model="isInfoModalOpen" title="Kode Verifikasi Dikirim" width="max-w-md">
    <div class="flex items-start gap-4">
      <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-status-approved-bg text-success">
        <MailCheck class="h-5 w-5" />
      </div>
      <div>
        <p class="text-sm leading-6 text-text-primary">
          Silakan cek email kamu dan masukkan kode verifikasi untuk melanjutkan pendaftaran.
        </p>
        <p class="mt-2 text-xs leading-5 text-text-secondary">
          Demi keamanan, NISN dan email dikunci setelah kode dikirim.
        </p>
      </div>
    </div>

    <template #footer>
      <AppButton variant="primary" @click="isInfoModalOpen = false">
        <Check class="mr-2 h-4 w-4" />
        Mengerti
      </AppButton>
    </template>
  </AppModal>
</template>

<style scoped>
.code-field-enter-active,
.code-field-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.code-field-enter-from,
.code-field-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>

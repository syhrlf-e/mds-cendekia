<script setup lang="ts">
import { AlertTriangle, Eye, EyeOff } from 'lucide-vue-next'
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminAuthService } from '~/services/useAdminAuthService'

definePageMeta({
  layout: false
})

useHead({ title: 'MDS Panel | MDS Cendekia' })

const router = useRouter()
const { login } = useAdminAuthService()
const { isAdminSessionInvalidated } = useAdminSession()
const { markAdminSessionVerified, verifyAdminSession } = useAdminSessionVerifier()
const { prefetchDashboardSummary } = useAdminDataCache()

const username = ref('')
const password = ref('')
const usernameInput = ref<{ focus: () => void } | null>(null)
const passwordInput = ref<HTMLInputElement | null>(null)
const showPassword = ref(false)
const isCheckingSession = ref(true)
const isSubmitting = ref(false)
const errorMsg = ref('')
const lockoutSeconds = ref(0)

let timer: ReturnType<typeof setInterval> | null = null

const isLockedOut = computed(() => lockoutSeconds.value > 0)
const canSubmit = computed(() => username.value.trim() && password.value && !isSubmitting.value && !isLockedOut.value)
const hasLoginError = computed(() => Boolean(errorMsg.value))

const getErrorStatus = (error: any) => {
  return Number(error?.response?.status || error?.statusCode || error?.status || 0)
}

const parseRetryAfter = (value: unknown) => {
  const rawValue = String(value || '').trim()
  if (!rawValue) return 0

  const seconds = Number(rawValue)
  if (Number.isFinite(seconds) && seconds > 0) return Math.ceil(seconds)

  const retryAt = Date.parse(rawValue)
  if (Number.isNaN(retryAt)) return 0
  return Math.max(0, Math.ceil((retryAt - Date.now()) / 1000))
}

const getLockoutSecondsFromError = (error: any) => {
  const data = error?.data || error?.response?._data
  const retryAfter = parseRetryAfter(error?.response?.headers?.get?.('retry-after'))
  const candidates = [
    data?.lockoutSeconds,
    data?.retryAfter,
    data?.retryAfterSeconds,
    data?.remainingSeconds,
    retryAfter
  ]

  return candidates.map(Number).find(value => Number.isFinite(value) && value > 0) || 60
}

const startLockout = (seconds: number) => {
  if (timer) clearInterval(timer)
  lockoutSeconds.value = seconds
  errorMsg.value = ''

  timer = setInterval(() => {
    lockoutSeconds.value -= 1

    if (lockoutSeconds.value <= 0) {
      if (timer) clearInterval(timer)
      timer = null
      lockoutSeconds.value = 0
    }
  }, 1000)
}

const focusLoginField = async (target: 'username' | 'password') => {
  await nextTick()

  if (target === 'password') {
    passwordInput.value?.focus()
    return
  }

  usernameInput.value?.focus()
}

const setLoginError = async (message: string, focusTarget: 'username' | 'password' = 'password') => {
  errorMsg.value = message
  await focusLoginField(focusTarget)
}

const handleLoginError = async (error: any) => {
  const status = getErrorStatus(error)

  if (status === 429) {
    password.value = ''
    startLockout(getLockoutSecondsFromError(error))
    return
  }

  if (status === 401) {
    password.value = ''
    await setLoginError('Username atau password tidak valid.')
    return
  }

  if (status === 403) {
    password.value = ''
    await setLoginError('Akun ini tidak memiliki izin untuk mengakses panel.')
    return
  }

  if (status >= 500) {
    await setLoginError('Server sedang bermasalah. Silakan coba kembali beberapa saat lagi.')
    return
  }

  if (!status) {
    await setLoginError('Tidak dapat terhubung ke server. Periksa koneksi internet lalu coba kembali.', 'username')
    return
  }

  password.value = ''
  await setLoginError('Login belum berhasil. Silakan coba kembali.')
}

const handleLogin = async () => {
  if (isSubmitting.value || isLockedOut.value) return

  if (!username.value.trim() || !password.value) {
    await setLoginError(
      'Username dan password wajib diisi.',
      username.value.trim() ? 'password' : 'username'
    )
    return
  }

  isSubmitting.value = true
  errorMsg.value = ''

  const { data, error } = await login({
    username: username.value.trim(),
    password: password.value
  })

  if (error) {
    isSubmitting.value = false
    await handleLoginError(error)
    return
  }

  if (data?.status || data?.success) {
    markAdminSessionVerified({
      id: data.data?.id,
      username: data.data?.username || username.value.trim()
    })
    void prefetchDashboardSummary()
    await router.push('/dashboard')
    return
  }

  isSubmitting.value = false
  password.value = ''
  await setLoginError('Username atau password tidak valid.')
}

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  if (minutes > 0) return `${minutes} menit ${remainingSeconds} detik`
  return `${remainingSeconds} detik`
}

onMounted(async () => {
  if (isAdminSessionInvalidated()) {
    isCheckingSession.value = false
    await focusLoginField('username')
    return
  }

  const isAuthenticated = await verifyAdminSession({
    force: true,
    clearOnFailure: false
  })
  if (isAuthenticated) {
    await router.replace('/dashboard')
    return
  }

  isCheckingSession.value = false
  await focusLoginField('username')
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="flex min-h-dvh min-w-0 items-center justify-center bg-bg-base p-4 sm:p-8 lg:p-10">
    <section
      v-if="isCheckingSession"
      class="flex min-h-64 w-full max-w-100 items-center justify-center rounded-2xl border border-border bg-bg-surface p-6 sm:p-10"
      aria-live="polite"
      aria-label="Memeriksa sesi admin"
    >
      <AppLoadingDotWave class="text-brand" />
      <span class="sr-only">Memeriksa sesi admin</span>
    </section>

    <section v-else class="w-full max-w-100 rounded-2xl border border-border bg-bg-surface p-6 sm:p-10">
      <div v-if="isLockedOut" class="flex flex-col items-center text-center">
        <AlertTriangle class="mb-6 h-10 w-10 text-error" />
        <h1 class="mb-3 text-[17px] font-semibold leading-[1.24] tracking-[-0.2px] text-text-primary">
          Terlalu Banyak Percobaan Login
        </h1>
        <p class="text-sm leading-[1.43] tracking-[-0.15px] text-text-secondary">Coba lagi dalam</p>
        <p class="mb-8 mt-3 text-[28px] font-semibold leading-[1.2] tracking-[-0.2px] text-brand">
          {{ formatTime(lockoutSeconds) }}
        </p>
        <AppButton variant="primary" disabled class="w-full">
          Login
        </AppButton>
      </div>

      <div v-else>
        <div class="mb-8 text-center">
          <img
            src="/images/logo-mds-main.png"
            alt="Logo MDS Cendekia"
            class="mx-auto mb-5 h-16 w-16 object-contain"
          >
          <h1 class="text-[28px] font-semibold leading-[1.2] tracking-[-0.2px] text-text-primary">MDS Panel</h1>
          <p class="mt-2 text-sm leading-[1.43] tracking-[-0.15px] text-text-secondary">
            Masuk untuk mengelola halaman admin
          </p>
        </div>

        <form class="flex flex-col gap-4" @submit.prevent="handleLogin">
          <AppInput
            ref="usernameInput"
            v-model="username"
            name="username"
            label="Username"
            placeholder="Masukkan username admin"
            required
            autocomplete="username"
            autocapitalize="none"
            :spellcheck="false"
            :disabled="isSubmitting"
            :invalid="hasLoginError"
          />

          <div class="flex w-full flex-col gap-1.5">
            <label for="admin-password" class="text-sm font-medium text-text-primary">Password</label>
            <div class="relative">
              <input
                ref="passwordInput"
                id="admin-password"
                name="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Masukkan password"
                autocomplete="current-password"
                required
                :disabled="isSubmitting"
                :aria-invalid="hasLoginError || undefined"
                :aria-describedby="hasLoginError ? 'admin-login-error' : undefined"
                :class="[
                  'h-11 w-full rounded-lg border bg-bg-surface px-4 pr-12 text-[17px] leading-[1.47] tracking-[-0.2px] text-text-primary outline-none transition-colors placeholder:text-text-muted disabled:cursor-not-allowed disabled:bg-bg-parchment disabled:text-text-muted',
                  hasLoginError
                    ? 'border-error focus:border-error focus:ring-[3px] focus:ring-error/10'
                    : 'border-border focus:border-sky-500/70 focus:ring-2 focus:ring-sky-500/12'
                ]"
              >
              <button
                type="button"
                class="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-primary-50 hover:text-text-primary"
                :aria-label="showPassword ? 'Sembunyikan password' : 'Tampilkan password'"
                :disabled="isSubmitting"
                @click="showPassword = !showPassword"
              >
                <EyeOff v-if="showPassword" class="h-4 w-4" />
                <Eye v-else class="h-4 w-4" />
              </button>
            </div>
          </div>

          <p
            v-if="errorMsg"
            id="admin-login-error"
            role="alert"
            aria-live="assertive"
            class="text-xs leading-[1.4] tracking-[-0.08px] text-error"
          >
            {{ errorMsg }}
          </p>

          <AppButton
            type="submit"
            variant="primary"
            :disabled="!canSubmit"
            :loading="isSubmitting"
            class="mt-2 w-full"
          >
            Masuk
          </AppButton>
        </form>
      </div>
    </section>
  </div>
</template>

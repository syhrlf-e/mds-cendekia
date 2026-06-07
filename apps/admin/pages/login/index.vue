<script setup lang="ts">
import { AlertTriangle, Eye, EyeOff } from 'lucide-vue-next'
import { computed, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminAuthService } from '~/services/useAdminAuthService'

definePageMeta({
  layout: false
})

useHead({ title: 'MDS Panel | MDS Cendekia' })

const router = useRouter()
const { login } = useAdminAuthService()
const { activateAdminSession } = useAdminSession()
const { prefetchDashboardSummary } = useAdminDataCache()

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const isSubmitting = ref(false)
const errorMsg = ref('')
const localFailedAttempts = ref(0)
const lockoutSeconds = ref(0)

let timer: ReturnType<typeof setInterval> | null = null

const isLockedOut = computed(() => lockoutSeconds.value > 0)
const canSubmit = computed(() => username.value.trim() && password.value && !isSubmitting.value && !isLockedOut.value)
const hasLoginError = computed(() => Boolean(errorMsg.value))

const getLockoutSecondsFromError = (error: any) => {
  const data = error?.data || error?.response?._data
  const retryAfter = Number(error?.response?.headers?.get?.('retry-after'))
  const candidates = [
    data?.lockoutSeconds,
    data?.retryAfter,
    data?.retryAfterSeconds,
    data?.remainingSeconds,
    retryAfter
  ]

  return candidates.map(Number).find(value => Number.isFinite(value) && value > 0) || 0
}

const getFallbackLockout = () => {
  if (localFailedAttempts.value === 4) return 30
  if (localFailedAttempts.value === 5) return 60
  if (localFailedAttempts.value === 6) return 300
  if (localFailedAttempts.value >= 7) return 900
  return 0
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

const handleLogin = async () => {
  if (!username.value.trim() || !password.value) {
    errorMsg.value = 'Username dan password wajib diisi.'
    return
  }

  isSubmitting.value = true
  errorMsg.value = ''

  const { data, error } = await login({
    username: username.value.trim(),
    password: password.value
  })

  isSubmitting.value = false

  if (error) {
    localFailedAttempts.value += 1
    const lockout = getLockoutSecondsFromError(error) || getFallbackLockout()

    if (lockout > 0) {
      startLockout(lockout)
      return
    }

    if (!error?.response?.status && !error?.statusCode) {
      errorMsg.value = 'Login belum bisa terhubung ke server. Periksa konfigurasi CORS kredensial di backend.'
      return
    }

    errorMsg.value = error?.data?.message || error?.statusMessage || 'Username atau password salah.'
    return
  }

  if (data?.status || data?.success) {
    localFailedAttempts.value = 0
    activateAdminSession()
    const adminUsername = useState<string>('admin-auth:username', () => '')
    const adminId = useState<number | null>('admin-auth:id', () => null)
    adminUsername.value = data.data?.username || username.value.trim()
    adminId.value = data.data?.id || null
    void prefetchDashboardSummary()
    await router.push('/dashboard')
    return
  }

  errorMsg.value = data?.message || 'Login belum berhasil. Periksa kembali kredensial admin.'
}

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  if (minutes > 0) return `${minutes} menit ${remainingSeconds} detik`
  return `${remainingSeconds} detik`
}

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="flex min-h-screen min-w-5xl items-center justify-center bg-bg-base p-10">
    <section class="w-100 rounded-2xl border border-border bg-bg-surface p-10">
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
            v-model="username"
            label="Username"
            placeholder="Masukkan username admin"
            required
            autocomplete="username"
            :disabled="isSubmitting"
            :invalid="hasLoginError"
          />

          <div class="flex w-full flex-col gap-1.5">
            <label for="admin-password" class="text-sm font-medium text-text-primary">Password</label>
            <div class="relative">
              <input
                id="admin-password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Masukkan password"
                autocomplete="current-password"
                :disabled="isSubmitting"
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

          <p v-if="errorMsg" class="text-xs leading-[1.4] tracking-[-0.08px] text-error">
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

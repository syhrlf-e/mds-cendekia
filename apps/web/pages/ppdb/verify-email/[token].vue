<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { CircleAlert, CircleCheck } from 'lucide-vue-next'
import { usePpdbEmailVerificationService } from '~/services/usePpdbEmailVerificationService'

useHead({ title: 'Konfirmasi Email | PPDB MDS Cendekia' })

definePageMeta({
  layout: 'ppdb-form',
  ppdbHeaderTitle: 'Konfirmasi Email',
  ppdbBackPath: '/ppdb',
  hideMobilePpdbFooter: true
})

type CallbackState = 'loading' | 'success' | 'expired' | 'failed'

const route = useRoute()
const router = useRouter()
const { confirmEmailVerificationToken } = usePpdbEmailVerificationService()
const callbackState = ref<CallbackState>('loading')
const responseMessage = ref('')

const token = computed(() => {
  const value = Array.isArray(route.params.token) ? route.params.token[0] : route.params.token
  return String(value || '').trim()
})

const title = computed(() => {
  if (callbackState.value === 'success') return 'Email berhasil diverifikasi'
  if (callbackState.value === 'expired') return 'Tautan sudah kedaluwarsa'
  if (callbackState.value === 'failed') return 'Verifikasi email tidak berhasil'
  return 'Memverifikasi email Anda'
})

const description = computed(() => {
  if (responseMessage.value) return responseMessage.value
  if (callbackState.value === 'success') {
    return 'Kembali ke halaman pendaftaran yang masih terbuka. Halaman tersebut akan melanjutkan secara otomatis.'
  }
  if (callbackState.value === 'expired') {
    return 'Silakan kembali ke halaman verifikasi PPDB dan minta tautan verifikasi yang baru.'
  }
  if (callbackState.value === 'failed') {
    return 'Tautan tidak valid atau sudah pernah digunakan. Silakan minta tautan verifikasi yang baru.'
  }
  return 'Mohon tunggu sebentar. Jangan tutup halaman ini.'
})

onMounted(async () => {
  if (!token.value) {
    callbackState.value = 'failed'
    return
  }

  const response = await confirmEmailVerificationToken(token.value)
  responseMessage.value = response.message || ''

  if (response.status === 'verified' || response.isVerified) {
    callbackState.value = 'success'
    return
  }

  callbackState.value = response.status === 'expired' ? 'expired' : 'failed'
})
</script>

<template>
  <div class="min-h-[calc(100vh-116px)] bg-white px-4 py-16 md:min-h-[calc(100vh-132px)]">
    <section class="mx-auto flex min-h-[55vh] max-w-xl items-center justify-center">
      <div class="w-full rounded-[2rem] bg-bg-base px-6 py-10 text-center md:px-10">
        <AppLoadingDotWave
          v-if="callbackState === 'loading'"
          class="mb-6 text-brand"
        />

        <div
          v-else
          class="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full text-2xl font-semibold"
          :class="callbackState === 'success'
            ? 'bg-status-approved-bg text-status-approved-text'
            : 'bg-status-rejected-bg text-status-rejected-text'"
          aria-hidden="true"
        >
          <CircleCheck v-if="callbackState === 'success'" class="h-7 w-7" />
          <CircleAlert v-else class="h-7 w-7" />
        </div>

        <h1 class="font-heading text-2xl font-semibold text-text-primary md:text-3xl">
          {{ title }}
        </h1>
        <p class="mx-auto mt-3 max-w-md text-sm leading-6 text-text-secondary md:text-base">
          {{ description }}
        </p>

        <AppButton
          v-if="callbackState !== 'loading'"
          class="mt-7"
          :variant="callbackState === 'success' ? 'primary' : 'secondary'"
          @click="router.push('/ppdb/verifikasi')"
        >
          {{ callbackState === 'success' ? 'Kembali ke Pendaftaran' : 'Minta Tautan Baru' }}
        </AppButton>
      </div>
    </section>
  </div>
</template>

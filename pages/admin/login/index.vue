<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { AlertTriangle } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

definePageMeta({
  layout: false // Do not use any layout to take over the whole screen
})

useHead({ title: 'Login Admin | PPDB MDS Cendekia' })

const router = useRouter()
const email = ref('')
const password = ref('')
const isSubmitting = ref(false)
const errorMsg = ref('')

// Rate Limiter Mock State
const failedAttempts = ref(0)
const lockoutSeconds = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

const isLockedOut = computed(() => lockoutSeconds.value > 0)

const handleLogin = async () => {
  if (!email.value || !password.value) {
    errorMsg.value = 'Email dan Password wajib diisi.'
    return
  }
  
  isSubmitting.value = true
  errorMsg.value = ''
  
  // Mock API Call delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  isSubmitting.value = false

  // Mock checking logic: accept anything but if it's wrong, we trigger the limit
  if (email.value === 'admin@mds.sch.id' && password.value === 'admin123') {
    failedAttempts.value = 0
    const adminToken = useCookie('admin_token')
    adminToken.value = 'mock_valid_token_123'
    // As per PRD, redirect to /admin/pendaftaran after successful login
    router.push('/admin/pendaftaran') 
  } else {
    failedAttempts.value++
    errorMsg.value = 'Email atau password salah.'
    
    // Apply Exponential Backoff logic as per PRD
    if (failedAttempts.value === 4) startLockout(30)
    else if (failedAttempts.value === 5) startLockout(60)
    else if (failedAttempts.value === 6) startLockout(300)
    else if (failedAttempts.value >= 7) startLockout(900)
  }
}

const startLockout = (seconds: number) => {
  lockoutSeconds.value = seconds
  errorMsg.value = '' // Clear error msg when entering lockout
  
  timer = setInterval(() => {
    lockoutSeconds.value--
    if (lockoutSeconds.value <= 0) {
      if (timer) clearInterval(timer)
      lockoutSeconds.value = 0
    }
  }, 1000)
}

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m > 0) return `${m} menit ${s} detik`
  return `${s} detik`
}
</script>

<template>
  <div class="min-h-screen bg-bg-base flex items-center justify-center p-4">
    <!-- Login Card -->
    <div class="w-full max-w-md bg-bg-surface border border-border shadow-xl rounded-2xl overflow-hidden transition-all duration-300">
      
      <!-- Locked Out State -->
      <div v-if="isLockedOut" class="p-10 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-300">
        <div class="w-20 h-20 bg-warning/10 text-warning rounded-full flex items-center justify-center mb-6">
          <AlertTriangle class="w-10 h-10" />
        </div>
        <h2 class="text-2xl font-heading font-bold text-text-primary mb-2">Terlalu Banyak Percobaan Login</h2>
        <p class="text-text-secondary mb-8">Sistem mendeteksi aktivitas login yang tidak wajar. Demi keamanan, fitur login dinonaktifkan sementara.</p>
        
        <div class="bg-bg-base w-full py-4 rounded-xl border border-border mb-6">
          <p class="text-sm font-medium text-text-secondary mb-1">Coba lagi dalam</p>
          <p class="text-2xl font-heading font-bold text-warning">{{ formatTime(lockoutSeconds) }}</p>
        </div>
        
        <AppButton variant="primary" disabled class="w-full cursor-not-allowed">
          Login
        </AppButton>
      </div>

      <!-- Normal State -->
      <div v-else class="p-8 md:p-10 animate-in fade-in zoom-in-95 duration-300">
        <div class="flex flex-col items-center mb-8">
          <div class="w-16 h-16 bg-brand rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-brand/20">
            <span class="text-2xl font-heading font-bold">MDS</span>
          </div>
          <h1 class="text-2xl font-heading font-bold text-text-primary">Admin Login</h1>
          <p class="text-sm text-text-secondary mt-1">Masuk untuk mengelola sistem PPDB</p>
        </div>

        <form @submit.prevent="handleLogin" class="flex flex-col gap-5">
          <AppInput 
            v-model="email" 
            type="email" 
            label="Email" 
            placeholder="admin@mds.sch.id" 
            required 
            :disabled="isSubmitting"
          />
          <AppInput 
            v-model="password" 
            type="password" 
            label="Password" 
            placeholder="••••••••" 
            required 
            :disabled="isSubmitting"
          />
          
          <div v-if="errorMsg" class="p-3 bg-error/10 border border-error rounded-xl text-error text-sm font-medium text-center animate-in slide-in-from-top-2">
            {{ errorMsg }}
          </div>
          
          <AppButton 
            type="submit" 
            variant="primary" 
            :disabled="!email || !password || isSubmitting"
            :loading="isSubmitting"
            class="w-full shadow-md mt-2"
          >
            Masuk
          </AppButton>
        </form>
      </div>

    </div>
  </div>
</template>
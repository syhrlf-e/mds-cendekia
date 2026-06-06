<script setup lang="ts">
import { CalendarDays, ChevronDown, GraduationCap, Images, LayoutDashboard, LogOut, MonitorX, Newspaper, PackageOpen, School, Settings, Users } from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'
import { useAdminAuthService } from '~/services/useAdminAuthService'

const route = useRoute()
const router = useRouter()
const { clearAdminDataCache } = useAdminDataCache()
const { logout } = useAdminAuthService()
const { addToast } = useToast()
const adminUsername = useState<string>('admin-auth:username', () => '')
const adminId = useState<number | null>('admin-auth:id', () => null)
const isHydrated = ref(false)
const isAdminMenuOpen = ref(false)
const isLogoutModalOpen = ref(false)
const isLoggingOut = ref(false)

const menu = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Data Calon Siswa', path: '/pendaftaran', icon: Users, pageTitle: 'Kelola Data Calon Siswa' },
  { name: 'Data Siswa', path: '/siswa', icon: GraduationCap, pageTitle: 'Data Siswa' },
  { name: 'Pelaksanaan PPDB', path: '/timeline-ppdb', icon: CalendarDays, pageTitle: 'Pelaksanaan PPDB' },
  { name: 'Paket Sekolah', path: '/paket-sekolah', icon: PackageOpen, pageTitle: 'Paket Sekolah' },
  { name: 'Berita', path: '/berita', icon: Newspaper, pageTitle: 'Kelola Berita' },
  { name: 'Galeri', path: '/galeri', icon: Images, pageTitle: 'Galeri Sekolah' },
  { name: 'Profil Sekolah', path: '/profil-sekolah', icon: School, pageTitle: 'Profil Sekolah' },
]
const settingsMenu = { name: 'Pengaturan', path: '/pengaturan', icon: Settings, pageTitle: 'Pengaturan' }

const isActive = (path: string) => route.path.startsWith(path)

const formatAdminName = (username: string) => {
  const normalized = username.trim().replace(/[._-]+/g, ' ')
  if (!normalized) return 'Admin'

  return normalized
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

const adminDisplayName = computed(() => formatAdminName(adminUsername.value))
const visibleAdminDisplayName = computed(() => isHydrated.value ? adminDisplayName.value : 'Admin')
const adminInitial = computed(() => adminDisplayName.value.charAt(0).toUpperCase() || 'A')
const activePageTitle = computed(() => {
  if (route.path.startsWith('/dashboard')) {
    return `Hai, Selamat datang kembali ${adminDisplayName.value}`
  }

  const activeMenu = [...menu, settingsMenu].find(item => isActive(item.path))
  return activeMenu?.pageTitle || activeMenu?.name || 'Admin'
})

const clearLocalSession = () => {
  const legacyAdminToken = useCookie('admin_token')
  const localCendekiaToken = useCookie('cendekia_token')
  legacyAdminToken.value = null
  localCendekiaToken.value = null
  adminUsername.value = ''
  adminId.value = null
  clearAdminDataCache()
}

const handleLogout = async () => {
  if (isLoggingOut.value) return

  isLoggingOut.value = true
  const { error } = await logout()

  if (error) {
    addToast('Sesi lokal ditutup, tetapi logout server belum dapat dikonfirmasi.', 'warning')
  }

  clearLocalSession()
  await router.push('/login')

  isLoggingOut.value = false
}

const openLogoutModal = () => {
  isAdminMenuOpen.value = false
  isLogoutModalOpen.value = true
}

onMounted(() => {
  isHydrated.value = true
})
</script>

<template>
  <div class="flex h-screen min-w-5xl overflow-hidden bg-gray-100 text-text-primary">
    <div class="fixed inset-0 z-100 flex flex-col items-center justify-center bg-bg-surface p-8 text-center lg:hidden">
      <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-error/10 text-error">
        <MonitorX class="h-8 w-8" />
      </div>
      <h2 class="mb-2 text-[28px] font-semibold leading-[1.2] tracking-[-0.2px] text-text-primary">Akses Dibatasi</h2>
      <p class="max-w-md text-[17px] leading-[1.47] tracking-[-0.2px] text-text-secondary">
        Halaman Admin hanya dapat diakses melalui perangkat <strong>Desktop</strong>. Silakan buka halaman ini di komputer atau laptop Anda.
      </p>
    </div>

    <aside class="z-10 m-4 hidden h-[calc(100%-2rem)] w-75 shrink-0 flex-col overflow-hidden rounded-2xl border border-border-soft bg-bg-surface lg:flex">
      <div class="flex h-20 shrink-0 items-center gap-3 border-b border-border-soft px-6">
        <img
          src="/images/logo-mds-main.png"
          alt="Logo MDS Cendekia"
          class="h-10 w-10 object-contain"
        >
        <div>
          <div class="text-[18px] font-extrabold leading-tight tracking-[-0.15px] text-text-primary">
            MDS Panel
          </div>
        </div>
      </div>

      <nav class="flex min-h-0 grow flex-col gap-1.5 overflow-y-auto px-4 py-6">
        <NuxtLink
          v-for="item in menu"
          :key="item.name"
          :to="item.path"
          class="group relative flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-text-secondary transition-all duration-200 hover:bg-bg-base hover:text-text-primary"
          :class="isActive(item.path) ? 'bg-primary-50 font-semibold text-brand [&>svg]:text-brand' : '[&>svg]:text-text-muted hover:[&>svg]:text-text-secondary'"
        >
          <component :is="item.icon" class="h-5 w-5 shrink-0 transition-colors" />
          {{ item.name }}
        </NuxtLink>
      </nav>

      <div class="mt-auto shrink-0 border-t border-border-soft bg-bg-surface/80 p-4">
        <NuxtLink
          :to="settingsMenu.path"
          class="group relative flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-text-secondary transition-all duration-200 hover:bg-bg-base hover:text-text-primary"
          :class="isActive(settingsMenu.path) ? 'bg-primary-50 font-semibold text-brand [&>svg]:text-brand' : '[&>svg]:text-text-muted hover:[&>svg]:text-text-secondary'"
        >
          <component :is="settingsMenu.icon" class="h-5 w-5 shrink-0 transition-colors" />
          {{ settingsMenu.name }}
        </NuxtLink>
      </div>
    </aside>

    <main class="relative hidden h-full min-w-0 grow flex-col overflow-hidden bg-gray-100 lg:flex">
      <header class="relative z-30 mt-4 flex h-20 shrink-0 items-center justify-between">
        <div class="flex h-16 max-w-[764px] items-center rounded-full bg-bg-surface px-8">
          <p class="truncate font-heading text-[26px] font-normal leading-normal text-dashboard-text">
            {{ activePageTitle }}
          </p>
        </div>

        <div class="relative h-20 w-[253px] shrink-0">
          <div
            v-if="isAdminMenuOpen"
            class="fixed inset-0 z-10"
            @click="isAdminMenuOpen = false"
          />

          <div
            class="absolute right-0 top-0 z-20 flex w-[253px] flex-col overflow-hidden rounded-[40px] bg-bg-surface transition-[height] duration-300 ease-out"
            :class="isAdminMenuOpen ? 'h-36' : 'h-20'"
          >
            <button
              type="button"
              class="flex h-20 w-[253px] shrink-0 items-center gap-3 border-0 bg-bg-surface px-4 text-dashboard-text outline-none focus:outline-none"
              :aria-expanded="isAdminMenuOpen"
              @click="isAdminMenuOpen = !isAdminMenuOpen"
            >
              <div class="flex size-[46px] shrink-0 items-center justify-center rounded-full bg-brand font-heading text-xl font-medium text-white">
                {{ isHydrated ? adminInitial : 'A' }}
              </div>
              <p class="min-w-0 grow truncate text-left font-heading text-base font-medium leading-normal text-dashboard-text">
                {{ visibleAdminDisplayName }}
              </p>
              <ChevronDown
                class="size-5 shrink-0 text-dashboard-text transition-transform duration-300"
                :class="isAdminMenuOpen ? 'rotate-180' : ''"
              />
            </button>

            <div
              class="flex h-16 shrink-0 items-center justify-center border-t border-border-soft transition-opacity duration-200"
              :class="isAdminMenuOpen ? 'opacity-100 delay-100' : 'pointer-events-none opacity-0'"
            >
              <button
                type="button"
                class="flex h-11 w-[calc(100%-1rem)] items-center justify-center gap-2 rounded-full font-heading text-sm font-semibold text-error transition-colors hover:bg-status-rejected-bg disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="isLoggingOut"
                @click="openLogoutModal"
              >
                <LogOut class="h-4 w-4 shrink-0" />
                Keluar Sistem
              </button>
            </div>
          </div>
        </div>
      </header>

      <div class="min-h-0 grow overflow-y-auto py-4">
        <NuxtPage />
      </div>
    </main>

    <AppModal
      v-model="isLogoutModalOpen"
      title="Keluar dari sistem?"
      width="max-w-[420px]"
      :close-on-backdrop="false"
      :close-on-escape="!isLoggingOut"
      :show-close-button="!isLoggingOut"
    >
      <p class="font-body text-sm leading-relaxed text-text-secondary">
        Sesi admin akan diakhiri dan kamu perlu masuk kembali untuk mengakses panel.
      </p>

      <template #footer>
        <AppButton
          variant="secondary"
          :disabled="isLoggingOut"
          @click="isLogoutModalOpen = false"
        >
          Batal
        </AppButton>
        <AppButton
          variant="danger"
          :loading="isLoggingOut"
          @click="handleLogout"
        >
          Keluar Sistem
        </AppButton>
      </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { Bell, CalendarDays, ChevronDown, GraduationCap, Images, LayoutDashboard, LogOut, MonitorX, Newspaper, PackageOpen, School, Settings, Users } from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'
import { useAdminAuthService } from '~/services/useAdminAuthService'

const route = useRoute()
const router = useRouter()
const { clearAdminDataCache } = useAdminDataCache()
const { logout } = useAdminAuthService()
const { addToast } = useToast()
const isAdminMenuOpen = ref(false)
const isLoggingOut = ref(false)

const menu = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Pendaftaran', path: '/pendaftaran', icon: Users, pageTitle: 'Data Pendaftar PPDB' },
  { name: 'Siswa', path: '/siswa', icon: GraduationCap, pageTitle: 'Data Siswa' },
  { name: 'Berita', path: '/berita', icon: Newspaper, pageTitle: 'Kelola Berita' },
  { name: 'Timeline PPDB', path: '/timeline-ppdb', icon: CalendarDays, pageTitle: 'Timeline PPDB' },
  { name: 'Profil Sekolah', path: '/profil-sekolah', icon: School, pageTitle: 'Profil Sekolah' },
  { name: 'Galeri', path: '/galeri', icon: Images, pageTitle: 'Galeri Sekolah' },
  { name: 'Paket Sekolah', path: '/paket-sekolah', icon: PackageOpen, pageTitle: 'Paket Sekolah' },
]
const settingsMenu = { name: 'Pengaturan', path: '/pengaturan', icon: Settings, pageTitle: 'Pengaturan' }

const isActive = (path: string) => route.path.startsWith(path)

const pageTitle = computed(() => {
  const activeMenu = [...menu, settingsMenu].find(item => isActive(item.path))
  return activeMenu?.pageTitle || activeMenu?.name || 'Admin'
})

const clearLocalSession = () => {
  const legacyAdminToken = useCookie('admin_token')
  const localCendekiaToken = useCookie('cendekia_token')
  legacyAdminToken.value = null
  localCendekiaToken.value = null
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
</script>

<template>
  <div class="flex h-screen min-w-5xl overflow-hidden bg-bg-base text-text-primary">
    <div class="fixed inset-0 z-100 flex flex-col items-center justify-center bg-bg-surface p-8 text-center lg:hidden">
      <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-error/10 text-error">
        <MonitorX class="h-8 w-8" />
      </div>
      <h2 class="mb-2 text-[28px] font-semibold leading-[1.2] tracking-[-0.2px] text-text-primary">Akses Dibatasi</h2>
      <p class="max-w-md text-[17px] leading-[1.47] tracking-[-0.2px] text-text-secondary">
        Halaman Admin hanya dapat diakses melalui perangkat <strong>Desktop</strong>. Silakan buka halaman ini di komputer atau laptop Anda.
      </p>
    </div>

    <aside class="z-10 m-4 hidden h-[calc(100%-2rem)] w-72 shrink-0 flex-col overflow-hidden rounded-2xl border border-border-soft bg-bg-surface shadow-sm lg:flex">
      <div class="flex h-17.5 shrink-0 items-center gap-3 border-b border-border-soft px-6">
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
          :class="isActive(item.path) ? 'bg-primary-50 font-semibold text-brand shadow-sm shadow-primary-100/60 [&>svg]:text-brand' : '[&>svg]:text-text-muted hover:[&>svg]:text-text-secondary'"
        >
          <component :is="item.icon" class="h-5 w-5 shrink-0 transition-colors" />
          {{ item.name }}
        </NuxtLink>
      </nav>

      <div class="mt-auto shrink-0 border-t border-border-soft bg-bg-surface/80 p-4">
        <NuxtLink
          :to="settingsMenu.path"
          class="group relative flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-text-secondary transition-all duration-200 hover:bg-bg-base hover:text-text-primary"
          :class="isActive(settingsMenu.path) ? 'bg-primary-50 font-semibold text-brand shadow-sm shadow-primary-100/60 [&>svg]:text-brand' : '[&>svg]:text-text-muted hover:[&>svg]:text-text-secondary'"
        >
          <component :is="settingsMenu.icon" class="h-5 w-5 shrink-0 transition-colors" />
          {{ settingsMenu.name }}
        </NuxtLink>
      </div>
    </aside>

    <main class="relative hidden h-full min-w-0 grow flex-col overflow-hidden bg-bg-base lg:flex">
      <header class="relative z-30 mb-0 mt-4 flex h-17.5 shrink-0 items-center justify-between rounded-2xl border border-border-soft bg-bg-surface px-6 shadow-sm transition-colors">
        <div>
          <h1 class="text-lg font-bold leading-[1.24] tracking-[-0.2px] text-text-primary">
            {{ pageTitle }}
          </h1>
        </div>

        <div class="flex items-center gap-2 sm:gap-4">
          <button
            type="button"
            class="relative flex h-10 w-10 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-bg-base hover:text-text-secondary focus:outline-none focus:ring-2 focus:ring-brand/20"
            aria-label="Notifikasi"
          >
            <Bell class="h-5 w-5" />
          </button>

          <div class="h-8 w-px bg-border-soft" />

          <div class="relative">
            <div
              v-if="isAdminMenuOpen"
              class="fixed inset-0 z-10"
              @click="isAdminMenuOpen = false"
            />

            <button
              type="button"
              class="relative z-20 flex items-center gap-3 rounded-full border border-transparent p-1.5 pr-3 transition-all duration-200 hover:border-border-soft hover:bg-bg-base hover:text-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              @click="isAdminMenuOpen = !isAdminMenuOpen"
            >
              <div class="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-bold text-white shadow-sm ring-2 ring-bg-surface">
                A
              </div>
              <div class="text-left">
                <p class="text-sm font-bold leading-none text-text-primary">Admin</p>
                <p class="mt-1 text-[10px] font-bold uppercase tracking-wider leading-none text-text-muted">Administrator</p>
              </div>
              <ChevronDown
                class="h-4 w-4 text-text-muted transition-transform"
                :class="isAdminMenuOpen ? 'rotate-180' : ''"
              />
            </button>

            <div
              v-if="isAdminMenuOpen"
              class="absolute right-0 top-[calc(100%+10px)] z-20 w-56 overflow-hidden rounded-3xl border border-border bg-bg-surface p-2 shadow-2xl shadow-text-primary/10"
            >
              <div class="mb-1 border-b border-border-soft px-4 py-3">
                <p class="mb-1 text-[10px] font-bold uppercase tracking-widest text-text-muted">Sesi Aktif</p>
                <p class="truncate text-xs font-bold text-text-secondary">admin@mdscendekia.local</p>
              </div>
              <button
                type="button"
                class="flex h-12 w-full items-center gap-3 rounded-xl px-4 text-left text-sm font-bold text-error transition-colors hover:bg-status-rejected-bg disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="isLoggingOut"
                @click="handleLogout"
              >
                <LogOut class="h-4 w-4 shrink-0" />
                {{ isLoggingOut ? 'Keluar...' : 'Keluar Sistem' }}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div class="min-h-0 grow overflow-y-auto py-4">
        <NuxtPage />
      </div>
    </main>
  </div>
</template>

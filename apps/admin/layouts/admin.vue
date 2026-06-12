<script setup lang="ts">
import { preloadRouteComponents } from '#app'
import { ChevronDown, GraduationCap, Images, LayoutDashboard, LogOut, Menu, Newspaper, PackageOpen, School, Settings, Users, X } from 'lucide-vue-next'
import type { Component } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAccessibleDialog } from '~/composables/useAccessibleDialog'
import { useAdminAuthService } from '~/services/useAdminAuthService'

type AdminMenuItem = {
  name: string
  path: string
  icon: Component
  pageTitle?: string
}

type AdminMenuGroup = {
  name: string
  icon: Component
  key: string
  children: AdminMenuItem[]
}

type AdminNavigationItem = AdminMenuItem | AdminMenuGroup

const route = useRoute()
const router = useRouter()
const { clearAdminSession } = useAdminSession()
const { logout } = useAdminAuthService()
const { addToast } = useToast()
const {
  loadDashboardSummary,
  loadPendaftar,
  loadStudents,
  loadPackages,
  loadNews,
  loadGallery
} = useAdminDataCache()
const adminUsername = useState<string>('admin-auth:username', () => '')
const isHydrated = ref(false)
const isMobileNavigationOpen = ref(false)
const isAdminMenuOpen = ref(false)
const isLogoutModalOpen = ref(false)
const isLoggingOut = ref(false)
const expandedMenuGroups = ref<Record<string, boolean>>({
  profile: true,
  students: true
})
const mobileNavigationRef = ref<HTMLElement | null>(null)
let desktopMediaQuery: MediaQueryList | null = null

const menu: AdminNavigationItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  {
    name: 'Profil Sekolah',
    icon: School,
    key: 'profile',
    children: [
      { name: 'Kelola Pengurus Yayasan', path: '/profil-sekolah?tab=pengurus-yayasan', icon: School, pageTitle: 'Kelola Pengurus Yayasan' },
      { name: 'Kelola Sambutan', path: '/profil-sekolah?tab=sambutan', icon: School, pageTitle: 'Kelola Sambutan' }
    ]
  },
  { name: 'Berita', path: '/berita', icon: Newspaper, pageTitle: 'Kelola Berita' },
  { name: 'Gallery', path: '/galeri', icon: Images, pageTitle: 'Galeri Sekolah' },
  {
    name: 'Manajemen Siswa',
    icon: Users,
    key: 'students',
    children: [
      { name: 'Data Calon Siswa', path: '/pendaftaran', icon: School, pageTitle: 'Kelola Data Calon Siswa' },
      { name: 'Data Siswa', path: '/siswa', icon: GraduationCap, pageTitle: 'Data Siswa' }
    ]
  },
  { name: 'Program Paket', path: '/paket-sekolah', icon: PackageOpen, pageTitle: 'Program Paket' }
]
const settingsMenu = { name: 'Pengaturan', path: '/pengaturan', icon: Settings, pageTitle: 'Pengaturan' }

const isMenuGroup = (item: AdminNavigationItem): item is AdminMenuGroup => 'children' in item
const isActive = (path: string) => path.includes('?')
  ? route.fullPath.startsWith(path)
  : route.path.startsWith(path)
const normalizeMenuPath = (path: string) => path.split('?')[0] || path
const isGroupActive = (group: AdminMenuGroup) => group.children.some(item => route.path.startsWith(normalizeMenuPath(item.path)))
const toggleMenuGroup = (key: string) => {
  expandedMenuGroups.value[key] = !expandedMenuGroups.value[key]
}
const flatMenuItems = computed(() => menu.flatMap(item => isMenuGroup(item) ? item.children : [item]))

const prefetchAdminMenu = (path: string) => {
  if (isActive(path)) return

  void preloadRouteComponents(path)

  switch (path) {
    case '/dashboard':
      void loadDashboardSummary({ background: true })
      break
    case '/pendaftaran':
      void loadPendaftar({ background: true })
      break
    case '/siswa':
      void loadStudents({ background: true })
      break
    case '/paket-sekolah':
      void loadPackages({ background: true })
      break
    case '/berita':
      void loadNews({ background: true })
      break
    case '/galeri':
      void loadGallery({ background: true })
      break
  }
}

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
    return `Hai, Selamat datang kembali ${visibleAdminDisplayName.value}`
  }

  const activeMenu = [...flatMenuItems.value, settingsMenu].find(item => isActive(item.path))
  if (!activeMenu && route.path.startsWith('/profil-sekolah')) return 'Profil Sekolah'

  return activeMenu?.pageTitle || activeMenu?.name || 'Admin'
})

const handleLogout = async () => {
  if (isLoggingOut.value) return

  isLoggingOut.value = true
  const { error } = await logout()

  if (error) {
    addToast('Sesi lokal ditutup, tetapi logout server belum dapat dikonfirmasi.', 'warning')
  }

  clearAdminSession()
  await router.replace('/login')

  isLoggingOut.value = false
}

const openLogoutModal = () => {
  isAdminMenuOpen.value = false
  isLogoutModalOpen.value = true
}

const closeMobileNavigation = () => {
  isMobileNavigationOpen.value = false
}

const handleDesktopViewport = (event: MediaQueryListEvent | MediaQueryList) => {
  if (event.matches) closeMobileNavigation()
}

useAccessibleDialog({
  isOpen: isMobileNavigationOpen,
  dialogRef: mobileNavigationRef,
  close: closeMobileNavigation,
  closeOnEscape: () => true
})

watch(() => route.path, () => {
  closeMobileNavigation()
  isAdminMenuOpen.value = false
})

onMounted(() => {
  isHydrated.value = true
  desktopMediaQuery = window.matchMedia('(min-width: 1280px)')
  desktopMediaQuery.addEventListener('change', handleDesktopViewport)
  handleDesktopViewport(desktopMediaQuery)
})

onBeforeUnmount(() => {
  desktopMediaQuery?.removeEventListener('change', handleDesktopViewport)
})
</script>

<template>
  <div class="flex h-dvh min-w-0 overflow-hidden bg-gray-100 text-text-primary">
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        leave-active-class="transition duration-150 ease-in"
        leave-to-class="opacity-0"
      >
        <div v-if="isMobileNavigationOpen" class="fixed inset-0 z-[90] xl:hidden">
          <button
            type="button"
            class="absolute inset-0 bg-black/45"
            aria-label="Tutup navigasi"
            @click="closeMobileNavigation"
          />

          <aside
            ref="mobileNavigationRef"
            role="dialog"
            aria-modal="true"
            aria-label="Navigasi admin"
            tabindex="-1"
            class="relative flex h-full w-[min(320px,calc(100vw-48px))] flex-col overflow-hidden bg-bg-surface shadow-2xl"
          >
            <div class="flex h-18 shrink-0 items-center gap-3 border-b border-border-soft px-5">
              <img
                src="/images/logo-mds-main.png"
                alt="Logo MDS Cendekia"
                class="h-10 w-10 object-contain"
              >
              <div class="grow text-[18px] font-extrabold leading-tight tracking-[-0.15px] text-text-primary">
                MDS Panel
              </div>
              <button
                type="button"
                class="flex h-11 w-11 items-center justify-center rounded-xl text-text-secondary transition-colors hover:bg-bg-base hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/30"
                aria-label="Tutup navigasi"
                @click="closeMobileNavigation"
              >
                <X class="h-5 w-5" />
              </button>
            </div>

            <nav class="flex min-h-0 grow flex-col gap-1.5 overflow-y-auto px-4 py-5">
              <template
                v-for="item in menu"
                :key="item.name"
              >
                <div v-if="isMenuGroup(item)" class="flex flex-col gap-1">
                  <button
                    type="button"
                    class="group relative flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-text-secondary transition-all duration-200 hover:bg-bg-base hover:text-text-primary"
                    :class="isGroupActive(item) ? 'font-semibold text-text-primary [&>svg]:text-text-primary' : '[&>svg]:text-text-muted hover:[&>svg]:text-text-secondary'"
                    :aria-expanded="expandedMenuGroups[item.key]"
                    @click="toggleMenuGroup(item.key)"
                  >
                    <component :is="item.icon" class="h-5 w-5 shrink-0 transition-colors" />
                    <span class="min-w-0 grow truncate">{{ item.name }}</span>
                    <ChevronDown
                      class="h-4 w-4 shrink-0 transition-transform duration-200"
                      :class="expandedMenuGroups[item.key] ? 'rotate-180' : ''"
                    />
                  </button>

                  <div
                    v-if="expandedMenuGroups[item.key]"
                    class="ml-[22px] flex flex-col gap-1 border-l border-border-soft pl-4"
                  >
                    <NuxtLink
                      v-for="child in item.children"
                      :key="child.name"
                      :to="child.path"
                      class="group relative flex min-h-10 items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-text-secondary transition-all duration-200 hover:bg-bg-base hover:text-text-primary"
                      :class="isActive(child.path) ? 'font-semibold text-brand [&>svg]:text-brand' : '[&>svg]:text-text-muted hover:[&>svg]:text-text-secondary'"
                      @pointerenter="prefetchAdminMenu(child.path)"
                      @focus="prefetchAdminMenu(child.path)"
                    >
                      <component :is="child.icon" class="h-4 w-4 shrink-0 transition-colors" />
                      {{ child.name }}
                    </NuxtLink>
                  </div>
                </div>

                <NuxtLink
                  v-else
                  :to="item.path"
                  class="group relative flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-text-secondary transition-all duration-200 hover:bg-bg-base hover:text-text-primary"
                  :class="isActive(item.path) ? 'font-semibold text-brand [&>svg]:text-brand' : '[&>svg]:text-text-muted hover:[&>svg]:text-text-secondary'"
                  @pointerenter="prefetchAdminMenu(item.path)"
                  @focus="prefetchAdminMenu(item.path)"
                >
                  <component :is="item.icon" class="h-5 w-5 shrink-0 transition-colors" />
                  {{ item.name }}
                </NuxtLink>
              </template>
            </nav>

            <div class="shrink-0 border-t border-border-soft p-4">
              <NuxtLink
                :to="settingsMenu.path"
                class="group relative flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-text-secondary transition-all duration-200 hover:bg-bg-base hover:text-text-primary"
                :class="isActive(settingsMenu.path) ? 'bg-primary-50 font-semibold text-brand [&>svg]:text-brand' : '[&>svg]:text-text-muted hover:[&>svg]:text-text-secondary'"
                @pointerenter="prefetchAdminMenu(settingsMenu.path)"
                @focus="prefetchAdminMenu(settingsMenu.path)"
              >
                <component :is="settingsMenu.icon" class="h-5 w-5 shrink-0 transition-colors" />
                {{ settingsMenu.name }}
              </NuxtLink>
            </div>
          </aside>
        </div>
      </Transition>
    </Teleport>

    <aside class="z-10 m-4 hidden h-[calc(100%-2rem)] w-75 shrink-0 flex-col overflow-hidden rounded-2xl border border-border-soft bg-bg-surface xl:flex">
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
        <template
          v-for="item in menu"
          :key="item.name"
        >
          <div v-if="isMenuGroup(item)" class="flex flex-col gap-1">
            <button
              type="button"
              class="group relative flex h-11 items-center gap-3 rounded-xl px-3 text-left text-sm font-medium text-text-secondary transition-all duration-200 hover:bg-bg-base hover:text-text-primary"
              :class="isGroupActive(item) ? 'font-semibold text-text-primary [&>svg]:text-text-primary' : '[&>svg]:text-text-muted hover:[&>svg]:text-text-secondary'"
              :aria-expanded="expandedMenuGroups[item.key]"
              @click="toggleMenuGroup(item.key)"
            >
              <component :is="item.icon" class="h-5 w-5 shrink-0 transition-colors" />
              <span class="min-w-0 grow truncate">{{ item.name }}</span>
              <ChevronDown
                class="h-4 w-4 shrink-0 transition-transform duration-200"
                :class="expandedMenuGroups[item.key] ? 'rotate-180' : ''"
              />
            </button>

            <div
              v-if="expandedMenuGroups[item.key]"
              class="ml-[22px] flex flex-col gap-1 border-l border-border-soft pl-4"
            >
              <NuxtLink
                v-for="child in item.children"
                :key="child.name"
                :to="child.path"
                class="group relative flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium text-text-secondary transition-all duration-200 hover:bg-bg-base hover:text-text-primary"
                :class="isActive(child.path) ? 'font-semibold text-brand [&>svg]:text-brand' : '[&>svg]:text-text-muted hover:[&>svg]:text-text-secondary'"
                @pointerenter="prefetchAdminMenu(child.path)"
                @focus="prefetchAdminMenu(child.path)"
              >
                <component :is="child.icon" class="h-4 w-4 shrink-0 transition-colors" />
                {{ child.name }}
              </NuxtLink>
            </div>
          </div>

          <NuxtLink
            v-else
            :to="item.path"
            class="group relative flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-text-secondary transition-all duration-200 hover:bg-bg-base hover:text-text-primary"
            :class="isActive(item.path) ? 'font-semibold text-brand [&>svg]:text-brand' : '[&>svg]:text-text-muted hover:[&>svg]:text-text-secondary'"
            @pointerenter="prefetchAdminMenu(item.path)"
            @focus="prefetchAdminMenu(item.path)"
          >
            <component :is="item.icon" class="h-5 w-5 shrink-0 transition-colors" />
            {{ item.name }}
          </NuxtLink>
        </template>
      </nav>

      <div class="mt-auto shrink-0 border-t border-border-soft bg-bg-surface/80 p-4">
        <NuxtLink
          :to="settingsMenu.path"
          class="group relative flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-text-secondary transition-all duration-200 hover:bg-bg-base hover:text-text-primary"
          :class="isActive(settingsMenu.path) ? 'bg-primary-50 font-semibold text-brand [&>svg]:text-brand' : '[&>svg]:text-text-muted hover:[&>svg]:text-text-secondary'"
          @pointerenter="prefetchAdminMenu(settingsMenu.path)"
          @focus="prefetchAdminMenu(settingsMenu.path)"
        >
          <component :is="settingsMenu.icon" class="h-5 w-5 shrink-0 transition-colors" />
          {{ settingsMenu.name }}
        </NuxtLink>
      </div>
    </aside>

    <main class="relative flex h-full min-w-0 grow flex-col overflow-hidden bg-gray-100">
      <header class="relative z-30 flex h-20 shrink-0 items-center justify-between gap-3 px-4 xl:mt-4 xl:px-0">
        <div class="flex h-14 min-w-0 grow items-center gap-2 rounded-2xl bg-bg-surface px-2 sm:h-16 sm:gap-3 sm:px-4 xl:max-w-[764px] xl:rounded-full xl:px-8">
          <button
            type="button"
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-dashboard-text transition-colors hover:bg-bg-base focus:outline-none focus:ring-2 focus:ring-brand/30 xl:hidden"
            aria-label="Buka navigasi"
            :aria-expanded="isMobileNavigationOpen"
            @click="isMobileNavigationOpen = true"
          >
            <Menu class="h-5 w-5" />
          </button>
          <p class="truncate font-heading text-lg font-normal leading-normal text-dashboard-text sm:text-xl xl:text-[26px]">
            {{ activePageTitle }}
          </p>
        </div>

        <div class="relative h-14 w-14 shrink-0 sm:h-16 sm:w-16 xl:h-20 xl:w-[253px]">
          <div
            v-if="isAdminMenuOpen"
            class="fixed inset-0 z-10"
            @click="isAdminMenuOpen = false"
          />

          <div
            class="absolute right-0 top-0 z-20 flex flex-col overflow-hidden bg-bg-surface transition-[height,width] duration-300 ease-out"
            :class="[
              isAdminMenuOpen ? 'h-34 w-[min(253px,calc(100vw-32px))] rounded-3xl xl:h-36 xl:w-[253px] xl:rounded-[40px]' : 'h-14 w-14 rounded-2xl sm:h-16 sm:w-16 xl:h-20 xl:w-[253px] xl:rounded-[40px]'
            ]"
          >
            <button
              type="button"
              class="flex h-14 w-full shrink-0 items-center gap-3 border-0 bg-bg-surface px-2 text-dashboard-text outline-none focus:outline-none sm:h-16 xl:h-20 xl:px-4"
              :aria-expanded="isAdminMenuOpen"
              aria-label="Buka menu akun admin"
              @click="isAdminMenuOpen = !isAdminMenuOpen"
            >
              <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand font-heading text-lg font-medium text-white sm:size-12 xl:size-[46px] xl:text-xl">
                {{ isHydrated ? adminInitial : 'A' }}
              </div>
              <p
                class="min-w-0 grow truncate text-left font-heading text-base font-medium leading-normal text-dashboard-text"
                :class="isAdminMenuOpen ? 'block' : 'hidden xl:block'"
              >
                {{ visibleAdminDisplayName }}
              </p>
              <ChevronDown
                class="size-5 shrink-0 text-dashboard-text transition-transform duration-300"
                :class="[isAdminMenuOpen ? 'rotate-180' : '', isAdminMenuOpen ? 'block' : 'hidden xl:block']"
              />
            </button>

            <div
              class="flex h-18 shrink-0 items-center justify-center border-t border-border-soft transition-opacity duration-200 xl:h-16"
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

      <div class="min-h-0 grow overflow-auto px-4 pb-4 xl:px-0 xl:py-4">
        <slot />
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

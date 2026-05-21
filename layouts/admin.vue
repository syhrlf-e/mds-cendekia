<script setup lang="ts">
import { LayoutDashboard, LogOut, MonitorX, Settings, Users } from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const menu = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Pendaftaran', path: '/admin/pendaftaran', icon: Users },
  { name: 'Pengaturan', path: '/admin/pengaturan', icon: Settings },
]

const isActive = (path: string) => route.path.startsWith(path)

const handleLogout = async () => {
  const { post } = useApi()
  await post('/auth/logout', undefined, { showErrorToast: false })

  const legacyAdminToken = useCookie('admin_token')
  const localCendekiaToken = useCookie('cendekia_token')
  legacyAdminToken.value = null
  localCendekiaToken.value = null

  router.push('/admin/login')
}
</script>

<template>
  <div class="flex min-h-screen min-w-5xl bg-bg-base">
    <div class="fixed inset-0 z-100 flex flex-col items-center justify-center bg-bg-surface p-8 text-center lg:hidden">
      <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-error/10 text-error">
        <MonitorX class="h-8 w-8" />
      </div>
      <h2 class="mb-2 text-[28px] font-semibold leading-[1.2] tracking-[-0.2px] text-text-primary">Akses Dibatasi</h2>
      <p class="max-w-md text-[17px] leading-[1.47] tracking-[-0.2px] text-text-secondary">
        Halaman Admin hanya dapat diakses melalui perangkat <strong>Desktop</strong>. Silakan buka halaman ini di komputer atau laptop Anda.
      </p>
    </div>

    <aside class="fixed left-0 top-0 hidden h-screen w-60 shrink-0 flex-col overflow-y-auto border-r border-border bg-bg-surface lg:flex">
      <div class="flex h-16 shrink-0 items-center gap-2.5 border-b border-border px-5">
        <img
          src="/images/logo-mds-main.png"
          alt="Logo MDS Cendekia"
          class="h-8 w-8 rounded-lg object-contain"
        >
        <div class="text-[15px] font-semibold leading-tight tracking-[-0.15px] text-text-primary">
          MDS<br>Cendekia
        </div>
      </div>

      <nav class="flex grow flex-col gap-1 px-3 py-3">
        <NuxtLink
          v-for="item in menu"
          :key="item.name"
          :to="item.path"
          class="flex h-10 items-center gap-2.5 rounded-lg px-3 text-sm font-normal text-text-secondary transition-colors hover:bg-primary-50 hover:text-text-primary"
          :class="isActive(item.path) ? 'border-l-[3px] border-brand bg-primary-50 pl-2.25 font-semibold text-brand [&>svg]:text-brand' : ''"
        >
          <component :is="item.icon" class="h-4 w-4 shrink-0" />
          {{ item.name }}
        </NuxtLink>
      </nav>

      <div class="mt-auto shrink-0 border-t border-border p-3">
        <button
          @click="handleLogout"
          class="flex h-10 w-full items-center gap-2.5 rounded-lg px-3 text-sm font-normal text-text-secondary transition-colors hover:bg-status-rejected-bg hover:text-error"
        >
          <LogOut class="h-4 w-4 shrink-0" />
          Keluar
        </button>
      </div>
    </aside>

    <main class="relative ml-60 hidden min-h-screen grow flex-col overflow-hidden lg:flex">
      <div class="grow overflow-y-auto bg-bg-base p-8">
        <NuxtPage />
      </div>
    </main>
  </div>
</template>

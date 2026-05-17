<script setup lang="ts">
import { LayoutDashboard, Users, Settings, LogOut } from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const menu = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Pendaftaran', path: '/admin/pendaftaran', icon: Users },
  { name: 'Pengaturan', path: '/admin/pengaturan', icon: Settings },
]

const isActive = (path: string) => route.path.startsWith(path)

const handleLogout = () => {
  const adminToken = useCookie('admin_token')
  adminToken.value = null
  router.push('/admin/login')
}
</script>

<template>
  <div class="min-h-screen bg-bg-base flex min-w-[1024px]">
    <!-- Mobile Warning Overlay -->
    <div class="lg:hidden fixed inset-0 z-[100] bg-bg-surface flex flex-col items-center justify-center p-8 text-center">
      <div class="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-monitor-x"><path d="M17 13V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/><path d="m14 21 2-2"/><path d="M8 21h8"/><path d="m22 2-2 2"/><path d="m17 7-5 5"/><path d="m12 7 5 5"/><path d="m2 2 20 20"/></svg>
      </div>
      <h2 class="text-2xl font-heading font-bold text-text-primary mb-2">Akses Dibatasi</h2>
      <p class="text-text-secondary">
        Halaman Admin hanya dapat diakses melalui perangkat <strong>Desktop</strong>. Silakan buka halaman ini di komputer atau laptop Anda.
      </p>
    </div>

    <!-- Sidebar (Desktop Only) -->
    <aside class="hidden lg:flex flex-col w-64 bg-primary-800 text-white shrink-0 border-r border-primary-900/50 shadow-xl sticky top-0 h-screen overflow-y-auto">
      <!-- Logo Header -->
      <div class="h-20 flex items-center gap-3 px-6 shrink-0 border-b border-white/10">
        <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
          <span class="font-heading font-bold text-lg">MDS</span>
        </div>
        <span class="font-heading font-bold text-lg tracking-wide">MDS Cendekia</span>
      </div>

      <!-- Navigation -->
      <nav class="flex-grow py-6 px-4 flex flex-col gap-2">
        <NuxtLink 
          v-for="item in menu" 
          :key="item.name"
          :to="item.path"
          class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium"
          :class="isActive(item.path) ? 'bg-white text-brand shadow-md' : 'text-white/80 hover:bg-white/10 hover:text-white'"
        >
          <component :is="item.icon" class="w-5 h-5 shrink-0" />
          {{ item.name }}
        </NuxtLink>
      </nav>

      <!-- Logout (Bottom) -->
      <div class="p-4 shrink-0 border-t border-white/10">
        <button 
          @click="handleLogout"
          class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:bg-error hover:text-white transition-all font-medium"
        >
          <LogOut class="w-5 h-5 shrink-0" />
          Keluar
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="flex-grow flex flex-col min-h-screen relative overflow-hidden max-w-full">
      <div class="flex-grow p-8 bg-bg-base overflow-y-auto">
        <NuxtPage />
      </div>
    </main>
  </div>
</template>
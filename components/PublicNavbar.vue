<script setup lang="ts">
import { ArrowLeft, Info, Menu, X } from 'lucide-vue-next'
import { computed, onUnmounted, ref, watch } from 'vue'

type NavItem = {
  id: number
  label: string
  to: string
}

const route = useRoute()
const router = useRouter()
const mobileMenuOpen = ref(false)

const ppdbYear = computed(() => {
  const year = new Date().getFullYear()
  return `${year}/${year + 1}`
})

const menuItems: NavItem[] = [
  { id: 1, label: 'Beranda', to: '/ppdb' },
  { id: 2, label: 'Profil', to: '/profil-sekolah' },
  { id: 3, label: 'Prestasi', to: '/profil-sekolah#prestasi' },
  { id: 4, label: 'Galeri', to: '/profil-sekolah#galeri' },
  { id: 5, label: 'Berita', to: '/profil-sekolah#berita' },
  { id: 6, label: 'Kontak', to: '/profil-sekolah#kontak' }
]

const activeMenu = computed(() => {
  if (route.path.startsWith('/profil-sekolah')) return 'Profil'
  return 'Beranda'
})

watch(mobileMenuOpen, (isOpen) => {
  if (!import.meta.client) return
  document.body.style.overflow = isOpen ? 'hidden' : ''
})

watch(() => route.fullPath, () => {
  mobileMenuOpen.value = false
})

onUnmounted(() => {
  if (import.meta.client) document.body.style.overflow = ''
})

const goToHome = () => {
  router.push('/ppdb')
}

const handleNavClick = (item: NavItem) => {
  mobileMenuOpen.value = false
  router.push(item.to)
}

const handleDokumenPPDB = () => {
  mobileMenuOpen.value = false
  router.push('/ppdb')
}

</script>

<template>
  <nav class="fixed left-0 right-0 top-0 z-[60] pt-5 transition-all duration-300">
      <div
        class="fixed inset-0 z-40 bg-text-primary/45 backdrop-blur-md transition-opacity duration-300 lg:hidden"
      :class="mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'"
      @click="mobileMenuOpen = false"
    />

    <div class="public-navbar-container">
      <div
        class="relative z-50 overflow-hidden rounded-3xl border border-border bg-bg-surface px-6 shadow-2xl shadow-brand/10 backdrop-blur-2xl backdrop-saturate-150 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
        :class="mobileMenuOpen ? 'py-6' : 'py-2 hover:bg-bg-surface'"
      >
        <div class="flex items-center justify-between">
          <button type="button" class="group flex items-center gap-3" aria-label="Ke beranda" @click="goToHome">
            <img
              src="/images/logo-mds-main.png"
              alt="Logo MDS Cendekia"
              class="h-12 w-12 object-contain transition-transform duration-300 group-hover:scale-110 group-hover:drop-shadow-lg"
              fetchpriority="high"
              loading="eager"
            />
          </button>

          <div class="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 lg:flex">
            <button
              v-for="item in menuItems"
              :key="item.id"
              type="button"
              class="relative cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 hover:bg-primary-50"
              :class="
                activeMenu === item.label
                  ? 'text-brand'
                  : 'text-text-secondary hover:text-brand'
              "
              @click="handleNavClick(item)"
            >
              <span class="relative z-10">{{ item.label }}</span>
              <span
                v-if="activeMenu === item.label"
                class="animate-slide-up absolute bottom-1.5 left-4 right-4 h-0.5 rounded-full bg-brand"
              />
            </button>
          </div>

          <div class="flex items-center gap-3">
            <button
              type="button"
              class="hidden items-center gap-2 rounded-xl border-2 border-brand bg-bg-surface px-4 py-2 text-sm font-medium text-brand transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-50 lg:flex"
              @click="handleDokumenPPDB"
            >
              <Info class="h-4 w-4" />
              <span>PPDB {{ ppdbYear }}</span>
            </button>

            <div class="flex items-center gap-3 lg:hidden">
              <button
                type="button"
                class="rounded-lg p-2 transition-transform duration-200 hover:scale-110 hover:bg-primary-50"
                aria-label="Toggle menu"
                @click="mobileMenuOpen = !mobileMenuOpen"
              >
                <Menu v-if="!mobileMenuOpen" class="h-6 w-6 text-text-primary" />
                <X v-else class="h-6 w-6 text-text-primary" />
              </button>
            </div>
          </div>
        </div>

        <div v-show="mobileMenuOpen" class="mt-4 border-t border-border-soft lg:hidden">
          <div class="space-y-2 pb-4 pt-4">
            <button
              v-for="(item, index) in menuItems"
              :key="item.id"
              type="button"
              :style="{ transitionDelay: mobileMenuOpen ? `${index * 50}ms` : '0ms' }"
              class="group flex w-full translate-y-2 items-center justify-between rounded-xl px-4 py-3 text-left opacity-0 transition-all duration-300"
              :class="[
                activeMenu === item.label
                  ? 'bg-primary-50 text-brand'
                  : 'text-text-secondary hover:bg-bg-base',
                mobileMenuOpen ? 'animate-slide-in' : ''
              ]"
              @click="handleNavClick(item)"
            >
              <span class="font-medium transition-transform group-hover:translate-x-1">{{ item.label }}</span>
              <ArrowLeft v-if="activeMenu === item.label" class="h-5 w-5 animate-bounce-x text-brand" />
            </button>
          </div>

          <div class="border-t border-border-soft pb-2 pt-4">
            <button
              type="button"
              class="flex w-full translate-y-2 items-center justify-center gap-2 rounded-xl border-2 border-brand bg-bg-surface px-4 py-3 font-medium text-brand opacity-0 transition-all duration-300"
              :class="mobileMenuOpen ? 'animate-slide-in' : ''"
              style="transition-delay: 300ms"
              @click="handleDokumenPPDB"
            >
              <Info class="h-5 w-5" />
              <span>PPDB {{ ppdbYear }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
@keyframes slide-up {
  from {
    transform: translateY(8px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-up {
  animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-in {
  animation: slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes bounce-x {
  0%,
  100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(-4px);
  }
}

.animate-bounce-x {
  animation: bounce-x 1s ease-in-out infinite;
}
</style>

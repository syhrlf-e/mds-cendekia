<script setup lang="ts">
import { ArrowLeft, Menu, X } from 'lucide-vue-next'
import { onUnmounted, ref, watch, onMounted, nextTick } from 'vue'

type NavItem = {
  id: number
  label: string
  to: string
}

const route = useRoute()
const router = useRouter()
const mobileMenuOpen = ref(false)

const menuItems: NavItem[] = [
  { id: 1, label: 'Beranda', to: '/' },
  { id: 2, label: 'Profil', to: '/profil-sekolah' },
  { id: 3, label: 'Galeri', to: '#galeri' },
  { id: 4, label: 'Berita', to: '#berita' },
  { id: 5, label: 'PPDB', to: '/ppdb' }
]

// Active menu dikelola manual agar bisa diupdate saat klik hash tanpa Vue Router
const activeMenuLabel = ref('Beranda')

// Setel active berdasarkan route path saat mount/navigasi
const setActiveFromRoute = () => {
  if (route.path === '/ppdb') {
    activeMenuLabel.value = 'PPDB'
  } else if (route.path === '/profil-sekolah') {
    activeMenuLabel.value = 'Profil'
  } else if (route.path === '/') {
    activeMenuLabel.value = 'Beranda'
  }
}

// IntersectionObserver: auto-detect seksi yang sedang di viewport
let observer: IntersectionObserver | null = null

const setupObserver = () => {
  if (!import.meta.client) return
  const sections = ['profil', 'galeri', 'berita']
  const threshold = 0.3

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const matched = menuItems.find(m => m.to === `#${entry.target.id}`)
          if (matched) activeMenuLabel.value = matched.label
        }
      })
    },
    { threshold }
  )

  sections.forEach((id) => {
    const el = document.getElementById(id)
    if (el) observer!.observe(el)
  })
}

const itemRefs = ref<HTMLElement[]>([])
const indicatorStyle = ref<any>({ width: '0px', transform: 'translateX(0px)', opacity: 0 })

const updateIndicator = async () => {
  if (!import.meta.client) return
  await nextTick()
  const activeIndex = menuItems.findIndex(m => m.label === activeMenuLabel.value)
  if (activeIndex !== -1 && itemRefs.value[activeIndex]) {
    const el = itemRefs.value[activeIndex]
    indicatorStyle.value = {
      width: `${el.offsetWidth}px`,
      transform: `translateX(${el.offsetLeft}px)`,
      opacity: 1
    }
  } else {
    indicatorStyle.value.opacity = 0
  }
}

onMounted(() => {
  setActiveFromRoute()
  updateIndicator()
  setupObserver()
  window.addEventListener('resize', updateIndicator)
})

watch(activeMenuLabel, () => {
  updateIndicator()
})

watch(() => route.path, () => {
  setActiveFromRoute()
  mobileMenuOpen.value = false
})

watch(mobileMenuOpen, (isOpen) => {
  if (!import.meta.client) return
  document.body.style.overflow = isOpen ? 'hidden' : ''
})

onUnmounted(() => {
  if (import.meta.client) {
    document.body.style.overflow = ''
    window.removeEventListener('resize', updateIndicator)
    observer?.disconnect()
  }
})

const goToHome = () => {
  activeMenuLabel.value = 'Beranda'
  router.push('/')
}

const handleNavClick = (item: NavItem) => {
  mobileMenuOpen.value = false
  if (item.to.startsWith('#')) {
    if (!import.meta.client) return
    // Set active langsung saat klik, jangan tunggu observer
    activeMenuLabel.value = item.label
    const target = document.querySelector(item.to)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      history.pushState(null, '', item.to)
    }
  } else {
    router.push(item.to)
  }
}

const handlePendaftaran = () => {
  mobileMenuOpen.value = false
  router.push('/ppdb')
}

</script>

<template>
  <nav class="fixed left-0 right-0 top-0 z-[60] bg-white/80 backdrop-blur-md transition-all duration-300">
      <div
        class="fixed inset-0 z-40 bg-text-primary/45 backdrop-blur-md transition-opacity duration-300 lg:hidden"
      :class="mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'"
      @click="mobileMenuOpen = false"
    />

    <div class="public-navbar-container">
      <div
        class="relative z-50 bg-transparent transition-all duration-500"
        :class="mobileMenuOpen ? 'py-6' : 'py-4'"
      >
        <div class="flex items-center justify-between">
          <!-- Logo -->
          <button type="button" class="group flex items-center gap-3" aria-label="Ke beranda" @click="goToHome">
            <img
              src="/images/logo-mds-main.png"
              alt="Logo MDS Cendekia"
              class="h-10 w-10 object-contain"
              fetchpriority="high"
              loading="eager"
            />
          </button>

          <!-- Desktop Menu -->
          <div class="absolute left-1/2 hidden -translate-x-1/2 items-center gap-[64px] lg:flex">
            <button
              v-for="(item, index) in menuItems"
              :key="item.id"
              :ref="(el) => { if (el) itemRefs[index] = el as HTMLElement }"
              type="button"
              class="group relative cursor-pointer py-2 text-[16px] font-medium font-heading transition-colors duration-300"
              :class="
                activeMenuLabel === item.label
                  ? 'text-brand'
                  : 'text-[#3A3A3A] hover:text-brand'
              "
              @click="handleNavClick(item)"
            >
              <span>{{ item.label }}</span>
            </button>
            
            <!-- Magic Sliding Indicator -->
            <span
              class="absolute -bottom-1 left-0 h-[3px] origin-left rounded-t-sm bg-brand transition-all duration-300 ease-in-out"
              :style="indicatorStyle"
            />
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-3">
            <button
              type="button"
              class="hidden items-center justify-center rounded-full border border-brand bg-[#FFFFFF] px-6 py-2.5 text-[16px] font-medium font-heading text-brand transition-colors duration-300 hover:bg-brand hover:text-white lg:flex"
              @click="handlePendaftaran"
            >
              <span>Daftarkan Diri Kamu</span>
            </button>

            <!-- Mobile Toggle -->
            <div class="flex items-center gap-3 lg:hidden">
              <button
                type="button"
                class="rounded-full p-2 transition-transform duration-200 hover:bg-primary-50"
                aria-label="Toggle menu"
                @click="mobileMenuOpen = !mobileMenuOpen"
              >
                <Menu v-if="!mobileMenuOpen" class="h-6 w-6 text-text-primary" />
                <X v-else class="h-6 w-6 text-text-primary" />
              </button>
            </div>
          </div>
        </div>

        <!-- Mobile Menu Panel -->
        <div v-show="mobileMenuOpen" class="mt-4 border-t border-border-soft lg:hidden">
          <div class="space-y-2 pb-4 pt-4">
            <button
              v-for="(item, index) in menuItems"
              :key="item.id"
              type="button"
              :style="{ transitionDelay: mobileMenuOpen ? `${index * 50}ms` : '0ms' }"
              class="group flex w-full translate-y-2 items-center justify-between rounded-xl px-4 py-3 text-left opacity-0 transition-all duration-300"
              :class="[
                activeMenuLabel === item.label
                  ? 'bg-primary-50 text-brand'
                  : 'text-[#3A3A3A] hover:bg-bg-base',
                mobileMenuOpen ? 'animate-slide-in' : ''
              ]"
              @click="handleNavClick(item)"
            >
              <span class="font-medium font-heading text-[16px] transition-transform group-hover:translate-x-1">{{ item.label }}</span>
              <ArrowLeft v-if="activeMenuLabel === item.label" class="h-5 w-5 animate-bounce-x text-brand" />
            </button>
          </div>

          <div class="border-t border-border-soft pb-2 pt-4">
            <button
              type="button"
              class="flex w-full translate-y-2 items-center justify-center gap-2 rounded-full border border-brand bg-[#FFFFFF] px-4 py-3 font-medium font-heading text-[16px] text-brand opacity-0 transition-all duration-300 hover:bg-brand hover:text-white"
              :class="mobileMenuOpen ? 'animate-slide-in' : ''"
              style="transition-delay: 300ms"
              @click="handlePendaftaran"
            >
              <span>Daftarkan Diri Kamu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
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

<script setup lang="ts">
import { Menu, X } from 'lucide-vue-next'
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

type NavItem = {
  id: number
  label: string
  to: string
}

const route = useRoute()
const router = useRouter()
const mobileMenuOpen = ref(false)
const clickedHashLabel = ref<string | null>(null)

const menuItems: NavItem[] = [
  { id: 1, label: 'Beranda', to: '/' },
  { id: 2, label: 'Galeri', to: '#galeri' },
  { id: 3, label: 'Berita', to: '#berita' },
  { id: 4, label: 'Profil', to: '/profil-sekolah' },
  { id: 5, label: 'PPDB', to: '/ppdb' }
]

const getRouteActiveLabel = () => {
  if (route.path.startsWith('/ppdb')) return 'PPDB'
  if (route.path.startsWith('/profil-sekolah')) return 'Profil'

  if (route.path === '/') {
    if (clickedHashLabel.value && route.hash) return clickedHashLabel.value
    return 'Beranda'
  }

  return 'Beranda'
}

const activeMenuLabel = ref(getRouteActiveLabel())
let isScrollListenerActive = false

const setActiveFromScroll = () => {
  if (!import.meta.client || route.path !== '/') return

  const activationLine = window.scrollY + window.innerHeight * 0.42
  const galeri = document.getElementById('galeri')
  const berita = document.getElementById('berita')
  const galeriTop = galeri ? galeri.getBoundingClientRect().top + window.scrollY : Number.POSITIVE_INFINITY
  const beritaTop = berita ? berita.getBoundingClientRect().top + window.scrollY : Number.POSITIVE_INFINITY

  if (activationLine >= beritaTop) {
    activeMenuLabel.value = 'Berita'
  } else if (activationLine >= galeriTop) {
    activeMenuLabel.value = 'Galeri'
  } else {
    activeMenuLabel.value = 'Beranda'
  }
}

const activateScrollListener = () => {
  if (!import.meta.client || isScrollListenerActive) return
  window.addEventListener('scroll', setActiveFromScroll, { passive: true })
  isScrollListenerActive = true
  setActiveFromScroll()
}

const deactivateScrollListener = () => {
  if (!import.meta.client || !isScrollListenerActive) return
  window.removeEventListener('scroll', setActiveFromScroll)
  isScrollListenerActive = false
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

const syncActiveFromRoute = async () => {
  activeMenuLabel.value = getRouteActiveLabel()
  await nextTick()

  if (route.path === '/') {
    activateScrollListener()
  } else {
    deactivateScrollListener()
  }

  updateIndicator()
}

const scrollToPosition = (targetTop: number) => {
  if (!import.meta.client) return
  window.scrollTo({ top: targetTop, left: 0, behavior: 'auto' })
}

const scrollToTop = () => {
  scrollToPosition(0)
}

const scrollToTarget = async (hash: string) => {
  if (!import.meta.client) return
  await nextTick()
  const target = document.querySelector(hash)
  if (!target) return

  const navbarOffset = 80
  const targetTop = Math.max(0, target.getBoundingClientRect().top + window.scrollY - navbarOffset)
  scrollToPosition(targetTop)
  history.replaceState(null, '', hash)
}

onMounted(async () => {
  if (route.path === '/' && route.hash) {
    await router.replace('/')
    scrollToTop()
  }

  await syncActiveFromRoute()
  updateIndicator()
  window.addEventListener('resize', updateIndicator)
})

watch(activeMenuLabel, () => {
  updateIndicator()
})

watch(() => route.fullPath, async () => {
  if (route.path !== '/' || !route.hash) {
    clickedHashLabel.value = null
  }

  await syncActiveFromRoute()
  if (route.path === '/' && route.hash && clickedHashLabel.value) {
    scrollToTarget(route.hash)
  }

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
    deactivateScrollListener()
  }
})

const goToHome = async () => {
  clickedHashLabel.value = null
  activeMenuLabel.value = 'Beranda'
  await router.push('/')
  await nextTick()
  scrollToTop()
  updateIndicator()
}

const handleNavClick = async (item: NavItem) => {
  mobileMenuOpen.value = false

  if (item.to === '/') {
    clickedHashLabel.value = null
    activeMenuLabel.value = 'Beranda'
    await router.push('/')
    await nextTick()
    scrollToTop()
    updateIndicator()
    return
  }

  if (item.to.startsWith('#')) {
    clickedHashLabel.value = item.label
    activeMenuLabel.value = item.label

    if (route.path !== '/') {
      await router.push('/')
      await nextTick()
      activeMenuLabel.value = item.label
      scrollToTarget(item.to)
      return
    }

    scrollToTarget(item.to)
    return
  }

  clickedHashLabel.value = null

  if (route.path !== item.to) {
    router.push(item.to)
  } else {
    syncActiveFromRoute()
  }
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
          <NuxtLink to="/" class="group flex cursor-pointer items-center gap-3" aria-label="Ke beranda" @click.prevent="goToHome">
            <img
              src="/images/logo-mds-main.png"
              alt="Logo MDS Cendekia"
              class="h-10 w-10 object-contain"
              fetchpriority="high"
              loading="eager"
            />
          </NuxtLink>

          <!-- Desktop Menu -->
          <div class="absolute left-1/2 hidden -translate-x-1/2 items-center gap-[64px] lg:flex">
            <NuxtLink
              v-for="(item, index) in menuItems"
              :key="item.id"
              :ref="(el) => { if (el) itemRefs[index] = el as HTMLElement }"
              :to="item.to.startsWith('#') ? `/${item.to}` : item.to"
              class="group relative cursor-pointer py-2 text-[16px] font-medium font-heading transition-colors duration-300"
              :class="
                activeMenuLabel === item.label
                  ? 'text-brand'
                  : 'text-[#3A3A3A] hover:text-brand'
              "
              :aria-current="activeMenuLabel === item.label ? 'page' : undefined"
              @click.prevent="handleNavClick(item)"
            >
              <span>{{ item.label }}</span>
            </NuxtLink>

            <span
              class="absolute -bottom-1 left-0 h-[3px] origin-left rounded-t-sm bg-brand transition-all duration-300 ease-in-out"
              :style="indicatorStyle"
            />
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-3">
            <NuxtLink
              to="/ppdb"
              class="hidden cursor-pointer items-center justify-center rounded-full border border-brand bg-[#FFFFFF] px-6 py-2.5 text-[16px] font-medium font-heading text-brand transition-colors duration-300 hover:bg-brand hover:text-white lg:flex"
              @click="mobileMenuOpen = false"
            >
              <span>Daftarkan Diri Kamu</span>
            </NuxtLink>

            <!-- Mobile Toggle -->
            <div class="flex items-center gap-3 lg:hidden">
              <button
                type="button"
                class="cursor-pointer rounded-full p-2 transition-transform duration-200 hover:bg-primary-50"
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
            <NuxtLink
              v-for="(item, index) in menuItems"
              :key="item.id"
              :to="item.to.startsWith('#') ? `/${item.to}` : item.to"
              :style="{ transitionDelay: mobileMenuOpen ? `${index * 50}ms` : '0ms' }"
              class="group flex w-full translate-y-2 cursor-pointer items-center justify-between rounded-xl px-4 py-3 text-left opacity-0 transition-all duration-300"
              :class="[
                activeMenuLabel === item.label
                  ? 'bg-primary-50 text-brand'
                  : 'text-[#3A3A3A] hover:bg-bg-base',
                mobileMenuOpen ? 'animate-slide-in' : ''
              ]"
              @click.prevent="handleNavClick(item)"
            >
              <span class="font-medium font-heading text-[16px] transition-transform group-hover:translate-x-1">{{ item.label }}</span>
              <span v-if="activeMenuLabel === item.label" class="h-2 w-2 rounded-full bg-brand" />
            </NuxtLink>
          </div>

          <div class="border-t border-border-soft pb-2 pt-4">
            <NuxtLink
              to="/ppdb"
              class="flex w-full translate-y-2 cursor-pointer items-center justify-center gap-2 rounded-full border border-brand bg-[#FFFFFF] px-4 py-3 font-medium font-heading text-[16px] text-brand opacity-0 transition-all duration-300 hover:bg-brand hover:text-white"
              :class="mobileMenuOpen ? 'animate-slide-in' : ''"
              style="transition-delay: 300ms"
              @click="mobileMenuOpen = false"
            >
              <span>Daftarkan Diri Kamu</span>
            </NuxtLink>
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
</style>

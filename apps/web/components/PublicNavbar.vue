<script setup lang="ts">
import { MessageCircle } from 'lucide-vue-next'
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

type NavItem = {
  id: number
  label: string
  to: string
}

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const { addToast } = useToast()
const mobileMenuOpen = ref(false)
const clickedHashLabel = ref<string | null>(null)

const menuItems: NavItem[] = [
  { id: 1, label: 'Beranda', to: '/' },
  { id: 2, label: 'Galeri', to: '#galeri' },
  { id: 3, label: 'Berita', to: '/berita' },
  { id: 4, label: 'Profil', to: '/profil-sekolah' },
  { id: 5, label: 'PPDB', to: '/ppdb' }
]

const getRouteActiveLabel = () => {
  if (route.path.startsWith('/ppdb')) return 'PPDB'
  if (route.path.startsWith('/profil-sekolah')) return 'Profil'
  if (route.path.startsWith('/berita')) return 'Berita'

  if (route.path === '/') {
    if (clickedHashLabel.value && route.hash) return clickedHashLabel.value
    return 'Beranda'
  }

  return 'Beranda'
}

const activeMenuLabel = ref(getRouteActiveLabel())
let isScrollListenerActive = false

const consultationMessage = computed(() => {
  if (route.path.startsWith('/ppdb')) {
    return 'Halo Admin MDS Cendekia, saya ingin berkonsultasi mengenai PPDB dan persyaratan pendaftaran.'
  }

  if (route.path.startsWith('/berita')) {
    return 'Halo Admin MDS Cendekia, saya ingin bertanya mengenai informasi yang saya baca di website.'
  }

  if (route.path.startsWith('/profil-sekolah')) {
    return 'Halo Admin MDS Cendekia, saya ingin berkonsultasi mengenai profil dan program pendidikan MDS Cendekia.'
  }

  return 'Halo Admin MDS Cendekia, saya ingin berkonsultasi mengenai program pendidikan MDS Cendekia.'
})

const whatsappNumber = computed(() => String(config.public.whatsappNumber || '').replace(/\D/g, ''))
const consultationUrl = computed(() => whatsappNumber.value
  ? `https://wa.me/${whatsappNumber.value}?text=${encodeURIComponent(consultationMessage.value)}`
  : ''
)

const handleConsultationClick = (event: MouseEvent) => {
  mobileMenuOpen.value = false

  if (consultationUrl.value) return

  event.preventDefault()
  addToast('Nomor konsultasi belum dikonfigurasi.', 'warning')
}

const setActiveFromScroll = () => {
  if (!import.meta.client || route.path !== '/') return

  const activationLine = window.scrollY + window.innerHeight * 0.42
  const galeri = document.getElementById('galeri')
  const galeriTop = galeri ? galeri.getBoundingClientRect().top + window.scrollY : Number.POSITIVE_INFINITY

  if (activationLine >= galeriTop) {
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

const setItemRef = (el: Element | { $el?: Element } | null, index: number) => {
  if (!el) return

  const componentElement = '$el' in el ? el.$el : null
  const element = el instanceof HTMLElement
    ? el
    : componentElement instanceof HTMLElement
      ? componentElement
      : null

  if (element) {
    itemRefs.value[index] = element
  }
}

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
    indicatorStyle.value = { width: '0px', transform: 'translateX(0px)', opacity: 0 }
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

const closeMobileMenuOnEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    mobileMenuOpen.value = false
  }
}

onMounted(async () => {
  if (route.path === '/' && route.hash) {
    await router.replace('/')
    scrollToTop()
  }

  await syncActiveFromRoute()
  updateIndicator()
  window.addEventListener('resize', updateIndicator)
  window.addEventListener('keydown', closeMobileMenuOnEscape)
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

onUnmounted(() => {
  if (import.meta.client) {
    window.removeEventListener('resize', updateIndicator)
    window.removeEventListener('keydown', closeMobileMenuOnEscape)
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
  <Transition name="mobile-page-blur">
    <button
      v-if="mobileMenuOpen"
      type="button"
      class="fixed inset-0 z-50 cursor-default bg-text-primary/12 backdrop-blur-sm lg:hidden"
      aria-label="Tutup menu navigasi"
      @click="mobileMenuOpen = false"
    />
  </Transition>

  <nav
    class="fixed left-0 right-0 top-0 z-60 border-b border-transparent bg-white/90 backdrop-blur-md transition-all duration-300"
    :class="mobileMenuOpen ? 'border-border-soft shadow-sm lg:border-transparent lg:shadow-none' : ''"
  >
    <div class="public-navbar-container">
      <div
        class="relative z-50 bg-transparent transition-all duration-500"
        :class="mobileMenuOpen ? 'py-3 lg:py-4' : 'py-3.5 lg:py-4'"
      >
        <div class="flex items-center justify-between">
          <!-- Logo -->
          <NuxtLink
            to="/"
            class="group flex min-h-11 cursor-pointer items-center gap-3"
            aria-label="Ke beranda"
            @click.prevent="goToHome"
          >
            <img
              src="/images/logo-mds-main.png"
              alt="Logo Yayasan Mukti Daris Sasmita Cendekia"
              class="h-9 w-9 object-contain lg:h-10 lg:w-10"
              fetchpriority="high"
              loading="eager"
            />
          </NuxtLink>

          <!-- Desktop Menu -->
          <div class="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 xl:gap-12 2xl:gap-16 lg:flex">
            <NuxtLink
              v-for="(item, index) in menuItems"
              :key="item.id"
              :ref="(el) => setItemRef(el, index)"
              :to="item.to.startsWith('#') ? `/${item.to}` : item.to"
              class="group relative cursor-pointer py-2 font-heading text-sm font-medium transition-colors duration-300 xl:text-base"
              :class="
                activeMenuLabel === item.label
                  ? 'text-brand'
                  : 'text-text-public-heading hover:text-brand'
              "
              :aria-current="activeMenuLabel === item.label ? 'page' : undefined"
              @click.prevent="handleNavClick(item)"
            >
              <span>{{ item.label }}</span>
            </NuxtLink>

            <span
              class="absolute -bottom-1 left-0 h-0.75 origin-left rounded-t-sm bg-brand transition-all duration-300 ease-in-out"
              :style="indicatorStyle"
            />
          </div>

          <!-- Actions -->
          <div class="relative z-10 flex items-center gap-3">
            <a
              :href="consultationUrl || undefined"
              target="_blank"
              rel="noopener noreferrer"
              class="public-navbar-consultation cursor-pointer items-center justify-center gap-2 rounded-full bg-bg-base px-4 py-2 font-heading text-sm font-medium text-text-public-heading transition-all duration-300 hover:bg-primary-50 hover:text-brand xl:px-5 xl:py-2.5 xl:text-base"
              :aria-disabled="!consultationUrl"
              @click="handleConsultationClick"
            >
              <MessageCircle class="h-4 w-4" stroke-width="1.8" />
              <span>Konsultasi</span>
            </a>

            <!-- Mobile Toggle -->
            <div class="flex items-center gap-3 lg:hidden">
              <button
                type="button"
                class="mobile-menu-button flex h-11 w-11 cursor-pointer items-center justify-center bg-transparent"
                :class="mobileMenuOpen ? 'is-open' : ''"
                :aria-label="mobileMenuOpen ? 'Tutup menu' : 'Buka menu'"
                :aria-expanded="mobileMenuOpen"
                aria-controls="public-mobile-menu"
                @click="mobileMenuOpen = !mobileMenuOpen"
              >
                <span class="mobile-menu-lines" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
              </button>
            </div>
          </div>
        </div>

        <!-- Mobile Menu Panel -->
        <Transition name="mobile-nav">
          <div
            v-if="mobileMenuOpen"
            id="public-mobile-menu"
            class="mt-3 overflow-hidden border-t border-border-soft pt-3 lg:hidden"
          >
            <div class="space-y-1">
              <NuxtLink
                v-for="(item, index) in menuItems"
                :key="item.id"
                :to="item.to.startsWith('#') ? `/${item.to}` : item.to"
                :style="{ transitionDelay: `${index * 45}ms` }"
                class="mobile-nav-item group flex min-h-12 w-full cursor-pointer items-center justify-between rounded-xl px-4 py-3 text-left transition-all duration-300"
                :class="
                  activeMenuLabel === item.label
                    ? 'bg-primary-50 text-brand'
                    : 'text-text-public-heading hover:bg-bg-base'
                "
                @click.prevent="handleNavClick(item)"
              >
                <span class="font-heading text-base font-medium transition-transform group-hover:translate-x-1">{{ item.label }}</span>
                <span v-if="activeMenuLabel === item.label" class="h-2 w-2 rounded-full bg-brand" />
              </NuxtLink>
            </div>

            <div class="mt-3 border-t border-border-soft pt-3">
              <a
                :href="consultationUrl || undefined"
                target="_blank"
                rel="noopener noreferrer"
                class="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 font-heading text-sm font-medium text-white transition-colors hover:bg-brand-hover"
                :aria-disabled="!consultationUrl"
                @click="handleConsultationClick"
              >
                <MessageCircle class="h-4 w-4" stroke-width="1.8" />
                Konsultasi
              </a>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.public-navbar-consultation {
  display: none;
}

@media (min-width: 1024px) {
  .public-navbar-consultation {
    display: inline-flex;
  }
}

.mobile-menu-lines {
  position: relative;
  display: block;
  width: 22px;
  height: 16px;
}

.mobile-menu-lines span {
  position: absolute;
  right: 0;
  height: 2px;
  border-radius: 999px;
  background: currentColor;
  color: #27272a;
  transition:
    top 0.25s ease,
    width 0.25s ease,
    transform 0.25s ease,
    opacity 0.2s ease;
}

.mobile-menu-lines span:nth-child(1) {
  top: 1px;
  width: 22px;
}

.mobile-menu-lines span:nth-child(2) {
  top: 7px;
  width: 14px;
}

.mobile-menu-lines span:nth-child(3) {
  top: 13px;
  width: 19px;
}

.mobile-menu-button.is-open .mobile-menu-lines span:nth-child(1) {
  top: 7px;
  width: 22px;
  transform: rotate(45deg);
}

.mobile-menu-button.is-open .mobile-menu-lines span:nth-child(2) {
  opacity: 0;
  transform: translateX(8px);
}

.mobile-menu-button.is-open .mobile-menu-lines span:nth-child(3) {
  top: 7px;
  width: 22px;
  transform: rotate(-45deg);
}

.mobile-nav-enter-active,
.mobile-nav-leave-active {
  transition:
    opacity 0.28s ease,
    transform 0.32s cubic-bezier(0.16, 1, 0.3, 1),
    max-height 0.32s cubic-bezier(0.16, 1, 0.3, 1);
}

.mobile-nav-enter-from,
.mobile-nav-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-8px) scaleY(0.98);
}

.mobile-nav-enter-to,
.mobile-nav-leave-from {
  max-height: 430px;
  opacity: 1;
  transform: translateY(0) scaleY(1);
}

.mobile-nav-enter-from .mobile-nav-item,
.mobile-nav-leave-to .mobile-nav-item {
  opacity: 0;
  transform: translateY(-6px);
}

.mobile-nav-enter-to .mobile-nav-item,
.mobile-nav-leave-from .mobile-nav-item {
  opacity: 1;
  transform: translateY(0);
}

.mobile-page-blur-enter-active,
.mobile-page-blur-leave-active {
  transition:
    opacity 0.24s ease,
    backdrop-filter 0.24s ease;
}

.mobile-page-blur-enter-from,
.mobile-page-blur-leave-to {
  opacity: 0;
  backdrop-filter: blur(0);
}

.mobile-page-blur-enter-to,
.mobile-page-blur-leave-from {
  opacity: 1;
  backdrop-filter: blur(4px);
}
</style>

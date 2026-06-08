<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeft } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const hideMobileFooter = computed(() => Boolean(route.meta.hideMobilePpdbFooter))
const mobileHeaderTitle = computed(() => String(route.meta.ppdbHeaderTitle || 'Formulir PPDB'))
const mobileBackPath = computed(() => String(route.meta.ppdbBackPath || '/ppdb'))

const goBack = () => {
  if (import.meta.client) {
    const event = new CustomEvent('ppdb-mobile-back', {
      cancelable: true,
      detail: { to: mobileBackPath.value }
    })

    if (!window.dispatchEvent(event)) return
  }

  router.push(mobileBackPath.value)
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-bg-base font-sans">
    <header class="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur-md">
      <div class="public-navbar-container">
        <div class="grid min-h-16 grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-3 md:hidden">
          <button
            type="button"
            class="inline-flex h-11 w-11 items-center justify-center text-text-primary transition-colors hover:text-brand focus:text-brand active:text-brand focus:outline-none"
            :aria-label="`Kembali ke ${mobileBackPath}`"
            @click="goBack"
          >
            <ChevronLeft class="h-6 w-6" aria-hidden="true" />
          </button>

          <p class="truncate text-center font-heading text-[15px] font-semibold leading-tight text-text-primary">
            {{ mobileHeaderTitle }}
          </p>

          <NuxtLink to="/ppdb" class="inline-flex h-10 w-10 items-center justify-center justify-self-end" aria-label="Kembali ke PPDB">
            <img
              src="/images/logo-mds-main.png"
              alt="Logo Yayasan Mukti Daris Sasmita Cendekia"
              class="h-9 w-9 shrink-0 object-contain"
              fetchpriority="high"
              loading="eager"
            />
          </NuxtLink>
        </div>

        <div class="hidden items-center justify-between gap-4 py-3 md:flex md:py-4">
          <NuxtLink to="/ppdb" class="flex min-w-0 items-center gap-2.5 md:gap-3" aria-label="Kembali ke PPDB">
            <img
              src="/images/logo-mds-main.png"
              alt="Logo Yayasan Mukti Daris Sasmita Cendekia"
              class="h-9 w-9 shrink-0 object-contain md:h-10 md:w-10"
              fetchpriority="high"
              loading="eager"
            />
            <span class="hidden truncate font-heading text-sm font-semibold text-text-primary sm:inline md:text-base">
              MDS Cendekia
            </span>
          </NuxtLink>

          <p class="shrink-0 font-heading text-xs font-medium text-text-secondary md:text-base">
            Formulir PPDB
          </p>
        </div>
      </div>
    </header>

    <main class="flex-1 pb-14 md:pb-16">
      <slot />
    </main>

    <footer
      class="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 backdrop-blur-md"
      :class="hideMobileFooter ? 'hidden md:block' : ''"
    >
      <div class="public-navbar-container py-3 text-center text-xs text-text-secondary md:py-4 md:text-sm">
        <p class="leading-relaxed">Butuh bantuan? Hubungi admin PPDB melalui kanal resmi sekolah.</p>
      </div>
    </footer>
  </div>
</template>

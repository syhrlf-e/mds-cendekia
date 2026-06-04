<template>
  <div class="flex min-h-screen flex-col bg-bg-base font-sans">
    <header class="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur-md">
      <div class="public-navbar-container">
        <div class="flex items-center justify-between py-4">
          <NuxtLink to="/ppdb" class="flex items-center gap-3" aria-label="Kembali ke PPDB">
            <img
              src="/images/logo-mds-main.png"
              alt="Logo Yayasan Mukti Daris Sasmita Cendekia"
              class="h-10 w-10 object-contain"
              fetchpriority="high"
              loading="eager"
            />
            <span class="hidden font-heading text-base font-semibold text-text-primary sm:inline">
              MDS Cendekia
            </span>
          </NuxtLink>

          <p class="font-heading text-sm font-medium text-text-secondary md:text-base">
            Formulir PPDB
          </p>
        </div>
      </div>
    </header>

    <main class="flex-1">
      <slot />
    </main>

    <footer class="border-t border-border bg-white">
      <div class="public-navbar-container flex flex-col gap-1 py-5 text-center text-sm text-text-secondary">
        <p class="font-medium text-text-primary">MDS Cendekia</p>
        <p>Butuh bantuan? Hubungi admin PPDB melalui kanal resmi sekolah.</p>
      </div>
    </footer>
  </div>
</template>

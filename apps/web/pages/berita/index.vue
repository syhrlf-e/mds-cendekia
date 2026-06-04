<script setup lang="ts">
import { usePublicNewsService } from '~/services/usePublicNewsService'

useHead({
  title: 'Berita & Informasi | MDS Cendekia',
  meta: [
    {
      name: 'description',
      content: 'Kumpulan berita, pengumuman, dan informasi edukasi terbaru dari MDS Cendekia.'
    },
    {
      property: 'og:title',
      content: 'Berita & Informasi | MDS Cendekia'
    },
    {
      property: 'og:description',
      content: 'Kumpulan berita, pengumuman, dan informasi edukasi terbaru dari MDS Cendekia.'
    }
  ]
})

useBreadcrumbJsonLd(() => [
  { name: 'Beranda', path: '/' },
  { name: 'Berita', path: '/berita' }
])

const { listPublicNews } = usePublicNewsService()

const { data: publicNewsItems, pending: isNewsLoading } = useLazyAsyncData('public-news-all', async () => {
  // Use a higher limit for the news page
  const { data } = await listPublicNews(100)
  return data
}, {
  server: false,
  default: () => []
})

const formatNewsDate = (date: string) => {
  if (!date) return ''
  const parsedDate = new Date(date)
  if (Number.isNaN(parsedDate.getTime())) return date

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(parsedDate)
}

const buildNewsPath = (item: { id: string, slug?: string }) => `/berita/${encodeURIComponent(item.slug || item.id)}`
</script>

<template>
  <div class="min-h-screen bg-bg-public-muted font-sans">
    <section class="relative flex flex-col items-center justify-center px-6 py-40">
      <div class="public-navbar-container flex w-full flex-col items-center">
        <!-- Headline -->
        <h2 class="mb-20 text-center font-heading text-5xl font-normal leading-tight text-text-public-heading">
          Kabar terbaru dan informasi edukasi.
        </h2>

        <div class="flex w-full flex-wrap justify-center gap-6">
          <template v-if="isNewsLoading">
            <div
              v-for="index in 8"
              :key="`news-skeleton-${index}`"
              class="news-card flex min-h-[460px] animate-pulse flex-col overflow-hidden rounded-4xl bg-white shadow-sm"
            >
              <div class="h-[250px] w-full bg-gray-200"></div>
              <div class="flex flex-col p-8">
                <div class="mb-6 flex items-center justify-between gap-4">
                  <span class="h-7 w-24 rounded-full bg-gray-200"></span>
                  <span class="h-4 w-28 rounded-full bg-gray-200"></span>
                </div>
                <div class="mb-4 h-16 rounded-2xl bg-gray-200"></div>
                <div class="h-20 rounded-2xl bg-gray-200"></div>
              </div>
            </div>
          </template>
          
          <template v-else-if="publicNewsItems.length">
            <NuxtLink
              v-for="item in publicNewsItems"
              :key="item.id"
              :to="buildNewsPath(item)"
              class="news-card flex cursor-pointer flex-col overflow-hidden rounded-4xl bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <img :src="item.imageUrl || '/images/logo-mds-main.png'" :alt="item.title" loading="lazy" decoding="async" class="h-[250px] w-full object-cover" />
              <div class="flex flex-col p-8">
                <div class="mb-6 flex items-center justify-between gap-4">
                  <span class="rounded-full border border-blue-500 px-4 py-1 font-sans text-sm font-medium text-blue-500">
                    {{ item.category || 'Berita' }}
                  </span>
                  <span class="text-right font-sans text-sm text-gray-400">
                    {{ formatNewsDate(item.publishDate) }}
                  </span>
                </div>
                <h3 class="mb-4 font-heading text-xl font-medium leading-snug text-text-public-heading">
                  {{ item.title }}
                </h3>
                <p class="font-sans text-sm leading-relaxed text-gray-500">
                  {{ item.excerpt }}
                </p>
              </div>
            </NuxtLink>
          </template>
          
          <div v-else class="flex min-h-40 w-full items-center justify-center px-8 text-center">
            <p class="font-sans text-lg leading-relaxed text-gray-500">
              Belum ada berita atau informasi yang dibuat
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.news-card {
  flex: 0 0 calc((100% - 72px) / 4);
  max-width: calc((100% - 72px) / 4);
}
</style>

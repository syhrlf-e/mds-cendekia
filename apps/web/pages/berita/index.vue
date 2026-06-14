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

const useFallbackNewsImage = (event: Event) => {
  const image = event.currentTarget as HTMLImageElement
  if (image.dataset.fallbackApplied) return

  image.dataset.fallbackApplied = 'true'
  image.src = '/images/logo-mds-main.png'
}

const buildNewsPath = (item: { id: string, slug?: string }) => `/berita/${encodeURIComponent(item.slug || item.id)}`
</script>

<template>
  <div class="min-h-screen bg-bg-public-muted font-sans">
    <section class="relative flex flex-col items-center justify-center px-0 py-24 md:py-32 lg:py-32 xl:py-36 2xl:py-40">
      <div class="public-container flex flex-col items-center">
        <!-- Headline -->
        <h2 class="mb-12 text-center font-heading text-3xl font-normal leading-tight text-text-public-heading md:mb-14 md:text-4xl lg:mb-16 lg:text-4xl 2xl:mb-20 2xl:text-5xl">
          Kabar terbaru dan informasi edukasi.
        </h2>

        <div class="grid w-full grid-cols-1 justify-center gap-5 sm:grid-cols-2 xl:grid-cols-4 2xl:gap-6">
          <template v-if="isNewsLoading">
            <div
              v-for="index in 8"
              :key="`news-skeleton-${index}`"
              class="flex min-h-96 animate-pulse flex-col overflow-hidden rounded-3xl bg-white shadow-sm 2xl:min-h-[460px] 2xl:rounded-4xl"
            >
              <div class="h-52 w-full bg-gray-200 lg:h-56 2xl:h-[250px]"></div>
              <div class="flex flex-col p-6 2xl:p-8">
                <div class="mb-5 flex items-center justify-between gap-4 2xl:mb-6">
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
              class="flex cursor-pointer flex-col overflow-hidden rounded-3xl bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md 2xl:rounded-4xl"
            >
              <img
                :src="item.imageUrl || '/images/logo-mds-main.png'"
                :alt="item.title"
                loading="lazy"
                decoding="async"
                class="h-52 w-full object-cover lg:h-56 2xl:h-[250px]"
                @error="useFallbackNewsImage"
              >
              <div class="flex flex-col p-6 2xl:p-8">
                <div class="mb-5 flex items-center justify-between gap-4 2xl:mb-6">
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
                <div
                  v-if="item.tags.length"
                  class="mt-5 flex flex-wrap gap-2"
                >
                  <span
                    v-for="tag in item.tags.slice(0, 3)"
                    :key="`${item.id}-${tag}`"
                    class="rounded-full bg-gray-100 px-3 py-1 font-sans text-xs font-medium text-neutral-600"
                  >
                    #{{ tag }}
                  </span>
                </div>
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

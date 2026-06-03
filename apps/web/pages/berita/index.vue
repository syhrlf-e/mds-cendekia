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
  <div class="min-h-screen bg-[#F8F9FA] font-sans">
    <section class="relative flex flex-col items-center justify-center px-6 py-[160px]">
      <div class="public-navbar-container flex w-full flex-col items-center">
        <!-- Headline -->
        <h2 class="mb-[80px] text-center font-heading text-[48px] font-normal leading-tight text-[#3B3B3B]">
          Kabar terbaru dan informasi edukasi.
        </h2>

        <div class="flex w-full flex-wrap justify-center gap-[24px]">
          <template v-if="isNewsLoading">
            <div
              v-for="index in 8"
              :key="`news-skeleton-${index}`"
              class="news-card flex min-h-[460px] animate-pulse flex-col overflow-hidden rounded-[32px] bg-white shadow-sm"
            >
              <div class="h-[250px] w-full bg-[#E5E7EB]"></div>
              <div class="flex flex-col p-[32px]">
                <div class="mb-[24px] flex items-center justify-between gap-4">
                  <span class="h-7 w-24 rounded-full bg-[#E5E7EB]"></span>
                  <span class="h-4 w-28 rounded-full bg-[#E5E7EB]"></span>
                </div>
                <div class="mb-[16px] h-16 rounded-2xl bg-[#E5E7EB]"></div>
                <div class="h-20 rounded-2xl bg-[#E5E7EB]"></div>
              </div>
            </div>
          </template>
          
          <template v-else-if="publicNewsItems.length">
            <NuxtLink
              v-for="item in publicNewsItems"
              :key="item.id"
              :to="buildNewsPath(item)"
              class="news-card flex cursor-pointer flex-col overflow-hidden rounded-[32px] bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <img :src="item.imageUrl || '/images/logo-mds-main.png'" :alt="item.title" loading="lazy" decoding="async" class="h-[250px] w-full object-cover" />
              <div class="flex flex-col p-[32px]">
                <div class="mb-[24px] flex items-center justify-between gap-4">
                  <span class="rounded-full border border-[#3B82F6] px-4 py-1 font-sans text-[14px] font-medium text-[#3B82F6]">
                    {{ item.category || 'Berita' }}
                  </span>
                  <span class="text-right font-sans text-[14px] text-[#9CA3AF]">
                    {{ formatNewsDate(item.publishDate) }}
                  </span>
                </div>
                <h3 class="mb-[16px] font-heading text-[20px] font-medium leading-snug text-[#3B3B3B]">
                  {{ item.title }}
                </h3>
                <p class="font-sans text-[14px] leading-relaxed text-[#6B7280]">
                  {{ item.excerpt }}
                </p>
              </div>
            </NuxtLink>
          </template>
          
          <div v-else class="flex min-h-[160px] w-full items-center justify-center px-8 text-center">
            <p class="font-sans text-[18px] leading-relaxed text-[#6B7280]">
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

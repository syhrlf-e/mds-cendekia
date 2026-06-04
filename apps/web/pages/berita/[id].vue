<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import { usePublicNewsService } from '~/services/usePublicNewsService'

const route = useRoute()
const { getPublicNewsDetail } = usePublicNewsService()
const newsId = computed(() => String(route.params.id || ''))
const siteHomeUrl = useAbsoluteSiteUrl('/')
const siteBaseUrl = siteHomeUrl.replace(/\/$/, '')
const fallbackImageUrl = useAbsoluteSiteUrl('/images/logo-mds-main.png')
const { data: newsItem, pending: isLoading } = await useAsyncData(`public-news-detail-${newsId.value}`, async () => {
  const { data } = await getPublicNewsDetail(newsId.value)
  return data
}, {
  watch: [newsId]
})

const articlePath = computed(() => `/berita/${encodeURIComponent(newsItem.value?.slug || newsId.value)}`)
const articleUrl = computed(() => siteBaseUrl ? `${siteBaseUrl}${articlePath.value}` : '')

useBreadcrumbJsonLd(() => [
  { name: 'Beranda', path: '/' },
  { name: 'Berita', path: '/berita' },
  {
    name: newsItem.value?.title || 'Detail Berita',
    path: articlePath.value
  }
])

const formattedDate = computed(() => {
  const date = newsItem.value?.publishDate
  if (!date) return ''
  const parsedDate = new Date(date)
  if (Number.isNaN(parsedDate.getTime())) return date

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(parsedDate)
})

const articleParagraphs = computed(() => {
  const content = newsItem.value?.content || newsItem.value?.excerpt || ''
  return content
    .split(/\n+/)
    .map(paragraph => paragraph.trim())
    .filter(Boolean)
})

useHead(() => ({
  title: newsItem.value ? `${newsItem.value.title} | MDS Cendekia` : 'Berita | MDS Cendekia',
  link: articleUrl.value ? [{ rel: 'canonical', href: articleUrl.value }] : [],
  meta: [
    {
      name: 'description',
      content: newsItem.value?.excerpt || 'Berita dan informasi terbaru MDS Cendekia.'
    },
    {
      property: 'og:type',
      content: 'article'
    },
    {
      property: 'og:title',
      content: newsItem.value?.title || 'Berita MDS Cendekia'
    },
    {
      property: 'og:description',
      content: newsItem.value?.excerpt || 'Berita dan informasi terbaru MDS Cendekia.'
    },
    {
      name: 'twitter:title',
      content: newsItem.value?.title || 'Berita MDS Cendekia'
    },
    {
      name: 'twitter:description',
      content: newsItem.value?.excerpt || 'Berita dan informasi terbaru MDS Cendekia.'
    },
    ...(articleUrl.value
      ? [
          { property: 'og:url', content: articleUrl.value },
          { name: 'twitter:url', content: articleUrl.value }
        ]
      : []),
    ...(newsItem.value?.imageUrl || fallbackImageUrl
      ? [
          { property: 'og:image', content: newsItem.value?.imageUrl || fallbackImageUrl },
          { name: 'twitter:image', content: newsItem.value?.imageUrl || fallbackImageUrl }
        ]
      : []),
    ...(newsItem.value?.publishDate
      ? [
          { property: 'article:published_time', content: newsItem.value.publishDate }
        ]
      : []),
    ...(newsItem.value?.authorName
      ? [
          { property: 'article:author', content: newsItem.value.authorName }
        ]
      : [])
  ]
}))

useJsonLd(() => {
  if (!newsItem.value) return null

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: newsItem.value.title,
    description: newsItem.value.excerpt || 'Berita dan informasi terbaru MDS Cendekia.',
    inLanguage: 'id-ID',
    author: {
      '@type': 'Person',
      name: newsItem.value.authorName || 'MDS Cendekia'
    },
    publisher: {
      '@id': siteHomeUrl ? `${siteHomeUrl}#school` : '#school'
    }
  }

  if (articleUrl.value) {
    schema.url = articleUrl.value
    schema.mainEntityOfPage = articleUrl.value
  }

  if (newsItem.value.imageUrl || fallbackImageUrl) schema.image = newsItem.value.imageUrl || fallbackImageUrl
  if (newsItem.value.publishDate) schema.datePublished = newsItem.value.publishDate
  if (newsItem.value.publishDate) schema.dateModified = newsItem.value.publishDate
  if (newsItem.value.category) schema.articleSection = newsItem.value.category
  if (newsItem.value.tags.length) schema.keywords = newsItem.value.tags.join(', ')

  return schema
})
</script>

<template>
  <main class="min-h-screen bg-white px-6 pb-30 pt-[150px]">
    <article v-if="isLoading" class="mx-auto w-full max-w-[860px]">
      <div class="mb-8 h-6 w-40 animate-pulse rounded-full bg-gray-200" />
      <div class="mb-5 h-14 animate-pulse rounded-2xl bg-gray-200" />
      <div class="mb-10 h-6 w-72 animate-pulse rounded-full bg-gray-200" />
      <div class="mb-12 aspect-[16/9] animate-pulse rounded-3xl bg-gray-200" />
      <div class="space-y-4">
        <div class="h-5 animate-pulse rounded-full bg-gray-200" />
        <div class="h-5 animate-pulse rounded-full bg-gray-200" />
        <div class="h-5 w-10/12 animate-pulse rounded-full bg-gray-200" />
      </div>
    </article>

    <article v-else-if="newsItem" class="mx-auto w-full max-w-[860px]">
      <NuxtLink to="/berita" class="mb-12 inline-flex items-center gap-2 font-sans text-sm font-medium text-neutral-600 transition-colors hover:text-brand">
        <ArrowLeft class="h-4 w-4" />
        Kembali ke Berita
      </NuxtLink>

      <div class="mb-6 flex flex-wrap items-center gap-3">
        <span class="rounded-full border border-blue-500 px-4 py-1 font-sans text-sm font-medium text-blue-500">
          {{ newsItem.category || 'Berita' }}
        </span>
        <span class="font-sans text-sm text-gray-400">{{ formattedDate }}</span>
      </div>

      <h1 class="mb-6 font-heading text-5xl font-medium leading-tight text-text-public-heading">
        {{ newsItem.title }}
      </h1>

      <p v-if="newsItem.authorName" class="mb-10 font-sans text-base text-gray-500">
        Ditulis oleh {{ newsItem.authorName }}
      </p>

      <img
        :src="newsItem.imageUrl || '/images/logo-mds-main.png'"
        :alt="newsItem.title"
        class="mb-12 aspect-[16/9] w-full rounded-3xl object-cover"
      >

      <div class="space-y-6 font-sans text-xl leading-[1.9] text-text-public-heading">
        <p v-for="paragraph in articleParagraphs" :key="paragraph">
          {{ paragraph }}
        </p>
      </div>

      <div v-if="newsItem.tags.length" class="mt-12 flex flex-wrap gap-3">
        <span
          v-for="tag in newsItem.tags"
          :key="tag"
          class="rounded-full bg-gray-100 px-4 py-2 font-sans text-sm text-neutral-600"
        >
          #{{ tag }}
        </span>
      </div>
    </article>

    <section v-else class="mx-auto flex min-h-[480px] w-full max-w-[860px] flex-col items-center justify-center text-center">
      <h1 class="mb-4 font-heading text-4xl font-medium text-text-public-heading">Berita tidak ditemukan</h1>
      <p class="mb-8 max-w-md font-sans text-base leading-relaxed text-gray-500">
        Berita yang kamu cari belum tersedia atau sudah tidak dapat diakses.
      </p>
      <NuxtLink to="/berita" class="inline-flex h-12 cursor-pointer items-center justify-center rounded-full border border-brand px-6 font-sans text-base font-medium text-brand transition-colors hover:bg-brand hover:text-white">
        Kembali ke Berita
      </NuxtLink>
    </section>
  </main>
</template>

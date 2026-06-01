export type PublicNewsItem = {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  category: string
  tags: string[]
  authorName: string
  publishDate: string
  imageUrl: string
}

export type NewsDto = Record<string, any>

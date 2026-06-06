export type AdminNewsItem = {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  category: string
  tags: string
  author: string
  image: string
  created_at: string
  published: boolean
  is_featured: boolean
  views: number
}

export type AdminNewsForm = {
  title: string
  content: string
  category: string
  tags: string
  image: File | null
}

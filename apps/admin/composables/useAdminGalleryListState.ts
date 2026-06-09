import type { Ref } from 'vue'
import type { GalleryItem } from '~/types/adminGallery'

type UseAdminGalleryListStateOptions = {
  items: Ref<GalleryItem[]>
}

export const useAdminGalleryListState = ({
  items
}: UseAdminGalleryListStateOptions) => {
  const searchQuery = ref('')
  const currentPage = ref(1)
  const perPage = ref(10)

  const filteredItems = computed(() => {
    const query = searchQuery.value.trim().toLowerCase()
    if (!query) return items.value

    return items.value.filter(item => [
      item.nama,
      item.deskripsi,
      item.createdAt
    ].some(value => value.toLowerCase().includes(query)))
  })

  const lastPage = computed(() => Math.max(1, Math.ceil(filteredItems.value.length / perPage.value)))
  const from = computed(() => filteredItems.value.length ? (currentPage.value - 1) * perPage.value + 1 : 0)
  const pagedItems = computed(() => filteredItems.value.slice(from.value - 1, Math.min(currentPage.value * perPage.value, filteredItems.value.length)))

  watch(searchQuery, () => {
    currentPage.value = 1
  })

  watch(filteredItems, () => {
    if (currentPage.value > lastPage.value) currentPage.value = lastPage.value
  })

  return {
    searchQuery,
    currentPage,
    filteredItems,
    lastPage,
    pagedItems
  }
}

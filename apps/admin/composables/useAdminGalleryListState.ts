import type { Ref } from 'vue'
import {
  applyGalleryDisplayOrder,
  sortGalleryItems
} from '~/services/useAdminGalleryService'
import type { GalleryItem } from '~/types/adminGallery'

type UseAdminGalleryListStateOptions = {
  items: Ref<GalleryItem[]>
  savingOrder: Ref<boolean>
}

export const useAdminGalleryListState = ({
  items,
  savingOrder
}: UseAdminGalleryListStateOptions) => {
  const searchQuery = ref('')
  const currentPage = ref(1)
  const perPage = ref(10)
  const draggedItemId = ref('')
  const orderChanged = ref(false)

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
  const canDragRows = computed(() => !searchQuery.value.trim() && !savingOrder.value)
  const primaryGalleryItem = computed(() => items.value.find(item => item.isUtama) || null)
  const canDragItem = (item: GalleryItem) => canDragRows.value && !item.isUtama

  const applyDisplayOrderToItems = () => {
    items.value = applyGalleryDisplayOrder(items.value)
    orderChanged.value = false
  }

  const normalizeCurrentOrder = () => {
    items.value = sortGalleryItems(items.value).map((item, index) => ({
      ...item,
      urutan: index + 1
    }))
  }

  const handleDragStart = (item: GalleryItem, event: DragEvent) => {
    if (!canDragItem(item)) return

    draggedItemId.value = item.id
    event.dataTransfer?.setData('text/plain', item.id)
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
  }

  const handleDrop = (targetItem: GalleryItem) => {
    if (!canDragItem(targetItem) || !draggedItemId.value || draggedItemId.value === targetItem.id) {
      draggedItemId.value = ''
      return
    }

    const currentIndex = items.value.findIndex(item => item.id === draggedItemId.value)
    const targetIndex = items.value.findIndex(item => item.id === targetItem.id)

    if (currentIndex < 0 || targetIndex < 0 || items.value[currentIndex]?.isUtama) {
      draggedItemId.value = ''
      return
    }

    const nextItems = [...items.value]
    const [movedItem] = nextItems.splice(currentIndex, 1)
    if (!movedItem) {
      draggedItemId.value = ''
      return
    }

    nextItems.splice(targetIndex, 0, movedItem)
    items.value = nextItems
    normalizeCurrentOrder()
    orderChanged.value = true
    draggedItemId.value = ''
    currentPage.value = 1
  }

  const handleDragEnd = () => {
    draggedItemId.value = ''
  }

  watch(searchQuery, () => {
    currentPage.value = 1
  })

  watch(filteredItems, () => {
    if (currentPage.value > lastPage.value) currentPage.value = lastPage.value
  })

  return {
    searchQuery,
    currentPage,
    draggedItemId,
    orderChanged,
    filteredItems,
    lastPage,
    from,
    pagedItems,
    primaryGalleryItem,
    applyDisplayOrderToItems,
    handleDragStart,
    handleDrop,
    handleDragEnd
  }
}

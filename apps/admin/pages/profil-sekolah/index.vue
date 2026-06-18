<script setup lang="ts">
import { MoreHorizontal, Plus, Search, Users, FileText, Edit2, Trash2 } from 'lucide-vue-next'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import YayasanPengurusDrawer from '~/components/yayasan/YayasanPengurusDrawer.vue'
import YayasanSambutanDrawer from '~/components/yayasan/YayasanSambutanDrawer.vue'
import { useAdminOrganizationService } from '~/services/useAdminOrganizationService'
import type { OrganizationMember, OrganizationCreatePayload } from '~/types/adminOrganization'

definePageMeta({
  layout: 'admin',
  middleware: ['admin-auth']
})

useHead({ title: 'Profil Sekolah | MDS Cendekia' })

const route = useRoute()
const router = useRouter()
const { addToast } = useToast()
const {
  getAllOrganization,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  BASE_URL
} = useAdminOrganizationService()

// ─── State ────────────────────────────────────────────────────────────────────
const activeTab = computed(() => (route.query.tab as string) || 'pengurus-yayasan')
const members = ref<OrganizationMember[]>([])
const isLoading = ref(true)
const searchQuery = ref('')

// Drawer
const isDrawerOpen = ref(false)
const drawerMode = ref<'create' | 'edit'>('create')
const editingMember = ref<OrganizationMember | null>(null)
const isSaving = ref(false)

// Dropdown
const activeDropdown = ref<number | null>(null)

// Delete modal
const isDeleteModalOpen = ref(false)
const memberToDelete = ref<OrganizationMember | null>(null)
const isDeleting = ref(false)

// Sambutan
const chairPositions = ['Ketua Pembina', 'Ketua Pengawas', 'Ketua Umum']
const isSambutanDrawerOpen = ref(false)
const sambutanDrawerMode = ref<'create' | 'edit'>('create')
const editingSambutanMember = ref<OrganizationMember | null>(null)
const isSavingSambutan = ref(false)

// ─── Computed ─────────────────────────────────────────────────────────────────
const filteredMembers = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return members.value
  return members.value.filter(m =>
    m.nama.toLowerCase().includes(q) || m.jabatan.toLowerCase().includes(q)
  )
})

const emptyMembersDescription = computed(() =>
  searchQuery.value
    ? `Tidak ada pengurus yang cocok dengan "${searchQuery.value}".`
    : 'Mulai tambahkan data pengurus yayasan untuk ditampilkan di sini.'
)

const chairMembers = computed(() =>
  members.value.filter(member => chairPositions.includes(member.jabatan))
)
const activeSambutanMember = computed(() =>
  chairMembers.value.find(member => member.sambutan?.trim()) ?? null
)
const sambutanRows = computed(() =>
  activeSambutanMember.value ? [activeSambutanMember.value] : []
)

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getInitials = (nama: string) => {
  const parts = nama.trim().split(' ')
  return parts.length >= 2
    ? `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase()
    : (parts[0]?.[0] ?? '?').toUpperCase()
}

const getAvatarUrl = (gambar: string) =>
  gambar ? `${BASE_URL}${gambar}` : null

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

// ─── Data Fetching ────────────────────────────────────────────────────────────
const fetchMembers = async () => {
  isLoading.value = true
  const { data, error } = await getAllOrganization()
  isLoading.value = false
  if (error) {
    addToast('Data pengurus belum bisa dimuat dari server.', 'error')
    return
  }
  members.value = data
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────
const openCreate = () => {
  drawerMode.value = 'create'
  editingMember.value = null
  isDrawerOpen.value = true
}

const openEdit = (member: OrganizationMember) => {
  drawerMode.value = 'edit'
  editingMember.value = member
  isDrawerOpen.value = true
  activeDropdown.value = null
}

const handleSubmit = async (payload: OrganizationCreatePayload) => {
  if (isSaving.value) return
  isSaving.value = true

  if (drawerMode.value === 'edit' && editingMember.value) {
    const { data, error } = await updateOrganization(editingMember.value.id, payload)
    isSaving.value = false
    if (error) {
      addToast(error?.data?.message || 'Gagal memperbarui data pengurus.', 'error')
      return
    }
    addToast(data?.message || 'Data pengurus berhasil diperbarui.', 'success')
    isDrawerOpen.value = false
    await fetchMembers()
    return
  }

  const { data, error } = await createOrganization(payload)
  isSaving.value = false
  if (error) {
    addToast(error?.data?.message || 'Gagal menambahkan pengurus.', 'error')
    return
  }
  addToast(data?.message || 'Pengurus berhasil ditambahkan.', 'success')
  isDrawerOpen.value = false
  await fetchMembers()
}

const openDelete = (member: OrganizationMember) => {
  memberToDelete.value = member
  isDeleteModalOpen.value = true
  activeDropdown.value = null
}

const confirmDelete = async () => {
  if (!memberToDelete.value) return
  isDeleting.value = true
  const { data, error } = await deleteOrganization(memberToDelete.value.id)
  isDeleting.value = false
  if (error) {
    addToast(error?.data?.message || 'Gagal menghapus pengurus.', 'error')
    return
  }
  members.value = members.value.filter(m => m.id !== memberToDelete.value?.id)
  isDeleteModalOpen.value = false
  memberToDelete.value = null
  addToast(data?.message || 'Pengurus berhasil dihapus.', 'success')
}

// ─── Sambutan ─────────────────────────────────────────────────────────────────
const openCreateChair = () => {
  router.replace({ query: { tab: 'pengurus-yayasan' } })
  openCreate()
}

const openCreateSambutan = () => {
  sambutanDrawerMode.value = 'create'
  editingSambutanMember.value = null
  isSambutanDrawerOpen.value = true
}

const openEditSambutan = (member: OrganizationMember) => {
  sambutanDrawerMode.value = 'edit'
  editingSambutanMember.value = member
  isSambutanDrawerOpen.value = true
  activeDropdown.value = null
}

const saveSambutan = async (payload: { chairId: number; sambutan: string }) => {
  if (isSavingSambutan.value) return

  const targetChair = chairMembers.value.find(member => member.id === payload.chairId)
  if (!targetChair) {
    addToast('Pemberi sambutan tidak ditemukan.', 'error')
    return
  }

  isSavingSambutan.value = true

  const { data, error } = await updateOrganization(targetChair.id, {
    nama: targetChair.nama,
    jabatan: targetChair.jabatan,
    sambutan: payload.sambutan
  })
  if (error) {
    isSavingSambutan.value = false
    addToast(error?.data?.message || 'Gagal menyimpan sambutan.', 'error')
    return
  }

  const otherChairsWithSambutan = chairMembers.value.filter(member =>
    member.id !== targetChair.id && member.sambutan
  )

  await Promise.all(
    otherChairsWithSambutan.map(member => updateOrganization(member.id, {
      nama: member.nama,
      jabatan: member.jabatan,
      sambutan: ''
    }))
  )

  members.value = members.value.map(member =>
    chairPositions.includes(member.jabatan)
      ? { ...member, sambutan: member.id === targetChair.id ? payload.sambutan : '' }
      : member
  )
  isSavingSambutan.value = false
  isSambutanDrawerOpen.value = false
  addToast(data?.message || 'Sambutan berhasil disimpan.', 'success')
}

// ─── Dropdown close on outside click ─────────────────────────────────────────
const closeDropdown = (e: MouseEvent) => {
  if (!(e.target as HTMLElement).closest('.org-dropdown-container')) {
    activeDropdown.value = null
  }
}

onMounted(() => {
  fetchMembers()
  document.addEventListener('click', closeDropdown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeDropdown)
})

</script>

<template>
  <div class="flex h-full min-h-0 flex-col gap-4">

    <!-- ── TAB: KELOLA PENGURUS ─────────────────────────────────────────────── -->
    <template v-if="activeTab === 'pengurus-yayasan'">

      <!-- Toolbar -->
      <section class="shrink-0 rounded-2xl border border-border-soft bg-bg-surface p-4">
        <div class="flex items-center gap-3">
          <div class="relative grow">
            <Search class="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-text-muted" />
            <input
              v-model="searchQuery"
              type="search"
              placeholder="Cari nama atau jabatan..."
              class="h-11 w-full rounded-xl border border-border-soft bg-bg-base py-2.5 pl-10 pr-4 font-heading text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-brand focus:bg-bg-surface focus:ring-[3px] focus:ring-brand/12"
            >
          </div>
          <div class="h-8 w-px shrink-0 bg-border-soft" />
          <AppButton variant="primary" @click="openCreate">
            <Plus class="mr-2 h-4 w-4" />
            Tambah Pengurus
          </AppButton>
        </div>
      </section>

      <!-- Table -->
      <section class="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border-soft bg-bg-surface">
        <div class="min-h-0 flex-1 overflow-auto">
          <table class="w-full border-collapse text-left">
            <thead class="sticky top-0 z-10 bg-bg-base">
              <tr class="h-12 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                <th class="min-w-64 px-6">Pengurus</th>
                <th class="w-40 px-4">Bergabung</th>
                <th class="w-16 px-4" />
              </tr>
            </thead>
            <tbody class="divide-y divide-border-soft">

              <!-- Loading -->
              <tr v-if="isLoading">
                <td colspan="3">
                  <div class="flex min-h-[380px] items-center justify-center">
                    <div class="flex items-center gap-3 font-heading text-sm font-medium text-text-secondary">
                      <span class="dot-wave" aria-hidden="true">
                        <span class="bg-current" />
                        <span class="bg-current" />
                        <span class="bg-current" />
                      </span>
                      Memuat data pengurus...
                    </div>
                  </div>
                </td>
              </tr>

              <!-- Empty -->
              <tr v-else-if="!filteredMembers.length">
                <td colspan="3">
                  <div class="flex min-h-[380px] items-center justify-center">
                    <AppEmptyState
                      :title="searchQuery ? 'Tidak ada hasil pencarian' : 'Belum ada pengurus'"
                      :description="emptyMembersDescription"
                    >
                      <template #icon>
                        <Users />
                      </template>
                      <template v-if="!searchQuery" #action>
                        <AppButton @click="openCreate">
                          <Plus class="mr-2 h-4 w-4" />
                          Tambah Pengurus
                        </AppButton>
                      </template>
                    </AppEmptyState>
                  </div>
                </td>
              </tr>

              <!-- Rows -->
              <tr
                v-for="member in filteredMembers"
                :key="member.id"
                class="h-[72px] text-sm text-text-primary transition-colors hover:bg-bg-base"
              >
                <!-- Avatar + Nama + Jabatan -->
                <td class="px-6">
                  <div class="flex items-center gap-3.5">
                    <div class="relative h-10 w-10 shrink-0">
                      <img
                        v-if="getAvatarUrl(member.gambar)"
                        :src="getAvatarUrl(member.gambar)!"
                        :alt="member.nama"
                        class="h-10 w-10 rounded-full border border-border-soft object-cover"
                      >
                      <div
                        v-else
                        class="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 font-heading text-sm font-bold text-brand"
                      >
                        {{ getInitials(member.nama) }}
                      </div>
                    </div>
                    <div class="min-w-0">
                      <p class="truncate font-heading font-semibold text-text-primary">{{ member.nama }}</p>
                      <p class="mt-0.5 truncate font-body text-xs text-text-secondary">{{ member.jabatan }}</p>
                    </div>
                  </div>
                </td>

                <!-- Tanggal bergabung -->
                <td class="px-4 font-body text-sm text-text-secondary">
                  {{ formatDate(member.join_at) }}
                </td>

                <!-- Actions dropdown -->
                <td class="px-4">
                  <div class="org-dropdown-container relative flex items-center justify-center">
                    <button
                      type="button"
                      class="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-bg-base hover:text-text-primary focus:outline-none"
                      @click.stop="activeDropdown = activeDropdown === member.id ? null : member.id"
                    >
                      <MoreHorizontal class="h-4 w-4" />
                    </button>

                    <Transition
                      enter-active-class="transition duration-100 ease-out"
                      enter-from-class="scale-95 opacity-0"
                      enter-to-class="scale-100 opacity-100"
                      leave-active-class="transition duration-75 ease-in"
                      leave-from-class="scale-100 opacity-100"
                      leave-to-class="scale-95 opacity-0"
                    >
                      <div
                        v-if="activeDropdown === member.id"
                        class="absolute right-0 top-full z-20 mt-1 w-36 rounded-xl border border-border-soft bg-white p-1 shadow-lg"
                      >
                        <button
                          type="button"
                          class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left font-sans text-sm font-medium text-[#3b3b3b] transition-colors hover:bg-gray-100"
                          @click="openEdit(member)"
                        >
                          <Edit2 class="h-3.5 w-3.5 shrink-0" />
                          Edit
                        </button>
                        <div class="my-1 h-px bg-border-soft" />
                        <button
                          type="button"
                          class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left font-sans text-sm font-medium text-error transition-colors hover:bg-status-rejected-bg"
                          @click="openDelete(member)"
                        >
                          <Trash2 class="h-3.5 w-3.5 shrink-0" />
                          Hapus
                        </button>
                      </div>
                    </Transition>
                  </div>
                </td>
              </tr>

            </tbody>
          </table>
        </div>

        <!-- Footer count -->
        <div
          v-if="!isLoading && filteredMembers.length"
          class="shrink-0 border-t border-border-soft px-6 py-3"
        >
          <p class="font-body text-xs text-text-muted">
            Menampilkan <span class="font-semibold text-text-secondary">{{ filteredMembers.length }}</span> pengurus
          </p>
        </div>
      </section>
    </template>

    <!-- ── TAB: KELOLA SAMBUTAN ────────────────────────────────────────────── -->
    <template v-else-if="activeTab === 'sambutan'">
      <section class="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border-soft bg-bg-surface">
        <div class="min-h-0 flex-1 overflow-auto">
          <table class="w-full border-collapse text-left">
            <thead class="sticky top-0 z-10 bg-bg-base">
              <tr class="h-12 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                <th class="min-w-64 px-6">Pemberi Sambutan</th>
                <th class="min-w-96 px-4">Kata Sambutan</th>
                <th class="w-16 px-4" />
              </tr>
            </thead>
            <tbody class="divide-y divide-border-soft">
              <tr v-if="isLoading">
                <td colspan="3">
                  <div class="flex min-h-[380px] items-center justify-center">
                    <div class="flex items-center gap-3 font-heading text-sm font-medium text-text-secondary">
                      <span class="dot-wave" aria-hidden="true">
                        <span class="bg-current" />
                        <span class="bg-current" />
                        <span class="bg-current" />
                      </span>
                      Memuat data sambutan...
                    </div>
                  </div>
                </td>
              </tr>

              <tr v-else-if="!chairMembers.length">
                <td colspan="3">
                  <div class="flex min-h-[380px] items-center justify-center">
                    <AppEmptyState
                      title="Belum ada ketua yayasan yang terdaftar"
                      description="Tambahkan pengurus dengan jabatan Ketua Pembina, Ketua Pengawas, atau Ketua Umum terlebih dahulu."
                    >
                      <template #icon>
                        <FileText />
                      </template>
                      <template #action>
                        <AppButton @click="openCreateChair">
                          <Plus class="mr-2 h-4 w-4" />
                          Tambah Ketua Yayasan
                        </AppButton>
                      </template>
                    </AppEmptyState>
                  </div>
                </td>
              </tr>

              <tr v-else-if="!sambutanRows.length">
                <td colspan="3">
                  <div class="flex min-h-[380px] items-center justify-center">
                    <AppEmptyState
                      title="Belum ada kata sambutan"
                      description="Tambahkan kata sambutan dari salah satu ketua yayasan."
                    >
                      <template #icon>
                        <FileText />
                      </template>
                      <template #action>
                        <AppButton @click="openCreateSambutan">
                          <Plus class="mr-2 h-4 w-4" />
                          Tambah Sambutan
                        </AppButton>
                      </template>
                    </AppEmptyState>
                  </div>
                </td>
              </tr>

              <tr
                v-for="member in sambutanRows"
                :key="member.id"
                class="h-[72px] text-sm text-text-primary transition-colors hover:bg-bg-base"
              >
                <td class="px-6">
                  <div class="flex items-center gap-3.5">
                    <div class="relative h-10 w-10 shrink-0">
                      <img
                        v-if="getAvatarUrl(member.gambar)"
                        :src="getAvatarUrl(member.gambar)!"
                        :alt="member.nama"
                        class="h-10 w-10 rounded-full border border-border-soft object-cover"
                      >
                      <div
                        v-else
                        class="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 font-heading text-sm font-bold text-brand"
                      >
                        {{ getInitials(member.nama) }}
                      </div>
                    </div>
                    <div class="min-w-0">
                      <p class="truncate font-heading font-semibold text-text-primary">{{ member.nama }}</p>
                      <p class="mt-0.5 truncate font-body text-xs text-text-secondary">{{ member.jabatan }}</p>
                    </div>
                  </div>
                </td>

                <td class="px-4">
                  <p class="line-clamp-2 font-body text-sm leading-relaxed text-text-secondary">
                    {{ member.sambutan }}
                  </p>
                </td>

                <td class="px-4">
                  <div class="org-dropdown-container relative flex items-center justify-center">
                    <button
                      type="button"
                      class="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-bg-base hover:text-text-primary focus:outline-none"
                      @click.stop="activeDropdown = activeDropdown === member.id ? null : member.id"
                    >
                      <MoreHorizontal class="h-4 w-4" />
                    </button>

                    <Transition
                      enter-active-class="transition duration-100 ease-out"
                      enter-from-class="scale-95 opacity-0"
                      enter-to-class="scale-100 opacity-100"
                      leave-active-class="transition duration-75 ease-in"
                      leave-from-class="scale-100 opacity-100"
                      leave-to-class="scale-95 opacity-0"
                    >
                      <div
                        v-if="activeDropdown === member.id"
                        class="absolute right-0 top-full z-20 mt-1 w-36 rounded-xl border border-border-soft bg-white p-1 shadow-lg"
                      >
                        <button
                          type="button"
                          class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left font-sans text-sm font-medium text-[#3b3b3b] transition-colors hover:bg-gray-100"
                          @click="openEditSambutan(member)"
                        >
                          <Edit2 class="h-3.5 w-3.5 shrink-0" />
                          Edit
                        </button>
                      </div>
                    </Transition>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          v-if="!isLoading && sambutanRows.length"
          class="shrink-0 border-t border-border-soft px-6 py-3"
        >
          <p class="font-body text-xs text-text-muted">
            Menampilkan <span class="font-semibold text-text-secondary">{{ sambutanRows.length }}</span> sambutan aktif
          </p>
        </div>
      </section>
    </template>

    <!-- ── DRAWER: Tambah / Edit Pengurus ─────────────────────────────────── -->
    <YayasanPengurusDrawer
      v-model="isDrawerOpen"
      :mode="drawerMode"
      :item="editingMember"
      :saving="isSaving"
      @submit="handleSubmit"
    />

    <YayasanSambutanDrawer
      v-model="isSambutanDrawerOpen"
      :mode="sambutanDrawerMode"
      :chairs="chairMembers"
      :item="editingSambutanMember"
      :saving="isSavingSambutan"
      @submit="saveSambutan"
    />

    <!-- ── MODAL: Hapus Pengurus ──────────────────────────────────────────── -->
    <AppModal
      v-model="isDeleteModalOpen"
      title="Hapus Pengurus"
      width="max-w-md"
    >
      <div class="font-body text-sm text-text-secondary">
        <p>
          Apakah Anda yakin ingin menghapus
          <span class="font-semibold text-text-primary">{{ memberToDelete?.nama }}</span>
          dari daftar pengurus yayasan?
        </p>
        <p class="mt-2 text-error/80">Tindakan ini tidak dapat dibatalkan.</p>
      </div>
      <template #footer>
        <AppButton variant="ghost" :disabled="isDeleting" @click="isDeleteModalOpen = false">
          Batal
        </AppButton>
        <AppButton variant="danger" :loading="isDeleting" @click="confirmDelete">
          Hapus Pengurus
        </AppButton>
      </template>
    </AppModal>

  </div>
</template>

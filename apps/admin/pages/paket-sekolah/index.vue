<script setup lang="ts">
import { PackageOpen, Plus } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import ProgramPackageCard from '~/components/program-paket/ProgramPackageCard.vue'
import ProgramPackageRecent from '~/components/program-paket/ProgramPackageRecent.vue'
import ProgramPackageCreateDrawer from '~/components/program-paket/ProgramPackageCreateDrawer.vue'
import ProgramPackageDrawer from '~/components/program-paket/ProgramPackageDrawer.vue'
import { buildProgramPaketCreatePayload, buildProgramPaketUpdatePayload, createPaketKode, useAdminPaketSekolahService } from '~/services/useAdminPaketSekolahService'
import type { PaketSekolah } from '~/types/adminPaketSekolah'
import type { ProgramPackageCreatePayload } from '~/components/program-paket/ProgramPackageCreateDrawer.vue'

definePageMeta({
  layout: 'admin',
  middleware: ['admin-auth']
})

useHead({ title: 'Program Paket | MDS Cendekia' })

const isDetailDrawerOpen = ref(false)
const isCreateDrawerOpen = ref(false)
const programFormMode = ref<'create' | 'edit'>('create')
const drawerMode = ref<'detail' | 'registration'>('detail')
const selectedPackage = ref<PaketSekolah | null>(null)
const editingPackage = ref<PaketSekolah | null>(null)
const packages = ref<PaketSekolah[]>([])
const recentRefreshKey = ref(0)
const isLoadingPackages = ref(true)
const isCreatingPackage = ref(false)
const { addToast } = useToast()
const {
  createProgramPaket,
  updateProgramPaket,
  deleteProgramPaket,
  deleteProgramPaketGelombang,
  listProgramPaket
} = useAdminPaketSekolahService()

const isDeleteModalOpen = ref(false)
const packageToDelete = ref<PaketSekolah | null>(null)
const isDeletingPackage = ref(false)

const visiblePackages = computed(() => packages.value.filter(item => item.nama))

const getPackageIdentity = (item: PaketSekolah) => String(item.id || item.kode)

const preservePackageOrder = (nextPackages: PaketSekolah[]) => {
  const nextPackageMap = new Map(nextPackages.map(item => [getPackageIdentity(item), item]))
  const usedIdentities = new Set<string>()

  const orderedPackages = packages.value
    .map((item) => {
      const identity = getPackageIdentity(item)
      const nextPackage = nextPackageMap.get(identity)
      if (nextPackage) {
        usedIdentities.add(identity)
      }
      return nextPackage
    })
    .filter((item): item is PaketSekolah => Boolean(item))

  const newPackages = nextPackages.filter((item) => {
    const identity = getPackageIdentity(item)
    return !usedIdentities.has(identity)
  })

  return [...orderedPackages, ...newPackages]
}

const getApiErrorMessage = (err: any, fallback: string) => {
  return err?.data?.message || err?.response?._data?.message || err?.message || fallback
}

const fetchProgramPackages = async (showErrorToast = true, showLoading = true, keepCurrentOrder = false) => {
  if (showLoading) {
    isLoadingPackages.value = true
  }

  const { data, error } = await listProgramPaket()

  if (showLoading) {
    isLoadingPackages.value = false
  }

  if (error) {
    if (showErrorToast) {
      addToast(getApiErrorMessage(error, 'Data program paket belum bisa diambil dari server.'), 'error')
    }
    return
  }

  packages.value = keepCurrentOrder && packages.value.length > 0
    ? preservePackageOrder(data)
    : data
}

const openPackageDetail = (item: PaketSekolah) => {
  selectedPackage.value = item
  drawerMode.value = 'detail'
  isDetailDrawerOpen.value = true
}

const openRegistrationManager = (item: PaketSekolah) => {
  selectedPackage.value = item
  drawerMode.value = 'registration'
  isDetailDrawerOpen.value = true
}

const readCreatedPackage = (response: any) => response?.data || response?.result || response?.programPaket || response

const resolvePackageStatus = (payload: ProgramPackageCreatePayload, source?: any) => {
  if (typeof source?.status === 'boolean') return source.status ? 'aktif' : 'nonaktif'
  const statusText = String(source?.status || '').toLowerCase()
  if (statusText) return statusText === 'aktif' ? 'aktif' : 'nonaktif'
  return payload.status ? 'aktif' : 'nonaktif'
}

const createPackageFromPayload = (payload: ProgramPackageCreatePayload, source?: any): PaketSekolah => ({
  id: Number(source?.id) || Date.now(),
  kode: String(source?.kode || source?.slug || createPaketKode(source?.nama || payload.nama)),
  nama: String(source?.nama || payload.nama),
  jenjang: '',
  status: resolvePackageStatus(payload, source),
  kuota: 0,
  biayaPendaftaran: 0,
  deskripsi: String(source?.deskripsi || payload.deskripsi),
  totalPendaftar: 0,
  totalDiterima: 0,
  gelombangIds: Array.isArray(source?.gelombang)
    ? source.gelombang.map((gelombang: any) => Number(gelombang.id)).filter((id: number) => id > 0)
    : source?.gelombang?.id
      ? [Number(source.gelombang.id)]
      : [],
  gelombang: []
})

const openCreateDrawer = () => {
  programFormMode.value = 'create'
  editingPackage.value = null
  isCreateDrawerOpen.value = true
}

const saveCreatedPackage = async (payload: ProgramPackageCreatePayload) => {
  if (isCreatingPackage.value) return

  isCreatingPackage.value = true

  if (programFormMode.value === 'edit' && editingPackage.value) {
    const targetPackage = editingPackage.value
    const updatePayload = buildProgramPaketUpdatePayload(payload)
    const { data, error } = await updateProgramPaket(targetPackage.id, updatePayload)

    if (error) {
      addToast(getApiErrorMessage(error, 'Program paket belum berhasil diperbarui.'), 'error')
      isCreatingPackage.value = false
      return
    }

    packages.value = packages.value.map(item => item.id === targetPackage.id
      ? {
          ...item,
          kode: createPaketKode(payload.nama),
          nama: payload.nama,
          deskripsi: payload.deskripsi,
          status: payload.status ? 'aktif' : 'nonaktif'
        }
      : item)
    isCreateDrawerOpen.value = false
    editingPackage.value = null
    programFormMode.value = 'create'
    isCreatingPackage.value = false
    addToast(data?.message || 'Program paket berhasil diperbarui.', 'success')
    await fetchProgramPackages(false, false, true)
    return
  }

  const createPayload = buildProgramPaketCreatePayload(payload)
  const { data, error } = await createProgramPaket(createPayload)

  if (error) {
    addToast(getApiErrorMessage(error, 'Program paket belum berhasil ditambahkan.'), 'error')
    isCreatingPackage.value = false
    return
  }

  const createdPackage = createPackageFromPayload(payload, readCreatedPackage(data))

  packages.value = [createdPackage, ...packages.value]
  isCreateDrawerOpen.value = false
  isCreatingPackage.value = false
  addToast(data?.message || 'Program paket berhasil ditambahkan.', 'success')
  await fetchProgramPackages(false, false, true)
}

const handleEditPackage = (item: PaketSekolah) => {
  programFormMode.value = 'edit'
  editingPackage.value = item
  isCreateDrawerOpen.value = true
}

const handleDeletePackage = (item: PaketSekolah) => {
  packageToDelete.value = item
  isDeleteModalOpen.value = true
}

const refreshRecentRegistrations = () => {
  recentRefreshKey.value += 1
  fetchProgramPackages(false, false, true)
}

const confirmDeletePackage = async () => {
  if (!packageToDelete.value) return
  isDeletingPackage.value = true

  for (const gelombangId of packageToDelete.value.gelombangIds) {
    const { error: deleteGelombangError } = await deleteProgramPaketGelombang(gelombangId)

    if (deleteGelombangError) {
      isDeletingPackage.value = false
      addToast(getApiErrorMessage(deleteGelombangError, 'Gagal menghapus gelombang program paket.'), 'error')
      return
    }
  }

  const { data, error } = await deleteProgramPaket(packageToDelete.value.id)

  isDeletingPackage.value = false

  if (error) {
    addToast(getApiErrorMessage(error, 'Gagal menghapus program paket.'), 'error')
    return
  }

  packages.value = packages.value.filter(p => p.id !== packageToDelete.value?.id)
  isDeleteModalOpen.value = false
  packageToDelete.value = null
  addToast(data?.message || 'Program paket berhasil dihapus', 'success')
}

onMounted(() => {
  fetchProgramPackages()
})
</script>

<template>
  <div class="flex h-full min-h-0 flex-col">
    <!-- Header / Action Section -->
    <div class="admin-program-action mb-4 flex justify-end 2xl:mb-6">
      <AppButton variant="primary" @click="openCreateDrawer">
        Tambah Program
      </AppButton>
    </div>

    <!-- Main Content Split Layout -->
    <div class="admin-program-layout flex min-h-0 flex-1 gap-4">
      <!-- Left Side: Cards -->
      <section class="flex min-w-0 flex-1 flex-col">
        <div
          v-if="isLoadingPackages"
          class="admin-program-empty flex min-h-[420px] items-center justify-center rounded-[27px] border border-border-soft bg-bg-surface shadow-sm"
        >
          <div class="flex items-center gap-3 font-heading text-sm font-medium text-text-secondary">
            <span class="dot-wave" aria-hidden="true">
              <span class="bg-current"></span>
              <span class="bg-current"></span>
              <span class="bg-current"></span>
            </span>
            Memuat program paket...
          </div>
        </div>

        <div
          v-else-if="visiblePackages.length === 0"
          class="admin-program-empty flex min-h-[420px] items-center justify-center rounded-[27px] border border-border-soft bg-bg-surface shadow-sm"
        >
          <AppEmptyState
            title="Belum ada program paket"
            description="Tambahkan program paket sekolah agar bisa dikelola dari panel admin."
          >
            <template #icon>
              <PackageOpen />
            </template>
            <template #action>
              <AppButton @click="openCreateDrawer">
                <Plus class="mr-2 h-4 w-4" />
                Tambah Data
              </AppButton>
            </template>
          </AppEmptyState>
        </div>

        <div
          v-else
          class="admin-program-card-grid grid grid-cols-3 gap-4"
        >
          <ProgramPackageCard
            v-for="item in visiblePackages"
            :key="item.id || item.kode"
            :item="item"
            @detail="openPackageDetail"
            @manage-registration="openRegistrationManager"
            @edit="handleEditPackage"
            @delete="handleDeletePackage"
          />
        </div>
      </section>

      <!-- Right Side: Recent Timeline -->
      <section class="admin-program-recent w-[500px] shrink-0">
        <ProgramPackageRecent :refresh-key="recentRefreshKey" />
      </section>
    </div>

    <ProgramPackageCreateDrawer
      v-model="isCreateDrawerOpen"
      :mode="programFormMode"
      :item="editingPackage"
      :saving="isCreatingPackage"
      @submit="saveCreatedPackage"
    />

    <ProgramPackageDrawer
      v-model="isDetailDrawerOpen"
      :item="selectedPackage"
      :mode="drawerMode"
      @saved="refreshRecentRegistrations"
    />

    <AppModal
      v-model="isDeleteModalOpen"
      title="Hapus Program Paket"
      width="max-w-md"
    >
      <div class="text-text-secondary">
        <p>Apakah Anda yakin ingin menghapus program paket <span class="font-semibold text-text-primary">{{ packageToDelete?.nama }}</span>?</p>
        <p class="mt-2 text-sm text-error/80">Tindakan ini tidak dapat dibatalkan dan semua data pendaftar terkait mungkin akan ikut terhapus.</p>
      </div>
      <template #footer>
        <AppButton variant="ghost" @click="isDeleteModalOpen = false" :disabled="isDeletingPackage">Batal</AppButton>
        <AppButton variant="danger" :loading="isDeletingPackage" @click="confirmDeletePackage">Hapus Program</AppButton>
      </template>
    </AppModal>
  </div>
</template>

<style scoped>
@media (max-width: 1439px) {
  .admin-program-layout {
    gap: 14px;
  }

  .admin-program-recent {
    width: 380px;
  }

  .admin-program-card-grid {
    gap: 14px;
  }

  .admin-program-empty {
    min-height: 360px;
    border-radius: 22px;
  }
}

@media (max-height: 820px) {
  .admin-program-action {
    margin-bottom: 12px;
  }

  .admin-program-layout {
    gap: 12px;
  }

  .admin-program-recent {
    width: 340px;
  }

  .admin-program-card-grid {
    gap: 12px;
  }

  .admin-program-empty {
    min-height: 300px;
    border-radius: 20px;
  }
}
</style>

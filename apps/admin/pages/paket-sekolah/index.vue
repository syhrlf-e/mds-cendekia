<script setup lang="ts">
import { PackageOpen, Plus } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import ProgramPackageCard from '~/components/program-paket/ProgramPackageCard.vue'
import ProgramPackageRecent from '~/components/program-paket/ProgramPackageRecent.vue'
import ProgramPackageCreateDrawer from '~/components/program-paket/ProgramPackageCreateDrawer.vue'
import ProgramPackageDrawer from '~/components/program-paket/ProgramPackageDrawer.vue'
import { buildProgramPaketCreatePayload, createPaketKode, useAdminPaketSekolahService } from '~/services/useAdminPaketSekolahService'
import type { PaketSekolah } from '~/types/adminPaketSekolah'
import type { ProgramPackageCreatePayload } from '~/components/program-paket/ProgramPackageCreateDrawer.vue'

definePageMeta({
  layout: 'admin',
  middleware: ['admin-auth']
})

useHead({ title: 'Program Paket | MDS Cendekia' })

const isDetailDrawerOpen = ref(false)
const isCreateDrawerOpen = ref(false)
const drawerMode = ref<'detail' | 'registration'>('detail')
const selectedPackage = ref<PaketSekolah | null>(null)
const packages = ref<PaketSekolah[]>([])
const isLoadingPackages = ref(true)
const isCreatingPackage = ref(false)
const { addToast } = useToast()
const {
  createProgramPaket,
  deleteProgramPaket,
  deleteProgramPaketGelombang,
  listProgramPaket
} = useAdminPaketSekolahService()

const isDeleteModalOpen = ref(false)
const packageToDelete = ref<PaketSekolah | null>(null)
const isDeletingPackage = ref(false)

const visiblePackages = computed(() => packages.value.filter(item => item.nama))

const getApiErrorMessage = (err: any, fallback: string) => {
  return err?.data?.message || err?.response?._data?.message || err?.message || fallback
}

const fetchProgramPackages = async (showErrorToast = true, showLoading = true) => {
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

  packages.value = data
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

const createPackageFromPayload = (payload: ProgramPackageCreatePayload, source?: any): PaketSekolah => ({
  id: Number(source?.id) || Date.now(),
  kode: String(source?.kode || source?.slug || createPaketKode(source?.nama || payload.nama)),
  nama: String(source?.nama || payload.nama),
  jenjang: '',
  status: source?.status === true || String(source?.status || '').toLowerCase() === 'aktif' ? 'aktif' : 'nonaktif',
  kuota: 0,
  biayaPendaftaran: 0,
  deskripsi: String(source?.deskripsi || payload.deskripsi),
  totalPendaftar: 0,
  totalDiterima: 0,
  gelombangIds: Array.isArray(source?.gelombang)
    ? source.gelombang.map((gelombang: any) => Number(gelombang.id)).filter((id: number) => id > 0)
    : source?.gelombang?.id
      ? [Number(source.gelombang.id)]
      : []
})

const openCreateDrawer = () => {
  isCreateDrawerOpen.value = true
}

const saveCreatedPackage = async (payload: ProgramPackageCreatePayload) => {
  if (isCreatingPackage.value) return

  isCreatingPackage.value = true

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
  await fetchProgramPackages(false, false)
}

const handleEditPackage = (item: PaketSekolah) => {
  addToast('Fitur edit program paket sedang dikembangkan.', 'warning')
}

const handleDeletePackage = (item: PaketSekolah) => {
  packageToDelete.value = item
  isDeleteModalOpen.value = true
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
    <div class="mb-6 flex justify-end">
      <AppButton variant="primary" @click="openCreateDrawer">
        Tambah Program
      </AppButton>
    </div>

    <!-- Main Content Split Layout -->
    <div class="flex min-h-0 flex-col gap-4 xl:flex-row">
      <!-- Left Side: Cards -->
      <section class="flex min-w-0 flex-1 flex-col">
        <div
          v-if="isLoadingPackages"
          class="flex min-h-[420px] items-center justify-center rounded-[27px] border border-border-soft bg-bg-surface shadow-sm"
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
          class="flex min-h-[420px] items-center justify-center rounded-[27px] border border-border-soft bg-bg-surface shadow-sm"
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
          class="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4"
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
      <section class="w-full shrink-0 xl:w-auto">
        <ProgramPackageRecent />
      </section>
    </div>

    <ProgramPackageCreateDrawer
      v-model="isCreateDrawerOpen"
      :saving="isCreatingPackage"
      @submit="saveCreatedPackage"
    />

    <ProgramPackageDrawer
      v-model="isDetailDrawerOpen"
      :item="selectedPackage"
      :mode="drawerMode"
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

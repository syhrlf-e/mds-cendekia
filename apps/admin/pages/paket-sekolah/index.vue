<script setup lang="ts">
import { PackageOpen, Plus } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import ProgramPackageCard from '~/components/program-paket/ProgramPackageCard.vue'
import ProgramPackageDrawer from '~/components/program-paket/ProgramPackageDrawer.vue'
import type { PaketSekolah } from '~/types/adminPaketSekolah'

definePageMeta({
  layout: 'admin',
  middleware: ['admin-auth']
})

useHead({ title: 'Program Paket | MDS Cendekia' })

const isDetailDrawerOpen = ref(false)
const selectedPackage = ref<PaketSekolah | null>(null)
const packages = ref<PaketSekolah[]>([])

const visiblePackages = computed(() => packages.value.filter(item => item.nama))

const openPackageDetail = (item: PaketSekolah) => {
  selectedPackage.value = item
  isDetailDrawerOpen.value = true
}

const createDraftPackage = (): PaketSekolah => ({
  id: 0,
  kode: '',
  nama: 'Program Paket C',
  jenjang: 'Setara SMA',
  status: 'nonaktif',
  kuota: 0,
  biayaPendaftaran: 0,
  deskripsi: 'Program Paket C adalah pendidikan kesetaraan setara SMA/MA yang dirancang untuk membantu peserta didik menyelesaikan jenjang pendidikan menengah secara fleksibel, terarah, dan tetap mendapatkan ijazah resmi yang diakui.',
  totalPendaftar: 0,
  totalDiterima: 0
})

const openCreateDrawer = () => {
  selectedPackage.value = createDraftPackage()
  isDetailDrawerOpen.value = true
}
</script>

<template>
  <div class="flex h-full min-h-0 flex-col">
    <section
      v-if="visiblePackages.length === 0"
      class="flex min-h-[420px] items-center justify-center rounded-[27px] bg-bg-surface"
    >
      <AppEmptyState
        title="Belum ada program paket"
        description="Tambahkan program paket sekolah agar bisa dikelola dari panel admin."
      >
        <template #icon>
          <PackageOpen />
        </template>
        <template #action>
          <AppButton
            @click="openCreateDrawer"
          >
            <Plus class="mr-2 h-4 w-4" />
            Tambah Data
          </AppButton>
        </template>
      </AppEmptyState>
    </section>

    <section
      v-else
      class="grid grid-cols-[repeat(auto-fill,minmax(420px,510px))] gap-6"
    >
      <ProgramPackageCard
        v-for="item in visiblePackages"
        :key="item.id || item.kode"
        :item="item"
        @detail="openPackageDetail"
      />
    </section>

    <ProgramPackageDrawer
      v-model="isDetailDrawerOpen"
      :item="selectedPackage"
    />
  </div>
</template>

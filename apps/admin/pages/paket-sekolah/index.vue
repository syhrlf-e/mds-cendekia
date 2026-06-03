<script setup lang="ts">
import {
  Edit3,
  PackageOpen,
  Plus,
  Power,
  Search,
  XCircle
} from 'lucide-vue-next'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { buildPaketPayload, buildPaketStatusPayload, useAdminPaketSekolahService } from '~/services/useAdminPaketSekolahService'
import type { PaketSekolah, PaketStatus } from '~/types/adminPaketSekolah'

definePageMeta({
  layout: 'admin',
  middleware: ['admin-auth']
})

useHead({ title: 'Paket Sekolah | MDS Cendekia' })

const { listPackages, savePackage, updatePackageStatus } = useAdminPaketSekolahService()
const { addToast } = useToast()
const isLoading = ref(true)
const isSaving = ref(false)
const loadError = ref('')
const packages = ref<PaketSekolah[]>([])
const searchQuery = ref('')
const filterStatus = ref<PaketStatus | ''>('')
const isDrawerOpen = ref(false)
const editingPackage = ref<PaketSekolah | null>(null)

const form = reactive({
  id: 0,
  nama: '',
  jenjang: '',
  status: 'aktif' as PaketStatus,
  kuota: '',
  biayaPendaftaran: '',
  deskripsi: ''
})

const statusOptions = [
  { label: 'Semua Status', value: '' },
  { label: 'Aktif', value: 'aktif' },
  { label: 'Nonaktif', value: 'nonaktif' }
]

const jenjangOptions = [
  { label: 'Setara SD', value: 'Setara SD' },
  { label: 'Setara SMP', value: 'Setara SMP' },
  { label: 'Setara SMA', value: 'Setara SMA' }
]

const loadPackages = async () => {
  isLoading.value = true
  loadError.value = ''

  const { data, error } = await listPackages()

  packages.value = data
  loadError.value = error ? 'Data paket sekolah belum bisa diambil dari server.' : ''
  isLoading.value = false
}

const filteredPackages = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return packages.value.filter((item) => {
    const matchesSearch = !query || [
      item.nama,
      item.jenjang,
      item.deskripsi
    ].some(value => value.toLowerCase().includes(query))
    const matchesStatus = !filterStatus.value || item.status === filterStatus.value

    return matchesSearch && matchesStatus
  })
})

const stats = computed(() => ({
  total: packages.value.length,
  active: packages.value.filter(item => item.status === 'aktif').length,
  quota: packages.value.reduce((total, item) => total + item.kuota, 0),
  applicants: packages.value.reduce((total, item) => total + item.totalPendaftar, 0)
}))

const resetForm = () => {
  editingPackage.value = null
  form.id = 0
  form.nama = ''
  form.jenjang = ''
  form.status = 'aktif'
  form.kuota = ''
  form.biayaPendaftaran = ''
  form.deskripsi = ''
}

const openCreate = () => {
  resetForm()
  isDrawerOpen.value = true
}

const openEdit = (item: PaketSekolah) => {
  editingPackage.value = item
  form.id = item.id
  form.nama = item.nama
  form.jenjang = item.jenjang
  form.status = item.status
  form.kuota = String(item.kuota)
  form.biayaPendaftaran = String(item.biayaPendaftaran)
  form.deskripsi = item.deskripsi
  isDrawerOpen.value = true
}

const closeDrawer = () => {
  isDrawerOpen.value = false
}

const validateForm = () => {
  if (!form.nama.trim()) return 'Nama paket wajib diisi.'
  if (!form.jenjang.trim()) return 'Jenjang wajib dipilih.'
  if (Number(form.kuota || 0) < 0) return 'Kuota tidak boleh kurang dari 0.'
  if (Number(form.biayaPendaftaran || 0) < 0) return 'Biaya tidak boleh kurang dari 0.'
  return ''
}

const handleSave = async () => {
  const errorMessage = validateForm()
  if (errorMessage) {
    addToast(errorMessage, 'error')
    return
  }

  isSaving.value = true
  const payload = buildPaketPayload(form)
  const { data, error } = await savePackage(payload, Boolean(editingPackage.value))
  isSaving.value = false

  if (error || data?.status === false || data?.success === false) {
    addToast(error?.data?.message || error?.response?._data?.message || data?.message || 'Paket sekolah belum berhasil disimpan.', 'error')
    return
  }

  closeDrawer()
  await loadPackages()
  addToast(data?.message || 'Paket sekolah berhasil disimpan.', 'success')
}

const toggleStatus = async (item: PaketSekolah) => {
  const nextStatus: PaketStatus = item.status === 'aktif' ? 'nonaktif' : 'aktif'
  isSaving.value = true
  const { data, error } = await updatePackageStatus(buildPaketStatusPayload(item, nextStatus))
  isSaving.value = false

  if (error || data?.status === false || data?.success === false) {
    addToast(error?.data?.message || error?.response?._data?.message || data?.message || 'Status paket belum berhasil diubah.', 'error')
    return
  }

  await loadPackages()
  addToast(nextStatus === 'aktif' ? 'Paket berhasil diaktifkan.' : 'Paket berhasil dinonaktifkan.', 'success')
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(value)
}

watch(isDrawerOpen, (isOpen) => {
  if (!isOpen) resetForm()
})

onMounted(loadPackages)
</script>

<template>
  <div class="flex h-full min-h-0 flex-col gap-4">
    <section class="grid shrink-0 grid-cols-4 gap-3">
      <article class="rounded-2xl border border-border bg-bg-surface p-4">
        <p class="text-xs font-medium uppercase tracking-wider text-text-muted">Total Paket</p>
        <p class="mt-2 text-[28px] font-semibold leading-none text-text-primary">{{ isLoading ? '...' : stats.total }}</p>
        <p class="mt-2 text-xs text-text-secondary">Master data program</p>
      </article>
      <article class="rounded-2xl border border-border bg-bg-surface p-4">
        <p class="text-xs font-medium uppercase tracking-wider text-text-muted">Paket Aktif</p>
        <p class="mt-2 text-[28px] font-semibold leading-none text-text-primary">{{ isLoading ? '...' : stats.active }}</p>
        <p class="mt-2 text-xs text-text-secondary">Tampil di pendaftaran</p>
      </article>
      <article class="rounded-2xl border border-border bg-bg-surface p-4">
        <p class="text-xs font-medium uppercase tracking-wider text-text-muted">Total Kuota</p>
        <p class="mt-2 text-[28px] font-semibold leading-none text-text-primary">{{ isLoading ? '...' : stats.quota }}</p>
        <p class="mt-2 text-xs text-text-secondary">Akumulasi paket</p>
      </article>
      <article class="rounded-2xl border border-border bg-bg-surface p-4">
        <p class="text-xs font-medium uppercase tracking-wider text-text-muted">Pendaftar</p>
        <p class="mt-2 text-[28px] font-semibold leading-none text-text-primary">{{ isLoading ? '...' : stats.applicants }}</p>
        <p class="mt-2 text-xs text-text-secondary">Berdasarkan paket</p>
      </article>
    </section>

    <section
      v-if="loadError && !isLoading"
      class="rounded-2xl border border-status-pending-text/20 bg-status-pending-bg px-5 py-4 text-sm text-status-pending-text"
    >
      {{ loadError }}
    </section>

    <section class="shrink-0 rounded-2xl border border-border bg-bg-surface p-4">
      <div class="grid grid-cols-[minmax(360px,1fr)_200px_auto] gap-4">
        <div class="relative">
          <Search class="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-text-muted" />
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Cari paket, jenjang, atau deskripsi..."
            class="h-11 w-full rounded-xl border border-border-soft bg-bg-base py-2.5 pl-10 pr-4 text-sm leading-none text-text-primary outline-none transition-colors placeholder:text-text-muted hover:bg-bg-surface focus:border-brand focus:bg-bg-surface focus:ring-[3px] focus:ring-brand/12"
          >
        </div>

        <div class="relative">
          <AppSelect
            v-model="filterStatus"
            :options="statusOptions"
          />
        </div>

        <button
          type="button"
          class="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-brand px-5 text-sm font-medium text-white transition-colors hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-brand/20"
          @click="openCreate"
        >
          <Plus class="h-4 w-4" />
          Tambah Paket
        </button>
      </div>
    </section>

    <section class="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-bg-surface">
      <div class="min-h-0 flex-1 overflow-auto">
        <table class="w-full border-collapse text-left">
          <thead class="sticky top-0 z-10 bg-bg-base">
            <tr class="h-12 text-xs font-semibold uppercase tracking-wider text-text-secondary">
              <th class="w-14 px-4">No</th>
              <th class="min-w-48 px-4">Paket</th>
              <th class="w-40 px-4">Jenjang</th>
              <th class="w-28 px-4">Kuota</th>
              <th class="w-32 px-4">Pendaftar</th>
              <th class="w-32 px-4">Diterima</th>
              <th class="w-44 px-4">Biaya</th>
              <th class="w-32 px-4">Status</th>
              <th class="w-44 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border-soft">
            <tr v-if="isLoading">
              <td colspan="9">
                <div class="flex min-h-[420px] items-center justify-center">
                  <AppEmptyState
                    title="Memuat paket sekolah"
                    description="Sebentar, data paket sedang diambil."
                  >
                    <template #icon>
                      <PackageOpen />
                    </template>
                  </AppEmptyState>
                </div>
              </td>
            </tr>

            <tr
              v-for="(item, index) in isLoading ? [] : filteredPackages"
              :key="item.id"
              class="h-[64px] text-sm text-text-primary transition-colors hover:bg-bg-base"
            >
              <td class="px-4 text-text-secondary">{{ index + 1 }}</td>
              <td class="px-4">
                <p class="text-text-primary">{{ item.nama }}</p>
                <p class="mt-0.5 truncate text-xs text-text-secondary">{{ item.deskripsi }}</p>
              </td>
              <td class="px-4 text-text-primary">{{ item.jenjang }}</td>
              <td class="px-4 text-text-primary">{{ item.kuota }}</td>
              <td class="px-4 text-text-primary">{{ item.totalPendaftar }}</td>
              <td class="px-4 text-text-primary">{{ item.totalDiterima }}</td>
              <td class="px-4 text-text-secondary">{{ item.biayaPendaftaran ? formatCurrency(item.biayaPendaftaran) : '-' }}</td>
              <td class="px-4">
                <span
                  class="inline-flex rounded-full px-3 py-0.5 text-xs font-normal"
                  :class="item.status === 'aktif' ? 'bg-status-approved-bg text-status-approved-text' : 'bg-bg-base text-text-secondary'"
                >
                  {{ item.status === 'aktif' ? 'Aktif' : 'Nonaktif' }}
                </span>
              </td>
              <td class="px-4">
                <div class="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border-soft bg-bg-base text-text-secondary transition-colors hover:bg-bg-surface hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/20"
                    aria-label="Edit paket"
                    @click="openEdit(item)"
                  >
                    <Edit3 class="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border-soft bg-bg-base text-text-secondary transition-colors hover:bg-bg-surface hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/20"
                    :aria-label="item.status === 'aktif' ? 'Nonaktifkan paket' : 'Aktifkan paket'"
                    :disabled="isSaving"
                    @click="toggleStatus(item)"
                  >
                    <Power class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="!isLoading && filteredPackages.length === 0">
              <td colspan="9">
                <div class="flex min-h-[420px] items-center justify-center">
                  <AppEmptyState
                    title="Paket sekolah tidak ditemukan"
                    description="Coba ubah kata kunci atau filter status."
                  >
                    <template #icon>
                      <XCircle />
                    </template>
                  </AppEmptyState>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <Teleport to="body">
      <Transition
        enter-active-class="transition-[opacity,backdrop-filter] duration-300 ease-out [&>aside]:transition-transform [&>aside]:duration-300 [&>aside]:ease-out"
        enter-from-class="opacity-0 backdrop-blur-none [&>aside]:translate-x-full"
        enter-to-class="opacity-100 backdrop-blur-[14px] [&>aside]:translate-x-0"
        leave-active-class="transition-[opacity,backdrop-filter] duration-300 ease-in [&>aside]:transition-transform [&>aside]:duration-300 [&>aside]:ease-in"
        leave-from-class="opacity-100 backdrop-blur-[14px] [&>aside]:translate-x-0"
        leave-to-class="opacity-0 backdrop-blur-none [&>aside]:translate-x-full"
      >
        <div
          v-if="isDrawerOpen"
          class="fixed inset-0 z-50 bg-text-primary/20 backdrop-blur-[14px]"
          @click.self="closeDrawer"
        >
          <aside class="ml-auto flex h-full w-[min(680px,calc(100%-320px))] flex-col overflow-hidden border-l-2 border-border bg-bg-base shadow-[rgba(0,0,0,0.08)_-12px_0_32px_0]">
            <header class="shrink-0 border-b border-border bg-bg-surface px-8 py-5">
              <div class="flex items-start justify-between gap-5">
                <div>
                  <h2 class="font-heading text-[22px] font-bold leading-[1.18] tracking-[-0.3px] text-text-primary">
                    {{ editingPackage ? 'Edit Paket Sekolah' : 'Tambah Paket Sekolah' }}
                  </h2>
                  <p class="mt-1 text-sm text-text-secondary">
                    Paket aktif akan tampil sebagai pilihan pada pendaftaran PPDB.
                  </p>
                </div>
                <button
                  type="button"
                  class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-bg-base hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/20"
                  aria-label="Tutup"
                  @click="closeDrawer"
                >
                  <XCircle class="h-5 w-5" />
                </button>
              </div>
            </header>

            <main class="min-h-0 grow overflow-y-auto px-8 py-6">
              <div class="grid grid-cols-2 gap-5">
                <AppInput v-model="form.nama" label="Nama Paket" required placeholder="Contoh: Paket C" class="col-span-2" />

                <AppSelect
                  v-model="form.jenjang"
                  label="Jenjang"
                  required
                  :options="jenjangOptions"
                  placeholder="Pilih jenjang"
                />

                <div class="flex w-full flex-col gap-1.5">
                  <label class="text-sm font-medium text-text-primary">Status</label>
                  <div class="grid h-11 grid-cols-2 gap-2">
                    <button
                      type="button"
                      class="rounded-lg border px-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand/30"
                      :class="form.status === 'aktif' ? 'border-brand bg-brand text-white' : 'border-border bg-bg-surface text-text-primary hover:bg-bg-base'"
                      @click="form.status = 'aktif'"
                    >
                      Aktif
                    </button>
                    <button
                      type="button"
                      class="rounded-lg border px-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand/30"
                      :class="form.status === 'nonaktif' ? 'border-brand bg-brand text-white' : 'border-border bg-bg-surface text-text-primary hover:bg-bg-base'"
                      @click="form.status = 'nonaktif'"
                    >
                      Nonaktif
                    </button>
                  </div>
                </div>

                <AppInput v-model="form.kuota" label="Kuota" inputmode="numeric" placeholder="120" />
                <AppInput v-model="form.biayaPendaftaran" label="Biaya Pendaftaran" inputmode="numeric" placeholder="150000" />

                <AppTextarea
                  v-model="form.deskripsi"
                  label="Deskripsi"
                  class="col-span-2"
                  :rows="4"
                  :maxlength="180"
                  placeholder="Deskripsi singkat paket sekolah"
                />
              </div>
            </main>

            <footer class="shrink-0 border-t border-border bg-bg-surface px-8 py-4">
              <div class="flex items-center justify-end gap-3">
                <AppButton variant="ghost" :disabled="isSaving" @click="closeDrawer">Batal</AppButton>
                <AppButton variant="primary" :loading="isSaving" :disabled="isSaving" @click="handleSave">
                  Simpan Paket
                </AppButton>
              </div>
            </footer>
          </aside>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

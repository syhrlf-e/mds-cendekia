<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { SearchX } from 'lucide-vue-next'

useHead({ title: 'Cek Status | PPDB MDS Cendekia' })

type CheckState = 'initial' | 'loading' | 'success' | 'not-found'
type StatusResult = {
  nomor: string
  tanggal: string
  nama: string
  ttl: string
  jenisKelamin: string
  sekolah: string
  email: string
  noHp: string
  status: 'pending' | 'approved' | 'rejected'
  alasanPenolakan: string
}

const router = useRouter()
const nomorPendaftaran = ref('')
const state = ref<CheckState>('initial')
const resultData = ref<StatusResult | null>(null)
const isMobile = ref(false)

const checkMobile = () => {
  isMobile.value = window.innerWidth < 1024
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

const hasResult = computed(() => state.value === 'success' || state.value === 'not-found')
const isChecking = computed(() => state.value === 'loading')
const rightButtonLabel = computed(() => hasResult.value ? 'Cek Pendaftaran Lainnya' : 'Cek Sekarang')

const handleCheck = async () => {
  if (hasResult.value) {
    checkAnother()
    return
  }

  if (!nomorPendaftaran.value.trim()) return

  state.value = 'loading'
  resultData.value = null

  await new Promise(resolve => setTimeout(resolve, 900))

  const normalizedNumber = nomorPendaftaran.value.trim().toUpperCase()
  const lastDigit = Number(normalizedNumber.match(/\d$/)?.[0] ?? 0)

  if (normalizedNumber.includes('404') || lastDigit === 9) {
    state.value = 'not-found'
    return
  }

  let status: StatusResult['status'] = 'pending'
  let alasanPenolakan = ''

  if (lastDigit % 3 === 1) {
    status = 'approved'
  } else if (lastDigit % 3 === 2) {
    status = 'rejected'
    alasanPenolakan = 'Berkas tidak lengkap dan nilai rata-rata rapor di bawah standar.'
  }

  resultData.value = {
    nomor: normalizedNumber,
    tanggal: '17/05/2026',
    nama: 'Syahrul Efendi',
    ttl: 'Jakarta, 12 Januari 2011',
    jenisKelamin: 'Laki-laki',
    sekolah: 'SMP Negeri 1 Jakarta',
    email: 'syahrul@example.com',
    noHp: '081234567890',
    status,
    alasanPenolakan
  }

  state.value = 'success'
}

const checkAnother = () => {
  state.value = 'initial'
  resultData.value = null
  nomorPendaftaran.value = ''
}
</script>

<template>
  <div class="min-h-screen bg-bg-base px-4 py-8 md:py-12">
    <div class="mx-auto flex min-h-[calc(100vh-96px)] w-full max-w-[640px] flex-col justify-center">
      <div class="mb-8 text-center">
        <h1 class="mb-3 font-heading text-3xl font-semibold text-text-primary">
          Cek Status Pendaftaran
        </h1>
        <p class="text-text-secondary">
          Masukkan nomor pendaftaran untuk melihat hasil seleksi.
        </p>
      </div>

      <form class="flex flex-col gap-5" @submit.prevent="handleCheck">
        <AppInput
          v-model="nomorPendaftaran"
          label="Nomor Pendaftaran"
          placeholder="Contoh: MDS-2025-0001"
          required
          :disabled="isChecking || hasResult"
        />

        <div
          class="hidden lg:grid transition-all duration-300 ease-out"
          :class="state !== 'initial' ? 'opacity-100 grid-rows-[1fr]' : 'opacity-0 grid-rows-[0fr]'"
        >
          <div class="overflow-hidden">
            <div v-if="isChecking" class="flex justify-center rounded-2xl border border-border bg-bg-surface p-8">
              <AppLoadingDotWave />
            </div>

            <div v-else-if="state === 'success' && resultData" class="rounded-2xl border border-border bg-bg-surface p-6">
              <div class="mb-4 flex items-center justify-between">
                <AppBadge :status="resultData.status" />
              </div>

              <p class="mb-6 text-[17px] text-text-secondary">
                Status pendaftaran kamu: {{ resultData.status === 'pending' ? 'Menunggu Persetujuan' : resultData.status === 'approved' ? 'Pendaftaran Diterima' : 'Pendaftaran Ditolak' }}
              </p>

              <div v-if="resultData.status === 'rejected'" class="mb-6 rounded-xl border border-red-100 bg-red-50 p-4">
                <p class="mb-1 text-sm font-semibold text-error">Alasan Penolakan</p>
                <p class="text-sm text-text-primary">{{ resultData.alasanPenolakan }}</p>
              </div>

              <div class="space-y-6">
                <section>
                  <h2 class="mb-3 border-b border-border pb-2 text-xs font-semibold uppercase tracking-wider text-text-secondary">Informasi Pendaftaran</h2>
                  <div class="grid grid-cols-3 gap-y-2 text-sm">
                    <span class="text-text-secondary">Nomor Pendaftaran</span>
                    <span class="col-span-2 font-medium text-text-primary">{{ resultData.nomor }}</span>
                    <span class="text-text-secondary">Tanggal Daftar</span>
                    <span class="col-span-2 font-medium text-text-primary">{{ resultData.tanggal }}</span>
                  </div>
                </section>

                <section>
                  <h2 class="mb-3 border-b border-border pb-2 text-xs font-semibold uppercase tracking-wider text-text-secondary">Identitas Calon Siswa</h2>
                  <div class="grid grid-cols-3 gap-y-2 text-sm">
                    <span class="text-text-secondary">Nama Lengkap</span>
                    <span class="col-span-2 font-medium text-text-primary">{{ resultData.nama }}</span>
                    <span class="text-text-secondary">Tempat, Tgl Lahir</span>
                    <span class="col-span-2 font-medium text-text-primary">{{ resultData.ttl }}</span>
                    <span class="text-text-secondary">Jenis Kelamin</span>
                    <span class="col-span-2 font-medium text-text-primary">{{ resultData.jenisKelamin }}</span>
                    <span class="text-text-secondary">Asal Sekolah</span>
                    <span class="col-span-2 font-medium text-text-primary">{{ resultData.sekolah }}</span>
                    <span class="text-text-secondary">Email</span>
                    <span class="col-span-2 font-medium text-text-primary">{{ resultData.email }}</span>
                    <span class="text-text-secondary">No. HP</span>
                    <span class="col-span-2 font-medium text-text-primary">{{ resultData.noHp }}</span>
                  </div>
                </section>
              </div>
            </div>

            <AppEmptyState
              v-else-if="state === 'not-found'"
              title="Nomor pendaftaran tidak ditemukan"
              description="Periksa kembali nomor pendaftaran kamu dan pastikan tidak ada kesalahan penulisan."
              class="rounded-2xl border border-border bg-bg-surface"
            >
              <template #icon>
                <SearchX class="h-10 w-10 text-gray-300" />
              </template>
            </AppEmptyState>
          </div>
        </div>

        <div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <AppButton
            variant="secondary"
            type="button"
            class="w-full sm:w-auto"
            @click="router.push('/ppdb')"
          >
            Kembali
          </AppButton>

          <AppButton
            type="submit"
            variant="primary"
            :disabled="(!nomorPendaftaran.trim() && !hasResult) || isChecking"
            :loading="isChecking"
            class="w-full sm:w-auto"
          >
            {{ rightButtonLabel }}
          </AppButton>
        </div>
      </form>
    </div>
  </div>

  <AppBottomSheet v-if="isMobile && hasResult" :modelValue="hasResult" @update:modelValue="checkAnother">
    <div v-if="state === 'success' && resultData" class="flex flex-col pt-2">
      <div class="mb-6 flex justify-center">
        <AppBadge :status="resultData.status" />
      </div>

      <div v-if="resultData.status === 'rejected'" class="mb-6 rounded-xl border border-red-100 bg-red-50 p-4">
        <p class="mb-1 text-sm font-semibold text-error">Alasan Penolakan</p>
        <p class="text-sm text-text-primary">{{ resultData.alasanPenolakan }}</p>
      </div>

      <div class="space-y-6 px-1">
        <section>
          <h2 class="mb-3 border-b border-border pb-2 text-xs font-semibold uppercase tracking-wider text-text-secondary">Informasi Pendaftaran</h2>
          <div class="grid grid-cols-3 gap-y-3 text-sm">
            <span class="text-text-secondary">Nomor</span>
            <span class="col-span-2 font-medium text-text-primary">{{ resultData.nomor }}</span>
            <span class="text-text-secondary">Tanggal</span>
            <span class="col-span-2 font-medium text-text-primary">{{ resultData.tanggal }}</span>
          </div>
        </section>

        <section>
          <h2 class="mb-3 border-b border-border pb-2 text-xs font-semibold uppercase tracking-wider text-text-secondary">Identitas Calon Siswa</h2>
          <div class="grid grid-cols-3 gap-y-3 text-sm">
            <span class="text-text-secondary">Nama</span>
            <span class="col-span-2 font-medium text-text-primary">{{ resultData.nama }}</span>
            <span class="text-text-secondary">TTL</span>
            <span class="col-span-2 font-medium text-text-primary">{{ resultData.ttl }}</span>
            <span class="text-text-secondary">J. Kelamin</span>
            <span class="col-span-2 font-medium text-text-primary">{{ resultData.jenisKelamin }}</span>
            <span class="text-text-secondary">Asal Sekolah</span>
            <span class="col-span-2 font-medium text-text-primary">{{ resultData.sekolah }}</span>
            <span class="text-text-secondary">Email</span>
            <span class="col-span-2 truncate font-medium text-text-primary">{{ resultData.email }}</span>
            <span class="text-text-secondary">No. HP</span>
            <span class="col-span-2 font-medium text-text-primary">{{ resultData.noHp }}</span>
          </div>
        </section>

        <AppButton class="w-full" @click="checkAnother">
          Cek Pendaftaran Lainnya
        </AppButton>
      </div>
    </div>

    <AppEmptyState
      v-else
      title="Nomor pendaftaran tidak ditemukan"
      description="Periksa kembali nomor pendaftaran kamu dan pastikan tidak ada kesalahan penulisan."
    >
      <template #icon>
        <SearchX class="h-10 w-10 text-gray-300" />
      </template>
      <template #action>
        <AppButton class="w-full" @click="checkAnother">
          Cek Pendaftaran Lainnya
        </AppButton>
      </template>
    </AppEmptyState>
  </AppBottomSheet>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ArrowLeft } from 'lucide-vue-next'

useHead({ title: 'Cek Status | PPDB MDS Cendekia' })

const nomorPendaftaran = ref('')
const isChecking = ref(false)

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

const hasResult = ref(false)
const resultData = ref<any>(null)

const handleCheck = async () => {
  if (!nomorPendaftaran.value) return

  isChecking.value = true
  hasResult.value = false

  await new Promise(resolve => setTimeout(resolve, 1500))

  const lastDigit = parseInt(nomorPendaftaran.value.slice(-1) || '0')
  let status: 'pending' | 'approved' | 'rejected' = 'pending'
  let alasanPenolakan = ''

  if (lastDigit % 3 === 1) {
    status = 'approved'
  } else if (lastDigit % 3 === 2) {
    status = 'rejected'
    alasanPenolakan = 'Berkas tidak lengkap dan nilai rata-rata raport di bawah standar.'
  }

  resultData.value = {
    nomor: nomorPendaftaran.value,
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

  isChecking.value = false
  hasResult.value = true
}

const closeResult = () => {
  hasResult.value = false
  resultData.value = null
}

const isConfirmDoneOpen = ref(false)

const checkAnother = () => {
  isConfirmDoneOpen.value = false
  nomorPendaftaran.value = ''
  closeResult()
}
</script>

<template>
  <div class="min-h-screen flex flex-col lg:flex-row bg-bg-base overflow-hidden">
    <div class="hidden lg:flex lg:w-[60%] bg-brand p-12 flex-col justify-center items-center text-white relative overflow-hidden shrink-0">
      <div class="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>

      <div class="z-10 text-center max-w-2xl">
        <img src="" alt="Logo MDS Cendekia" class="w-24 h-24 object-contain mx-auto mb-8 cursor-pointer" @click="$router.push('/ppdb')" />
        <h1 class="text-4xl lg:text-5xl font-heading font-bold mb-6 leading-tight">
          Cek Status Pendaftaran
        </h1>
        <p class="text-white/80 text-lg lg:text-xl">
          Pantau perkembangan status penerimaan peserta didik baru secara *real-time*.
        </p>
      </div>
    </div>

    <div class="w-full lg:w-[40%] relative flex shrink-0">
      <div class="w-full flex flex-col p-4 sm:p-8 lg:p-12 min-h-screen bg-bg-surface justify-center items-center relative z-10">
        <div class="w-full max-w-md">
          <div class="mb-8 lg:hidden flex items-center gap-3 cursor-pointer" @click="$router.push('/ppdb')">
            <img src="" alt="Logo MDS" class="w-12 h-12 object-contain" />
            <span class="text-xl font-heading font-bold text-text-primary">MDS Cendekia</span>
          </div>

          <div class="mb-8">
            <h1 class="text-3xl font-heading font-bold text-text-primary mb-3">Cek Status</h1>
            <p class="text-text-secondary">Masukkan nomor pendaftaran untuk melihat hasil seleksi.</p>
          </div>

          <form @submit.prevent="handleCheck" class="flex flex-col gap-5">
            <AppInput
              v-model="nomorPendaftaran"
              label="Nomor Pendaftaran"
              placeholder="Contoh: MDS-2026-1234"
              required
            />

            <AppButton
              type="submit"
              variant="primary"
              :disabled="!nomorPendaftaran.trim() || isChecking"
              :loading="isChecking"
              class="w-full shadow-md"
            >
              Cek Sekarang
            </AppButton>
          </form>
        </div>
      </div>

      <div class="hidden lg:flex absolute inset-0 bg-bg-surface p-12 flex-col min-h-screen overflow-y-auto transform transition-transform duration-500 z-20 border-l border-border"
           :class="hasResult && !isMobile ? 'translate-x-0' : 'translate-x-full'">
        <div class="w-full max-w-md mx-auto" v-if="resultData">
          <div class="flex items-center gap-4 mb-8">
            <AppBadge :status="resultData.status" />
          </div>

          <div v-if="resultData.status === 'rejected'" class="mb-6 p-4 rounded-xl border border-error bg-bg-base">
            <p class="text-sm font-semibold text-error mb-1">Alasan Penolakan:</p>
            <p class="text-sm text-text-primary">{{ resultData.alasanPenolakan }}</p>
          </div>

          <div class="space-y-6">
            <div>
              <h3 class="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3 border-b border-border pb-2">Informasi Pendaftaran</h3>
              <div class="grid grid-cols-3 gap-y-2 text-sm">
                <div class="text-text-secondary">Nomor</div>
                <div class="col-span-2 font-medium text-text-primary">{{ resultData.nomor }}</div>
                <div class="text-text-secondary">Tanggal</div>
                <div class="col-span-2 font-medium text-text-primary">{{ resultData.tanggal }}</div>
              </div>
            </div>

            <div>
              <h3 class="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3 border-b border-border pb-2">Identitas Calon Siswa</h3>
              <div class="grid grid-cols-3 gap-y-2 text-sm">
                <div class="text-text-secondary">Nama Lengkap</div>
                <div class="col-span-2 font-medium text-text-primary">{{ resultData.nama }}</div>
                <div class="text-text-secondary">TTL</div>
                <div class="col-span-2 font-medium text-text-primary">{{ resultData.ttl }}</div>
                <div class="text-text-secondary">Jenis Kelamin</div>
                <div class="col-span-2 font-medium text-text-primary">{{ resultData.jenisKelamin }}</div>
                <div class="text-text-secondary">Asal Sekolah</div>
                <div class="col-span-2 font-medium text-text-primary">{{ resultData.sekolah }}</div>
                <div class="text-text-secondary">Email</div>
                <div class="col-span-2 font-medium text-text-primary">{{ resultData.email }}</div>
                <div class="text-text-secondary">No. HP</div>
                <div class="col-span-2 font-medium text-text-primary">{{ resultData.noHp }}</div>
              </div>
            </div>

            <div class="pt-6">
              <AppButton variant="primary" class="w-full" @click="isConfirmDoneOpen = true">
                Selesai
              </AppButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <AppModal v-model="isConfirmDoneOpen" title="Konfirmasi">
    <p class="text-text-primary text-base">Apakah kamu masih ingin mengecek status pendaftaran lainnya?</p>

    <template #footer>
      <AppButton variant="secondary" @click="$router.push('/ppdb')">
        Tidak, Kembali ke Awal
      </AppButton>
      <AppButton variant="primary" @click="checkAnother">
        Ya, Cek Lainnya
      </AppButton>
    </template>
  </AppModal>

  <AppBottomSheet v-model="hasResult" v-if="isMobile">
    <div class="flex flex-col pt-2" v-if="resultData">
      <div class="flex justify-center mb-6">
        <AppBadge :status="resultData.status" />
      </div>

      <div v-if="resultData.status === 'rejected'" class="mb-6 p-4 rounded-xl border border-error bg-bg-base">
        <p class="text-sm font-semibold text-error mb-1">Alasan Penolakan:</p>
        <p class="text-sm text-text-primary">{{ resultData.alasanPenolakan }}</p>
      </div>

      <div class="space-y-6 px-1">
        <div>
          <h3 class="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3 border-b border-border pb-2">Informasi Pendaftaran</h3>
          <div class="grid grid-cols-3 gap-y-3 text-sm">
            <div class="text-text-secondary">Nomor</div>
            <div class="col-span-2 font-medium text-text-primary">{{ resultData.nomor }}</div>
            <div class="text-text-secondary">Tanggal</div>
            <div class="col-span-2 font-medium text-text-primary">{{ resultData.tanggal }}</div>
          </div>
        </div>

        <div>
          <h3 class="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3 border-b border-border pb-2">Identitas Calon Siswa</h3>
          <div class="grid grid-cols-3 gap-y-3 text-sm">
            <div class="text-text-secondary">Nama Lengkap</div>
            <div class="col-span-2 font-medium text-text-primary">{{ resultData.nama }}</div>
            <div class="text-text-secondary">TTL</div>
            <div class="col-span-2 font-medium text-text-primary">{{ resultData.ttl }}</div>
            <div class="text-text-secondary">J. Kelamin</div>
            <div class="col-span-2 font-medium text-text-primary">{{ resultData.jenisKelamin }}</div>
            <div class="text-text-secondary">Asal Sekolah</div>
            <div class="col-span-2 font-medium text-text-primary">{{ resultData.sekolah }}</div>
            <div class="text-text-secondary">Email</div>
            <div class="col-span-2 font-medium text-text-primary truncate">{{ resultData.email }}</div>
            <div class="text-text-secondary">No. HP</div>
            <div class="col-span-2 font-medium text-text-primary">{{ resultData.noHp }}</div>
          </div>
        </div>
      </div>
    </div>
  </AppBottomSheet>
</template>

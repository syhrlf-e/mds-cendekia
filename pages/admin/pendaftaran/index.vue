<script setup lang="ts">
import { ref, computed } from 'vue'
import { Eye, Search, ArrowUp, ArrowDown, ArrowUpDown, FileText, ExternalLink } from 'lucide-vue-next'

definePageMeta({
  layout: 'admin',
  middleware: ['admin-auth']
})

useHead({ title: 'Data Pendaftaran | Admin PPDB MDS Cendekia' })

const mockData = ref([
  { id: 'MDS-2026-0001', nama: 'Budi Santoso', sekolah: 'SMPN 1 Jakarta', tanggal: '2026-05-12', status: 'pending' as const },
  { id: 'MDS-2026-0002', nama: 'Siti Aminah', sekolah: 'SMPN 2 Bandung', tanggal: '2026-05-13', status: 'approved' as const },
  { id: 'MDS-2026-0003', nama: 'Andi Wijaya', sekolah: 'SMP Muhammadiyah', tanggal: '2026-05-14', status: 'rejected' as const },
  { id: 'MDS-2026-0004', nama: 'Rina Marlina', sekolah: 'SMP IT Al-Huda', tanggal: '2026-05-15', status: 'pending' as const },
  { id: 'MDS-2026-0005', nama: 'Joko Anwar', sekolah: 'SMPN 3 Surabaya', tanggal: '2026-05-16', status: 'approved' as const },
])

const mockBerkas = [
  { id: 1, name: 'Foto Siswa (3x4 berwarna)', url: '#' },
  { id: 2, name: 'Buku Rapor SMP', url: '#' },
  { id: 3, name: 'Surat Keterangan Nilai Rapor Semester I–V', url: '#' },
  { id: 4, name: 'Ijazah / SKL', url: '#' },
  { id: 5, name: 'Akta Kelahiran', url: '#' },
  { id: 6, name: 'Kartu Keluarga', url: '#' }
]

const searchQuery = ref('')
const filterStatus = ref('')
const sortKey = ref<'nama' | 'tanggal' | ''>('')
const sortOrder = ref<'asc' | 'desc'>('asc')

let debounceTimeout: ReturnType<typeof setTimeout>
const handleSearch = (e: Event) => {
  const target = e.target as HTMLInputElement
  clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(() => {
    searchQuery.value = target.value
  }, 300)
}

const handleSort = (key: 'nama' | 'tanggal') => {
  if (sortKey.value === key) {
    if (sortOrder.value === 'asc') sortOrder.value = 'desc'
    else sortKey.value = ''
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}

const filteredAndSortedData = computed(() => {
  let result = [...mockData.value]

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(item =>
      item.nama.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q)
    )
  }

  if (filterStatus.value) {
    result = result.filter(item => item.status === filterStatus.value)
  }

  if (sortKey.value) {
    result.sort((a, b) => {
      let valA = a[sortKey.value as 'nama' | 'tanggal']
      let valB = b[sortKey.value as 'nama' | 'tanggal']

      if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1
      if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1
      return 0
    })
  }

  return result
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

const activeTab = ref<'diri' | 'ortu' | 'berkas'>('diri')
const ortuTabAyahOpen = ref(true)
const ortuTabIbuOpen = ref(false)
const ortuTabWaliOpen = ref(false)

const isDetailModalOpen = ref(false)
const selectedItem = ref<any>(null)

const handleView = (id: string) => {
  selectedItem.value = mockData.value.find(item => item.id === id) || null
  if (selectedItem.value) {
    activeTab.value = 'diri'
    isDetailModalOpen.value = true
  }
}

const isApproveModalOpen = ref(false)
const isProcessingApprove = ref(false)

const promptApprove = () => {
  isApproveModalOpen.value = true
}

const handleApprove = () => {
  isProcessingApprove.value = true
  setTimeout(() => {
    isProcessingApprove.value = false
    isApproveModalOpen.value = false
    isDetailModalOpen.value = false
    if (selectedItem.value) {
      selectedItem.value.status = 'approved'
      useToast().addToast('Pendaftar berhasil diterima', 'success')
    }
  }, 1000)
}

const isRejectModalOpen = ref(false)
const rejectReason = ref('')
const isProcessingReject = ref(false)
const isRejectGuardOpen = ref(false)

const promptReject = () => {
  rejectReason.value = ''
  isRejectModalOpen.value = true
}

const attemptCancelReject = (val?: boolean) => {
  if (val !== false) return // Only handle close
  if (rejectReason.value.trim() !== '') {
    isRejectGuardOpen.value = true
  } else {
    isRejectModalOpen.value = false
  }
}

const confirmCancelReject = () => {
  isRejectGuardOpen.value = false
  isRejectModalOpen.value = false
  rejectReason.value = ''
}

const handleReject = () => {
  isProcessingReject.value = true
  setTimeout(() => {
    isProcessingReject.value = false
    isRejectModalOpen.value = false
    isDetailModalOpen.value = false
    if (selectedItem.value) {
      selectedItem.value.status = 'rejected'
      useToast().addToast('Pendaftar ditolak', 'error')
    }
  }, 1000)
}
</script>

<template>
  <div class="flex flex-col h-full animate-in fade-in duration-300">
    <div class="mb-8">
      <h1 class="text-3xl font-heading font-bold text-text-primary mb-2">Data Pendaftar</h1>
      <p class="text-text-secondary">Kelola dan tinjau data peserta didik baru yang telah mendaftar.</p>
    </div>

    <div class="bg-bg-surface border border-border rounded-2xl grow flex flex-col shadow-sm overflow-hidden">
      <div class="p-6 border-b border-border bg-bg-base/30 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div class="relative w-full sm:max-w-md">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search class="h-5 w-5 text-text-secondary" />
          </div>
          <input
            type="text"
            @input="handleSearch"
            class="block w-full pl-10 pr-3 py-2 border border-border rounded-xl leading-5 bg-bg-surface text-text-primary placeholder-text-secondary focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand sm:text-sm transition-colors"
            placeholder="Cari nama atau nomor pendaftaran..."
          >
        </div>

        <div class="w-full sm:w-auto">
          <select
            v-model="filterStatus"
            class="block w-full pl-3 pr-10 py-2 text-text-primary bg-bg-surface border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand sm:text-sm appearance-none"
            style="background-image: url('data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 20 20\' fill=\'%236b7280\'><path fill-rule=\'evenodd\' d=\'M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z\' clip-rule=\'evenodd\'/></svg>'); background-position: right 0.5rem center; background-repeat: no-repeat; background-size: 1.5em 1.5em;"
          >
            <option value="">Semua Status</option>
            <option value="pending">Menunggu Persetujuan</option>
            <option value="approved">Diterima</option>
            <option value="rejected">Ditolak</option>
          </select>
        </div>
      </div>

      <div class="overflow-x-auto grow">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-bg-base/50 text-text-secondary text-sm uppercase tracking-wider border-b border-border">
              <th class="p-4 font-semibold w-16 text-center">No</th>

              <th class="p-4 font-semibold cursor-pointer hover:bg-bg-surface transition-colors select-none group" @click="handleSort('nama')">
                <div class="flex items-center gap-2">
                  Nama / Nomor
                  <span class="text-text-secondary/50 group-hover:text-text-primary transition-colors">
                    <ArrowUp v-if="sortKey === 'nama' && sortOrder === 'asc'" class="w-4 h-4 text-brand" />
                    <ArrowDown v-else-if="sortKey === 'nama' && sortOrder === 'desc'" class="w-4 h-4 text-brand" />
                    <ArrowUpDown v-else class="w-4 h-4" />
                  </span>
                </div>
              </th>

              <th class="p-4 font-semibold">Asal Sekolah</th>

              <th class="p-4 font-semibold cursor-pointer hover:bg-bg-surface transition-colors select-none group" @click="handleSort('tanggal')">
                <div class="flex items-center gap-2">
                  Tgl Daftar
                  <span class="text-text-secondary/50 group-hover:text-text-primary transition-colors">
                    <ArrowUp v-if="sortKey === 'tanggal' && sortOrder === 'asc'" class="w-4 h-4 text-brand" />
                    <ArrowDown v-else-if="sortKey === 'tanggal' && sortOrder === 'desc'" class="w-4 h-4 text-brand" />
                    <ArrowUpDown v-else class="w-4 h-4" />
                  </span>
                </div>
              </th>

              <th class="p-4 font-semibold">Status</th>
              <th class="p-4 font-semibold w-32 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr v-for="(item, index) in filteredAndSortedData" :key="item.id" class="hover:bg-bg-base/30 transition-colors">
              <td class="p-4 text-center text-text-secondary font-medium">{{ index + 1 }}</td>
              <td class="p-4">
                <p class="font-semibold text-text-primary mb-1">{{ item.nama }}</p>
                <p class="text-xs text-text-secondary font-mono">{{ item.id }}</p>
              </td>
              <td class="p-4 text-text-primary text-sm">{{ item.sekolah }}</td>
              <td class="p-4 text-text-primary text-sm">{{ formatDate(item.tanggal) }}</td>
              <td class="p-4">
                <AppBadge :status="item.status" />
              </td>
              <td class="p-4 text-center">
                <button
                  @click="handleView(item.id)"
                  class="inline-flex items-center justify-center p-2 text-brand hover:bg-primary-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand"
                  title="Lihat Detail"
                >
                  <Eye class="w-5 h-5" />
                </button>
              </td>
            </tr>
            <tr v-if="filteredAndSortedData.length === 0">
              <td colspan="6" class="p-8 text-center text-text-secondary">
                <div class="flex flex-col items-center justify-center gap-3">
                  <Search class="w-10 h-10 text-border" />
                  <p>Tidak ada data pendaftar yang sesuai.</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <AppModal v-model="isDetailModalOpen" width="w-full max-w-[80vw]" v-if="selectedItem">
    <template #header>
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 bg-bg-base border border-border rounded-xl flex items-center justify-center shrink-0">
          <span class="text-xs font-medium text-text-secondary">Foto</span>
        </div>
        <div>
          <div class="flex items-center gap-3 mb-1">
            <h3 class="text-xl font-heading font-bold text-text-primary">{{ selectedItem.nama }}</h3>
            <AppBadge :status="selectedItem.status" />
          </div>
          <div class="flex items-center gap-3 text-sm text-text-secondary">
            <span class="font-mono">{{ selectedItem.id }}</span>
            <span>•</span>
            <span>Terdaftar: {{ formatDate(selectedItem.tanggal) }}</span>
          </div>
        </div>
      </div>
    </template>

    <div class="flex h-[60vh] -m-6">
      <div class="w-64 border-r border-border bg-bg-base/30 flex flex-col p-4 gap-2 shrink-0 overflow-y-auto">
        <button
          @click="activeTab = 'diri'"
          class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-left"
          :class="activeTab === 'diri' ? 'bg-white text-brand shadow-sm border border-border/50' : 'text-text-secondary hover:bg-white/50 hover:text-text-primary'"
        >
          Data Diri
        </button>
        <button
          @click="activeTab = 'ortu'"
          class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-left"
          :class="activeTab === 'ortu' ? 'bg-white text-brand shadow-sm border border-border/50' : 'text-text-secondary hover:bg-white/50 hover:text-text-primary'"
        >
          Data Orang Tua
        </button>
        <button
          @click="activeTab = 'berkas'"
          class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-left"
          :class="activeTab === 'berkas' ? 'bg-white text-brand shadow-sm border border-border/50' : 'text-text-secondary hover:bg-white/50 hover:text-text-primary'"
        >
          Berkas Persyaratan
        </button>
      </div>

      <div class="grow p-6 overflow-y-auto">
        <div v-if="activeTab === 'diri'" class="space-y-8 animate-in fade-in duration-300">
          <div>
            <h4 class="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4 border-b border-border pb-2">Informasi Pribadi</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
              <div class="flex flex-col gap-1"><span class="text-text-secondary">Nama Lengkap</span><span class="font-medium text-text-primary">{{ selectedItem.nama }}</span></div>
              <div class="flex flex-col gap-1"><span class="text-text-secondary">Nama Panggilan</span><span class="font-medium text-text-primary">Mock Panggilan</span></div>
              <div class="flex flex-col gap-1"><span class="text-text-secondary">NIK</span><span class="font-medium text-text-primary font-mono">1234567890123456</span></div>
              <div class="flex flex-col gap-1"><span class="text-text-secondary">Tempat, Tanggal Lahir</span><span class="font-medium text-text-primary">Jakarta, 12 Januari 2011</span></div>
              <div class="flex flex-col gap-1"><span class="text-text-secondary">Jenis Kelamin</span><span class="font-medium text-text-primary">Laki-laki</span></div>
              <div class="flex flex-col gap-1"><span class="text-text-secondary">Agama</span><span class="font-medium text-text-primary">Islam</span></div>
              <div class="flex flex-col gap-1"><span class="text-text-secondary">Kewarganegaraan</span><span class="font-medium text-text-primary">WNI</span></div>
              <div class="flex flex-col gap-1"><span class="text-text-secondary">Anak Ke- / Jml Saudara</span><span class="font-medium text-text-primary">1 dari 3</span></div>
              <div class="flex flex-col gap-1"><span class="text-text-secondary">Golongan Darah</span><span class="font-medium text-text-primary">O</span></div>
            </div>
          </div>

          <div>
            <h4 class="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4 border-b border-border pb-2">Kontak & Alamat</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
              <div class="flex flex-col gap-1 md:col-span-2"><span class="text-text-secondary">Alamat Lengkap</span><span class="font-medium text-text-primary leading-relaxed">Jl. Contoh Alamat No. 123, RT 001/RW 002</span></div>
              <div class="flex flex-col gap-1"><span class="text-text-secondary">Provinsi</span><span class="font-medium text-text-primary">DKI Jakarta</span></div>
              <div class="flex flex-col gap-1"><span class="text-text-secondary">Kota/Kabupaten</span><span class="font-medium text-text-primary">Jakarta Selatan</span></div>
              <div class="flex flex-col gap-1"><span class="text-text-secondary">Kecamatan</span><span class="font-medium text-text-primary">Kebayoran Baru</span></div>
              <div class="flex flex-col gap-1"><span class="text-text-secondary">Kelurahan</span><span class="font-medium text-text-primary">Senayan</span></div>
              <div class="flex flex-col gap-1"><span class="text-text-secondary">Kode Pos</span><span class="font-medium text-text-primary">12190</span></div>
              <div class="flex flex-col gap-1"><span class="text-text-secondary">No. HP Siswa</span><span class="font-medium text-text-primary">081234567890</span></div>
              <div class="flex flex-col gap-1"><span class="text-text-secondary">Email</span><span class="font-medium text-text-primary">student@example.com</span></div>
            </div>
          </div>
        </div>
        <div v-if="activeTab === 'ortu'" class="space-y-4 animate-in fade-in duration-300">
          <AppAccordion
            title="Data Ayah"
            :isOpen="ortuTabAyahOpen"
            @toggle="ortuTabAyahOpen = !ortuTabAyahOpen"
          >
            <div class="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
              <div class="flex flex-col gap-1"><span class="text-text-secondary">Nama Lengkap</span><span class="font-medium text-text-primary">Mock Ayah</span></div>
              <div class="flex flex-col gap-1"><span class="text-text-secondary">NIK</span><span class="font-medium text-text-primary font-mono">3174123456780001</span></div>
              <div class="flex flex-col gap-1"><span class="text-text-secondary">Tempat, Tanggal Lahir</span><span class="font-medium text-text-primary">Surabaya, 10 Agustus 1980</span></div>
              <div class="flex flex-col gap-1"><span class="text-text-secondary">Pendidikan Terakhir</span><span class="font-medium text-text-primary">S1</span></div>
              <div class="flex flex-col gap-1"><span class="text-text-secondary">Pekerjaan</span><span class="font-medium text-text-primary">Karyawan Swasta</span></div>
              <div class="flex flex-col gap-1"><span class="text-text-secondary">Penghasilan Per Bulan</span><span class="font-medium text-text-primary">Rp 5.000.000 - Rp 10.000.000</span></div>
              <div class="flex flex-col gap-1"><span class="text-text-secondary">No. HP</span><span class="font-medium text-text-primary">081299998888</span></div>
            </div>
          </AppAccordion>

          <AppAccordion
            title="Data Ibu"
            :isOpen="ortuTabIbuOpen"
            @toggle="ortuTabIbuOpen = !ortuTabIbuOpen"
          >
            <div class="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
              <div class="flex flex-col gap-1"><span class="text-text-secondary">Nama Lengkap</span><span class="font-medium text-text-primary">Mock Ibu</span></div>
              <div class="flex flex-col gap-1"><span class="text-text-secondary">NIK</span><span class="font-medium text-text-primary font-mono">3174123456780002</span></div>
              <div class="flex flex-col gap-1"><span class="text-text-secondary">Tempat, Tanggal Lahir</span><span class="font-medium text-text-primary">Bandung, 15 September 1982</span></div>
              <div class="flex flex-col gap-1"><span class="text-text-secondary">Pendidikan Terakhir</span><span class="font-medium text-text-primary">Diploma</span></div>
              <div class="flex flex-col gap-1"><span class="text-text-secondary">Pekerjaan</span><span class="font-medium text-text-primary">Wiraswasta</span></div>
              <div class="flex flex-col gap-1"><span class="text-text-secondary">Penghasilan Per Bulan</span><span class="font-medium text-text-primary">Rp 3.000.000 - Rp 5.000.000</span></div>
              <div class="flex flex-col gap-1"><span class="text-text-secondary">No. HP</span><span class="font-medium text-text-primary">081277776666</span></div>
            </div>
          </AppAccordion>

          <AppAccordion
            title="Data Wali"
            :isOpen="ortuTabWaliOpen"
            @toggle="ortuTabWaliOpen = !ortuTabWaliOpen"
          >
            <div class="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
              <div class="flex flex-col gap-1"><span class="text-text-secondary">Nama Lengkap</span><span class="font-medium text-text-primary">Mock Wali</span></div>
              <div class="flex flex-col gap-1"><span class="text-text-secondary">Hubungan dengan Siswa</span><span class="font-medium text-text-primary">Paman</span></div>
              <div class="flex flex-col gap-1"><span class="text-text-secondary">No. HP</span><span class="font-medium text-text-primary">081255554444</span></div>
              <div class="flex flex-col gap-1 md:col-span-2"><span class="text-text-secondary">Alamat Wali</span><span class="font-medium text-text-primary leading-relaxed">Jl. Wali No. 45, RT 003/RW 004, Jakarta Selatan</span></div>
            </div>
          </AppAccordion>
        </div>
        <div v-if="activeTab === 'berkas'">
          <h4 class="text-lg font-heading font-semibold text-text-primary mb-4">Berkas Persyaratan (Phase 34)</h4>
          <p class="text-text-secondary">Konten detail berkas akan ditampilkan di sini.</p>
        </div>
      </div>
    </div>

    <template #footer>
      <AppButton variant="danger" class="min-w-30" @click="promptReject" v-if="selectedItem?.status === 'pending'">
        Tolak
      </AppButton>
      <AppButton variant="primary" class="min-w-30" @click="promptApprove" v-if="selectedItem?.status === 'pending'">
        Terima
      </AppButton>
      <div v-if="selectedItem?.status !== 'pending'" class="text-sm font-medium text-text-secondary italic">
        Tindakan tidak tersedia (Pendaftar sudah {{ selectedItem?.status === 'approved' ? 'diterima' : 'ditolak' }})
      </div>
    </template>
    </AppModal>

    <AppModal v-model="isApproveModalOpen" title="Konfirmasi Pendaftaran" width="max-w-md" :zIndex="60">
    <p class="text-text-primary text-base leading-relaxed">Apakah Anda yakin ingin menerima pendaftar ini?</p>
    <p class="text-sm text-text-secondary mt-2">Sistem akan secara otomatis memperbarui status dan mengirimkan email konfirmasi penerimaan kepada calon siswa beserta link Kartu Peserta.</p>

    <template #footer>
      <AppButton variant="secondary" @click="isApproveModalOpen = false" :disabled="isProcessingApprove">
        Batal
      </AppButton>
      <AppButton variant="primary" @click="handleApprove" :loading="isProcessingApprove">
        Ya, Terima
      </AppButton>
    </template>
    </AppModal>

    <AppModal :modelValue="isRejectModalOpen" @update:modelValue="attemptCancelReject" title="Tolak Pendaftar" width="max-w-lg" :zIndex="60">
    <p class="text-text-primary text-base leading-relaxed mb-4">Silakan masukkan alasan penolakan. Alasan ini akan dikirimkan ke email calon siswa.</p>

    <AppTextarea
      v-model="rejectReason"
      label="Alasan Penolakan"
      placeholder="Ketikkan alasan secara detail..."
      required
      :disabled="isProcessingReject"
      :rows="4"
    />

    <template #footer>
      <AppButton variant="secondary" @click="attemptCancelReject" :disabled="isProcessingReject">
        Batal
      </AppButton>
      <AppButton variant="danger" @click="handleReject" :disabled="!rejectReason.trim() || isProcessingReject" :loading="isProcessingReject">
        Kirim Penolakan
      </AppButton>
    </template>
    </AppModal>

    <AppModal v-model="isRejectGuardOpen" title="Batalkan Penolakan?" width="max-w-sm" :zIndex="70">
    <p class="text-text-primary text-base leading-relaxed">Kamu sudah mengetikkan alasan. Apakah kamu yakin ingin membatalkannya? Tulisanmu akan hilang.</p>

    <template #footer>
      <AppButton variant="secondary" @click="isRejectGuardOpen = false">
        Lanjut Mengetik
      </AppButton>
      <AppButton variant="danger" @click="confirmCancelReject">
        Ya, Batalkan
      </AppButton>
    </template>
    </AppModal>
    </template>

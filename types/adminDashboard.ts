import type { RegistrationStatus } from '~/types/adminPendaftaran'

export type AdminSummaryDto = {
  total_pendaftar?: number
  total?: number
  diterima?: number
  ditolak?: number
  menunggu?: number
  berkas_terverifikasi?: number
  berkas_disetujui?: number
  siswa?: number
  total_siswa?: number
  berita?: number
  total_berita?: number
}

export type DashboardRegistration = {
  id: string
  nama: string
  nisn: string
  sekolah: string
  program: string
  status: RegistrationStatus
  statusText: string
  statusBerkas: string
  tanggal: string
}

export type DashboardActivity = {
  id: string
  title: string
  description: string
  date: string
  tone: 'pending' | 'approved' | 'rejected'
}

export type DashboardTimeline = {
  id: number
  judul: string
  deskripsi: string
  tanggalMulai: string
  tanggalSelesai: string
  urutan: number
  status: 'aktif' | 'nonaktif'
  tampilPublik: boolean
}

export type AdminDashboardData = {
  registrations: DashboardRegistration[]
  timelineItems: DashboardTimeline[]
  totalStudents: number
  summary: AdminSummaryDto | null
  hasCriticalError: boolean
}

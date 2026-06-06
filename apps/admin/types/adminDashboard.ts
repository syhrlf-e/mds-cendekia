import type { RegistrationStatus } from '~/types/adminPendaftaran'

export type AdminSummaryDto = {
  total_pendaftar: number
  total_siswa: number
  total_berita: number
  pendaftar_perlu_aksi: DashboardActionApplicant[]
  program_paket: DashboardProgramPackage[]
  gelombang: DashboardWave[]
  distribusi_program_paket: DashboardProgramDistribution[]
  aktivitas_ppdb: DashboardPpdbActivity[]
}

export type DashboardActionApplicant = {
  nama: string
  program_paket: string
  status_berkas: string
  created_at: string
}

export type DashboardProgramPackage = {
  nama: string
  status: string
}

export type DashboardWave = {
  order: number
  mulai: string
  selesai: string
  status: string
}

export type DashboardProgramDistribution = {
  program: string
  total: number
}

export type DashboardPpdbActivity = {
  nama: string
  created_at: string
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

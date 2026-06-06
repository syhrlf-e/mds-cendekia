import type { RegistrationStatus } from '~/types/adminPendaftaran'

export type AdminSummaryDto = {
  total_menunggu_verifikasi: number
  total_pendaftar_diterima: number
  total_pendaftar_ditolak: number
  total_siswa: number
  total_galeri: number
  total_berita: number
  gelombang: DashboardWave[]
  program_paket: DashboardProgramPackage[]
  berita_terbaru: DashboardLatestNews[]
  pendaftar_terbaru: DashboardLatestApplicant[]
}

export type DashboardProgramPackage = {
  nama: string
  status: boolean
}

export type DashboardWave = {
  order: number
  kuota: number
  total_pendaftar: number
  status: boolean
}

export type DashboardLatestNews = {
  gambar: string
  created_at: string
}

export type DashboardLatestApplicant = {
  kode_pendaftaran: string
  nama: string
  nisn: string
  nama_sekolah_asal: string
  status: boolean
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

import { useCookie, useState } from '#app'
import type { AdminSummaryDto } from '~/types/adminDashboard'
import type { GalleryItem } from '~/types/adminGallery'
import type { AdminNewsItem } from '~/types/adminNews'
import type { PaketSekolah } from '~/types/adminPaketSekolah'
import type { Registration } from '~/types/adminPendaftaran'
import type { Student } from '~/types/adminSiswa'
import type { GelombangTimelineDto } from '~/types/adminTimeline'

let adminSessionGeneration = 0
const ADMIN_SESSION_INVALIDATED_KEY = 'admin-session-invalidated'

const createEmptyAdminSummary = (): AdminSummaryDto => ({
  total_menunggu_verifikasi: 0,
  total_pendaftar_diterima: 0,
  total_pendaftar_ditolak: 0,
  total_siswa: 0,
  total_galeri: 0,
  total_berita: 0,
  gelombang: [],
  program_paket: [],
  berita_terbaru: [],
  pendaftar_terbaru: []
})

export const getAdminSessionGeneration = () => adminSessionGeneration

export const useAdminSession = () => {
  const isAdminSessionInvalidated = () => {
    return import.meta.client && sessionStorage.getItem(ADMIN_SESSION_INVALIDATED_KEY) === '1'
  }

  const activateAdminSession = () => {
    if (import.meta.client) sessionStorage.removeItem(ADMIN_SESSION_INVALIDATED_KEY)
  }

  const clearAdminSession = () => {
    adminSessionGeneration += 1
    if (import.meta.client) sessionStorage.setItem(ADMIN_SESSION_INVALIDATED_KEY, '1')

    useCookie('admin_token').value = null
    useCookie('cendekia_token').value = null

    useState<string>('admin-auth:username', () => '').value = ''
    useState<number | null>('admin-auth:id', () => null).value = null

    useState<AdminSummaryDto>('admin-cache:dashboard-summary', createEmptyAdminSummary).value = createEmptyAdminSummary()
    useState<Registration[]>('admin-cache:pendaftar', () => []).value = []
    useState<Student[]>('admin-cache:students', () => []).value = []
    useState<AdminNewsItem[]>('admin-cache:news', () => []).value = []
    useState<GalleryItem[]>('admin-cache:gallery', () => []).value = []
    useState<GelombangTimelineDto[]>('admin-cache:timeline', () => []).value = []
    useState<PaketSekolah[]>('admin-cache:packages', () => []).value = []

    const cacheNames = ['dashboard-summary', 'pendaftar', 'students', 'news', 'gallery', 'timeline', 'packages']
    for (const cacheName of cacheNames) {
      useState<number>(`admin-cache:${cacheName}-loaded-at`, () => 0).value = 0
      useState<boolean>(`admin-cache:${cacheName}-loading`, () => false).value = false
      useState<string>(`admin-cache:${cacheName}-error`, () => '').value = ''
    }
  }

  return {
    activateAdminSession,
    isAdminSessionInvalidated,
    clearAdminSession
  }
}

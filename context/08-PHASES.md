# PHASES — Checklist Development
# Sistem PPDB MDS Cendekia

> Setiap phase bersifat atomic — satu tugas, satu fokus.
> Centang setiap phase setelah selesai sebelum lanjut ke phase berikutnya.

---

## FOUNDATION

- [x] **Phase 1 — Project Setup**
  - Init Nuxt.js + Tailwind CSS v4
  - Setup struktur folder
  - Setup routing dasar

- [x] **Phase 2 — Design Tokens**
  - Jalankan `npx getdesign@latest add apple`
  - Daftarkan color tokens (Terracotta + Kournikova) ke Tailwind config
  - Setup CSS variables semantic tokens
  - Setup Google Fonts: Plus Jakarta Sans + Inter via `@nuxt/google-fonts`

---

## BASE COMPONENTS

- [x] **Phase 3 — Button Component**
  - Variant: primary (emas), secondary (outline), danger (merah outline)
  - State: default, hover, disabled, loading

- [x] **Phase 4 — Input Component**
  - State: default, focus, error
  - Error message teks merah di bawah field

- [x] **Phase 5 — Badge Component**
  - Variant: pending (kuning), approved (hijau), rejected (merah)

- [x] **Phase 6 — Toast Pill Component**
  - Posisi: top-center
  - Struktur: icon + teks
  - Auto dismiss 3 detik
  - Animasi: slide down + fade in/out

- [x] **Phase 7 — Modal Component**
  - Backdrop semi-transparan
  - Animasi: fade in
  - Slot konten fleksibel
  - Tombol tutup [×]

- [x] **Phase 8 — Bottom Sheet Component**
  - Tinggi: 85% viewport height (fixed)
  - Gap atas: 15% (backdrop gelap)
  - Drag handle dekoratif
  - Animasi: slide up dari bawah
  - Dismiss: tap backdrop atau tombol tutup

- [x] **Phase 9 — Empty State Component**
  - Slot: icon, teks bold, subtext

- [x] **Phase 10 — Loading Dot Wave Component**
  - 3 titik animasi bergelombang (naik turun)

- [x] **Phase 11 — Accordion Component**
  - State: terkunci, terbuka, selesai (ada icon centang)
  - Belum ada logic lock/unlock (hanya visual)

---

## HALAMAN USER — LANDING PPDB

- [x] **Phase 12 — Hero Section `/ppdb`**
  - Logo MDS Cendekia
  - Judul + subjudul tahun ajaran
  - 2 CTA button: Daftar Sekarang + Cek Status
  - State tombol: aktif / disabled berdasarkan periode

- [x] **Phase 13 — Card Component `/ppdb`**
  - Visual card dengan judul + subtext
  - Behavior klik: bottom sheet (mobile) / modal (desktop)

- [x] **Phase 14 — Timeline Pendaftaran `/ppdb`**
  - Layout horizontal (desktop) / vertikal (mobile)
  - Tahapan: Pendaftaran → Seleksi Berkas → Pengumuman

- [x] **Phase 15 — Konten Bottom Sheet & Modal Card `/ppdb`**
  - Card 1: Alur Pendaftaran (step 1–4 dengan icon)
  - Card 2: Persyaratan Berkas (list dokumen)
  - Card 3: Informasi Penting (kontak, catatan sekolah)

---

## HALAMAN USER — FORMULIR PENDAFTARAN

- [x] **Phase 16 — Accordion Data Diri + Validasi**
  - Semua field accordion 1 beserta validasi onBlur
  - Error message per field

- [x] **Phase 17 — Cascade Dropdown Wilayah**
  - Integrasi API emsifa: provinsi → kota → kecamatan → kelurahan
  - Reset & disable cascade behavior

- [x] **Phase 18 — Accordion Data Asal Sekolah + Validasi**
  - Semua field accordion 2 beserta validasi onBlur

- [x] **Phase 19 — Accordion Data Orang Tua + Validasi**
  - Sub-section: Data Ayah, Data Ibu
  - Sub-section Data Wali kondisional (muncul jika checkbox dicentang)
  - Validasi per field

- [x] **Phase 20 — Logic Lock/Unlock Accordion**
  - Accordion unlock jika semua field accordion sebelumnya valid
  - Icon centang ✅ muncul di header accordion yang selesai
  - Accordion yang sudah terbuka tidak bisa dikunci kembali

- [x] **Phase 21 — Tombol Berikutnya + Modal Konfirmasi**
  - Tombol disabled sampai semua accordion ✅
  - Modal konfirmasi: "Data sudah sesuai?"
  - "Ya, Lanjut" → redirect ke `/ppdb/daftar/berkas`
  - "Belum" → modal tutup

---

## HALAMAN USER — UPLOAD BERKAS

- [x] **Phase 22 — Halaman Upload Berkas `/ppdb/daftar/berkas`**
  - Upload area per berkas (6 berkas)
  - Validasi format + ukuran saat file dipilih
  - Tampilkan nama + ukuran file setelah dipilih
  - Tombol Kirim disabled sampai semua berkas terupload

- [x] **Phase 23 — Submit + Bottom Sheet Nomor Pendaftaran**
  - Modal konfirmasi sebelum submit
  - Loading dot wave saat proses
  - Bottom sheet hasil: nomor pendaftaran + tombol Cek Status

---

## HALAMAN USER — CEK STATUS & KARTU PESERTA

- [x] **Phase 24 — Halaman Cek Status `/ppdb/cek-status`**
  - Input nomor pendaftaran
  - Tombol "Cek Sekarang"
  - Layout: mobile center / desktop 60:40

- [x] **Phase 25 — Hasil Cek Status**
  - Mobile: Bottom Sheet dengan data + badge status
  - Desktop: slide in from right dengan data + badge status
  - Tampilkan alasan penolakan jika status Ditolak

- [x] **Phase 26 — Halaman Kartu Peserta + Generate PDF**
  - Hit API ambil data peserta via parameter URL
  - Generate PDF layout 2 kolom (foto kiri, biodata kanan)
  - Auto download di browser

---

## HALAMAN ADMIN

- [x] **Phase 27 — Halaman Login Admin `/admin/login`**
  - Form email + password
  - State normal: pesan error di bawah form
  - State lockout: card berubah + countdown timer

- [x] **Phase 28 — Sidebar Admin + Routing**
  - Menu: Dashboard, Pendaftaran, Pengaturan
  - Logout di pojok kiri bawah
  - Active menu indicator (Terracotta-800)
  - Routing guard: redirect ke login jika belum auth

- [x] **Phase 29 — Tabel List Pendaftar `/admin/pendaftaran`**
  - Kolom: No, Nama, Asal Sekolah, Tgl Daftar, Status, Aksi
  - Badge status per baris
  - Tombol "Lihat Detail" per baris

- [x] **Phase 30 — Search + Filter + Sorting Tabel**
  - Search realtime debounce 300ms (nama / nomor pendaftaran)
  - Filter dropdown by status
  - Sorting kolom Tgl Daftar & Nama dengan indikator panah

- [x] **Phase 31 — Modal Detail Pendaftar (Struktur + Sidebar Tab)**
  - Layout modal 80% viewport
  - Header: foto + nomor pendaftaran + tanggal + badge status
  - Sidebar tab vertikal: Data Diri, Orang Tua, Berkas
  - Tombol Tolak + Terima sticky di bottom

- [x] **Phase 32 — Tab Data Diri di Modal Detail**
  - Tampilkan semua data diri siswa

- [x] **Phase 33 — Tab Orang Tua di Modal Detail**
  - Accordion internal: Data Ayah (default terbuka), Data Ibu, Data Wali

- [x] **Phase 34 — Tab Berkas di Modal Detail**
  - List berkas + tombol "Lihat" per berkas
  - Tombol Lihat → buka di tab baru

- [x] **Phase 35 — Flow Approve**
  - Modal konfirmasi kecil
  - Trigger BE update status + email
  - Toast berhasil

- [x] **Phase 36 — Flow Reject + Modal Guard**
  - Modal 1: textarea alasan + tombol Kirim & Batal
  - Skenario A: isi alasan → kirim → toast
  - Skenario B: batal saat textarea kosong → langsung tutup
  - Skenario C: batal saat textarea ada teks → Modal 2 "Kamu berubah pikiran?"

- [x] **Phase 37 — Halaman Pengaturan PPDB `/admin/pengaturan`**
  - Toggle ON/OFF
  - Date picker tanggal buka & tutup
  - Validasi logic sebelum simpan
  - Tombol Terapkan

- [x] **Phase 38 — Dashboard Placeholder `/admin/dashboard`**
  - Empty state: icon + "Dashboard sedang dalam penyempurnaan"

---

## INTEGRASI & POLISH

- [x] **Phase 39 — Integrasi Semua Endpoint BE**
  - Setup fondasi `useApi` composable (Interceptor, Header, Error Handling Global)
  - Integrasi API sesungguhnya menunggu dokumentasi Backend selesai sepenuhnya

- [x] **Phase 40 — Polish + Bug Fixing + Cross Browser Testing**
  - Review konsistensi UI di seluruh halaman
  - Test flow end-to-end: daftar → upload → cek status → kartu peserta
  - Test flow admin: login → list → detail → approve/reject
  - Cross browser: Chrome, Firefox, Safari
  - Mobile testing: iOS Safari, Android Chrome

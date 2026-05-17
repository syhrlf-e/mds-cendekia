# Product Requirements Document (PRD)
# Sistem PPDB — MDS Cendekia
### Mukti Daris Sasmita Cendekia

**Versi:** 1.0.0 (MVP)
**Tanggal:** Mei 2026
**Status:** Draft — Subject to API Contract
**API Docs:** https://cendekia.sekata.my.id/api-docs

---

## Daftar File PRD

| File | Konten |
|---|---|
| `01-PRD-main.md` | Overview, Tech Stack, Design System, UX Laws |
| `02-PRD-sitemap.md` | Sitemap & Routing |
| `03-PRD-user-pages.md` | Semua halaman sisi user |
| `04-PRD-admin-pages.md` | Semua halaman sisi admin |
| `05-PRD-validation.md` | Validasi field & aturan bisnis |
| `06-PRD-api.md` | API & integrasi eksternal |
| `07-PRD-email.md` | Email templates |
| `08-PHASES.md` | Checklist phase development |

---

## 1. Overview Proyek

Sistem PPDB (Penerimaan Peserta Didik Baru) MDS Cendekia adalah platform digital yang memungkinkan calon peserta didik melakukan pendaftaran secara online. Platform ini terdiri dari dua sisi:

- **Sisi User (Publik):** Calon siswa dapat mengisi formulir pendaftaran, mengunggah berkas, mengecek status pendaftaran, dan mengunduh kartu peserta.
- **Sisi Admin (Desktop-only):** Admin sekolah dapat mengelola data pendaftar, melakukan approval/reject, dan mengatur periode pendaftaran.

MVP ini berfokus pada **flow pendaftaran** secara menyeluruh. Fitur profil sekolah dan statistik dashboard di-defer ke fase berikutnya.

---

## 2. Tujuan & Scope MVP

### Tujuan
- Mendigitalisasi proses pendaftaran peserta didik baru MDS Cendekia
- Memberikan pengalaman pendaftaran yang mudah, cepat, dan informatif bagi calon siswa
- Memberikan kemudahan bagi admin dalam mengelola dan memvalidasi data pendaftar

### In Scope (MVP)
- Halaman landing PPDB dengan informasi pendaftaran
- Formulir pendaftaran multi-step (accordion)
- Upload berkas persyaratan
- Notifikasi email otomatis
- Cek status pendaftaran via nomor pendaftaran
- Download kartu peserta (generate PDF di FE)
- Dashboard admin: list pendaftar, approval/reject
- Pengaturan periode pendaftaran

### Out of Scope (Defer)
- Halaman profil sekolah
- Statistik & analitik dashboard admin
- Kuota pendaftaran otomatis
- Fitur multi-sekolah (multi-tenant)
- Navbar user

---

## 3. Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | Nuxt.js + Tailwind CSS v4 |
| Backend | NestJS |
| Icon | Lucide Icons |
| PDF Generation | jsPDF / pdfmake (FE-side) |
| Wilayah API | api-wilayah-indonesia (emsifa) |
| Design System | `npx getdesign@latest add apple` |
| API Docs | https://cendekia.sekata.my.id/api-docs |

> ⚠️ **Catatan:** Semua field, endpoint, dan validasi bersifat **subject to API contract**. Sesuaikan dengan dokumentasi BE saat development.

---

## 4. Design System

### 4.1 Setup Design System

```bash
npx getdesign@latest add apple
```

Jalankan perintah ini di awal setup project untuk menginstall design system base.

### 4.2 Warna (Color Tokens)

#### Primary — Roof Terracotta
| Token | Variable | Hex |
|---|---|---|
| primary-50 | `--color-primary-50` | `#fef3f2` |
| primary-100 | `--color-primary-100` | `#fee3e2` |
| primary-200 | `--color-primary-200` | `#ffccc9` |
| primary-300 | `--color-primary-300` | `#fda8a4` |
| primary-400 | `--color-primary-400` | `#fa766f` |
| primary-500 | `--color-primary-500` | `#f24a41` |
| primary-600 | `--color-primary-600` | `#df2c23` |
| primary-700 | `--color-primary-700` | `#bb221a` |
| primary-800 | `--color-primary-800` | `#a7221b` |
| primary-900 | `--color-primary-900` | `#81201b` |
| primary-950 | `--color-primary-950` | `#460c09` |

#### Secondary — Kournikova
| Token | Variable | Hex |
|---|---|---|
| secondary-50 | `--color-secondary-50` | `#fffceb` |
| secondary-100 | `--color-secondary-100` | `#fdf4c8` |
| secondary-200 | `--color-secondary-200` | `#fbe579` |
| secondary-300 | `--color-secondary-300` | `#fad74f` |
| secondary-400 | `--color-secondary-400` | `#f8c427` |
| secondary-500 | `--color-secondary-500` | `#f2a40e` |
| secondary-600 | `--color-secondary-600` | `#d67d09` |
| secondary-700 | `--color-secondary-700` | `#b2580b` |
| secondary-800 | `--color-secondary-800` | `#904410` |
| secondary-900 | `--color-secondary-900` | `#773810` |
| secondary-950 | `--color-secondary-950` | `#441c04` |

#### Semantic Tokens
```css
/* Background */
--color-bg-base:         #fef3f2;  /* primary-50, background halaman utama */
--color-bg-surface:      #ffffff;  /* card, modal, input */

/* Brand */
--color-brand:           #a7221b;  /* primary-800, sidebar admin, logo area */
--color-brand-hover:     #bb221a;  /* primary-700 */

/* CTA */
--color-cta:             #fbe579;  /* secondary-200, tombol utama */
--color-cta-hover:       #fad74f;  /* secondary-300 */
--color-cta-text:        #81201b;  /* primary-900, teks di atas tombol emas */

/* Text */
--color-text-primary:    #1a1a1a;
--color-text-secondary:  #6b7280;

/* Border */
--color-border:          #fee3e2;  /* primary-100 */

/* Feedback */
--color-success:         #16a34a;
--color-error:           #dc2626;
--color-warning:         #d97706;

/* Status Badge */
--color-status-pending:  #fbe579;  /* Menunggu — kuning */
--color-status-approved: #16a34a;  /* Diterima — hijau */
--color-status-rejected: #dc2626;  /* Ditolak — merah */
```

### 4.3 Tipografi

| Peran | Font | Weight |
|---|---|---|
| Heading | Plus Jakarta Sans | 600, 700 |
| Body | Inter | 400, 500 |

```css
--font-heading: 'Plus Jakarta Sans', sans-serif;
--font-body: 'Inter', sans-serif;
```

> Load via `@nuxt/google-fonts` — keduanya tersedia di Google Fonts.

### 4.4 Ikon

Gunakan **Lucide Icons** secara konsisten di seluruh sistem.

```bash
npm install lucide-vue-next
```

### 4.5 Loading State

Gunakan **dot wave animation** (3 titik naik turun bergelombang) sebagai loading indicator global.

```css
.dot-wave span {
  animation: wave 1.2s ease-in-out infinite;
}
.dot-wave span:nth-child(2) { animation-delay: 0.2s; }
.dot-wave span:nth-child(3) { animation-delay: 0.4s; }

@keyframes wave {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
```

### 4.6 Empty State

Gunakan pola berikut secara konsisten untuk seluruh kondisi empty state:

```
[Lucide Icon — ukuran besar, warna primary-300]
[Teks bold — "Belum ada data di sini"]
[Teks subtext — deskripsi singkat atau instruksi]
```

### 4.7 Toast Pill

Digunakan untuk feedback ringan yang tidak membutuhkan aksi dari user.

**Spesifikasi:**
- Bentuk: pill (border-radius penuh)
- Posisi: top-center
- Struktur: `[Lucide Icon]  [Teks feedback]`
- Auto dismiss: 3 detik
- Animasi: slide down + fade in saat muncul, fade out saat dismiss

**Digunakan pada:**
- Berhasil approve/reject (admin)
- Gagal upload file
- Session expired
- Akses periode pendaftaran ditutup

### 4.8 Bottom Sheet

Digunakan untuk momen penting yang membutuhkan atensi penuh user (mobile).

**Spesifikasi:**
- Tinggi: **85% viewport height** (fixed, tidak bisa di-drag)
- Gap atas: 15% viewport — backdrop gelap semi-transparan
- Drag handle: garis kecil di bagian atas sheet (dekoratif)
- Animasi: slide up dari bawah
- Dismiss: tap backdrop atau tombol tutup eksplisit

**Digunakan pada:**
- Konten card di halaman `/ppdb` (mobile)
- Hasil cek status pendaftaran (mobile)
- Nomor pendaftaran setelah submit berhasil

### 4.9 Favicon & Page Title

**Favicon:** Logo MDS Cendekia versi icon/square

| Halaman | Page Title |
|---|---|
| `/ppdb` | `PPDB MDS Cendekia` |
| `/ppdb/daftar` | `Formulir Pendaftaran \| PPDB MDS Cendekia` |
| `/ppdb/daftar/berkas` | `Upload Berkas \| PPDB MDS Cendekia` |
| `/ppdb/cek-status` | `Cek Status \| PPDB MDS Cendekia` |
| `/ppdb/kartu-peserta` | `Kartu Peserta \| PPDB MDS Cendekia` |
| `/admin/login` | `Login Admin \| MDS Cendekia` |
| `/admin/dashboard` | `Dashboard \| MDS Cendekia` |
| `/admin/pendaftaran` | `Pendaftaran \| MDS Cendekia` |
| `/admin/pengaturan` | `Pengaturan \| MDS Cendekia` |

---

## 5. UX Laws & Prinsip

### 5.1 Fitts's Law
> Waktu untuk mencapai target bergantung pada jarak dan ukuran target.

**Implementasi:**
- Tombol CTA utama berukuran besar dan mudah dijangkau
- Tombol Approve (hijau) di kanan, Tolak (merah outline) di kiri
- Touch target minimum 44x44px di mobile

### 5.2 Hick's Law
> Makin banyak pilihan, makin lama user mengambil keputusan.

**Implementasi:**
- Halaman `/ppdb` hanya menampilkan 3 card informasi
- Tombol CTA hanya 2: Daftar Sekarang & Cek Status
- Filter tabel admin menggunakan dropdown tunggal

### 5.3 Jakob's Law
> User mengharapkan sistem baru bekerja seperti sistem yang sudah mereka kenal.

**Implementasi:**
- Merah untuk error, hijau untuk success — konsisten dengan konvensi umum
- Menu Pengaturan ada di sidebar, bukan embed di dashboard
- Sorting tabel dengan klik header kolom
- Accordion yang sudah terbuka tidak dikunci kembali

### 5.4 Miller's Law
> Manusia rata-rata hanya dapat menyimpan 7±2 item dalam memori kerja.

**Implementasi:**
- Form dibagi ke accordion berdasarkan kategori
- Modal detail admin menggunakan tab untuk memisahkan kelompok informasi
- Upload berkas dipisah ke halaman tersendiri

### 5.5 Progressive Disclosure
> Tampilkan hanya informasi yang dibutuhkan user saat itu.

**Implementasi:**
- Accordion berikutnya hanya terbuka setelah accordion sebelumnya selesai
- Card di `/ppdb` hanya tampil ringkasan, detail muncul di bottom sheet/modal
- Data Wali hanya muncul jika user mencentang "Berbeda dengan orang tua"
- Tombol Kirim hanya aktif setelah semua accordion selesai

### 5.6 Law of Similarity
> Elemen yang tampak serupa dianggap memiliki fungsi yang serupa.

**Implementasi:**
- Semua tombol CTA utama menggunakan warna dan style yang konsisten
- Badge status menggunakan warna yang konsisten di seluruh sistem
- Card di halaman `/ppdb` menggunakan style yang sama

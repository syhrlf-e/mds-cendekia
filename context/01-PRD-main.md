# Product Requirements Document (PRD)
# Sistem PPDB — MDS Cendekia
### Mukti Daris Sasmita Cendekia

**Versi:** 1.1.0 (MVP)
**Tanggal:** Mei 2026
**Status:** Draft — Subject to API Contract
**API Docs:** https://cendekia.sekata.my.id/api-docs

---

## Daftar File PRD

| File | Konten |
|---|---|
| `00-PRD-design-language.md` | **Visual spec lengkap — WAJIB DIBACA PERTAMA** |
| `01-PRD-main.md` | Overview, Tech Stack, Design System ringkas, UX Laws |
| `02-PRD-sitemap.md` | Sitemap & Routing |
| `03-PRD-user-pages.md` | Semua halaman sisi user |
| `04-PRD-admin-pages.md` | Semua halaman sisi admin |
| `05-PRD-validation.md` | Validasi field & aturan bisnis |
| `06-PRD-api.md` | API & integrasi eksternal |
| `07-PRD-email.md` | Email templates |
| `08-PHASES.md` | Checklist phase development |

> ⚠️ **Urutan baca wajib:** `00` → `01` → file relevan lainnya sesuai kebutuhan phase.

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
- Data orang tua / wali (menunggu API siap)

---

## 3. Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | Nuxt.js + Tailwind CSS v4 |
| Backend | NestJS |
| Icon | Lucide Icons (`lucide-vue-next`) |
| PDF Generation | BE-side PDF generation |
| Wilayah API | api-wilayah-indonesia (emsifa) |
| Design System | `npx getdesign@latest add apple` |
| Font | Plus Jakarta Sans (heading) + Inter (body) via `@nuxt/google-fonts` |
| API Docs | https://cendekia.sekata.my.id/api-docs |

> ⚠️ **Catatan:** Semua field, endpoint, dan validasi bersifat **subject to API contract**. Fetch dokumentasi BE sebelum implementasi API apapun.

---

## 4. Design System

> ⚠️ Detail lengkap ada di `00-PRD-design-language.md` — file tersebut adalah acuan visual utama dan wajib dibaca sebelum mengerjakan UI apapun. Section ini hanya ringkasan dan pointer.

### 4.1 Setup

```bash
# Install design system base
npx getdesign@latest add apple

# Install icon
npm install lucide-vue-next

# Font via nuxt.config.ts @nuxt/google-fonts
# Plus Jakarta Sans: weights 400, 600
# Inter: weights 400, 500
```

### 4.2 Visual Personality

Sistem ini mengadopsi filosofi Apple: **UI meresap ke belakang, konten yang berbicara.**

```
Tone    : Prestisius, terpercaya, institusional — tapi tidak kaku
Feel    : Clean seperti Linear, warm seperti brand merah-emas MDS Cendekia
Prinsip : Whitespace adalah fitur. Border bukan shadow. Satu aksen warna.
```

### 4.3 Warna Utama

> Full color scale (Terracotta + Kournikova) dan semua semantic token ada di `00-PRD-design-language.md` section 2.

| Peran | Token | Hex |
|---|---|---|
| Background halaman | `--color-canvas-warm` | `#fef3f2` |
| Surface (card, modal, input) | `--color-canvas` | `#ffffff` |
| Brand / aksen | `--color-brand` | `#a7221b` |
| CTA button background | `--color-cta` | `#fbe579` | Hanya untuk accent/decorative, bukan button |
| CTA button text | `--color-cta-text` | `#81201b` | Hanya untuk accent/decorative, bukan button |
| Text utama | `--color-ink` | `#1d1d1f` |
| Text sekunder | `--color-ink-secondary` | `#6b7280` |
| Border / hairline | `--color-hairline` | `#fee3e2` |
| Success | `--color-success` | `#16a34a` |
| Error | `--color-error` | `#dc2626` |
| Warning | `--color-warning` | `#d97706` |

**Aturan warna kritis — tidak boleh dilanggar:**
```
✅ Background halaman SELALU #fef3f2 — bukan pure white
✅ Sidebar admin SELALU putih #ffffff — bukan merah
✅ Merah (#a7221b) HANYA untuk active state, focus ring, accent kecil
✅ Emas (#fbe579) HANYA untuk tombol CTA utama
✅ Card pakai border #fee3e2 — bukan box-shadow
✅ Text utama #1d1d1f — bukan pure black #000000
```

### 4.4 Tipografi

> Full type scale ada di `00-PRD-design-language.md` section 3.

| Font | Peran | Weight |
|---|---|---|
| Plus Jakarta Sans | Heading, label, button | 600 |
| Inter | Body, caption, input, placeholder | 400, 500 |

**Aturan tipografi kritis:**
```
✅ Heading selalu weight 600 — bukan 700
✅ Body text 17px — bukan 16px
✅ Letter-spacing negatif (-0.2px) di font size ≥ 17px
✅ Button weight 500
✅ Line-height tight di display (1.07–1.20), relaxed di body (1.47)
```

### 4.5 Spacing

> Full spacing system ada di `00-PRD-design-language.md` section 4.

Base unit: **4px** (micro) / **8px** (structural grid)

| Konteks | Nilai |
|---|---|
| Section vertical padding | 80px |
| Card padding | 24px |
| Input padding | 12px 16px |
| Button padding (primary) | 11px 22px |
| Button padding (sm) | 8px 16px |
| Gap antar form field | 16px |
| Gap antar card | 20px |
| Sidebar width | 240px |
| Table row height | 56px |
| Min touch target (mobile) | 44px × 44px |

### 4.6 Ringkasan Komponen Global

> Spesifikasi lengkap (ukuran, warna, animasi, state) ada di `00-PRD-design-language.md` section 6.

| Komponen | Ringkasan |
|---|---|
| Button Primary | Pill, bg emas `#fbe579`, teks `#81201b` |
| Button Secondary | Pill, outline merah `#a7221b` |
| Button Danger | Rect 8px radius, outline merah error |
| Button Success | Rect 8px radius, bg hijau solid |
| Input | Border `#fee3e2`, focus border `#a7221b` + shadow ring |
| Badge Status | Pill, soft color (bg + text, bukan solid) |
| Card | Border `#fee3e2`, radius 16px, tanpa shadow |
| Toast Pill | Near-black, pill, top-center, auto dismiss 3s |
| Bottom Sheet | 85vh fixed, radius 20px top, backdrop 40% |
| Modal | Radius 16px, backdrop 40%, scale animation |
| Accordion | Border `#fee3e2`, radius 12px, 3 state: locked/active/done |
| Sidebar | Putih, border-right `#fee3e2`, active indicator merah kiri 3px |
| Table | Border `#fee3e2`, radius 12px, header uppercase 12px |
| Empty State | Icon 48px Terracotta-300, bold title, muted subtext |
| Loading | Dot wave 3 titik warna `#a7221b` |

### 4.7 Elevation & Shadow

```
Filosofi: SATU shadow di seluruh sistem — hanya untuk modal & toast.

Card         → border saja, NO shadow
Button       → NO shadow
Modal        → rgba(0,0,0,0.22) 3px 5px 30px 0
Toast        → rgba(0,0,0,0.22) 3px 5px 30px 0
Sticky bar   → backdrop-filter blur(20px)
```

### 4.8 Favicon & Page Title

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
- Touch target minimum **44×44px** di mobile

### 5.2 Hick's Law
> Makin banyak pilihan, makin lama user mengambil keputusan.

**Implementasi:**
- Halaman `/ppdb` hanya menampilkan **3 card** informasi
- Tombol CTA hanya 2: Daftar Sekarang & Cek Status
- Filter tabel admin menggunakan **1 dropdown** tunggal

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
- Form dibagi ke accordion berdasarkan kategori (Data Diri, Asal Sekolah)
- Modal detail admin menggunakan sidebar tab untuk memisahkan kelompok informasi
- Upload berkas dipisah ke halaman tersendiri

### 5.5 Progressive Disclosure
> Tampilkan hanya informasi yang dibutuhkan user saat itu.

**Implementasi:**
- Accordion berikutnya hanya terbuka setelah accordion sebelumnya selesai
- Card di `/ppdb` hanya tampil ringkasan, detail muncul di bottom sheet/modal
- Tombol Kirim hanya aktif setelah semua accordion selesai

### 5.6 Law of Similarity
> Elemen yang tampak serupa dianggap memiliki fungsi yang serupa.

**Implementasi:**
- Semua tombol CTA utama menggunakan warna dan style yang konsisten
- Badge status menggunakan warna yang konsisten di seluruh sistem
- Card di halaman `/ppdb` menggunakan style yang sama

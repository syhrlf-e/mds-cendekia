# PRD — Halaman Admin
# Sistem PPDB MDS Cendekia
**Versi:** 1.1.0

> ⚠️ Seluruh halaman admin hanya dapat diakses dari **desktop**. Tidak ada tampilan responsif untuk mobile.
> Baca `00-PRD-design-language.md` sebelum mengerjakan file ini.
> Semua spesifikasi komponen mengacu ke file tersebut.

---

## 1. Sidebar Admin

Spesifikasi lengkap sidebar lihat `00-PRD-design-language.md` section 6.9.

```
┌──────────────────────┐
│  [Logo MDS] MDS      │  ← Logo 32px + text 15px/600/#1d1d1f
│  Cendekia            │  ← height 64px, border-bottom #fee3e2
├──────────────────────┤
│  🏠  Dashboard       │  ← menu item height 40px, radius 8px
│  👥  Pendaftaran     │  ← fully functional (MVP)
│  ⚙️  Pengaturan     │
├──────────────────────┤
│                      │
│  [LogOut] Keluar     │  ← pojok kiri bawah
└──────────────────────┘
```

**Spesifikasi visual:**
- Width: `240px`, background: `#ffffff`, border-right: `1px solid #fee3e2`
- Menu item default: text `#6b7280`, icon `16px`
- Menu item hover: background `#fef3f2`, text `#1d1d1f`
- Menu item active: background `#fef3f2`, text `#a7221b`, font-weight `600`, border-left `3px solid #a7221b`, icon color `#a7221b`
- Logout hover: background `#fee2e2`, text `#dc2626`

> ⚠️ Sidebar background PUTIH `#ffffff` — bukan merah. Merah hanya muncul sebagai active indicator (border-left 3px).

---

## 2. `/admin/login` — Login Admin

### Layout
Card login di tengah viewport (horizontally & vertically centered).

**Card spec:**
- Background: `#ffffff`
- Border: `1px solid #fee3e2`
- Border radius: `16px`
- Padding: `40px`
- Width: `400px`
- Shadow: `rgba(0,0,0,0.22) 3px 5px 30px 0`

### Field
- Email → spec input di `00` section 6.2
- Password → spec input di `00` section 6.2 + toggle show/hide password (icon `Eye` / `EyeOff` Lucide)

### State Normal
- Error message: teks merah `12px` di bawah form setelah submit gagal
- Percobaan 1–3: tampilkan pesan error biasa, form tetap aktif

### Behavior Rate Limiter — Exponential Backoff

| Percobaan Gagal | Lockout |
|---|---|
| 1 – 3 | Tidak terkena limit, pesan error biasa |
| 4 | Lockout 30 detik |
| 5 | Lockout 1 menit |
| 6 | Lockout 5 menit |
| 7+ | Lockout 15 menit |

### State Card saat Lockout

Card berubah total — bukan sekadar error message:

```
┌──────────────────────────────────────┐
│                                      │
│   [AlertTriangle — Lucide 40px]      │
│   warna: #dc2626                     │
│                                      │
│   Terlalu Banyak Percobaan Login     │
│   17px / 600 / #1d1d1f              │
│                                      │
│   Coba lagi dalam                    │
│   14px / 400 / #6b7280              │
│                                      │
│   [XX detik]                         │
│   28px / 600 / #a7221b  ← countdown │
│                                      │
│   [Tombol Login — disabled]          │
│   opacity 0.4, cursor not-allowed    │
│                                      │
└──────────────────────────────────────┘
```

- Seluruh field input **disabled** selama lockout
- Countdown realtime di UI (detik berkurang tiap 1 detik)
- Setelah countdown habis → card kembali ke form normal **otomatis**
- Lockout ditangani di **BE** — FE membaca response error dan menampilkan state + countdown

> ⚠️ JWT atau Session: menyusul setelah dokumentasi endpoint dapat diakses di https://cendekia.sekata.my.id/api-docs

### Setelah Login Berhasil
Redirect ke `/admin/pendaftaran`

---

## 3. `/admin/dashboard` — Dashboard

### MVP Placeholder

Gunakan `Empty State` pattern (spec di `00` section 6.11):

```
[Icon: LayoutDashboard — Lucide, 48px, #fda8a4]
Dashboard sedang dalam penyempurnaan
Fitur ini akan segera hadir
```

- Container: flex center, full height
- Icon: `LayoutDashboard` (Lucide), `48px`, warna `#fda8a4` (Terracotta-300)
- Title: `17px / 600 / #1d1d1f`
- Subtitle: `14px / 400 / #6b7280`

---

## 4. `/admin/pendaftaran` — List Pendaftar

### Layout Halaman

```
┌──────────────────────────────────────────────────────┐
│  Pendaftaran                    [jumlah total data]  │
│  ────────────────────────────────────────────────── │
│  [🔍 Cari nama / nomor pendaftaran]  [Filter ▾]     │
│  ────────────────────────────────────────────────── │
│  [Tabel]                                             │
└──────────────────────────────────────────────────────┘
```

**Header halaman:**
- Judul: `display-md` (28px / 600 / #1d1d1f)
- Jumlah data: `caption` (14px / 400 / #6b7280) — "X pendaftar"

### Area Kontrol (Search & Filter)

```
[🔍 Cari nama / nomor pendaftaran.......]  [Filter Status ▾]
```

**Search Input:**
- Spec input di `00` section 6.2
- Icon `Search` (Lucide, 16px, `#86868b`) di dalam input sebelah kiri
- Padding left: `40px` (beri ruang untuk icon)
- Placeholder: "Cari nama atau nomor pendaftaran..."
- Debounce: **300ms** sebelum hit API
- Cari by: nama lengkap / nomor pendaftaran

**Filter Dropdown:**
- Gunakan `Button Ghost` style (spec di `00` section 6.1)
- Icon `ChevronDown` (Lucide, 14px) di kanan label
- Opsi dropdown:
  - Semua *(default)*
  - Menunggu
  - Diterima
  - Ditolak
- Kombinasi search + filter berjalan bersamaan

### Tabel List Pendaftar

Spec tabel lengkap lihat `00-PRD-design-language.md` section 6.10.

**Kolom:**
| No | Nama | Asal Sekolah | Tgl Daftar | Status | Aksi |
|---|---|---|---|---|---|

**Header row:**
- Background: `#fef3f2`
- Font: `12px / 600 / uppercase / #6b7280 / letter-spacing 0.05em`
- Height: `44px`

**Body row:**
- Height: `56px`
- Font: `14px / 400 / #1d1d1f`
- Hover: background `#fef3f2`, transition `100ms ease`
- Border-bottom: `1px solid #fef3f2`

**Badge Status** (spec di `00` section 6.3):
| Status | Badge bg | Badge text |
|---|---|---|
| Menunggu | `#fef9c3` | `#854d0e` |
| Diterima | `#dcfce7` | `#166534` |
| Ditolak | `#fee2e2` | `#991b1b` |

**Sorting:**
| Kolom | Behavior |
|---|---|
| Tgl Daftar | Default: descending (terbaru dulu) → klik: ascending → klik lagi: descending |
| Nama | A–Z → Z–A → default |

- Icon sort aktif: `ChevronUp` / `ChevronDown` (Lucide, 14px, `#a7221b`)
- Icon sort default: `ChevronsUpDown` (Lucide, 14px, `#86868b`)

**Kolom Aksi:**
- Tombol **"Lihat Detail"** → `Button Ghost` style → membuka Modal Detail Pendaftar

**Empty State** (spec di `00` section 6.11):
```
[Icon: Users — Lucide, 48px, #fda8a4]
Belum ada data pendaftar
Data pendaftar akan muncul di sini
```

---

## 5. Modal Detail Pendaftar

Spec modal lengkap lihat `00-PRD-design-language.md` section 6.7.

### Ukuran
- Width: `80vw`, Height: `80vh`
- Border radius: `16px`
- Shadow: `rgba(0,0,0,0.22) 3px 5px 30px 0`

### Layout

```
┌────────────────────────────────────────────────┐
│  Detail Pendaftar                      [ × ]   │  ← header, border-bottom #fee3e2
├─────────────────────┬──────────────────────────┤
│   [Foto Siswa]      │  Nomor Pendaftaran: ...  │
│   80px × 100px      │  14px/400/#6b7280        │
│   radius 8px        │                          │
│   border #fee3e2    │  Nama Lengkap: ...       │
│                     │  17px/600/#1d1d1f        │
│                     │                          │
│                     │  Tanggal Daftar: ...     │
│                     │  [Status Badge]          │
├────────┬────────────┴──────────────────────────┤
│        │                                       │
│ Data   │                                       │
│ Diri   │   Konten tab yang dipilih             │
│────────│                                       │
│ Orang  │                                       │
│ Tua    │                                       │
│────────│   (Orang Tua: DEFER sampai API siap)  │
│ Berkas │                                       │
│        │                                       │
├────────┴───────────────────────────────────────┤
│  [ Tolak ]                        [ Terima ]   │  ← sticky bottom, border-top #fee3e2
└────────────────────────────────────────────────┘
```

### Sidebar Tab Vertikal

**Spesifikasi:**
- Width sidebar tab: `120px`
- Border-right: `1px solid #fee3e2`
- Padding tab item: `12px 16px`
- Font: `14px / 400 / #6b7280`
- Border radius tab: `8px`

**State tab:**
- Default: text `#6b7280`, background transparent
- Hover: background `#fef3f2`, text `#1d1d1f`
- Active: background `#fef3f2`, text `#a7221b`, font-weight `600`, border-left `3px solid #a7221b`

**Daftar tab:**
- **Data Diri** *(default aktif)* → menampilkan semua field data diri siswa
- **Orang Tua** *(DEFER)* → tampilkan placeholder "Segera hadir" sampai API siap
- **Berkas** → list berkas + tombol Lihat per berkas

### Tab Data Diri

Tampilkan semua field dalam grid 2 kolom:

```
Nama Lengkap     : [value]     NIK              : [value]
Email            : [value]     No. HP           : [value]
Tempat Lahir     : [value]     Tanggal Lahir    : [value]
Jenis Kelamin    : [value]     Agama            : [value]
Alamat           : [value — full width]
RT / RW          : [value]     Kode Pos         : [value]
Provinsi         : [value]     Kota/Kab         : [value]
Kecamatan        : [value]     Kelurahan        : [value]
```

**Spesifikasi:**
- Label: `12px / 600 / uppercase / #6b7280 / letter-spacing 0.05em`
- Value: `14px / 400 / #1d1d1f`
- Gap antar item: `16px`
- Divider section: `1px solid #fee3e2`

### Tab Berkas

Setiap berkas ditampilkan sebagai baris list:

```
[FileText icon 16px #a7221b]  Nama Berkas          [Lihat →]
─────────────────────────────────────────────────────────────
[FileText icon 16px #a7221b]  Nama Berkas          [Lihat →]
```

**Spesifikasi:**
- Row height: `48px`
- Border-bottom: `1px solid #fef3f2`
- Nama berkas: `14px / 400 / #1d1d1f`
- Tombol "Lihat": `Button Ghost` style → buka di tab baru browser
- Icon: `FileText` (Lucide, 16px, `#a7221b`)

### Tombol Aksi (Sticky Bottom)

- Padding: `16px 24px`
- Border-top: `1px solid #fee3e2`
- Background: `#ffffff`

**[ Tolak ]** → `Button Danger` (spec di `00` section 6.1):
- Background: transparent
- Text: `#dc2626`
- Border: `1.5px solid #dc2626`
- Border radius: `8px`
- Padding: `8px 16px`
- Hover bg: `#fee2e2`

**[ Terima ]** → `Button Success` (spec di `00` section 6.1):
- Background: `#16a34a`
- Text: `#ffffff`
- Border radius: `8px`
- Padding: `8px 16px`
- Hover bg: `#15803d`

---

## 6. Flow Approve

1. Admin klik **"Terima"**
2. Muncul `Modal` konfirmasi kecil (max-width 400px):
   - Judul: "Terima Pendaftar?"
   - Body: "Tindakan ini akan mengirimkan email notifikasi ke pendaftar."
   - Footer: **[Batal]** (Button Ghost) | **[Ya, Terima]** (Button Success)
3. Klik **"Ya, Terima"**:
   - Loading dot wave di tombol
   - BE update status → BE kirim email approval
   - Toast success: `[CheckCircle icon] Pendaftar berhasil diterima`
   - Semua modal tutup
4. Klik **"Batal"** → modal konfirmasi tutup

---

## 7. Flow Reject

1. Admin klik **"Tolak"**
2. **Modal 1** muncul (max-width 480px):
   - Judul: "Alasan Penolakan"
   - Body: textarea alasan (spec input di `00` section 6.2, min-height 120px)
   - Placeholder: "Tuliskan alasan penolakan..."
   - Footer: **[Batal]** (Button Ghost) | **[Kirim]** (Button Danger)

**Skenario A — Admin isi alasan → klik "Kirim":**
- Loading dot wave di tombol
- BE update status → BE kirim email rejection + alasan
- Toast error: `[XCircle icon] Pendaftar berhasil ditolak`
- Semua modal tutup

**Skenario B — Admin klik "Batal" saat textarea KOSONG:**
- Modal langsung tutup, tidak ada konfirmasi

**Skenario C — Admin klik "Batal" saat textarea SUDAH ADA TEKS:**
- **Modal 2** muncul (max-width 360px) di atas Modal 1:
  - Judul: "Kamu berubah pikiran?"
  - Body: "Alasan yang sudah ditulis akan hilang."
  - Footer: **[Tidak]** (Button Ghost) | **[Ya, Keluar]** (Button Danger outline)
  - Klik **"Ya, Keluar"** → kedua modal tutup, teks alasan dibuang
  - Klik **"Tidak"** → Modal 2 tutup, kembali ke Modal 1, teks alasan **tetap ada**

---

## 8. `/admin/pengaturan` — Pengaturan PPDB

### Layout Halaman

```
┌──────────────────────────────────────────┐
│  Pengaturan                              │  ← judul halaman
│  ──────────────────────────────────────  │
│  ┌────────────────────────────────────┐  │
│  │  Periode Pendaftaran               │  │  ← card
│  │                                    │  │
│  │  Status Pendaftaran                │  │
│  │  [Toggle ON/OFF]  Aktif / Nonaktif │  │
│  │                                    │  │
│  │  Tanggal Buka   [📅 date picker]   │  │
│  │  Tanggal Tutup  [📅 date picker]   │  │
│  │                                    │  │
│  │  * pesan error (jika ada)          │  │
│  │  12px / #dc2626                    │  │
│  │                                    │  │
│  │                    [ Terapkan ]    │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

**Card spec** (lihat `00` section 6.4):
- Background: `#ffffff`
- Border: `1px solid #fee3e2`
- Border radius: `16px`
- Padding: `24px`
- Max-width: `480px`

**Toggle:**
- ON: background `#16a34a` (hijau)
- OFF: background `#d1d5db` (abu)
- Transition: `150ms ease`

**Date picker:**
- Gunakan spec input di `00` section 6.2
- Icon `Calendar` (Lucide, 16px, `#86868b`) di dalam input sebelah kanan

**Tombol Terapkan:**
- Gunakan `Button Primary` (pill, emas) — spec di `00` section 6.1
- Posisi: kanan bawah card

### Logic Validasi

| Kondisi | Behavior |
|---|---|
| Toggle OFF | Simpan langsung, pendaftaran ditutup |
| Toggle ON + kedua tanggal belum diisi | Error: "Harap isi tanggal buka dan tutup pendaftaran" |
| Toggle ON + hanya tanggal buka diisi | Error: "Harap isi tanggal tutup pendaftaran" |
| Toggle ON + hanya tanggal tutup diisi | Error: "Harap isi tanggal buka pendaftaran" |
| Toggle ON + kedua tanggal lengkap | Simpan, pendaftaran aktif sesuai interval |

**Toast setelah simpan berhasil:**
`[CheckCircle icon] Pengaturan berhasil disimpan`

### Efek di Halaman User (`/ppdb`)

| Kondisi | Tampilan Tombol "Daftar Sekarang" |
|---|---|
| Toggle OFF | Disabled — "Pendaftaran Ditutup" |
| Toggle ON, sebelum tanggal buka | Disabled — "Pendaftaran dibuka [tanggal]" |
| Toggle ON, dalam interval | Aktif normal |
| Toggle ON, setelah tanggal tutup | Disabled — "Pendaftaran telah ditutup" |

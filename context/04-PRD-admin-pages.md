# PRD — Halaman Admin
# Sistem PPDB MDS Cendekia

> ⚠️ Seluruh halaman admin hanya dapat diakses dari **desktop**. Tidak ada tampilan responsif untuk mobile.

---

## 1. Sidebar Admin

```
┌──────────────────────┐
│  [Logo MDS Cendekia] │
│  MDS Cendekia        │
├──────────────────────┤
│  🏠  Dashboard       │
│  👥  Pendaftaran     │  ← fully functional (MVP)
│  ⚙️  Pengaturan     │
├──────────────────────┤
│                      │
│  [Logout Icon] Keluar│  ← pojok kiri bawah
└──────────────────────┘
```

**Warna sidebar:** background menggunakan Terracotta-800 `#a7221b` atau sebagai accent aktif menu.

---

## 2. `/admin/login` — Login Admin

### Layout
Card login di tengah viewport (horizontally & vertically centered).

### Field
- Email
- Password

### Behavior Normal
- Error message tampil di bawah form jika login gagal (percobaan 1–3)

### Behavior Rate Limiter — Exponential Backoff

| Percobaan Gagal | Lockout |
|---|---|
| 1 – 3 | Tidak terkena limit, tampilkan pesan error biasa |
| 4 | Lockout 30 detik |
| 5 | Lockout 1 menit |
| 6 | Lockout 5 menit |
| 7+ | Lockout 15 menit |

### State Card saat Lockout

```
┌─────────────────────────────┐
│                             │
│  [Lucide Icon ⚠️]           │
│                             │
│  Terlalu Banyak             │
│  Percobaan Login            │
│                             │
│  Coba lagi dalam            │
│  [XX detik]  ← countdown   │
│                             │
│  [Tombol Login — disabled]  │
│                             │
└─────────────────────────────┘
```

- Seluruh field input **disabled** selama lockout
- Countdown realtime di UI
- Setelah countdown habis → card kembali ke form normal **otomatis**
- Lockout ditangani di **BE (NestJS rate limiter)** — FE hanya membaca response error dan menampilkan state + countdown

> ⚠️ JWT atau Session: menyusul setelah dokumentasi endpoint dapat diakses di https://cendekia.sekata.my.id/api-docs

### Setelah Login Berhasil
Redirect ke `/admin/pendaftaran`

---

## 3. `/admin/dashboard` — Dashboard

### MVP Placeholder
Tampilkan empty state di tengah halaman:

```
[Lucide Icon — ukuran besar]
Dashboard sedang dalam penyempurnaan
Fitur ini akan segera hadir
```

---

## 4. `/admin/pendaftaran` — List Pendaftar

### Area Kontrol (Search & Filter)

```
[🔍 Cari nama / nomor pendaftaran.......]  [Filter Status ▾]
```

**Search:**
- Realtime dengan debounce **300ms**
- Cari by: nama lengkap / nomor pendaftaran
- Kombinasi search + filter berjalan bersamaan

**Filter Dropdown:**
- Semua *(default aktif)*
- Menunggu
- Diterima
- Ditolak

### Tabel List Pendaftar

| No | Nama | Asal Sekolah | Tgl Daftar | Status | Aksi |
|---|---|---|---|---|---|

**Badge Status:**
| Status | Warna |
|---|---|
| Menunggu | Kournikova `#fbe579`, teks gelap |
| Diterima | Hijau `#16a34a`, teks putih |
| Ditolak | Merah `#dc2626`, teks putih |

**Sorting:**
| Kolom | Behavior |
|---|---|
| Tgl Daftar | Sort ascending/descending, **default: descending (terbaru dulu)** |
| Nama | Sort A–Z / Z–A |

- Indikator sorting: ikon panah ↑↓ di header kolom aktif
- Klik header → ascending → klik lagi → descending → klik lagi → kembali default

**Kolom Aksi:**
- Tombol **"Lihat Detail"** → membuka Modal Detail Pendaftar

**Empty State:**
- Jika belum ada pendaftar atau hasil search kosong → tampilkan empty state pattern

---

## 5. Modal Detail Pendaftar

### Ukuran
80% viewport width & height

### Layout

```
┌─────────────────────────────────────────────┐
│  Detail Pendaftar                   [ × ]   │
├──────────────────┬──────────────────────────┤
│   [Foto Siswa]   │  Nomor Pendaftaran: ...  │
│                  │  Tanggal Daftar   : ...  │
│                  │  [Status Badge]          │
├────────┬─────────┴──────────────────────────┤
│ Data   │                                    │
│ Diri   │                                    │
│────────│   Konten tab yang dipilih          │
│ Orang  │                                    │
│ Tua    │                                    │
│────────│                                    │
│ Berkas │                                    │
├────────┴────────────────────────────────────┤
│  [ Tolak ]                      [ Terima ]  │
└─────────────────────────────────────────────┘
```

### Sidebar Tab (Vertical)
- **Data Diri** *(default aktif)* → menampilkan semua data diri siswa
- **Orang Tua** → accordion internal:
  - ▼ Data Ayah *(default terbuka)*
  - ▶ Data Ibu
  - ▶ Data Wali *(hanya tampil jika ada)*
- **Berkas** → list berkas + tombol "Lihat" per berkas

**Active tab indicator:** Terracotta-800 `#a7221b`

### Tab Berkas
Setiap berkas ditampilkan sebagai baris:
```
📄 Nama Berkas          [Lihat]
```
Tombol **"Lihat"** → buka preview di tab baru browser

### Tombol Aksi (Sticky Bottom)
- **[ Tolak ]** → merah outline, posisi kiri
- **[ Terima ]** → hijau solid, posisi kanan
- Kedua tombol sticky di bottom modal, selalu visible

---

## 6. Flow Approve

1. Admin klik **"Terima"**
2. Muncul modal konfirmasi kecil: *"Terima pendaftar ini?"*
   - **"Ya"** → BE update status → BE kirim email approval → toast "Pendaftar berhasil diterima" → modal tutup
   - **"Batal"** → modal konfirmasi tutup

---

## 7. Flow Reject

1. Admin klik **"Tolak"**
2. **Modal 1** muncul: textarea alasan penolakan + tombol **"Kirim"** & **"Batal"**

**Skenario A — Admin isi alasan → klik "Kirim":**
- BE update status → BE kirim email rejection + alasan → toast "Pendaftar ditolak"
- Semua modal tutup

**Skenario B — Admin klik "Batal" saat textarea KOSONG:**
- Modal langsung tutup tanpa konfirmasi

**Skenario C — Admin klik "Batal" saat textarea SUDAH ADA TEKS:**
- **Modal 2** muncul: *"Kamu berubah pikiran?"*
  - **"Ya"** → kedua modal tutup, teks alasan dibuang
  - **"Tidak"** → kembali ke Modal 1, teks alasan **tetap ada**

---

## 8. `/admin/pengaturan` — Pengaturan PPDB

### Layout

```
┌───────────────────────────────────┐
│  Pengaturan Pendaftaran           │
│                                   │
│  Status Pendaftaran               │
│  Buka / Tutup  [Toggle ON/OFF]    │
│                                   │
│  Tanggal Buka   [📅 date picker]  │
│  Tanggal Tutup  [📅 date picker]  │
│                                   │
│  * pesan error (jika ada)         │
│                                   │
│                    [ Terapkan ]   │
└───────────────────────────────────┘
```

### Logic Validasi Tombol Terapkan

| Kondisi | Behavior |
|---|---|
| Toggle OFF | Simpan langsung, pendaftaran ditutup |
| Toggle ON + kedua tanggal belum diisi | Error: "Harap isi tanggal buka dan tutup pendaftaran" |
| Toggle ON + hanya tanggal buka diisi | Error: "Harap isi tanggal tutup pendaftaran" |
| Toggle ON + hanya tanggal tutup diisi | Error: "Harap isi tanggal buka pendaftaran" |
| Toggle ON + kedua tanggal lengkap | Simpan, pendaftaran aktif sesuai interval |

### Efek di Halaman User (`/ppdb`)

| Kondisi | Tampilan Tombol "Daftar Sekarang" |
|---|---|
| Toggle OFF | Disabled — "Pendaftaran Ditutup" |
| Toggle ON, sebelum tanggal buka | Disabled — "Pendaftaran dibuka [tanggal]" |
| Toggle ON, dalam interval | Aktif normal |
| Toggle ON, setelah tanggal tutup | Disabled — "Pendaftaran telah ditutup" |

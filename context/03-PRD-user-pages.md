# PRD — Halaman User
# Sistem PPDB MDS Cendekia

---

## 1. `/ppdb` — Landing PPDB

### Layout
- **Mobile:** single column, padding horizontal 16px, konten di tengah viewport
- **Desktop:** 60% kiri (ilustrasi/branding) | 40% kanan (konten interaktif)
- Tidak ada navbar untuk MVP

### Hero Section
- Logo MDS Cendekia
- Judul: "Penerimaan Peserta Didik Baru"
- Subjudul: tahun ajaran aktif
- 2 CTA Button:
  - **[Daftar Sekarang]** → primary button (emas `#fbe579`) → `/ppdb/daftar`
  - **[Cek Status]** → secondary button (outline) → `/ppdb/cek-status`

**Behavior tombol berdasarkan periode:**
| Kondisi | Tampilan Tombol "Daftar Sekarang" |
|---|---|
| Sebelum tanggal buka | Disabled — label: "Pendaftaran dibuka [tanggal]" |
| Dalam interval aktif | Aktif normal |
| Setelah tanggal tutup | Disabled — label: "Pendaftaran telah ditutup" |

### Timeline Pendaftaran
- Menampilkan tahapan: **Pendaftaran → Seleksi Berkas → Pengumuman**
- Layout: horizontal di desktop, vertikal di mobile

### 3 Card Informasi

**Layout:**
- Mobile: stack vertikal full width
- Desktop: 2 card atas sejajar + 1 card center di bawah

| Card | Judul | Subtext |
|---|---|---|
| 1 | Alur Pendaftaran | "Ikuti langkah berikut untuk mendaftar" |
| 2 | Persyaratan Berkas | "Siapkan dokumen sebelum mendaftar" |
| 3 | Informasi Penting | "Baca sebelum mendaftar" |

**Behavior klik card:**
- **Mobile** → muncul Bottom Sheet (85% height)
- **Desktop** → muncul Modal di tengah viewport

**Konten detail per card:**

*Card 1 — Alur Pendaftaran:*
1. Isi formulir data diri & orang tua
2. Upload berkas persyaratan
3. Dapatkan nomor pendaftaran
4. Tunggu hasil seleksi

*Card 2 — Persyaratan Berkas:*
- Foto siswa 3x4 berwarna
- Buku Rapor SMP asli & fotocopy
- Surat Keterangan Nilai Rapor Semester I–V
- Ijazah / SKL asli & fotocopy
- Akta Kelahiran asli & fotocopy
- Kartu Keluarga asli & fotocopy

*Card 3 — Informasi Penting:*
- Informasi kuota (jika tersedia)
- Kontak sekolah
- Catatan penting dari pihak sekolah

---

## 2. `/ppdb/daftar` — Formulir Pendaftaran

### Layout
- **Mobile:** full width, padding horizontal 16px
- **Desktop:** accordion di tengah, lebar 50% viewport, horizontally centered

### Behavior Accordion

- Accordion **pertama (Data Diri)** default terbuka
- Accordion berikutnya **terkunci** sampai accordion sebelumnya terisi lengkap
- Setelah unlock, accordion **tidak bisa dikunci kembali** meskipun user edit ulang
- Accordion yang sudah selesai menampilkan **icon centang ✅** di header
- Validasi berjalan **real-time di state** — bukan submit per accordion
- Tombol **"Berikutnya"** disabled sampai semua accordion berstatus ✅

### Tombol Berikutnya
- Aktif hanya jika semua accordion ✅
- Klik → Modal konfirmasi: **"Data sudah sesuai?"**
  - **"Ya, Lanjut"** → redirect ke `/ppdb/daftar/berkas`
  - **"Belum"** → modal tutup, user kembali edit

---

### Accordion 1 — Data Diri Siswa *(default terbuka)*

| Field | Tipe Input | Keterangan |
|---|---|---|
| Nama | Text | Required |
| NIK | Text | Required, 16 digit, cek duplikat ke API |
| Email | Text | Required, format email valid, cek duplikat ke API |
| No Telepon | Text | Required, format Indonesia (08xx/+628xx) |
| Tanggal Lahir | Date picker | Required, format RFC 3339: 2017-07-21T17:32:28Z |
| Tempat Lahir | Text | Required |
| Jenis Kelamin | Radio | Required: Laki-laki / Perempuan |
| Agama | Dropdown | Required |
| Alamat | Textarea | Required, min 10 karakter |
| RT | Text | Required |
| RW | Text | Required |
| Kelurahan | Dropdown | Required, cascade dari kecamatan |
| Kecamatan | Dropdown | Required, cascade dari kabupaten_kota |
| Kabupaten/Kota | Dropdown | Required, cascade dari provinsi |
| Provinsi | Dropdown | Required, data dari API Wilayah |
| Kode Pos | Text | Required, 5 digit angka (input manual) |

**Cascade Dropdown Wilayah:**
- Dropdown di bawah selalu **reset dan disabled** sampai dropdown di atasnya dipilih
- Data dari: https://www.emsifa.com/api-wilayah-indonesia/

---

### Accordion 2 — Data Asal Sekolah

| Field | Tipe Input | Keterangan |
|---|---|---|
| Nama Sekolah Asal | Text | Required, min 5 karakter |
| Alamat Sekolah Asal | Textarea | Required, min 10 karakter |
| NPSN Sekolah Asal | Text | Required, 8 digit angka |
| Tahun Lulus | Number | Required, 4 digit, tidak boleh future year |
| No Ijazah | Text | Required |

---

### Accordion 3 — Data Orang Tua / Wali

#### Sub-section: Data Ayah

| Field | Tipe Input | Keterangan |
|---|---|---|
| Nama Lengkap Ayah | Text | Required |
| NIK Ayah | Text | Required, 16 digit angka |
| Tempat Lahir | Text | Required |
| Tanggal Lahir | Date picker | Required |
| Pendidikan Terakhir | Dropdown | Required |
| Pekerjaan | Text | Required |
| Penghasilan Per Bulan | Dropdown | Required (range) |
| No. HP Ayah | Text | Required, format Indonesia |

#### Sub-section: Data Ibu
*(field identik dengan Data Ayah)*

#### Sub-section: Data Wali *(kondisional)*

Muncul hanya jika user mencentang: **"Wali berbeda dengan orang tua"**

| Field | Tipe Input | Keterangan |
|---|---|---|
| Nama Lengkap Wali | Text | Required if checked |
| Hubungan dengan Siswa | Text | Required if checked |
| No. HP Wali | Text | Required if checked, format Indonesia |
| Alamat Wali | Textarea | Required if checked |

---

## 3. `/ppdb/daftar/berkas` — Upload Berkas

### Layout
- Sama dengan halaman formulir (mobile full width, desktop 50% center)

### Daftar Berkas

| No | Nama Berkas | Format | Maks. Ukuran |
|---|---|---|---|
| 1 | Foto Siswa (3x4 berwarna) | JPG / PNG | 1 MB |
| 2 | Buku Rapor SMP | PDF | 2 MB |
| 3 | Surat Keterangan Nilai Rapor Semester I–V | PDF | 2 MB |
| 4 | Ijazah / SKL | PDF | 2 MB |
| 5 | Akta Kelahiran | PDF | 2 MB |
| 6 | Kartu Keluarga | PDF | 2 MB |

### Behavior Upload
- Setiap berkas memiliki upload area sendiri
- Setelah file dipilih: tampilkan nama file + ukuran
- Validasi format & ukuran terjadi saat file dipilih
- Error: teks merah di bawah upload area
- Tombol **"Kirim"** disabled sampai semua berkas terupload

### Flow Submit
1. User klik **"Kirim"**
2. Muncul modal konfirmasi: **"Data sudah sesuai?"**
   - **"Ya, Kirim"** → hit API → loading dot wave
   - **"Belum"** → modal tutup
3. Berhasil → muncul **Bottom Sheet** berisi:
   - Nomor Pendaftaran: `MDS-2025-XXXX`
   - Pesan: "Pendaftaran berhasil! Cek email kamu untuk informasi lebih lanjut."
   - Tombol: **"Cek Status Pendaftaran"** → `/ppdb/cek-status`

---

## 4. `/ppdb/cek-status` — Cek Status Pendaftaran

### Layout
- **Mobile:** input di tengah viewport (vertically centered), padding 16px
- **Desktop:** 60% kiri (ilustrasi/branding) | 40% kanan (form + hasil)

### Konten Form
- Input: Nomor Pendaftaran
- Tombol: **"Cek Sekarang"**

### Behavior Hasil

**Mobile:**
- Klik "Cek Sekarang" → muncul **Bottom Sheet** (85% height)
- Animasi: slide up dari bawah

**Desktop:**
- Hasil muncul di kolom kanan (40%)
- Animasi: **slide in from right**

### Konten Hasil

```
[STATUS BADGE]
"Status pendaftaran kamu: ..."

── Informasi Pendaftaran ──────────
Nomor Pendaftaran  : MDS-2025-XXXX
Tanggal Daftar     : DD/MM/YYYY

── Identitas Calon Siswa ──────────
Nama Lengkap       : ...
Tempat, Tgl Lahir  : ...
Jenis Kelamin      : ...
Asal Sekolah       : ...
Email              : ...
No. HP             : ...
```

### Status Badge

| Status | Warna | Teks |
|---|---|---|
| Menunggu | Kournikova `#fbe579` | "Menunggu Persetujuan" |
| Diterima | Hijau `#16a34a` | "Pendaftaran Diterima" |
| Ditolak | Merah `#dc2626` | "Pendaftaran Ditolak" |

> Jika status **Ditolak**, tampilkan juga alasan penolakan dari admin di bawah badge.

---

## 5. `/ppdb/kartu-peserta` — Download Kartu Peserta

### Akses
- Via link di email approval (direct link, tanpa autentikasi)

### Flow
1. Halaman load → FE hit API dengan parameter dari URL untuk ambil data peserta
2. FE generate PDF menggunakan **jsPDF** atau **pdfmake**
3. PDF otomatis ter-download di browser user

### Layout Kartu Peserta (PDF)

```
┌────────────────────────────────────────────┐
│  [Logo MDS Cendekia]                       │
│  KARTU PESERTA DIDIK BARU 2025/2026        │
├──────────────┬─────────────────────────────┤
│              │  Nomor Pendaftaran : ...    │
│  [Foto 3x4]  │  Nama Lengkap      : ...   │
│              │  TTL               : ...   │
│              │  Jenis Kelamin     : ...   │
│              │  Asal Sekolah      : ...   │
│              │  No. HP            : ...   │
│              │  Email             : ...   │
└──────────────┴─────────────────────────────┘
```

- **Kolom kiri (kecil):** foto siswa
- **Kolom kanan (lebar):** biodata lengkap siswa

# PRD — Halaman User
# Sistem PPDB MDS Cendekia
**Versi:** 1.1.0

> ⚠️ Baca `00-PRD-design-language.md` sebelum mengerjakan file ini.
> Semua spesifikasi komponen (button, input, card, modal, bottom sheet, accordion) mengacu ke file tersebut.

---

## 1. `/ppdb` — Landing PPDB

### Layout
- **Mobile:** single column, padding horizontal 16px, konten di tengah viewport
- **Desktop:** 60% kiri (ilustrasi/branding) | 40% kanan (konten interaktif)
- Tidak ada navbar untuk MVP

### Hero Section

**Konten:**
- Logo MDS Cendekia
- Judul: "Penerimaan Peserta Didik Baru" → gunakan `display-lg` (36px / 600 / -0.2px)
- Subjudul: tahun ajaran aktif → gunakan `lead` (21px / 400)
- 2 CTA Button (lihat spec di `00-PRD-design-language.md` section 6.1):
  - **[Daftar Sekarang]** → `Button Primary` (pill, emas) → `/ppdb/daftar`
  - **[Cek Status]** → `Button Secondary` (pill, outline merah) → `/ppdb/cek-status`

**Behavior tombol berdasarkan periode:**
| Kondisi | Tampilan Tombol "Daftar Sekarang" |
|---|---|
| Sebelum tanggal buka | Disabled — label: "Pendaftaran dibuka [tanggal]" |
| Dalam interval aktif | Aktif normal |
| Setelah tanggal tutup | Disabled — label: "Pendaftaran telah ditutup" |

### Timeline Pendaftaran

**Konten:** Pendaftaran → Seleksi Berkas → Pengumuman

**Visual:**
- Layout: horizontal di desktop, vertikal di mobile
- Step aktif: warna `--color-brand` `#a7221b`
- Step selesai: warna `--color-success` `#16a34a`
- Step belum: warna `--color-ink-secondary` `#6b7280`
- Connector line: `--color-hairline` `#fee3e2`

### 3 Card Informasi

**Layout:**
- Mobile: stack vertikal full width
- Desktop: 2 card atas sejajar + 1 card center di bawah

**Spesifikasi card** (lihat `Card` di `00-PRD-design-language.md` section 6.4):
- Background: `#ffffff`
- Border: `1px solid #fee3e2`
- Border radius: `16px`
- Padding: `24px`
- Shadow: none
- Hover: background `#fef3f2`, transition 150ms ease
- Cursor: pointer

| Card | Judul | Subtext |
|---|---|---|
| 1 | Alur Pendaftaran | "Ikuti langkah berikut untuk mendaftar" |
| 2 | Persyaratan Berkas | "Siapkan dokumen sebelum mendaftar" |
| 3 | Informasi Penting | "Baca sebelum mendaftar" |

**Behavior klik card:**
- **Mobile** → muncul `Bottom Sheet` (85vh, spec di `00` section 6.6)
- **Desktop** → muncul `Modal` (max-width 480px, spec di `00` section 6.7)

**Konten detail per card:**

*Card 1 — Alur Pendaftaran:*
1. Isi formulir data diri
2. Isi data asal sekolah
3. Upload berkas persyaratan
4. Dapatkan nomor pendaftaran
5. Tunggu hasil seleksi

*Card 2 — Persyaratan Berkas:*
- Foto siswa 3x4 berwarna
- Buku Rapor SMP asli & fotocopy
- Surat Keterangan Nilai Rapor Semester I–V
- Ijazah / SKL asli & fotocopy
- Akta Kelahiran asli & fotocopy
- Kartu Keluarga asli & fotocopy

*Card 3 — Informasi Penting:*
- Kontak sekolah
- Catatan penting dari pihak sekolah

---

## 2. `/ppdb/daftar` — Formulir Pendaftaran

### Layout
- **Mobile:** full width, padding horizontal 16px
- **Desktop:** accordion di tengah, lebar 50% viewport, horizontally centered

---

### Behavior Accordion

Spesifikasi visual accordion lihat `00-PRD-design-language.md` section 6.8.

- Accordion **pertama (Data Diri Siswa)** default terbuka
- Accordion berikutnya **disabled/locked** sampai accordion sebelumnya valid dan lengkap
- Saat accordion valid:
  - accordion berikutnya menjadi enabled
  - accordion aktif tetap terbuka
  - accordion berikutnya **tidak otomatis terbuka**
- User membuka accordion berikutnya secara manual
- Saat accordion baru dibuka:
  - accordion sebelumnya otomatis collapse
- Hanya **satu accordion** yang boleh terbuka dalam satu waktu
- Accordion yang sebelumnya sudah enabled **tidak dikunci kembali** meskipun accordion sebelumnya berubah invalid
- Validasi berjalan **real-time di state** — bukan submit per accordion
- Tombol **"Berikutnya"** disabled sampai semua accordion berstatus `✓ Lengkap`

---

### Status Accordion

Accordion menggunakan status text di sisi kanan header.

| State | Tampilan |
|---|---|
| Locked | `Lock` icon + disabled |
| Incomplete | `• Belum lengkap` |
| Complete | `✓ Lengkap` |

---

### Reactive Validation Behavior

Jika user:
- mengubah data
- menghapus field
- membuat field menjadi invalid

Maka status accordion otomatis berubah realtime:

```txt
✓ Lengkap
↓
• Belum lengkap
```

Accordion lain tetap enabled dan dapat diakses, namun tombol final submit akan kembali disabled sampai seluruh accordion valid.

---

### State Accordion

```txt
Locked
→ background header #f5f5f7
→ text #86868b
→ icon Lock
→ cursor not-allowed

Active
→ border 1.5px solid #a7221b
→ text #1d1d1f
→ accordion terbuka

Incomplete
→ text status "• Belum lengkap"
→ warna muted / neutral
→ tetap dapat dibuka dan diedit

Complete
→ text status "✓ Lengkap"
→ warna hijau soft
→ bisa di-klik untuk edit
```

---

### Tombol Berikutnya

- Gunakan `Button Primary` — lihat spec terbaru di `00-PRD-design-language.md` section 6.1
- Disabled sampai semua accordion berstatus `✓ Lengkap`
- Disabled state:
  - opacity 0.4
  - cursor not-allowed

### Behavior Klik

Saat tombol **"Berikutnya"** diklik:
- langsung redirect ke `/ppdb/daftar/berkas`
- tanpa modal konfirmasi tambahan

> ⚠️ Modal konfirmasi "Data sudah sesuai?" telah dihapus
> Halaman upload berkas menjadi checkpoint review alami sebelum submit final.
---

### Accordion 1 — Data Diri Siswa *(default terbuka)*

> ⚠️ Field berikut sudah disesuaikan dengan API contract.
> `id_gelombang` dan `id_program` dikirim sebagai **hidden field** — nilai default dari BE, tidak ditampilkan di UI.

| Field | Nama API | Tipe Input | Keterangan |
|---|---|---|---|
| Nama Lengkap | `nama` | Text | Required |
| NIK | `nik` | Text | Required, 16 digit, cek duplikat ke API onBlur |
| Email | `email` | Text | Required, format email valid, cek duplikat ke API onBlur |
| No. HP | `no_telepon` | Text | Required, format Indonesia (08xx/+628xx) |
| Tempat Lahir | `tempat_lahir` | Text | Required |
| Tanggal Lahir | `tanggal_lahir` | Date picker | Required, format RFC 3339 (2006-01-02T15:04:05Z), tidak boleh future date |
| Jenis Kelamin | `jenis_kelamin` | Radio | Required: Laki-laki / Perempuan |
| Agama | `agama` | Dropdown | Required |
| Alamat Lengkap | `alamat` | Textarea | Required, min 10 karakter |
| RT | `rt` | Text | Required, format 000 |
| RW | `rw` | Text | Required, format 000 |
| Provinsi | `provinsi` | Dropdown | Required, data dari API Wilayah |
| Kota/Kabupaten | `kabupaten_kota` | Dropdown | Required, cascade dari Provinsi |
| Kecamatan | `kecamatan` | Dropdown | Required, cascade dari Kota |
| Kelurahan | `kelurahan` | Dropdown | Required, cascade dari Kecamatan |
| Kode Pos | `kode_pos` | Text | Required, auto-fill setelah Kelurahan dipilih, tetap dapat diedit manual |

**Spesifikasi Input** (lihat `00-PRD-design-language.md` section 6.2):
- Border: `1px solid #fee3e2`
- Border radius: `8px`
- Padding: `12px 16px`
- Height: `44px`
- Focus: border `1.5px solid #a7221b` + shadow ring `rgba(167,34,27,0.12)`
- Error: border `1.5px solid #dc2626` + teks merah `12px` di bawah field (tanpa icon)

### Cascade Dropdown Wilayah

- Dropdown di bawah selalu reset dan disabled sampai dropdown di atasnya dipilih
- Data wilayah menggunakan API `emsifa`
- Cascade:
  - Provinsi
  - Kabupaten/Kota
  - Kecamatan
  - Kelurahan

### Auto-fill Kode Pos

Setelah user memilih Kelurahan:
- FE melakukan lookup kode pos menggunakan API `sooluh/kodepos`
- Query menggunakan kombinasi:
  - Kelurahan
  - Kecamatan
  - Kabupaten/Kota
- Jika kode pos ditemukan:
  - field `Kode Pos` otomatis terisi
- User tetap dapat mengedit field secara manual jika diperlukan
- Jika kode pos tidak ditemukan:
  - field tetap kosong
  - user mengisi manual

### UX Behavior

Saat proses lookup:
- field Kode Pos menjadi disabled sementara
- tampilkan loading state kecil:
  `"Mencari kode pos..."`

Setelah lookup selesai:
- field aktif kembali

---

### Accordion 1 — Data Diri Siswa *(default terbuka)*

> ⚠️ Field berikut sudah disesuaikan dengan API contract.
> `id_gelombang` dan `id_program` dikirim sebagai **hidden field** — nilai default dari BE, tidak ditampilkan di UI.

| Field | Nama API | Tipe Input | Keterangan |
|---|---|---|---|
| Nama Lengkap | `biodata.nama` | Text | Required |
| NIK | `biodata.nik` | Text | Required, 16 digit, cek duplikat ke API onBlur |
| Email | `biodata.email` | Text | Required, format email valid, cek duplikat ke API onBlur |
| No. HP | `biodata.no_telepon` | Text | Required, format Indonesia (08xx/+628xx) |
| Tempat Lahir | `biodata.tempat_lahir` | Text | Required |
| Tanggal Lahir | `biodata.tanggal_lahir` | Date picker | Required, format RFC 3339 (2006-01-02T15:04:05Z), tidak boleh future date |
| Jenis Kelamin | `biodata.jenis_kelamin` | Radio | Required: Laki-laki / Perempuan |
| Agama | `biodata.agama` | Dropdown | Required |
| Alamat Lengkap | `alamat.alamat` | Textarea | Required, min 10 karakter |
| RT | `alamat.rt` | Text | Required, format 000 |
| RW | `alamat.rw` | Text | Required, format 000 |
| Provinsi | `alamat.provinsi` | Dropdown | Required, data dari API Wilayah |
| Kota/Kabupaten | `alamat.kabupaten_kota` | Dropdown | Required, cascade dari Provinsi |
| Kecamatan | `alamat.kecamatan` | Dropdown | Required, cascade dari Kota |
| Kelurahan | `alamat.kelurahan` | Dropdown | Required, cascade dari Kecamatan |
| Kode Pos | `alamat.kode_pos` | Text | Required, auto-fill setelah Kelurahan dipilih, tetap dapat diedit manual |

---

### Accordion 2 — Data Asal Sekolah

> ⚠️ Field berikut sudah disesuaikan dengan API contract.

| Field | Nama API | Tipe Input | Keterangan |
|---|---|---|---|
| Nama Sekolah Asal | `riwayat_pendidikan.nama_sekolah_asal` | Text | Required, min 5 karakter |
| Alamat Sekolah Asal | `riwayat_pendidikan.alamat_sekolah_asal` | Textarea | Required, min 10 karakter |
| NPSN | `riwayat_pendidikan.npsn_sekolah_asal` | Text | Required, 8 digit angka |
| Tahun Lulus | `riwayat_pendidikan.tahun_lulus` | Text | Required, 4 digit, tidak boleh future year |
| No. Ijazah / SKHUN | `riwayat_pendidikan.no_ijazah` | Text | Required |

---

### Accordion 3 — Data Orang Tua / Wali

> ⚠️ Field berikut disesuaikan dengan API contract.
> `orang_tua` dikirim sebagai array of object (`OrangTuaDto[]`).
> Secara default terdiri dari:
>
> - Data Ayah
> - Data Ibu
>
> Data Wali bersifat opsional dan hanya ditampilkan jika wali berbeda dari orang tua.

---

### Struktur Data API

```txt
orang_tua: [
  { peran: "orang_tua", hubungan: "ayah kandung", ... },
  { peran: "orang_tua", hubungan: "ibu kandung", ... },
  { peran: "wali", hubungan: "...", ... } // optional
]
```

---

### Section Required

#### Data Ayah

| Field | Nama API | Tipe Input | Keterangan |
|---|---|---|---|
| Nama Lengkap | `orang_tua[].nama` | Text | Required, min 3 karakter |
| NIK | `orang_tua[].nik` | Text | Required, 16 digit |
| Agama | `orang_tua[].agama` | Dropdown | Required |
| Hubungan dengan Siswa | `orang_tua[].hubungan` | Hidden / Fixed | `ayah kandung` |
| Peran | `orang_tua[].peran` | Hidden / Fixed | `orang_tua` |
| No. HP | `orang_tua[].no_telepon` | Text | Required, format Indonesia (08xx/+628xx) |
| Email | `orang_tua[].email` | Text | Optional, format email valid |
| Pendidikan Terakhir | `orang_tua[].pendidikan` | Dropdown | Optional |
| Pekerjaan | `orang_tua[].pekerjaan` | Text | Optional |
| Penghasilan Per Bulan | `orang_tua[].penghasilan` | Dropdown | Optional |

---

#### Data Ibu

| Field | Nama API | Tipe Input | Keterangan |
|---|---|---|---|
| Nama Lengkap | `orang_tua[].nama` | Text | Required, min 3 karakter |
| NIK | `orang_tua[].nik` | Text | Required, 16 digit |
| Agama | `orang_tua[].agama` | Dropdown | Required |
| Hubungan dengan Siswa | `orang_tua[].hubungan` | Hidden / Fixed | `ibu kandung` |
| Peran | `orang_tua[].peran` | Hidden / Fixed | `orang_tua` |
| No. HP | `orang_tua[].no_telepon` | Text | Required, format Indonesia (08xx/+628xx) |
| Email | `orang_tua[].email` | Text | Optional, format email valid |
| Pendidikan Terakhir | `orang_tua[].pendidikan` | Dropdown | Optional |
| Pekerjaan | `orang_tua[].pekerjaan` | Text | Optional |
| Penghasilan Per Bulan | `orang_tua[].penghasilan` | Dropdown | Optional |

---

### Data Wali *(Opsional)*

Data wali hanya muncul jika user mengaktifkan:

```txt
☑ Wali berbeda dari orang tua
```

Jika aktif, tampilkan section tambahan:

#### Data Wali

| Field | Nama API | Tipe Input | Keterangan |
|---|---|---|---|
| Nama Lengkap | `orang_tua[].nama` | Text | Required, min 3 karakter |
| NIK | `orang_tua[].nik` | Text | Required, 16 digit |
| Agama | `orang_tua[].agama` | Dropdown | Required |
| Hubungan dengan Siswa | `orang_tua[].hubungan` | Dropdown | Required |
| Peran | `orang_tua[].peran` | Hidden / Fixed | `wali` |
| No. HP | `orang_tua[].no_telepon` | Text | Required, format Indonesia (08xx/+628xx) |
| Email | `orang_tua[].email` | Text | Optional, format email valid |
| Pendidikan Terakhir | `orang_tua[].pendidikan` | Dropdown | Optional |
| Pekerjaan | `orang_tua[].pekerjaan` | Text | Optional |
| Penghasilan Per Bulan | `orang_tua[].penghasilan` | Dropdown | Optional |

---

### Dropdown Hubungan Wali

Pilihan dropdown:

```txt
Paman
Bibi
Kakek
Nenek
Kakak
Saudara
Orang Tua Asuh
Lainnya
```

Jika user memilih:

```txt
Lainnya
```

maka tampilkan input tambahan:

```txt
Hubungan Wali Lainnya
```

---

> ⚠️ Revisi v1.2.2:
> Struktur `orang_tua` sekarang menggunakan array of object (`OrangTuaDto[]`) sesuai API contract backend.
>
> Sistem menggunakan:
>
> - Data Ayah
> - Data Ibu
> - Data Wali (opsional)
>
> dengan struktur:
>
> - `peran` → kategori besar (`orang_tua` / `wali`)
> - `hubungan` → relasi spesifik terhadap siswa
>
> untuk menjaga fleksibilitas struktur data sekaligus mempertahankan UX yang tetap ringan dan terstruktur.

---

## 3. `/ppdb/daftar/berkas` — Upload Berkas

### Layout
- Sama dengan halaman formulir (mobile full width, desktop 50% center)

### Daftar Berkas

Nama API: `jenis_berkas` (array string — nama/label berkas) + `berkas_persyaratan` (array file)

| No | Label | Nama di `jenis_berkas` | Format | Maks. Ukuran |
|---|---|---|---|---|
| 1 | Foto Siswa (3x4 berwarna) | `foto` | JPG / PNG | 1 MB |
| 2 | Buku Rapor SMP | `rapor` | PDF | 2 MB |
| 3 | Surat Keterangan Nilai Rapor Semester I–V | `surat_nilai` | PDF | 2 MB |
| 4 | Ijazah / SKL | `ijazah` | PDF | 2 MB |
| 5 | Akta Kelahiran | `akta` | PDF | 2 MB |
| 6 | Kartu Keluarga | `kk` | PDF | 2 MB |

> ⚠️ Nilai `jenis_berkas` di atas adalah asumsi. Sesuaikan dengan API contract aktual di https://cendekia.sekata.my.id/api-docs

### Behavior Upload

**Upload area per berkas:**
- Background: `#ffffff`
- Border: `1.5px dashed #fee3e2`
- Border radius: `12px`
- Padding: `24px`
- Icon: `Upload` (Lucide, 24px, `#fda8a4`)
- Teks: "Klik untuk upload atau drag & drop"
- Font: `14px / 400 / #6b7280`

**Setelah file dipilih:**
- Tampilkan nama file + ukuran file
- Icon: `FileCheck` (Lucide, 16px, `#16a34a`)
- Border berubah: `1.5px solid #16a34a`

**Error state:**
- Teks merah `12px` di bawah upload area (tanpa icon)
- Border: `1.5px dashed #dc2626`

**Validasi saat file dipilih (onChange):**
- Format tidak sesuai → error: "Format file tidak didukung"
- Ukuran melebihi batas → error: "Ukuran file melebihi batas maksimum"

**Tombol Kirim:**
- Gunakan `Button Primary` (pill, emas)
- Disabled sampai semua berkas terupload — opacity 0.4

### Flow Submit

1. User klik **"Kirim"**
2. Muncul `Modal` konfirmasi: **"Data sudah sesuai?"**
   - **"Ya, Kirim"** → hit API → loading dot wave
   - **"Belum"** → modal tutup
3. Berhasil → muncul `Bottom Sheet` (spec di `00` section 6.6) berisi:
   - Nomor Pendaftaran: `MDS-2025-XXXX` → font `display-md` (28px / 600), warna `#a7221b`
   - Pesan: "Pendaftaran berhasil! Cek email kamu untuk informasi lebih lanjut." → font `body` (17px / 400)
   - Tombol: **"Cek Status Pendaftaran"** → `Button Primary` → `/ppdb/cek-status`

---

## 4. `/ppdb/cek-status` — Cek Status Pendaftaran

### Layout

- **Mobile:** input di tengah viewport (vertically centered), padding 16px
- **Desktop:** centered single-column, width ±40% viewport, horizontally centered

### Tombol (Selalu Ada dari Awal)

- Kiri: **[Back]** → `Button Secondary` (outline) → navigate ke `/ppdb`
- Kanan: **[Cek Sekarang]** → `Button Primary` (merah `#a7221b`)

### Form

- Input: Nomor Pendaftaran → spec input di `00` section 6.2
- Placeholder: `"Contoh: MDS-2025-0001"`

---

### State Machine

| State     | Area Hasil                                | Tombol Kanan                  |
| --------- | ----------------------------------------- | ----------------------------- |
| Initial   | Hidden                                    | `[Cek Sekarang]`              |
| Success   | Expand ke bawah — card data pendaftar     | `[Cek Pendaftaran Lainnya]`   |
| Not Found | Expand ke bawah — empty state soft        | `[Cek Pendaftaran Lainnya]`   |
| Loading   | Dot wave di area hasil                    | Disabled                      |

---

### Behavior "Cek Sekarang"

1. Klik → tombol kanan disabled + loading dot wave muncul di area hasil
2. Response datang → area hasil expand ke bawah dengan transisi smooth
3. Tombol kanan berubah menjadi **[Cek Pendaftaran Lainnya]**

**Animasi expand:**

- `max-height: 0` → `max-height: auto`
- `opacity: 0` → `opacity: 1`
- Duration: 300ms ease-out

---

### Behavior "Cek Pendaftaran Lainnya"

Saat diklik:

- Collapse area hasil (reverse animasi expand)
- Reset input (kosong)
- Tombol kanan kembali menjadi **[Cek Sekarang]**
- Focus cursor kembali ke input

---

### Konten Area Hasil — Success State

```
[STATUS BADGE]                          ← pill badge, spec di 00 section 6.3
"Status pendaftaran kamu: ..."          ← body (17px / 400 / #6b7280)

── Informasi Pendaftaran ───────────────
Nomor Pendaftaran  : MDS-2025-XXXX     ← caption-strong (14px / 600)
Tanggal Daftar     : DD/MM/YYYY

── Identitas Calon Siswa ───────────────
Nama Lengkap       : ...
Tempat, Tgl Lahir  : ...
Jenis Kelamin      : ...
Asal Sekolah       : ...
Email              : ...
No. HP             : ...
```

**Section divider:**

- Font label section: `12px / 600 / uppercase / #6b7280 / letter-spacing 0.05em`
- Divider line: `1px solid #fee3e2`

> Jika status **Ditolak**, tampilkan alasan penolakan dari admin di bawah badge
> dalam card dengan border `#fee2e2` dan background `#fff5f5`.

---

### Konten Area Hasil — Not Found State

- Icon: `SearchX` atau `FileSearch` (Lucide, 40px, `#d1d5db`)
- Background: `#ffffff`
- Border: `1px solid #fee3e2`
- Border radius: `16px`
- Padding: `32px 24px`
- Teks utama: `"Nomor pendaftaran tidak ditemukan"` → `body-strong` (17px / 600 / `#1d1d1f`)
- Teks sub: `"Periksa kembali nomor pendaftaran kamu dan pastikan tidak ada kesalahan penulisan."` → `body` (17px / 400 / `#6b7280`)
- Tidak menggunakan warna merah error — bukan system failure

---

### Status Badge

Gunakan spesifikasi `Badge` di `00-PRD-design-language.md` section 6.3:

| Status    | Badge bg    | Badge text | Teks deskripsi           |
| --------- | ----------- | ---------- | ------------------------ |
| Menunggu  | `#fef9c3`   | `#854d0e`  | "Menunggu Persetujuan"   |
| Diterima  | `#dcfce7`   | `#166534`  | "Pendaftaran Diterima"   |
| Ditolak   | `#fee2e2`   | `#991b1b`  | "Pendaftaran Ditolak"    |

---

### Behavior Mobile (Dipertahankan)

- Klik "Cek Sekarang" → loading dot wave → muncul `Bottom Sheet` (85vh)
- Animasi: slide up dari bawah (300ms cubic-bezier(0.32, 0.72, 0, 1))
- Konten Bottom Sheet: sama dengan Success State / Not Found State di atas
- Tombol di Bottom Sheet: **[Cek Pendaftaran Lainnya]** → dismiss sheet + reset
---

## 5. `/ppdb/kartu-peserta` — Download Kartu Peserta

### Akses
- Via link di email approval (direct link, tanpa autentikasi)
- Parameter URL digunakan FE untuk hit API ambil data peserta

### Flow
1. Halaman load → FE hit API dengan parameter dari URL
2. Loading dot wave selama fetch data
3. FE generate PDF menggunakan **jsPDF** atau **pdfmake**
4. PDF otomatis ter-download di browser user

### Layout Kartu Peserta (PDF)

```
┌─────────────────────────────────────────────┐
│  [Logo MDS Cendekia]                        │
│  KARTU PESERTA DIDIK BARU 2025/2026         │
│  ─────────────────────────────────────────  │
├──────────────┬──────────────────────────────┤
│              │  Nomor Pendaftaran : ...     │
│  [Foto 3x4]  │  Nama Lengkap      : ...    │
│              │  Tempat, Tgl Lahir : ...    │
│              │  Jenis Kelamin     : ...    │
│              │  Asal Sekolah      : ...    │
│              │  No. HP            : ...    │
│              │  Email             : ...    │
└──────────────┴──────────────────────────────┘
```

**Warna PDF:**
- Background: `#ffffff`
- Header background: `#a7221b` (brand merah)
- Header text: `#ffffff`
- Body text: `#1d1d1f`
- Border/divider: `#fee3e2`
- Label field: `#6b7280`

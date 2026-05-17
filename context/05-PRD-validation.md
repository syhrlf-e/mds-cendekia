# PRD — Validasi & Aturan Bisnis
# Sistem PPDB MDS Cendekia

---

## 1. Behavior Validasi Global

- Validasi berjalan **onBlur** (saat user keluar dari field)
- Pesan error: **teks merah di bawah field** (tanpa icon)
- Border field yang error: merah `#dc2626`
- Accordion berikutnya hanya unlock jika **semua field required valid**
- Tombol "Berikutnya" dan "Kirim" hanya aktif jika semua validasi ✅

---

## 2. Validasi Per Field — Accordion 1 (Data Diri Siswa)

| Field | Aturan Validasi |
|---|---|
| Nama Lengkap | Required, min 3 karakter, hanya huruf & spasi |
| Nama Panggilan | Required, min 2 karakter |
| NIK | Required, exactly 16 digit angka, cek duplikat ke API onBlur |
| Tempat Lahir | Required, min 3 karakter, hanya huruf & spasi |
| Tanggal Lahir | Required, format date valid, tidak boleh future date |
| Jenis Kelamin | Required, pilih salah satu |
| Agama | Required, pilih salah satu dari dropdown |
| Kewarganegaraan | Required |
| Anak ke | Required, angka, min 1 |
| Jumlah Saudara | Required, angka, min 0 |
| Golongan Darah | Optional |
| Alamat Lengkap | Required, min 10 karakter |
| RT / RW | Required, format 000/000 |
| Provinsi | Required, pilih dari dropdown |
| Kota/Kabupaten | Required, pilih dari dropdown (cascade) |
| Kecamatan | Required, pilih dari dropdown (cascade) |
| Kelurahan | Required, pilih dari dropdown (cascade) |
| Kode Pos | Required, exactly 5 digit angka |
| No. HP Siswa | Required, format Indonesia (08xx atau +628xx), min 10 max 13 digit |
| Email | Required, format email valid, cek duplikat ke API onBlur |

---

## 3. Validasi Per Field — Accordion 2 (Data Asal Sekolah)

| Field | Aturan Validasi |
|---|---|
| Nama Sekolah Asal | Required, min 5 karakter |
| NPSN | Required, exactly 8 digit angka |
| Alamat Sekolah Asal | Required, min 10 karakter |
| Tahun Lulus | Required, 4 digit angka, tidak boleh future year |
| No. Ijazah / SKHUN | Optional |

---

## 4. Validasi Per Field — Accordion 3 (Data Orang Tua / Wali)

### Data Ayah & Ibu (sama)

| Field | Aturan Validasi |
|---|---|
| Nama Lengkap | Required, min 3 karakter, hanya huruf & spasi |
| NIK | Required, exactly 16 digit angka |
| Tempat Lahir | Required, min 3 karakter |
| Tanggal Lahir | Required, format date valid |
| Pendidikan Terakhir | Required, pilih dari dropdown |
| Pekerjaan | Required, min 3 karakter |
| Penghasilan Per Bulan | Required, pilih dari dropdown |
| No. HP | Required, format Indonesia |

### Data Wali (kondisional — hanya jika checkbox dicentang)

| Field | Aturan Validasi |
|---|---|
| Nama Lengkap Wali | Required if checked |
| Hubungan dengan Siswa | Required if checked |
| No. HP Wali | Required if checked, format Indonesia |
| Alamat Wali | Required if checked, min 10 karakter |

---

## 5. Validasi Upload Berkas

| Berkas | Format | Maks. Ukuran | Keterangan |
|---|---|---|---|
| Foto Siswa | JPG / PNG | 1 MB | Required |
| Buku Rapor SMP | PDF | 2 MB | Required |
| Surat Ket. Nilai Rapor | PDF | 2 MB | Required |
| Ijazah / SKL | PDF | 2 MB | Required |
| Akta Kelahiran | PDF | 2 MB | Required |
| Kartu Keluarga | PDF | 2 MB | Required |

**Validasi terjadi saat file dipilih (onChange):**
- Format tidak sesuai → error: "Format file tidak didukung. Gunakan [format yang sesuai]"
- Ukuran melebihi batas → error: "Ukuran file melebihi batas maksimum [X MB]"

---

## 6. Aturan Bisnis

### Duplikat Pendaftaran
- **NIK:** jika NIK sudah terdaftar → error di field NIK: *"NIK ini sudah terdaftar dalam sistem"*
- **Email:** jika email sudah terdaftar → error di field Email: *"Email ini sudah terdaftar dalam sistem"*
- Pengecekan dilakukan **onBlur** via hit API

### Format Nomor Pendaftaran
```
MDS-{TAHUN}-{XXXX}
Contoh: MDS-2025-0001
```
- `MDS` → identitas sekolah
- `{TAHUN}` → tahun pendaftaran, auto dari sistem
- `{XXXX}` → nomor urut 4 digit, auto-increment oleh BE
- Di-generate BE saat submit berhasil

### Akses Periode Tertutup
- Akses `/ppdb/daftar` saat periode ditutup → redirect ke `/ppdb` + toast "Pendaftaran sedang tidak dibuka"

### Cascade Dropdown Wilayah
- Dropdown Kota/Kab, Kecamatan, Kelurahan selalu **reset dan disabled** saat pilihan di atasnya berubah
- Kode Pos **tidak tersedia** dari API wilayah → input manual

### Admin Rate Limiter
- Percobaan login 1–3: pesan error biasa
- Percobaan 4+: exponential backoff (30 detik → 1 menit → 5 menit → 15 menit)
- Ditangani di BE, FE membaca response error dan menampilkan countdown timer

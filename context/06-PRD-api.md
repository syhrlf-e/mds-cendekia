# PRD — API & Integrasi Eksternal
# Sistem PPDB MDS Cendekia

---

## 1. API Backend (NestJS)

**Base URL Dokumentasi:** https://cendekia.sekata.my.id/api-docs

> ⚠️ **WAJIB DIBACA:** Semua endpoint, request body, response schema, dan validasi bersifat **subject to API contract**. AI agent wajib fetch dokumentasi di URL di atas sebelum mengimplementasikan integrasi API apapun. Field dan struktur data di PRD ini bersifat asumsi dan akan disesuaikan dengan dokumentasi aktual.

### Endpoint yang Dibutuhkan (Asumsi)

| Fitur | Method | Endpoint (asumsi) |
|---|---|---|
| Cek duplikat NIK | GET | `/pendaftar/cek-nik/:nik` |
| Cek duplikat Email | GET | `/pendaftar/cek-email/:email` |
| Submit formulir | POST | `/pendaftar` |
| Upload berkas | POST | `/pendaftar/:id/berkas` |
| Cek status pendaftaran | GET | `/pendaftar/status/:nomorPendaftaran` |
| Ambil data kartu peserta | GET | `/pendaftar/:id/kartu` |
| Login admin | POST | `/auth/login` |
| List pendaftar (admin) | GET | `/pendaftar` |
| Detail pendaftar (admin) | GET | `/pendaftar/:id` |
| Approve pendaftar | PATCH | `/pendaftar/:id/approve` |
| Reject pendaftar | PATCH | `/pendaftar/:id/reject` |
| Pengaturan periode PPDB | GET/POST | `/pengaturan/periode` |

> Semua endpoint di atas adalah **asumsi**. Sesuaikan dengan dokumentasi aktual di https://cendekia.sekata.my.id/api-docs

---

## 2. API Wilayah Indonesia

**Source:** https://www.emsifa.com/api-wilayah-indonesia/
**Tipe:** API Statis (GitHub Pages), tidak memerlukan API key

### Endpoint

| Data | Endpoint |
|---|---|
| List semua provinsi | `https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json` |
| List kota/kab by provinsi | `https://www.emsifa.com/api-wilayah-indonesia/api/regencies/{province_id}.json` |
| List kecamatan by kota | `https://www.emsifa.com/api-wilayah-indonesia/api/districts/{regency_id}.json` |
| List kelurahan by kecamatan | `https://www.emsifa.com/api-wilayah-indonesia/api/villages/{district_id}.json` |

### Implementasi Cascade Dropdown

```
Pilih Provinsi
  → fetch /regencies/{province_id}.json
  → populate Kota/Kab dropdown
  → reset & disable Kecamatan & Kelurahan

Pilih Kota/Kab
  → fetch /districts/{regency_id}.json
  → populate Kecamatan dropdown
  → reset & disable Kelurahan

Pilih Kecamatan
  → fetch /villages/{district_id}.json
  → populate Kelurahan dropdown
```

> **Catatan:** Kode Pos tidak tersedia di API ini. User mengisi kode pos secara manual.

---

---

## 3. API Kode Pos Indonesia

**Source:** https://github.com/sooluh/kodepos

Digunakan untuk auto-fill field `Kode Pos`
setelah user memilih Kelurahan.

### Tujuan

API ini bukan pengganti API wilayah utama (`emsifa`),
melainkan enhancement UX untuk mengurangi input manual.

### Flow

1. User memilih:
   - Provinsi
   - Kabupaten/Kota
   - Kecamatan
   - Kelurahan

2. FE melakukan lookup kode pos berdasarkan kombinasi:
   - Kelurahan
   - Kecamatan
   - Kabupaten/Kota

3. Jika kode pos ditemukan:
   - field `Kode Pos` otomatis terisi

4. Jika tidak ditemukan:
   - user mengisi manual

### Catatan Penting

- API ini hanya digunakan sebagai helper auto-fill
- Bukan source validasi utama
- Field `Kode Pos` tetap editable secara manual
- Query tidak boleh hanya menggunakan nama Kelurahan
  karena beberapa wilayah dapat memiliki nama yang sama

## 4. PDF Generation (BE-side)

Update terbaru: kartu peserta di-generate di sisi BE. FE tidak lagi bertanggung jawab membuat PDF kartu peserta.

### Library

```bash
npm install jspdf
# atau
npm install pdfmake
```

### Flow

1. Admin approve pendaftar.
2. BE update status dan generate PDF kartu peserta.
3. BE mengirim email approval.
4. Email approval dapat melampirkan PDF kartu peserta, menyediakan link download PDF dari BE, atau keduanya.

### Layout PDF

Layout PDF mengikuti desain kartu peserta pada `03-PRD-user-pages.md` section 5, tetapi rendering dan file PDF final dibuat oleh BE.

---

## 5. Email (Handled by BE)

Email dikirim oleh BE (NestJS) menggunakan library mailer (misal `@nestjs-modules/mailer`).

FE tidak perlu handle pengiriman email — FE hanya trigger action (submit, approve, reject) dan BE yang handle email secara otomatis.

**3 trigger email:**
1. Submit formulir + berkas berhasil → Email konfirmasi + nomor pendaftaran
2. Admin approve → Email approval + PDF kartu peserta dari BE
3. Admin reject → Email rejection + alasan penolakan

> Detail konten email ada di `07-PRD-email.md`

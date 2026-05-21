<p align="center">
  <img src="./public/images/logo-mds-main.png" alt="Logo MDS Cendekia" width="150" />
</p>

<h1 align="center">MDS Cendekia PPDB</h1>

<p align="center">
  Aplikasi frontend PPDB MDS Cendekia berbasis Nuxt 4 untuk alur pendaftaran calon siswa, cek status pendaftaran, dan panel administrasi.
</p>

<p align="center">
  <img src="./public/favicon-32x32.png" alt="MDS Cendekia icon" width="24" height="24" />
</p>

## Ringkasan

Project ini berisi frontend PPDB MDS Cendekia dengan dua area utama:

- Area publik untuk pendaftaran, upload berkas, cek status, dan kartu peserta.
- Area admin untuk login, dashboard, pengelolaan pendaftar, dan pengaturan.
- Template email Handlebars untuk kebutuhan backend NestJS + Resend.
- Nuxt server route bridge untuk endpoint registrasi yang membutuhkan proxy dari frontend.

## Tech Stack

- Nuxt 4
- Vue 3
- TypeScript
- Tailwind CSS v4
- Nuxt Security
- Nuxt Google Fonts
- Lucide Vue Next

## Struktur Penting

```text
assets/css/main.css              Global style dan Tailwind entry
components/                      Reusable UI components
composables/                     Logic reusable untuk API, form PPDB, wilayah, toast
email-templates/                 Template email .hbs dan dokumentasi untuk backend
layouts/admin.vue                Layout khusus admin
middleware/admin-auth.ts         Guard halaman admin
pages/                           Route Nuxt untuk publik dan admin
public/                          Asset publik, logo, favicon, manifest
server/api/register/             Bridge endpoint registrasi ke backend
server/utils/upstream-api.ts     Helper request ke API backend
```

Dokumen PRD, catatan desain eksploratif, dan source export favicon disimpan sebagai dokumen internal lokal dan tidak ikut dipublikasikan ke repository.

## Asset Publik

Logo utama dan favicon sudah tersedia di folder `public` agar bisa langsung dipakai oleh browser dan GitHub README:

```text
public/images/logo-mds-main.png
public/favicon.ico
public/favicon-16x16.png
public/favicon-32x32.png
public/apple-touch-icon.png
public/android-chrome-192x192.png
public/android-chrome-512x512.png
public/site.webmanifest
```

Konfigurasi favicon sudah didaftarkan di `nuxt.config.ts` melalui `app.head`.

## Setup Lokal

Install dependency:

```bash
npm install
```

Jalankan development server:

```bash
npm run dev
```

Secara default dev server berjalan di:

```text
http://127.0.0.1:3000
```

## Environment dan Konfigurasi API

Konfigurasi publik saat ini berada di `nuxt.config.ts`:

```ts
runtimeConfig: {
  public: {
    apiBaseUrl: 'https://cendekia.sekata.my.id',
    apiTimeoutMs: '15000',
    ppdbProgramId: '1',
    ppdbGelombangId: '3'
  }
}
```

Catatan untuk backend:

- Base API production saat ini memakai `https://cendekia.sekata.my.id`.
- Endpoint registrasi publik dipanggil melalui server route Nuxt di `/api/register/*`.
- Bridge ini digunakan agar request multipart dan registrasi lebih stabil dari sisi browser.
- PDF kartu peserta digenerate oleh backend, bukan frontend.

## Script

```bash
npm run dev       # menjalankan dev server
npm run build     # build production
npm run preview   # preview hasil build
npm run lint      # cek lint
npm run lint:fix  # perbaiki lint otomatis
npm run check     # typecheck Nuxt
```

## Alur PPDB Publik

Halaman utama:

- `/ppdb`
- `/ppdb/daftar`
- `/ppdb/daftar/berkas`
- `/ppdb/cek-status`
- `/ppdb/kartu-peserta`

Alur pendaftaran:

1. Calon siswa mengisi formulir data diri, orang tua, alamat, dan riwayat pendidikan.
2. Frontend mengirim data siswa ke backend.
3. Frontend mendapatkan nomor pendaftaran.
4. Frontend mengecek data pendaftaran untuk mendapatkan `id_pendaftaran` bila dibutuhkan.
5. Calon siswa mengupload berkas persyaratan.
6. Backend memproses data, berkas, email, dan PDF kartu peserta.

## Endpoint Backend Yang Digunakan

Endpoint utama yang dipakai frontend:

```text
POST /auth/login
POST /register/siswa
POST /register/cek-status
POST /register/berkas
```

Untuk dokumentasi detail backend, gunakan API docs backend:

```text
https://cendekia.sekata.my.id/api-docs
```

## Admin

Halaman admin:

- `/admin/login`
- `/admin/dashboard`
- `/admin/pendaftaran`
- `/admin/pengaturan`

Admin login menggunakan endpoint backend `/auth/login`.

## Email Templates

Template email tersedia di:

```text
email-templates/
```

Isi utama:

- `registrasi_konfirmasi_berkas.hbs`
- `template_pendaftaran_diterima.hbs`
- `registrasi_ditolak.hbs`
- `README.md`

Backend NestJS + Resend dapat membaca file `.hbs`, mengisi variabel, lalu mengirim email melalui Resend. Detail implementasi backend ada di `email-templates/README.md`.

## Quality Check

Sebelum push ke GitHub, jalankan:

```bash
npm run lint
npm run check
npm run build
```

## Catatan Development

- Project ini desktop focused untuk halaman admin.
- UI mengikuti design language internal MDS Cendekia yang dijaga konsisten di komponen aplikasi.
- Jangan mengubah nama field request backend tanpa mengecek API docs terbaru.
- Untuk perubahan alur pendaftaran, sinkronkan dengan backend karena sebagian proses final seperti PDF dan email berada di sisi backend.

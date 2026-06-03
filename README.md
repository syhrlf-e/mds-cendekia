<p align="center">
  <img src="./apps/web/public/images/logo-mds-main.png" alt="Logo MDS Cendekia" width="150" />
</p>

<h1 align="center">MDS Cendekia</h1>

<p align="center">
  Monorepo frontend MDS Cendekia berbasis Nuxt 4 untuk website publik sekolah dan panel administrasi terpisah.
</p>

## Ringkasan

Project ini berisi dua aplikasi Nuxt yang dideploy sebagai dua project Vercel terpisah:

- `apps/web` untuk website publik di `https://mdscendekia.oirul.com`.
- `apps/admin` untuk panel admin di `https://mdspanel.mdscendekia.oirul.com`.
- Template email Handlebars untuk kebutuhan backend NestJS + Resend.
- Integrasi API langsung dari browser ke backend melalui `NUXT_PUBLIC_API_BASE_URL`.

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
apps/web/                        Website publik, SEO, sitemap, robots, PPDB publik
apps/admin/                      Panel admin, login, dashboard, pengelolaan data
email-templates/                 Template email .hbs dan dokumentasi untuk backend
```

## Setup Lokal

Install dependency:

```bash
npm install
```

Jalankan website publik:

```bash
npm run dev:web
```

Jalankan panel admin:

```bash
npm run dev:admin
```

Secara default dev server berjalan di:

```text
Web   : http://127.0.0.1:3000
Admin : http://127.0.0.1:3001
```

## Environment dan API

Base API production saat ini memakai:

```text
https://api.oirul.com
```

Environment variable yang wajib ada di project web dan admin:

```text
NUXT_PUBLIC_API_BASE_URL=https://api.oirul.com
```

Catatan backend:

- Endpoint backend dipanggil langsung dari browser.
- Endpoint registrasi siswa, cek status, upload berkas, dan revisi berkas dikirim ke backend `/register/*`.
- PDF kartu peserta digenerate oleh backend, bukan frontend.

## Script

```bash
npm run dev:web       # menjalankan website publik
npm run dev:admin     # menjalankan panel admin
npm run build:web     # build website publik
npm run build:admin   # build panel admin
npm run lint:web      # lint website publik
npm run lint:admin    # lint panel admin
npm run check:web     # typecheck website publik
npm run check:admin   # typecheck panel admin
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

## Admin

Admin berada di subdomain panel, sehingga route admin tidak lagi memakai prefix `/admin`.

Halaman admin utama:

- `/login`
- `/dashboard`
- `/pendaftaran`
- `/siswa`
- `/berita`
- `/timeline-ppdb`
- `/galeri`
- `/paket-sekolah`
- `/pengaturan`

Admin login menggunakan endpoint backend `/auth/login`. Panel admin diberi `noindex` melalui konfigurasi Nuxt agar tidak masuk indeks Google.

## Deploy Vercel

Gunakan dua project Vercel dari repository yang sama:

```text
Project web
Root Directory : apps/web
Domain         : mdscendekia.oirul.com

Project admin
Root Directory : apps/admin
Domain         : mdspanel.mdscendekia.oirul.com
```

Setelah mengubah environment variable di Vercel, lakukan redeploy agar nilai env masuk ke deployment terbaru.

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

Backend NestJS + Resend dapat membaca file `.hbs`, mengisi variabel, lalu mengirim email melalui Resend.

## Quality Check

Sebelum push ke GitHub, jalankan:

```bash
npm run lint:web
npm run lint:admin
npm run check:web
npm run check:admin
npm run build:web
npm run build:admin
```

## Catatan Development

- Project ini menggunakan dua Nuxt app terpisah dalam satu repository.
- Jangan mengubah nama field request backend tanpa mengecek API docs terbaru.
- Untuk perubahan alur pendaftaran, sinkronkan dengan backend karena sebagian proses final seperti PDF dan email berada di sisi backend.

# Audit Frontend Apps/Web

Tanggal audit: 2026-06-08  
Scope: `apps/web` saja, fokus frontend Nuxt/Vue, UI/UX, keamanan browser, maintainability, dan kesiapan production.

> Catatan: user meminta Context7, tetapi tool Context7 tidak tersedia di sesi MCP ini. Audit tetap menggunakan inspeksi codebase langsung, security skill lokal, dan referensi resmi terbaru dari Vue, Nuxt, Vite, dan OWASP.

## Ringkasan Eksekutif

Secara umum fondasi `apps/web` sudah cukup sehat: lint lulus, typecheck lulus, `npm audit` tidak menemukan vulnerability dependency, struktur UI sudah konsisten memakai komponen bersama, dan tidak ditemukan sink XSS langsung seperti `v-html`, `innerHTML`, `eval`, atau `document.write`.

Namun untuk standar production-grade, masih ada beberapa titik yang perlu diperkuat sebelum PPDB menangani data asli dalam volume besar. Prioritas paling penting adalah memperketat security header/CSP, memastikan flow PPDB tidak pernah mempercayai `localStorage` sebagai security boundary, menyepakati CSRF/session contract dengan backend karena request memakai cookie, dan mengurangi penyimpanan data pribadi calon siswa di browser.

## Validasi Yang Dilakukan

- `npm run lint:web`: lulus.
- `npm run check:web`: lulus.
- `npm audit --workspace @mds-cendekia/web --audit-level=moderate`: `found 0 vulnerabilities`.
- Static scan untuk XSS sink: tidak ditemukan `v-html`, `innerHTML`, `insertAdjacentHTML`, `eval`, `new Function`, atau `document.write` di `apps/web`.
- Static scan untuk storage, cookie credentials, upload, config security, dynamic URL, dan ukuran file besar.

## Temuan Prioritas

### P1 - CSP masih dimatikan

Lokasi: `apps/web/nuxt.config.ts:147`

`contentSecurityPolicy` diset `false`, padahal aplikasi memproses data PPDB dan dokumen identitas. Header lain sudah ada, tetapi tanpa CSP browser kehilangan lapisan mitigasi penting ketika suatu saat ada XSS, third-party script, atau asset injection.

Rekomendasi:
- Aktifkan CSP bertahap, mulai dari mode report-only/staging bila perlu.
- Batasi minimal `default-src 'self'`, `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'none'`.
- Whitelist eksplisit untuk API, image CDN/API, font lokal, dan WhatsApp link bila dibutuhkan.
- Hindari `unsafe-inline` permanen; jika Nuxt membutuhkan inline script/style, cari konfigurasi nonce/hash yang kompatibel.

Referensi: [OWASP CSP Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html), [Vue Security](https://vuejs.org/guide/best-practices/security).

### P1 - Request cookie-based belum terlihat punya CSRF contract

Lokasi:
- `apps/web/composables/useApi.ts:30`
- `apps/web/services/usePpdbEmailVerificationService.ts:109`
- `apps/web/services/usePpdbEmailVerificationService.ts:129`
- `apps/web/services/usePpdbEmailVerificationService.ts:149`

API client memakai `credentials: 'include'`. Ini benar jika backend memakai session cookie, tetapi perlu perlindungan CSRF untuk endpoint state-changing seperti login, submit PPDB, upload berkas, dan verifikasi email. Di frontend belum terlihat mekanisme `X-CSRF-Token`, `X-XSRF-TOKEN`, origin validation contract, atau endpoint bootstrap token.

Rekomendasi:
- Sepakati dengan BE apakah auth memakai cookie session, Bearer token, atau hybrid.
- Jika cookie session: BE harus set cookie `HttpOnly`, `Secure`, `SameSite=Lax/Strict`, dan validasi CSRF untuk request mutasi.
- FE menambahkan header CSRF dari endpoint bootstrap/non-HttpOnly CSRF cookie sesuai pola yang disepakati.
- Jangan mengandalkan CORS atau SameSite saja sebagai satu-satunya kontrol untuk semua flow.

Referensi: [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html).

### P1 - Verifikasi PPDB masih UX guard berbasis localStorage

Lokasi:
- `apps/web/composables/usePpdbVerificationGate.ts:44`
- `apps/web/composables/usePpdbVerificationGate.ts:74`
- `apps/web/pages/ppdb/daftar/berkas/index.vue:155`
- `apps/web/pages/ppdb/daftar/berkas/index.vue:446`

Saat ini status email verified dan pending registration disimpan di browser. Ini bagus untuk UX sementara, tetapi tidak boleh dianggap sebagai keamanan final karena user bisa mengubah `localStorage` sendiri. Jika backend nanti menerima submit/berkas hanya berdasarkan data dari client, flow bisa dilewati.

Rekomendasi:
- Tetapkan localStorage hanya sebagai cache UX.
- BE wajib validasi status email verified saat submit biodata dan upload berkas.
- Gunakan verification session/token dari BE dengan expiry dan binding ke email/registration id.
- FE cukup membaca status dari BE dan memakai storage untuk menghindari flicker/re-entry, bukan untuk otorisasi final.

### P1 - Data pribadi calon siswa disimpan persisten di localStorage

Lokasi:
- `apps/web/composables/usePpdbRegistrationForm.ts:110`
- `apps/web/composables/usePpdbRegistrationForm.ts:249`
- `apps/web/composables/usePpdbRegistrationForm.ts:261`

Draft PPDB menyimpan biodata, NIK, NISN, alamat, informasi orang tua, email, dan nomor telepon di `localStorage`. Risiko utamanya adalah data menetap lama di perangkat bersama, bisa terbaca jika ada XSS di masa depan, dan sulit dikontrol masa hidupnya.

Rekomendasi:
- Tambahkan TTL draft, misalnya 24 jam atau mengikuti sesi PPDB.
- Tampilkan copy kecil: "Draft tersimpan di perangkat ini".
- Hapus draft otomatis setelah submit sukses.
- Pertimbangkan `sessionStorage` untuk data sangat sensitif, atau jadikan penyimpanan draft sebagai opt-in.
- Jangan simpan file dokumen di storage browser.

### P2 - CORS terlalu longgar

Lokasi: `apps/web/nuxt.config.ts:161-163`

`corsHandler.origin` diset `'*'` dan method membuka `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`. Saat ini route server Nuxt masih minim, tetapi konfigurasi ini berbahaya jika nanti `apps/web/server` mulai punya endpoint sensitif.

Rekomendasi:
- Restrict origin ke domain resmi, staging, dan localhost dev.
- Batasi methods sesuai kebutuhan aktual.
- Untuk API utama, lebih baik CORS dikendalikan di backend API, bukan web frontend server secara broad.

Referensi: [OWASP HTTP Headers Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html).

### P2 - Pesan error backend masih bisa tampil mentah

Lokasi:
- `apps/web/composables/useApi.ts:36`
- `apps/web/pages/ppdb/revisi-berkas/[token].vue:156`

Beberapa flow masih memakai `response._data?.message` atau `data?.message` langsung ke toast. Ini bisa membuat pesan teknis backend bocor ke user dan membuat UX tidak konsisten.

Rekomendasi:
- Buat mapper error terpusat: status/code backend -> copy user-friendly.
- Log aman hanya untuk status/error type, bukan payload sensitif.
- Untuk PPDB, jangan tampilkan detail internal seperti SQL, stack trace, raw validation object, atau nama field internal.

### P2 - Validasi upload FE masih extension-based

Lokasi:
- `apps/web/components/AppFileUpload.vue:27-35`
- `apps/web/pages/ppdb/daftar/berkas/index.vue:566-571`

Komponen upload mengecek extension dan size di client. Ini baik untuk UX, tetapi mudah dibypass. Dokumen PPDB seperti KK, akta, ijazah, dan foto perlu validasi server-side yang kuat.

Rekomendasi:
- FE tetap validasi extension, size, dan MIME untuk feedback cepat.
- BE wajib validasi MIME signature/magic number, size, jumlah file, nama file, dan storage path.
- Pertimbangkan antivirus/malware scanning jika dokumen akan dibuka oleh admin.
- Simpan file di object storage/private storage, bukan public webroot.

### P2 - Token revisi berkas berada di URL path

Lokasi:
- `apps/web/pages/ppdb/revisi-berkas/[token].vue:34`
- `apps/web/pages/ppdb/revisi-berkas/[token].vue:133`

Magic link revisi menggunakan token di path. Ini umum, tetapi token di URL dapat masuk history browser, log server/proxy, screenshot, atau analytics jika tidak hati-hati.

Rekomendasi:
- Token harus high entropy, expiry pendek, one-time use, dan scoped ke registration/document.
- Jangan pernah menaruh data pribadi dalam token plain.
- Pertahankan `Referrer-Policy: no-referrer` dan `X-Robots-Tag: noindex`.
- Setelah token valid, pertimbangkan exchange token menjadi session revisi singkat, lalu replace URL tanpa token.

### P2 - Base URL API terlalu permisif dan ada parsing markdown URL

Lokasi:
- `apps/web/composables/useApi.ts:8-12`
- `apps/web/services/usePublicNewsService.ts:5`
- `apps/web/services/usePublicGalleryService.ts:5`

`useApi` menerima URL mentah dan bahkan mencoba mengambil URL dari pola markdown `(...)`. Ini membuat konfigurasi lebih toleran dari yang perlu. Untuk production, config sebaiknya fail fast ketika invalid.

Rekomendasi:
- Gunakan `new URL()` untuk validasi.
- Enforce `https:` di production.
- Allowlist host API resmi.
- Hapus parsing markdown URL karena konfigurasi harus bersih, bukan dipulihkan diam-diam.

### P2 - External image URL dari API belum dibatasi

Lokasi:
- `apps/web/services/usePublicNewsService.ts:25-36`
- `apps/web/services/usePublicGalleryService.ts:31-39`

Jika backend mengembalikan URL absolut, frontend langsung menggunakannya. Secara XSS ini tidak langsung berbahaya selama dipakai di `src`, tetapi tetap bisa menjadi tracking vector, mixed content, atau broken content jika URL tidak dikontrol.

Rekomendasi:
- Prefer relative path dari API, lalu FE membangun URL dari host API resmi.
- Jika absolute URL tetap diterima, allowlist protocol `https:` dan host yang dipercaya.
- Tambahkan fallback image dan monitoring broken image.

### P2 - `devtools` aktif eksplisit

Lokasi: `apps/web/nuxt.config.ts:108`

`devtools: { enabled: true }` sebaiknya tidak dibuat eksplisit untuk semua mode. Walau Nuxt umumnya membatasi devtools di development, konfigurasi production-grade lebih jelas jika dikaitkan ke mode dev.

Rekomendasi:
- Ubah menjadi `devtools: { enabled: import.meta.dev }` atau hapus jika default sudah cukup.

### P2 - Runtime config public dan env perlu dirapikan

Lokasi: `apps/web/nuxt.config.ts:113-118`

`runtimeConfig.public` memang akan tersedia di client. Itu cocok untuk API base URL, site name, dan nomor WhatsApp, tetapi jangan pernah dipakai untuk secret. Untuk Nuxt, nilai public runtime config bisa dioverride env `NUXT_PUBLIC_*`.

Rekomendasi:
- Pakai default kosong/aman di `runtimeConfig.public`, lalu override dengan `NUXT_PUBLIC_WHATSAPP_NUMBER`, `NUXT_PUBLIC_API_BASE_URL`, dan sejenisnya.
- Jangan memakai public runtime config untuk secret, token, private API key, atau credential.
- Dokumentasikan `.env.example`.

Referensi: [Nuxt Runtime Config](https://nuxt.com/docs/4.x/getting-started/configuration), [Vite Env Security Notes](https://vite.dev/guide/env-and-mode.html).

### P3 - Type safety API masih longgar

Lokasi:
- `apps/web/composables/useApi.ts:18`
- `apps/web/types/news.ts:14`
- `apps/web/services/usePublicNewsService.ts:43`
- `apps/web/services/usePublicGalleryService.ts:21`
- `apps/web/pages/ppdb/daftar/berkas/index.vue:226`

`any` masih banyak dipakai untuk response API dan error. Ini wajar saat backend belum stabil, tetapi makin lama akan membuat bug mapping response sulit dideteksi.

Rekomendasi:
- Ganti `any` bertahap menjadi `unknown` + type guard.
- Buat response contract per endpoint.
- Untuk API yang belum stabil, buat adapter layer yang menerima banyak bentuk payload tetapi tetap mengeluarkan tipe internal yang ketat.

### P3 - Beberapa file/page sudah terlalu besar

Lokasi utama:
- `apps/web/pages/index.vue` sekitar 36 KB.
- `apps/web/pages/ppdb/daftar/berkas/index.vue` sekitar 26 KB.
- `apps/web/pages/ppdb/daftar/index.vue` sekitar 22 KB.
- `apps/web/components/PublicNavbar.vue` sekitar 17 KB.
- `apps/web/pages/ppdb/verifikasi/index.vue` sekitar 13 KB.

File besar belum otomatis salah, tetapi mulai mengurangi maintainability. Risiko terbesar ada di PPDB karena banyak logic submit, mapping payload, local storage, upload, dan UI dalam satu file.

Rekomendasi:
- Extract `usePpdbUploadSubmission` untuk submit biodata + upload berkas.
- Extract `usePpdbPendingRegistration` untuk pending registration storage.
- Extract verification result state menjadi reusable component, misalnya `PpdbVerificationState`.
- Pecah `PublicNavbar` menjadi `PublicNavLinks`, `PublicConsultationButton`, dan `PublicMobileMenu`.
- Untuk homepage, pindahkan data section statis ke config/constant supaya template lebih ringkas.

### P3 - Komponen upload belum punya aksesibilitas error yang optimal

Lokasi: `apps/web/components/AppFileUpload.vue:99`

Error upload tampil visual, tetapi belum punya `aria-live`, `aria-describedby`, dan state invalid yang eksplisit. Untuk form PPDB, ini penting karena user bisa gagal upload akibat format/ukuran file.

Rekomendasi:
- Tambahkan id error message.
- Hubungkan input dengan `aria-describedby`.
- Set `aria-invalid` saat error ada.
- Gunakan `role="alert"` atau `aria-live="polite"` pada pesan error.

## Hal Yang Sudah Bagus

- Security headers dasar sudah ada: HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`.
- Route PPDB sensitif sudah diberi `X-Robots-Tag: noindex, nofollow, noarchive`.
- Tidak ditemukan penggunaan `v-html` atau sink DOM XSS langsung.
- External link WhatsApp dibangun melalui util/config, bukan hardcode tersebar.
- Lint, typecheck, dan dependency audit lulus.
- Komponen form dasar sudah mulai reusable (`AppInput`, `AppSelect`, `AppDateInput`, `AppButton`, `AppFileUpload`).

## Rekomendasi Roadmap

### Sprint pendek

1. Aktifkan CSP dengan konfigurasi aman bertahap.
2. Kunci CORS agar tidak wildcard.
3. Rapikan `useApi`: URL validation, error mapper, type fetch options.
4. Tambahkan TTL untuk draft PPDB di `localStorage`.
5. Tambahkan aksesibilitas error pada `AppFileUpload`.
6. Matikan devtools eksplisit di non-dev.

### Sprint integrasi BE

1. Finalisasi kontrak email verification: request, confirm, check session, expiry, retry/rate limit.
2. Finalisasi CSRF/session contract jika memakai cookie.
3. Backend enforce verified email sebelum submit form dan upload berkas.
4. Backend validasi file upload dengan MIME signature dan storage aman.
5. Response error memakai `code`, bukan teks bebas, agar FE bisa mapping copy konsisten.

### Sprint maintainability

1. Pecah halaman PPDB upload menjadi composable + subcomponent.
2. Kurangi `any` di adapter API.
3. Pisahkan data content homepage/profil dari template.
4. Tambahkan `.env.example` untuk semua `NUXT_PUBLIC_*` yang dipakai.

## Checklist Manual QA

- Buka PPDB verifikasi tanpa storage: harus masuk halaman verifikasi.
- Verifikasi email dummy/real: setelah berhasil, masuk formulir tanpa verifikasi ulang selama session masih valid.
- Hapus `localStorage`: user kembali diminta verifikasi.
- Submit PPDB dengan file terlalu besar: error terbaca dan fokus/error announcement jelas.
- Upload file extension palsu: FE menolak extension tidak valid; BE tetap wajib menolak file palsu.
- Coba refresh di tiap step PPDB: state tidak rusak.
- Coba link revisi expired/invalid: copy user-friendly, tidak menampilkan raw backend error.
- Cek Network: request mutasi tidak mengirim credential ke host yang tidak diharapkan.
- Cek Response Headers production/staging: CSP, HSTS, X-Frame-Options, Referrer-Policy, X-Content-Type-Options aktif.

## Pertanyaan Untuk Backend

1. Apakah auth/session akan memakai cookie `HttpOnly` atau Bearer token?
2. Jika cookie, pola CSRF apa yang akan dipakai?
3. Apakah submit PPDB dan upload berkas akan menolak request tanpa email verification session yang valid?
4. Berapa expiry verification link, verification session, dan revision magic link?
5. Apakah token revisi berkas one-time use?
6. Validasi file upload backend mencakup apa saja: MIME signature, extension, size, virus scan, dan storage path?
7. Apakah error response akan memakai `code` stabil seperti `INVALID_TOKEN`, `EMAIL_NOT_VERIFIED`, `RATE_LIMITED`, `FILE_TOO_LARGE`?

## Kesimpulan

`apps/web` sudah layak sebagai fondasi frontend, tetapi belum sepenuhnya production-grade untuk PPDB data asli. Fokus berikutnya sebaiknya bukan mengganti UI besar-besaran, melainkan memperketat trust boundary: security header, CSRF/session, validasi backend untuk verifikasi dan upload, serta minimisasi data pribadi di browser.

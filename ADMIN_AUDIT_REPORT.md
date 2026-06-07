# Audit Admin MDS Cendekia

Tanggal audit: 7 Juni 2026  
Ruang lingkup: `apps/admin`, integrasi API admin, konfigurasi Nuxt, keamanan frontend, performa, aksesibilitas, dan maintainability.

## Ringkasan

Fondasi admin sudah cukup baik: seluruh halaman internal memakai middleware, request memakai cookie credential, respons `401` ditangani terpusat, output teks tidak memakai `v-html`, dependency produksi tidak memiliki vulnerability yang terdeteksi `npm audit`, dan build produksi berhasil.

Prioritas tertinggi bukan perubahan visual. Tim perlu memastikan kontrak keamanan cookie/CSRF dan proteksi dokumen pendaftar di backend. Di frontend, prioritas berikutnya adalah mengaktifkan CSP, membatasi URL dan tipe upload, membersihkan seluruh cache saat sesi berakhir, serta mengurangi prefetch data setelah login.

## Temuan Prioritas

### SEC-01 - High - Mekanisme CSRF belum terlihat pada request berbasis cookie

**Bukti**

- `apps/admin/composables/useApi.ts:58-69` meneruskan cookie dan selalu memakai `credentials: 'include'`.
- Request mutasi `POST`, `PUT`, `PATCH`, dan `DELETE` tidak menambahkan CSRF token/header.

**Dampak**

Jika cookie sesi backend dapat dikirim lintas situs dan backend tidak memvalidasi `Origin`/`Referer` atau token CSRF, situs lain dapat mencoba menjalankan aksi admin menggunakan sesi korban.

**Rekomendasi**

1. Backend wajib memakai cookie `HttpOnly`, `Secure`, dan `SameSite=Lax` atau `Strict` bila arsitektur memungkinkan.
2. Semua endpoint mutasi wajib memvalidasi `Origin` dan memakai CSRF token yang terikat ke sesi.
3. CORS backend harus memakai allowlist origin admin yang eksplisit, bukan `*`, serta `Access-Control-Allow-Credentials: true`.
4. Tambahkan integration test bahwa request mutasi tanpa CSRF token atau dari origin asing ditolak.

**Catatan**

Ini adalah risiko kontrak frontend-backend, bukan bukti bahwa backend saat ini dapat dieksploitasi. Cookie attributes dan middleware backend harus diaudit untuk menutup temuan ini.

### SEC-02 - High - Dokumen pendaftar memakai URL langsung yang perlu dipastikan tidak publik

**Bukti**

- `apps/admin/mappers/adminPendaftarMapper.ts:51-58` membentuk URL dokumen langsung dari respons API.
- `apps/admin/components/pendaftaran/PendaftaranFilePreview.vue:42-65` membuka atau mengambil file langsung melalui browser/PDF.js.
- URL absolut dari API diterima tanpa allowlist host.

**Dampak**

KTP, KK, ijazah, atau dokumen siswa dapat bocor jika path upload dapat diakses tanpa autentikasi atau URL mudah ditebak. URL eksternal yang tersimpan juga dapat membuat browser admin menghubungi host yang tidak dipercaya.

**Rekomendasi**

1. Simpan dokumen privat di storage non-public.
2. Layani file melalui endpoint yang memverifikasi sesi dan izin admin, atau signed URL berumur sangat pendek.
3. Jangan expose path storage internal pada payload API.
4. Frontend hanya menerima HTTPS dari host API/storage yang di-allowlist.
5. Tambahkan audit log untuk akses dan unduhan dokumen sensitif.

**Verifikasi backend**

Coba akses satu URL dokumen pendaftar dari sesi incognito/tanpa cookie. Respons yang benar adalah `401`/`403`, bukan file.

### SEC-03 - Medium - CSP dimatikan dan CORS server admin terlalu luas

**Bukti**

- `apps/admin/nuxt.config.ts:73-92` menetapkan `contentSecurityPolicy: false` dan `corsHandler.origin: '*'`.
- `apps/admin/nuxt.config.ts:38` mengaktifkan Nuxt DevTools tanpa pembatasan environment.

**Dampak**

CSP yang dimatikan menghilangkan lapisan pertahanan penting terhadap XSS dan pemuatan resource asing. CORS wildcard memperbesar permukaan server Nuxt bila route server ditambahkan. DevTools sebaiknya tidak diaktifkan secara eksplisit pada konfigurasi produksi.

**Rekomendasi**

1. Mulai dengan `Content-Security-Policy-Report-Only`, lalu enforcement setelah semua resource terpetakan.
2. Minimal batasi `default-src 'self'`, `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'none'`, serta allowlist API, font, image, dan worker yang benar-benar dipakai.
3. Hapus CORS handler jika admin tidak menyediakan API publik; jika diperlukan, gunakan origin admin eksplisit.
4. Aktifkan DevTools hanya saat development.

### SEC-04 - Medium - Validasi upload gambar terlalu permisif

**Status frontend: selesai pada 7 Juni 2026.**

**Bukti**

- `apps/admin/pages/berita/index.vue:195-209` dan `apps/admin/composables/useAdminGalleryImageFiles.ts:31-45` hanya memeriksa `file.type.startsWith('image/')`.
- Input berita di `apps/admin/pages/berita/index.vue:761-766` memakai `accept="image/*"` walau UI menyatakan PNG/JPG/WEBP.

**Dampak**

Format seperti SVG atau tipe lain yang tidak diharapkan tetap lolos frontend. MIME dari browser dapat dipalsukan, sehingga validasi frontend tidak boleh menjadi kontrol keamanan.

**Implementasi frontend**

Upload berita dan galeri kini hanya menerima PNG, JPEG, dan WebP maksimal 4 MB. Validator memeriksa ekstensi, MIME, dan magic bytes sebelum file masuk ke form.

**Sisa rekomendasi backend**

Backend tetap wajib mengulangi pemeriksaan magic bytes dan ukuran/dimensi, menolak SVG, mengganti nama file, dan idealnya decode lalu encode ulang gambar sebelum disimpan.

### SEC-05 - Medium - Cache data sensitif tidak seluruhnya dibersihkan pada respons 401

**Status: selesai pada 7 Juni 2026.**

**Bukti**

- `apps/admin/composables/useAdminSession.ts` sekarang menjadi teardown terpusat untuk logout, respons `401`, dan kegagalan verifikasi middleware.
- Seluruh state milik admin dan cookie lokal dibersihkan tanpa menyentuh state internal Nuxt.
- Loader cache memakai session generation agar respons dari sesi lama tidak dapat menulis data kembali setelah logout.

**Dampak**

Data akun sebelumnya dapat tetap berada di memory aplikasi setelah sesi kedaluwarsa, lalu terlihat sementara saat admin lain login pada tab yang sama.

**Sisa verifikasi**

Pastikan cookie sesi `HttpOnly` benar-benar dihapus oleh endpoint logout backend karena cookie tersebut tidak dapat dihapus melalui JavaScript.

### AUTH-01 - Medium - Route guard hanya berjalan di client dan memverifikasi sesi pada setiap navigasi

**Bukti**

- `apps/admin/middleware/admin-auth.ts:3-19` melewati guard saat SSR dan memanggil `/auth/verify` pada setiap perpindahan route.

**Dampak**

Client guard bukan authorization boundary dan menambah round-trip pada setiap navigasi. Keamanan tetap sepenuhnya bergantung pada otorisasi setiap endpoint backend.

**Rekomendasi**

Backend wajib memeriksa sesi dan role pada setiap endpoint. Untuk UX, deduplikasi request verify dan beri TTL singkat pada status sesi; tetap jadikan `401` API sebagai sumber invalidasi. Jika ingin proteksi sebelum render, gunakan server middleware/BFF same-origin.

### AUTH-02 - Medium - Lockout login frontend dapat dilewati

**Bukti**

- `apps/admin/pages/login/index.vue:22-66` menyimpan hitungan percobaan dan timer hanya di memory browser.

**Dampak**

Reload atau browser baru menghapus lockout lokal. Kontrol ini hanya membantu UX, bukan mencegah brute force.

**Rekomendasi**

Rate limit dan lockout harus diterapkan di backend berdasarkan kombinasi akun, IP, dan sinyal risiko, dengan respons `429` dan `Retry-After`. Hindari pesan yang membocorkan apakah username terdaftar.

## Performa

### PERF-01 - High - Login memicu tujuh kelompok request sekaligus

**Bukti**

- `apps/admin/pages/login/index.vue:103-110` menjalankan prefetch setelah login.
- `apps/admin/composables/useAdminDataCache.ts:383-392` mengambil summary, seluruh pendaftar, siswa, timeline, paket, berita, dan galeri secara paralel.

**Dampak**

Login membuat burst request, mengunduh data pribadi yang belum dibutuhkan, membebani API, dan memperburuk performa seiring pertumbuhan data.

**Rekomendasi**

Prefetch hanya summary dashboard. Muat data lain ketika route terkait dibuka atau saat browser idle. Endpoint daftar wajib memakai pagination, server-side search/filter/sort, field projection, dan batas maksimum `limit`.

### PERF-02 - Medium - Preview PDF merender semua halaman sekaligus

**Bukti**

- `apps/admin/components/pendaftaran/PendaftaranFilePreview.vue:60-95` mengimpor PDF.js lalu merender seluruh halaman dalam loop.
- Build menghasilkan `pdf.worker` sekitar 2,16 MB. Worker sudah lazy-loaded, tetapi parsing file besar tetap mahal saat preview dibuka.

**Dampak**

PDF panjang atau beresolusi tinggi dapat memicu penggunaan CPU/memory besar dan membuat UI macet.

**Rekomendasi**

Render halaman pertama lebih dahulu, lanjutkan dengan lazy rendering memakai `IntersectionObserver`, batasi ukuran file/jumlah halaman, batalkan loading task saat modal ditutup, dan tampilkan fallback unduh bila melewati batas.

### PERF-03 - Medium - Chunk aplikasi utama masih besar

Build produksi berhasil, tetapi chunk JavaScript terbesar sekitar 415,62 KB (123,37 KB gzip) dan chunk berikutnya sekitar 194,04 KB (72,77 KB gzip).

**Rekomendasi**

Tambahkan bundle visualizer, identifikasi dependency per chunk, pastikan fitur berat hanya diimpor pada halaman yang membutuhkan, dan tetapkan performance budget di CI.

## UX dan Aksesibilitas

### UX-01 - Medium - Modal dan bottom sheet belum mengikuti pola dialog aksesibel

**Bukti**

- `apps/admin/components/AppModal.vue:55-93` belum memiliki `role="dialog"`, `aria-modal`, relasi judul, focus trap, initial focus, atau restore focus.
- `apps/admin/components/AppBottomSheet.vue:44-65` memiliki kekurangan serupa.
- Tombol tutup modal di `apps/admin/components/AppModal.vue:76-82` tidak menetapkan `type="button"` dan accessible label.

**Dampak**

Pengguna keyboard/screen reader dapat kehilangan konteks atau fokus keluar dari dialog. Tombol tutup juga berpotensi menjadi submit bila modal berada di dalam form.

**Rekomendasi**

Buat primitive dialog tunggal: focus trap, restore focus, `aria-labelledby`, inert background, Escape, scroll-lock reference counting, dan tombol dengan `type="button"` serta `aria-label`.

### UX-02 - Medium - Layout desktop dipaksa dengan minimum width

**Bukti**

- `apps/admin/layouts/admin.vue:91-102` memakai `min-w-5xl` dan menutup seluruh UI di bawah breakpoint `lg`.
- `apps/admin/pages/login/index.vue:130-132` juga memaksa `min-w-5xl`.

**Dampak**

Laptop kecil, zoom browser, split-screen, dan pengguna low-vision dapat mengalami overflow atau tidak dapat mengakses login. Pembatasan perangkat berdasarkan lebar viewport juga bukan kontrol keamanan.

**Rekomendasi**

Pertahankan admin desktop-first, tetapi dukung viewport 1024 px dan zoom 200%. Hapus minimum width global, buat grid adaptif, dan gunakan pesan unsupported hanya pada area yang memang tidak dapat dioperasikan.

## Engineering Quality

### QUAL-01 - Medium - Belum ada test otomatis dan CI yang terlihat

`package.json:8-26` hanya menyediakan build, lint, dan check. Pencarian repository tidak menemukan test/spec atau workflow `.github`.

**Risiko**

Regresi pada login, session expiry, CRUD berita, upload, approve/reject pendaftar, dan proteksi data baru diketahui lewat pengujian manual.

**Rekomendasi minimum**

1. Unit test untuk mapper, URL normalizer, cache invalidation, dan validation.
2. Integration test untuk API client: cookie, CSRF, timeout, `401`, `403`, `429`, dan error multipart.
3. E2E untuk login, logout, session expiry, CRUD berita, upload invalid, serta approve/reject.
4. CI menjalankan lint, typecheck, unit test, build, `npm audit`, dan performance budget.

## Hal Positif

- Seluruh halaman admin internal memakai middleware autentikasi.
- Penanganan `401` terpusat dan mencegah redirect berulang.
- `window.open` sudah memakai `noopener,noreferrer`.
- Tidak ditemukan penggunaan `v-html`; teks dinamis memakai escaping Vue.
- PDF.js diimpor secara dinamis, sehingga worker tidak masuk initial route.
- Header `frame-ancestors` ekuivalen melalui `X-Frame-Options: DENY`, `nosniff`, HSTS, dan referrer policy sudah dikonfigurasi.
- `npm audit --omit=dev` pada 7 Juni 2026: 0 vulnerability dari 711 production dependencies.
- `npm run build:admin` berhasil.

## Urutan Implementasi

### P0 - Sebelum dianggap production-ready

1. Audit cookie, CORS, CSRF, rate limit, role authorization, dan session rotation di backend.
2. Pastikan seluruh dokumen pendaftar tidak dapat diakses tanpa otorisasi.
3. Bersihkan seluruh cache saat logout atau `401`. Selesai 7 Juni 2026.
4. Terapkan validasi upload ketat di backend.

### P1 - Hardening frontend

1. Terapkan CSP bertahap dan allowlist URL asset.
2. Batasi format upload di UI.
3. Ganti prefetch global dengan route-aware loading dan pagination server.
4. Perbaiki dialog accessibility dan PDF lazy rendering.

### P2 - Quality gate

1. Tambahkan test otomatis dan CI.
2. Tambahkan bundle analyzer, performance budget, logging terstruktur, dan monitoring error.
3. Perbaiki layout untuk laptop kecil, zoom, dan split-screen.

## Referensi

- [Vue Security](https://vuejs.org/guide/best-practices/security)
- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)
- [OWASP HTTP Headers Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

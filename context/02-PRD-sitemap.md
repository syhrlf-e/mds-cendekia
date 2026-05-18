# PRD — Sitemap & Routing
# Sistem PPDB MDS Cendekia

---

## Sisi User (Publik)

```
/ppdb                    → Landing PPDB
/ppdb/daftar             → Formulir Pendaftaran (Accordion)
/ppdb/daftar/berkas      → Upload Berkas Persyaratan
/ppdb/cek-status         → Cek Status Pendaftaran
/ppdb/kartu-peserta      → Download Kartu Peserta (generate PDF)
```

## Sisi Admin (Desktop-only)

```
/admin/login             → Login Admin
/admin/dashboard         → Dashboard (placeholder MVP)
/admin/pendaftaran       → List & Manajemen Pendaftar
/admin/pengaturan        → Pengaturan Periode PPDB
```

---

## Aturan Akses & Redirect

| Kondisi | Behavior |
|---|---|
| Akses `/ppdb/daftar` saat periode ditutup | Redirect ke `/ppdb` + toast "Pendaftaran sedang tidak dibuka" |
| Akses `/admin/*` tanpa autentikasi | Redirect ke `/admin/login` |
| Login admin berhasil | Redirect ke `/admin/pendaftaran` |
| Akses `/ppdb/kartu-peserta` | Direct link, tanpa autentikasi |

---

## Catatan Layout Global

| Halaman | Mobile | Desktop |
|---|---|---|
| `/ppdb` | Single column, padding 16px | 60% ilustrasi kiri / 40% konten kanan |
| `/ppdb/daftar` | Full width, padding 16px | Accordion 50% lebar, di-center |
| `/ppdb/daftar/berkas` | Full width, padding 16px | 50% lebar, di-center |
| `/ppdb/cek-status` | Input di tengah viewport, hasil via Bottom Sheet | Centered single-column ±40% width, hasil expand ke bawah |
| `/ppdb/kartu-peserta` | — | Auto generate & download PDF |
| `/admin/*` | Tidak didukung | Full desktop layout |

> **Catatan:** Tidak ada navbar di seluruh halaman user untuk MVP.

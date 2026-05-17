# PRD — Email Templates
# Sistem PPDB MDS Cendekia

> Email dikirim oleh BE (NestJS). FE hanya trigger aksi, BE yang handle pengiriman.

---

## 1. Email Konfirmasi Pendaftaran

**Trigger:** Setelah user berhasil submit formulir + berkas
**Penerima:** Email siswa pendaftar

```
Subject:
Konfirmasi Pendaftaran PPDB MDS Cendekia 2025

─────────────────────────────────────────
[Logo MDS Cendekia]

Halo, {Nama Siswa}!

Pendaftaran kamu telah berhasil diterima oleh sistem kami.
Berikut detail pendaftaran kamu:

  Nomor Pendaftaran  : MDS-2025-XXXX
  Nama Lengkap       : {Nama Lengkap}
  Asal Sekolah       : {Nama Sekolah Asal}
  Tanggal Daftar     : {DD/MM/YYYY}

Simpan nomor pendaftaran kamu untuk mengecek
status pendaftaran secara berkala.

[ Cek Status Pendaftaran ]  ← tombol/link ke /ppdb/cek-status

─────────────────────────────────────────
© 2025 MDS Cendekia — Mukti Daris Sasmita Cendekia
```

---

## 2. Email Approval (Diterima)

**Trigger:** Admin klik "Terima" dan konfirmasi
**Penerima:** Email siswa pendaftar

```
Subject:
Selamat! Kamu Diterima di MDS Cendekia 2025

─────────────────────────────────────────
[Logo MDS Cendekia]

Halo, {Nama Siswa}!

Selamat! Pendaftaran kamu telah disetujui.
Kamu resmi menjadi calon peserta didik baru
MDS Cendekia tahun ajaran 2025/2026.

Di bawah ini adalah kartu peserta kamu.
Simpan dan bawa kartu ini saat proses daftar ulang.

[ Download Kartu Peserta ]  ← tombol/link ke /ppdb/kartu-peserta?id={param}

─────────────────────────────────────────
© 2025 MDS Cendekia — Mukti Daris Sasmita Cendekia
```

---

## 3. Email Rejection (Ditolak)

**Trigger:** Admin mengisi alasan dan klik "Kirim" di modal reject
**Penerima:** Email siswa pendaftar

```
Subject:
Informasi Status Pendaftaran MDS Cendekia 2025

─────────────────────────────────────────
[Logo MDS Cendekia]

Halo, {Nama Siswa}!

Mohon maaf, pendaftaran kamu belum dapat kami terima
dengan alasan berikut:

  "{Alasan dari admin}"

Untuk informasi lebih lanjut, silakan hubungi kami:
  {Kontak Sekolah}

─────────────────────────────────────────
© 2025 MDS Cendekia — Mukti Daris Sasmita Cendekia
```

---

## Variabel Template

| Variabel | Sumber Data |
|---|---|
| `{Nama Siswa}` | Field Nama Panggilan atau Nama Lengkap |
| `{Nama Lengkap}` | Field Nama Lengkap |
| `{Nama Sekolah Asal}` | Field Nama Sekolah Asal |
| `{DD/MM/YYYY}` | Tanggal submit pendaftaran |
| `{Alasan dari admin}` | Input textarea modal reject admin |
| `{Kontak Sekolah}` | Data kontak sekolah (dari pengaturan atau hardcoded) |
| `{param}` | ID atau token untuk akses kartu peserta |

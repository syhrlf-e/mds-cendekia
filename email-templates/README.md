# Email Templates - PPDB MDS Cendekia

Folder ini berisi template email PPDB MDS Cendekia untuk backend NestJS.

Implementasi yang disepakati:
- Email dikirim oleh backend.
- Provider email menggunakan Resend.
- Template production menggunakan Handlebars (`.hbs`).
- PDF kartu peserta digenerate oleh backend.
- Email approval dapat melampirkan PDF kartu peserta, menyediakan link download PDF, atau keduanya.

## Struktur File

```txt
email-templates/
  registration-confirmation.hbs
  registration-approved.hbs
  registration-rejected.hbs
  preview/
    registration-confirmation.html
    registration-approved.html
    registration-rejected.html
```

File `.hbs` dipakai backend production.

File `preview/*.html` hanya untuk melihat tampilan di browser. File preview memakai dummy data dan tidak perlu dipakai oleh backend.

## Template Dan Trigger

| File | Trigger | Subject yang disarankan |
|---|---|---|
| `registration-confirmation.hbs` | Setelah registrasi dan upload berkas berhasil | `Pendaftaran PPDB MDS Cendekia Berhasil Tercatat` |
| `registration-approved.hbs` | Setelah admin menerima pendaftar | `Selamat! Kamu Diterima di MDS Cendekia` |
| `registration-rejected.hbs` | Setelah admin menolak pendaftar | `Informasi Status Pendaftaran MDS Cendekia` |

## Cara Pakai Di NestJS + Resend

Install dependency di backend:

```bash
npm install resend handlebars
```

Contoh struktur di backend:

```txt
src/
  email/
    templates/
      registration-confirmation.hbs
      registration-approved.hbs
      registration-rejected.hbs
    email.service.ts
```

Copy file `.hbs` dari folder ini ke `src/email/templates/` di backend.

## Environment

Contoh `.env` backend:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
MAIL_FROM=MDS Cendekia <noreply@domain-terverifikasi.com>
FRONTEND_URL=http://127.0.0.1:3000
APP_URL=https://api.oirul.com
API_URL=https://api.oirul.com
```

Catatan:
- `MAIL_FROM` wajib memakai domain yang sudah diverifikasi di Resend.
- `FRONTEND_URL` dipakai untuk link halaman FE seperti cek status.
- `APP_URL` atau `API_URL` dipakai untuk asset publik dan link download PDF dari backend.
- `url_logo` harus URL publik. Jangan pakai path lokal seperti `/images/logo-mds-main.png` di email production.

## Contoh Email Service

```ts
import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as Handlebars from 'handlebars';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly resend = new Resend(process.env.RESEND_API_KEY);

  private renderTemplate(templateName: string, data: Record<string, unknown>) {
    const templatePath = join(
      process.cwd(),
      'src',
      'email',
      'templates',
      `${templateName}.hbs`,
    );

    const templateSource = readFileSync(templatePath, 'utf8');
    const template = Handlebars.compile(templateSource);

    return template(data);
  }

  async kirimKonfirmasiPendaftaran(pendaftar: any) {
    const html = this.renderTemplate('registration-confirmation', {
      url_logo: `${process.env.APP_URL}/images/logo-mds-main.png`,
      nama_sekolah: 'MDS Cendekia',
      nama_yayasan: 'Mukti Daris Sasmita Cendekia',
      tahun: new Date().getFullYear(),

      nama_siswa: pendaftar.biodata.nama,
      nomor_pendaftaran: pendaftar.nomor_pendaftaran,
      nama_lengkap: pendaftar.biodata.nama,
      nisn: pendaftar.nisn,
      asal_sekolah: pendaftar.riwayat_pendidikan.nama_sekolah_asal,
      tanggal_daftar: this.formatTanggal(pendaftar.created_at),
      url_cek_status: `${process.env.FRONTEND_URL}/ppdb/cek-status`,
    });

    return this.resend.emails.send({
      from: process.env.MAIL_FROM!,
      to: pendaftar.biodata.email,
      subject: 'Pendaftaran PPDB MDS Cendekia Berhasil Tercatat',
      html,
    });
  }

  async kirimPendaftaranDiterima(pendaftar: any, pdfBuffer?: Buffer) {
    const namaFilePdf = `Kartu-Peserta-${pendaftar.nomor_pendaftaran}.pdf`;

    const html = this.renderTemplate('registration-approved', {
      url_logo: `${process.env.APP_URL}/images/logo-mds-main.png`,
      nama_sekolah: 'MDS Cendekia',
      nama_yayasan: 'Mukti Daris Sasmita Cendekia',
      tahun: new Date().getFullYear(),
      tahun_ajaran: '2026/2027',

      nama_siswa: pendaftar.biodata.nama,
      nomor_pendaftaran: pendaftar.nomor_pendaftaran,
      nama_lampiran_pdf: pdfBuffer ? namaFilePdf : '',
      url_download_pdf: `${process.env.API_URL}/register/kartu/${pendaftar.nomor_pendaftaran}`,
    });

    return this.resend.emails.send({
      from: process.env.MAIL_FROM!,
      to: pendaftar.biodata.email,
      subject: 'Selamat! Kamu Diterima di MDS Cendekia',
      html,
      attachments: pdfBuffer
        ? [
            {
              filename: namaFilePdf,
              content: pdfBuffer.toString('base64'),
            },
          ]
        : undefined,
    });
  }

  async kirimPendaftaranDitolak(pendaftar: any, alasanPenolakan: string) {
    const html = this.renderTemplate('registration-rejected', {
      url_logo: `${process.env.APP_URL}/images/logo-mds-main.png`,
      nama_sekolah: 'MDS Cendekia',
      nama_yayasan: 'Mukti Daris Sasmita Cendekia',
      tahun: new Date().getFullYear(),

      nama_siswa: pendaftar.biodata.nama,
      nomor_pendaftaran: pendaftar.nomor_pendaftaran,
      alasan_penolakan: alasanPenolakan,
      kontak_sekolah: '0812-3456-7890',
    });

    return this.resend.emails.send({
      from: process.env.MAIL_FROM!,
      to: pendaftar.biodata.email,
      subject: 'Informasi Status Pendaftaran MDS Cendekia',
      html,
    });
  }

  private formatTanggal(value: string | Date) {
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(value));
  }
}
```
## Variabel Yang Dapat Digunakan

Gunakan data ini ketika mengetes template di HBS editor.

### Konfirmasi Pendaftaran

```json
{
  "url_logo": "https://api.oirul.com/images/logo-yayasan.png",
  "nama_yayasan": "Yayasan Mukti Daris Sasmita Cendekia",
  "nama_siswa": "Syahrul Efendi",
  "nomor_pendaftaran": "PPDB-2026-00125",
  "nisn": "0045678912",
  "nama_lengkap": "Syahrul Efendi",
  "asal_sekolah": "SMP Negeri 1 Jawilan",
  "tanggal_daftar": "21 Mei 2026",
  "url_cek_status": "https://api.oirul.com/ppdb/status/00125",
  "tahun": "2026"
}
```

### Diterima

```json
{
  "url_logo": "https://api.oirul.com/images/logo-yayasan.png",
  "nama_yayasan": "Yayasan Mukti Daris Sasmita Cendekia",
  "nama_siswa": "Syahrul Efendi",
  "tahun_ajaran": "2026/2027",
  "nomor_pendaftaran": "PPDB-2026-00125",
  "url_download_pdf": "https://api.oirul.com/api/ppdb/download-kartu/00125",
  "tahun": "2026"
}
```

### Ditolak

```json
{
  "url_logo": "https://api.oirul.com/images/logo-yayasan.png",
  "nama_yayasan": "Yayasan Mukti Daris Sasmita Cendekia",
  "nama_siswa": "Syahrul Efendi",
  "tahun_ajaran": "2026/2027",
  "nomor_pendaftaran": "PPDB-2026-00125",
  "alasan_penolakan": "Dokumen Kartu Keluarga (KK) yang diunggah tidak mencantumkan nama calon peserta didik baru atau masa berlaku dokumen tidak sesuai ketentuan.",
  "kontak_yayasan": "+62 812-3456-7890 (Helpdesk)",
  "tahun": "2026"
}
```

## Catatan Pengiriman

- Kirim email confirmation hanya setelah register dan upload berkas berhasil.
- Kirim email approved setelah admin approve.
- Kirim email rejected setelah admin reject dan alasan penolakan sudah diisi.
- Jangan mengirim email approval sebelum PDF selesai dibuat jika PDF wajib dilampirkan.
- Gunakan URL absolut untuk semua link dan gambar di email.
- Hindari path lokal atau relative path pada email production.

# PRD — Design Language
# Sistem PPDB MDS Cendekia
### Berbasis getdesign@latest add apple — Diadaptasi ke Brand MDS Cendekia

> ⚠️ File ini adalah **acuan visual utama**. Wajib dibaca sebelum mengerjakan UI apapun.
> Semua nilai di sini bersifat EKSPLISIT — tidak ada ruang interpretasi bebas.

---

## 1. Visual Personality

Sistem ini mengadopsi filosofi Apple: **UI meresap ke belakang, konten yang berbicara.**

```
Bukan: ramai, banyak warna, banyak shadow, banyak dekorasi
Tapi:  bersih, confident, warm, satu aksen warna dominan
```

**Tone:** Prestisius, terpercaya, institusional — tapi tidak kaku.
**Referensi feel:** Apple.com + Linear + Notion — warm white base, satu brand color, tipografi yang tight dan confident.

---

## 2. Color System

### Brand Colors (MDS Cendekia)

```css
/* Primary — Terracotta (Brand) */
--color-brand:         #a7221b;   /* Terracotta-800 — sidebar active, logo, accent */
--color-brand-hover:   #bb221a;   /* Terracotta-700 */
--color-brand-subtle:  #fef3f2;   /* Terracotta-50  — background, hover row */
--color-brand-border:  #fee3e2;   /* Terracotta-100 — hairline, card border */

/* Secondary — Kournikova (CTA) */
--color-cta:           #fbe579;   /* Kournikova-200 — tombol utama */
--color-cta-hover:     #fad74f;   /* Kournikova-300 */
--color-cta-text:      #81201b;   /* Terracotta-900 — teks di atas tombol emas */
```

### Surface Colors

```css
--color-canvas:        #ffffff;   /* Surface card, modal, input */
--color-canvas-warm:   #fef3f2;   /* Background halaman — Terracotta-50, bukan pure white */
--color-canvas-parchment: #f5f5f7; /* Alternating section, sidebar background */
```

### Text Colors

```css
--color-ink:           #1d1d1f;   /* Headline, body utama — near-black, bukan pure black */
--color-ink-secondary: #6b7280;   /* Subtext, label, caption */
--color-ink-muted:     #86868b;   /* Placeholder, disabled text */
--color-ink-on-dark:   #ffffff;   /* Teks di atas surface gelap */
--color-ink-on-cta:    #81201b;   /* Teks di atas tombol emas */
```

### Hairline & Border

```css
--color-hairline:      #fee3e2;   /* Terracotta-100 — border card, divider (on-brand) */
--color-hairline-soft: rgba(0, 0, 0, 0.06); /* Border subtle di atas white surface */
```

### Feedback Colors

```css
--color-success:       #16a34a;
--color-error:         #dc2626;
--color-warning:       #d97706;

/* Status Badge */
--color-pending-bg:    #fef9c3;
--color-pending-text:  #854d0e;
--color-approved-bg:   #dcfce7;
--color-approved-text: #166534;
--color-rejected-bg:   #fee2e2;
--color-rejected-text: #991b1b;
```

### Elevation (Shadow)

```css
/* Filosofi: SATU shadow di seluruh sistem — hanya untuk product/image lift */
--shadow-product: rgba(0, 0, 0, 0.22) 3px 5px 30px 0px;

/* Card — bukan shadow, tapi hairline border */
--shadow-card: none; /* Gunakan border, bukan shadow */

/* Frosted glass — sticky bar, modal backdrop */
--backdrop-blur: blur(20px);
--backdrop-bg: rgba(254, 243, 242, 0.80); /* canvas-warm 80% */
```

---

## 3. Typography

> Font stack: **Plus Jakarta Sans** (heading) + **Inter** (body/UI)
> Keduanya adalah closest open-source equivalent dari SF Pro Display + SF Pro Text.

### Type Scale

| Token | Size | Weight | Line Height | Letter Spacing | Penggunaan |
|---|---|---|---|---|---|
| `display-hero` | 48px | 600 | 1.07 | -0.28px | Hero headline utama halaman |
| `display-lg` | 36px | 600 | 1.10 | -0.2px | Section headline, judul card besar |
| `display-md` | 28px | 600 | 1.20 | -0.2px | Sub-section head |
| `lead` | 21px | 400 | 1.40 | 0 | Tagline, subjudul hero |
| `body-strong` | 17px | 600 | 1.24 | -0.2px | Label field, tabel header, emphasis |
| `body` | 17px | 400 | 1.47 | -0.2px | Body text, deskripsi |
| `caption-strong` | 14px | 600 | 1.29 | -0.15px | Badge, label aktif, button utility |
| `caption` | 14px | 400 | 1.43 | -0.15px | Caption, subtext, helper text |
| `button` | 15px | 500 | 1.0 | 0 | Teks tombol utama |
| `button-sm` | 13px | 500 | 1.0 | 0 | Teks tombol kecil, nav link |
| `fine-print` | 12px | 400 | 1.4 | -0.08px | Error message, fine print |
| `nav-link` | 13px | 400 | 1.0 | -0.08px | Sidebar menu item |

### Prinsip Tipografi

```
✅ Gunakan letter-spacing negatif di ukuran display (≥17px)
✅ Heading selalu weight 600, bukan 700
✅ Body text 17px, bukan 16px — terasa "reading" bukan "scanning"
✅ Weight 500 untuk button — bukan 400, bukan 600
✅ Line-height tight di display (1.07–1.20), relaxed di body (1.47)

❌ Jangan pakai weight 700 kecuali sangat perlu
❌ Jangan pakai letter-spacing positif di ukuran kecil
❌ Jangan pakai font-size < 12px
```

---

## 4. Spacing System

**Base unit: 4px** (sub-base untuk adjustment tipografi)
**Structural grid: 8px** (semua layout snaps ke kelipatan 8)

```css
--spacing-1:   4px;   /* micro — gap icon ke teks */
--spacing-2:   8px;   /* xs — padding badge, gap inline */
--spacing-3:   12px;  /* sm — padding button kecil */
--spacing-4:   16px;  /* md — padding standar, gap komponen */
--spacing-5:   20px;  /* — gap card dalam grid */
--spacing-6:   24px;  /* lg — padding card, padding input */
--spacing-8:   32px;  /* xl — gap antar section kecil */
--spacing-10:  40px;  /* — gap konten dalam section */
--spacing-12:  48px;  /* xxl — padding section */
--spacing-16:  64px;  /* — air di atas headline */
--spacing-20:  80px;  /* section — vertical padding full section */
```

### Penggunaan Spacing

```
Section vertical padding   : 80px (--spacing-20)
Card padding               : 24px (--spacing-6)
Input padding              : 12px 16px
Button padding (primary)   : 11px 22px
Button padding (sm)        : 8px 16px
Gap antar form field       : 16px (--spacing-4)
Gap antar card dalam grid  : 20px (--spacing-5)
Sidebar width              : 240px
Navbar/header height       : 56px
Table row height            : 56px
Table cell padding         : 0 16px
Min touch target (mobile)  : 44px × 44px
```

---

## 5. Border Radius Scale

| Token | Value | Penggunaan |
|---|---|---|
| `rounded-none` | 0px | Full-bleed section, tile |
| `rounded-xs` | 4px | Badge kecil, chip inline |
| `rounded-sm` | 8px | Button utility, input, dropdown |
| `rounded-md` | 12px | Card kecil, modal inner |
| `rounded-lg` | 16px | Card utama, modal |
| `rounded-xl` | 20px | Bottom sheet, panel besar |
| `rounded-pill` | 9999px | Button primary CTA, badge status |
| `rounded-full` | 50% | Avatar, icon circular button |

---

## 6. Components

### 6.1 Button

> Filosofi:
> Terracotta adalah warna utama sistem.
> Kournikova/emas hanya digunakan sebagai accent kecil,
> bukan sebagai primary CTA.

---

## Button Primary

```
Background    : #a7221b (--color-brand)
Text          : #ffffff (--color-ink-on-dark)
Font          : 15px / weight 500
Border radius : 9999px (pill)
Padding       : 11px 22px
Border        : none

Hover bg      : #bb221a (--color-brand-hover)
Active        : transform scale(0.97)

Focus:
  outline     : 2px solid rgba(167, 34, 27, 0.24)
  offset      : 2px

Disabled:
  opacity     : 0.4
  cursor      : not-allowed
```

### Penggunaan
- Daftar Sekarang
- Berikutnya
- Kirim Pendaftaran
- Login
- Cek Sekarang
- Approve utama

---

## Button Secondary (Outline)

```
Background    : transparent
Text          : #a7221b (--color-brand)
Font          : 15px / weight 500
Border radius : 9999px (pill)
Padding       : 11px 22px
Border        : 1.5px solid #a7221b

Hover bg      : #fef3f2
Active        : transform scale(0.97)

Focus:
  outline     : 2px solid rgba(167, 34, 27, 0.18)
  offset      : 2px
```

### Penggunaan
- Kembali
- Batal
- Tutup
- Utility action

---

## Button Danger (Reject)

```
Background    : transparent
Text          : #dc2626
Font          : 14px / weight 500
Border radius : 8px (rounded-sm)
Padding       : 8px 16px
Border        : 1.5px solid #dc2626

Hover bg      : #fee2e2
Active        : transform scale(0.97)
```

---

## Button Success

```
Background    : #16a34a
Text          : #ffffff
Font          : 14px / weight 500
Border radius : 8px (rounded-sm)
Padding       : 8px 16px
Border        : none

Hover bg      : #15803d
Active        : transform scale(0.97)
```

> Digunakan untuk action approval sekunder/admin.
> Jangan menggantikan seluruh primary CTA user-facing.

---

## Button Ghost (Utility)

```
Background    : #fafafc
Text          : #1d1d1f
Font          : 13px / weight 500
Border radius : 8px
Padding       : 8px 15px
Border        : 1px solid rgba(0,0,0,0.06)

Hover bg      : #f5f5f7
Active        : transform scale(0.98)
```

### Penggunaan
- Table action
- Filter
- Dropdown trigger
- Utility button
- Admin tools


> ⚠️ **Revisi v1.2.0 — CTA Color Hierarchy Update**
>
> Warna emas `#fbe579` (`--color-cta`) tidak lagi digunakan sebagai background untuk `Button Primary`.
>
> Mulai versi `v1.2.0`, seluruh primary action menggunakan warna brand utama:
>
> ```txt
> #a7221b (--color-brand)
> ```
>
> Warna emas (`--color-cta`, `--color-cta-hover`) tetap dipertahankan di design token dan hanya digunakan untuk:
>
> - accent kecil
> - decorative element
> - icon highlight
> - subtle visual emphasis
>
> Bukan sebagai warna utama tombol CTA.
>
> Token `--color-ink-on-cta` tetap didefinisikan untuk kebutuhan accent di atas surface emas.

---

### 6.2 Input Field

```
Background      : #ffffff
Border          : 1px solid #fee3e2 (--color-hairline)
Border radius   : 8px (rounded-sm)
Padding         : 12px 16px
Font            : 17px / weight 400 / color #1d1d1f
Placeholder     : color #86868b
Height          : 44px (single line)

Focus state:
  Border        : 1.5px solid #a7221b
  Box shadow    : 0 0 0 3px rgba(167, 34, 27, 0.12)

Error state:
  Border        : 1.5px solid #dc2626
  Box shadow    : 0 0 0 3px rgba(220, 38, 38, 0.10)

Error message:
  Font          : 12px / weight 400 / color #dc2626
  Margin top    : 4px
  (teks saja, tanpa icon)

Disabled state:
  Background    : #f5f5f7
  Border        : 1px solid #fee3e2
  Text          : #86868b
  Cursor        : not-allowed
```

---

### 6.3 Badge / Status Chip

```
Border radius : 9999px (pill)
Padding       : 3px 10px
Font          : 12px / weight 600

Menunggu:
  Background  : #fef9c3
  Text        : #854d0e

Diterima:
  Background  : #dcfce7
  Text        : #166534

Ditolak:
  Background  : #fee2e2
  Text        : #991b1b
```

---

### 6.4 Card

```
Background      : #ffffff
Border          : 1px solid #fee3e2
Border radius   : 16px (rounded-lg)
Padding         : 24px
Shadow          : none (gunakan border, bukan shadow)

Hover state (jika clickable):
  Background   : #fef3f2
  Transition   : background 150ms ease
```

---

### 6.5 Toast Pill

```
Background      : #1d1d1f (near-black)
Text            : #ffffff
Font            : 14px / weight 500
Border radius   : 9999px (pill)
Padding         : 10px 16px
Gap icon-teks   : 8px
Position        : top-center, fixed
Top offset      : 24px
Max width       : 360px
Shadow          : rgba(0,0,0,0.22) 3px 5px 30px 0

Animasi masuk   : translateY(-8px) → translateY(0) + fade in, 200ms ease-out
Animasi keluar  : translateY(0) → translateY(-8px) + fade out, 150ms ease-in
Auto dismiss    : 3000ms

Variant success : background #166534
Variant error   : background #991b1b
Variant warning : background #854d0e
```

---

### 6.6 Bottom Sheet

```
Background      : #ffffff
Border radius   : 20px 20px 0 0 (rounded-xl top only)
Height          : 85vh (fixed)
Padding         : 24px
Backdrop        : rgba(0, 0, 0, 0.40)

Drag handle:
  Width         : 36px
  Height        : 4px
  Background    : #e0e0e0
  Border radius : 9999px
  Margin        : 0 auto 20px auto

Animasi masuk   : translateY(100%) → translateY(0), 300ms cubic-bezier(0.32, 0.72, 0, 1)
Animasi keluar  : translateY(0) → translateY(100%), 250ms ease-in
```

---

### 6.7 Modal

```
Background      : #ffffff
Border radius   : 16px (rounded-lg)
Padding         : 0 (konten mengatur padding internal)
Max width       : 480px (modal kecil) / 80vw (modal detail admin)
Backdrop        : rgba(0, 0, 0, 0.40)
Shadow          : rgba(0,0,0,0.22) 3px 5px 30px 0

Animasi masuk   : scale(0.96) opacity(0) → scale(1) opacity(1), 200ms ease-out
Animasi keluar  : scale(1) opacity(1) → scale(0.96) opacity(0), 150ms ease-in

Header:
  Padding       : 20px 24px
  Border bottom : 1px solid #fee3e2
  Font title    : 17px / weight 600 / color #1d1d1f

Body:
  Padding       : 24px

Footer:
  Padding       : 16px 24px
  Border top    : 1px solid #fee3e2
  Display       : flex, justify-content space-between
```

---

### 6.8 Accordion

```
Border          : 1px solid #fee3e2
Border radius   : 12px (rounded-md)
Background      : #ffffff
Margin bottom   : 12px

Header:
  Padding       : 16px 20px
  Font          : 15px / weight 600 / color #1d1d1f
  Display       : flex, align-items center, justify-content space-between
  Cursor        : pointer (jika unlocked)

  State — Locked:
    Background  : #f5f5f7
    Text        : #86868b
    Cursor      : not-allowed
    Icon        : LockIcon (Lucide), color #86868b, size 16px

  State — Unlocked / Active:
    Background  : #ffffff
    Border      : 1.5px solid #a7221b
    Text        : #1d1d1f

  State — Done (✅):
    Icon        : CheckCircle (Lucide), color #16a34a, size 18px
    Text        : #1d1d1f

Body:
  Padding       : 0 20px 20px 20px
  Border top    : 1px solid #fee3e2

Animasi buka   : height 0 → auto, 250ms ease-out
Animasi tutup  : height auto → 0, 200ms ease-in
```

---

### 6.9 Sidebar Admin

```
Width           : 240px
Background      : #ffffff
Border right    : 1px solid #fee3e2
Height          : 100vh
Position        : fixed, left 0, top 0
Display         : flex, flex-direction column

Logo area:
  Height        : 64px
  Padding       : 0 20px
  Border bottom : 1px solid #fee3e2
  Display       : flex, align-items center, gap 10px
  Logo size     : 32px
  Text          : 15px / weight 600 / color #1d1d1f

Menu section:
  Padding       : 12px 12px
  Flex          : 1

Menu item:
  Height        : 40px
  Padding       : 0 12px
  Border radius : 8px
  Font          : 14px / weight 400 / color #6b7280
  Display       : flex, align-items center, gap 10px
  Icon size     : 16px
  Cursor        : pointer
  Transition    : background 150ms ease

  Hover state:
    Background  : #fef3f2
    Text        : #1d1d1f

  Active state:
    Background  : #fef3f2
    Text        : #a7221b
    Font weight : 600
    Border left : 3px solid #a7221b
    Icon color  : #a7221b

Logout area:
  Padding       : 12px
  Border top    : 1px solid #fee3e2
  Margin top    : auto

  Logout item:
    (sama dengan menu item)
    Text/icon color : #6b7280
    Hover text  : #dc2626
    Hover bg    : #fee2e2
```

---

### 6.10 Table (Admin)

```
Background      : #ffffff
Border          : 1px solid #fee3e2
Border radius   : 12px
Overflow        : hidden

Header row:
  Background    : #fef3f2
  Height        : 44px
  Font          : 12px / weight 600 / color #6b7280
  Letter spacing: 0.05em
  Text transform: uppercase
  Cell padding  : 0 16px
  Border bottom : 1px solid #fee3e2

Body row:
  Height        : 56px
  Cell padding  : 0 16px
  Font          : 14px / weight 400 / color #1d1d1f
  Border bottom : 1px solid #fef3f2 (sangat subtle)

  Hover state:
    Background  : #fef3f2
    Transition  : background 100ms ease

Sort indicator:
  Icon          : ChevronUp / ChevronDown (Lucide), size 14px, color #a7221b
  Default       : ChevronsUpDown (Lucide), size 14px, color #86868b
```

---

### 6.11 Empty State

```
Container       : flex, flex-direction column, align-items center
                  justify-content center, gap 12px, padding 48px 24px

Icon            : Lucide icon, size 48px, color #fda8a4 (Terracotta-300)
Title           : 17px / weight 600 / color #1d1d1f
Subtitle        : 14px / weight 400 / color #6b7280
                  max-width 280px, text-align center
```

---

### 6.12 Loading Dot Wave

```
Container       : display flex, gap 6px, align-items center

Dot:
  Size          : 8px × 8px
  Border radius : 50%
  Background    : #a7221b (--color-brand)

Animasi:
  Name          : wave
  Duration      : 1.2s ease-in-out infinite
  Dot 1 delay   : 0s
  Dot 2 delay   : 0.2s
  Dot 3 delay   : 0.4s
  Keyframes     : 0%/100% translateY(0), 50% translateY(-6px)
```

---

## 7. Do's & Don'ts

### ✅ DO
```
- Gunakan --color-canvas-warm (#fef3f2) sebagai background halaman, bukan pure white
- Gunakan border (--color-hairline) untuk card, bukan shadow
- Gunakan satu aksen warna brand (#a7221b) untuk active state, focus, accent
- Gunakan pill shape (border-radius 9999px) untuk CTA utama
- Beri whitespace yang cukup — section padding minimal 48px
- Gunakan letter-spacing negatif di font size ≥ 17px
- Sidebar selalu putih (#ffffff), bukan merah
- Merah (#a7221b) hanya untuk: active state, focus ring, accent — bukan background besar
- Emas (#fbe579) hanya untuk: tombol CTA utama
```

### ❌ DON'T
```
- Jangan pakai box-shadow pada card atau button (kecuali toast dan modal)
- Jangan pakai background merah (#a7221b) untuk area besar (sidebar, header, dll)
- Jangan pakai border-radius < 8px pada komponen interaktif
- Jangan pakai warna selain yang didefinisikan di color system
- Jangan pakai font-weight 700 — gunakan 600 untuk heading
- Jangan pakai gradient dekoratif
- Jangan pakai lebih dari 2 warna aksen dalam satu halaman
- Jangan pakai pure black (#000000) untuk teks — gunakan #1d1d1f
- Jangan pakai pure white (#ffffff) untuk background halaman — gunakan #fef3f2
- Jangan stack shadow di atas shadow
```

---

## 8. Animation & Transition

```
Micro interaction  : 150ms ease
Component enter    : 200ms ease-out
Component exit     : 150ms ease-in
Page transition    : 300ms cubic-bezier(0.32, 0.72, 0, 1)
Button active      : transform scale(0.97), 100ms ease

Gunakan:
  transition: background 150ms ease;        /* hover state */
  transition: border-color 150ms ease;      /* focus state */
  transition: opacity 200ms ease-out;       /* fade in */
  transform: scale(0.97);                   /* button press */
```

---

## 9. Responsive Breakpoints

```
Mobile first. Admin: desktop-only.

xs   : 0px      → default mobile
sm   : 640px    → mobile landscape
md   : 768px    → tablet
lg   : 1024px   → desktop (admin mulai dari sini)
xl   : 1280px   → desktop lebar
2xl  : 1536px   → wide screen

User pages (mobile-first):
  - Padding horizontal: 16px (mobile), auto center 50% (desktop ≥ lg)
  - Max content width: 480px (form), 640px (cek status desktop column)

Admin pages (desktop-only, ≥ lg):
  - Sidebar: 240px fixed
  - Main content: calc(100vw - 240px)
  - Content padding: 32px
```

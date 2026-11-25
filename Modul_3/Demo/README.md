# FlipPlay - Platform Hiburan Digital Generasi Baru (Landing Page)

Dokumentasi rancangan dan implementasi **Landing Page FlipPlay** untuk Praktikum Pemrograman Web. Landing page ini dibangun dengan standar **HTML5 Semantik murni**, **Tailwind CSS**, serta **JavaScript modern** untuk menghadirkan pengalaman visual yang interaktif, elegan, dan sepenuhnya responsif pada berbagai ukuran perangkat (*mobile*, *tablet*, dan *desktop*).

---

## 🚀 Sekilas Tentang FlipPlay

**FlipPlay** merupakan platform hiburan digital generasi baru yang mengintegrasikan layanan **streaming video** (*anime*, *drama*) dan **digital reading** (*manga*, *light novel*) ke dalam satu aplikasi web terpadu.

### Permasalahan yang Diselesaikan:
Sebelum adanya FlipPlay, penggemar *pop culture* harus membuka satu situs atau aplikasi terpisah untuk *streaming video* dan aplikasi lain untuk membaca *manga/novel*. Pengguna sering kesulitan mencari nomor *chapter manga* lanjutan setelah menyelesaikan episode terakhir serial anime kesayangannya.

### Solusi FlipPlay:
- **Dual-Experience Interface**: Menonton *video streaming* dan membaca buku digital dalam satu *platform* dengan satu akun.
- **Auto-Bridge Smart Sync™**: Sinkronisasi cerdas yang langsung memetakan akhir episode anime ke bab dan *chapter manga* padanannya secara akurat dan bebas *spoiler*.
- **Pustaka Terpadu**: 3.500+ episode anime & drama kualitas 4K HDR serta 18.000+ *chapter manga* dan *light novel* berlisensi resmi.

---

## 📋 Pemenuhan Ketentuan Pengerjaan Praktikum

| Ketentuan Praktikum | Implementasi pada FlipPlay |
| :--- | :--- |
| **Wajib menerapkan HTML Semantik** | Menggunakan elemen semantik lengkap: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<figure>`, `<figcaption>`, `<aside>`, `<form>`, `<fieldset>`, `<legend>`, `<label>`, `<address>`, `<footer>`, `<details>`, `<summary>`, `<time>`, `<mark>`. |
| **Styling wajib menggunakan Tailwind CSS** | Menggunakan Tailwind CSS CDN v3 dengan konfigurasi *custom palette* warna FlipPlay (Cyber Magenta `#e91e63`, Neon Purple `#8b5cf6`, Dark Canvas `#0b0b14`), tipografi Google Fonts (*Plus Jakarta Sans* & *Inter*), efek *glassmorphism*, dan *gradient borders*. |
| **Struktur halaman wajib memuat: Navbar, Hero, Content, Contact Form, dan Footer** | Memuat seluruh struktur wajib dengan penambahan sub-seksi konten yang kaya: **Navbar**, **Hero Section**, **Fitur Unggulan**, **The Vibe Grid Discovery Engine**, **Ekosistem Auto-Bridge**, **Paket Harga**, **Testimoni Komunitas**, **FAQ Accordion**, **Contact Form**, dan **Footer**. |
| **Tampilan Responsif (Desktop, Tablet, Mobile)** | Menggunakan *breakpoint* Tailwind (`sm:`, `md:`, `lg:`, `xl:`) pada seluruh komponen. Dilengkapi *hamburger mobile menu* interaktif, tata letak kartu yang adaptif (1 kolom di mobile, 2 kolom di tablet, 3-4 kolom di desktop). |
| **The Vibe Grid & Live Public API** | Pengambilan data langsung dari **Kitsu REST API** (`https://kitsu.io/api/edge/anime`) menggunakan **Fetch API** (`try/catch/async/await`). Respons Kitsu dipetakan ke format kartu grid. Jika permintaan API gagal, grid menampilkan pesan error dan tombol untuk mencoba kembali. |
| **Unified Search** | Input pencarian real-time (`input` event) yang langsung menyaring kartu media berdasarkan judul saat pengguna mengetik, dengan tombol bersihkan (*clear button*) dan pintasan keyboard `Ctrl + K`. |
| **Aura-Based Discovery** | Tombol filter berbasis getaran suasana hati (*Aura*): *"Semua Vibes"*, *"High Energy"*, *"Melancholy"*, *"Binge Mode"*, *"Cozy Chill"*, dan *"Mind-Bender"*, yang menyaring subset data saat diklik (`click` event). |
| **Loading State & Error Message State** | - *Loading State*: Kartu skeleton shimmer animasi yang tampil saat data sedang diambil.<br>- *Error State*: Tampilan pesan gagal jika jaringan terputus atau *rate-limit*, dengan tombol *"Coba Lagi"* dan tombol *"Simulasi Error"* untuk mempermudah evaluasi. |
| **Penggunaan Template Literal** | Seluruh kartu media, modal detail, skeleton loading, dan pesan error dirender ke DOM menggunakan *string template literal* (`` `${...}` ``). |
| **Penerapan Array Methods (Minimal 1)** | Menerapkan 5 metode array sekaligus: **`filter()`** (filter judul & aura), **`map()`** (transformasi data ke HTML), **`forEach()`** (pemasangan event listener), **`reduce()`** (perhitungan skor rata-rata pada stats bar), dan **`find()`** (pencarian ID anime untuk modal detail). |
| **Minimal Dua Event Handling** | 1. `input` event (Unified search real-time)<br>2. `click` event (Aura filter, detail modal, retry, refresh, simulasi error, watchlist)<br>3. `change` event (Format & sort filter)<br>4. `keydown` event (`Ctrl+K` dan `Escape`). |

---

## 🏛️ Struktur Semantik HTML5

Landing page ini dirancang dengan struktur pohon semantik yang rapi untuk aksesibilitas (a11y) dan SEO:

1. **`<header>` & `<nav id="main-nav">`**:
   - Memuat logo branding `FlipPlay`, link menu navigasi terstruktur, tombol CTA *"Coba Gratis 14 Hari"*, serta tombol *hamburger* responsif untuk perangkat mobile (`aria-expanded`, `aria-label`).
2. **`<main>`**:
   - Sebagai kontainer utama seluruh konten halaman.
3. **`<section id="home">` (Hero Section)**:
   - Berisi `<aside>` badge generasi baru, `<h1>` utama dengan teknik *text-gradient*, paragraf deskriptif dengan `<mark>`, dual CTA (*Call To Action*), statistik kepercayaan komunitas, serta `<figure>` pratinjau interaktif pemutar video (*Anime Player*) dan pembaca manga (*Digital Manga Reader*).
4. **`<section id="ekosistem-stats">` (Ecosystem Banner)**:
   - Statistik platform: 3.500+ Episode, 18.000+ Chapter, 1 Akun Terpadu, 99.9% Uptime.
5. **`<section id="fitur">` (Fitur Unggulan)**:
   - 6 buah `<article>` fitur: *Streaming Video 4K HDR*, *Digital Reader Cerdas*, *Bookmark Lintas Format*, *Mode Offline*, *Multi-Profil*, dan *Watch Party*.
6. **`<section id="vibe-grid">` (The Vibe Grid Discovery Engine)**:
   - Live Kitsu REST API integration dengan stats bar dinamis (Total Media, Rata-rata Skor via `reduce()`, Watchlist); error API ditampilkan dengan opsi coba lagi tanpa data cadangan lokal.
   - Unified Search real-time input.
   - Aura-Based Discovery buttons (*Semua Vibes*, *High Energy*, *Melancholy*, *Binge Mode*, *Cozy Chill*, *Mind-Bender*).
   - Grid kontainer dinamis dengan kartu media `<article>` dari API.
   - Quick-view detail modal untuk rincian sinopsis dan link ke Kitsu (atau MyAnimeList untuk data cadangan).
7. **`<section id="keunggulan">` (Arsitektur Ekosistem)**:
   - Menjelaskan alur 3 langkah fitur *Auto-Bridge Smart Sync™* yang menghubungkan tontonan anime ke pembacaan manga.
8. **`<section id="harga">` (Paket Langganan)**:
   - Switcher periode tagihan (Bulanan vs Tahunan hemat 20%) dan 3 tier kartu paket: *Free Explorer*, *Pro Streamer & Reader* (terpopuler), dan *Ultimate Family*.
9. **`<section id="testimoni">` (Ulasan Komunitas)**:
   - 3 kartu ulasan `<article>` dengan `<blockquote>`, rating bintang, dan profil pengguna.
10. **`<section id="faq">` (Pertanyaan Umum)**:
    - Akordion interaktif semantik menggunakan `<details>` dan `<summary>`.
11. **`<section id="kontak">` (Formulir Kontak & Info Alamat)**:
    - Informasi kantor dan narahubung menggunakan tag `<address>`.
    - Formulir semantik `<form id="contact-form">` dengan `<fieldset>`, `<legend>`, `<label>`, `<input>`, `<select>`, `<textarea>`, `<button>`, serta notifikasi umpan balik (*toast notification*).
12. **`<footer role="contentinfo">`**:
    - Deskripsi legalitas, waktu terbit menggunakan `<time>`, link navigasi internal, form berlangganan buletin (*newsletter*), dan hak cipta.

---

## 🎨 Palet Desain & Tema (Tailwind CSS)

| Token Warna | Nilai Heksadesimal | Peran & Penggunaan |
| :--- | :--- | :--- |
| `brand-pink` | `#e91e63` | Warna aksen primer, tombol utama, highlight teks, hover border |
| `brand-pink-dark` | `#d81b60` | Gradien tombol dan status aktif |
| `brand-purple` | `#8b5cf6` | Warna aksen sekunder, identitas mode Manga & Digital Reading |
| `brand-dark` | `#0b0b14` | Latar belakang dasar (*deep entertainment dark canvas*) |
| `brand-dark-card` | `#131226` | Latar kartu (*glassmorphic card background*) |

---

## 📁 Struktur Direktori

```text
Demo/
├── index.html                  # Halaman utama landing page FlipPlay (HTML Semantik + Tailwind)
├── index.php                   # Entry point simulasi CLI Engine FlipPlay (PHP OOP)
├── README.md                   # Dokumentasi proyek praktikum
└── src/
    ├── css/
    │   └── style.css           # Utilitas kustom, efek glassmorphism, animasi glow & scrollbar
    ├── js/
    │   ├── main.js             # Logika interaktif: mobile menu, hero tab, catalog filter, pricing switch
    │   └── vibe-grid.js        # The Vibe Grid Discovery Engine & Kitsu API integration
    └── FlipPlay/               # Arsitektur Backend OOP PHP
        ├── Core/
        │   └── Media.php       # Abstract Base Class Media (Blueprint & Encapsulation)
        ├── Models/
        │   ├── Anime.php       # Child Class Video Streaming (Inherits Media)
        │   ├── Manga.php       # Child Class Digital Reading (Inherits Media)
        │   └── User.php        # Class Entitas Pengguna & Koleksi Pribadi
        ├── Services/
        │   └── FlipPlayEngine.php # Service Katalog, Pencarian & Auto-Bridge
        └── Utils/
            └── CliHelper.php   # Formatting CLI Terminal, ANSI Color & Text Helpers
```

---

## 🐘 Backend Engine Prototype (PHP OOP - Simulasi CLI)

Pada tahap demo backend praktikum, engine FlipPlay disimulasikan melalui terminal/command line menggunakan bahasa **PHP** dengan paradigma **Object-Oriented Programming (OOP)**.

### 📋 Pemenuhan Ketentuan Modul Backend OOP

| Ketentuan Modul | Status | Implementasi pada FlipPlay |
| :--- | :---: | :--- |
| **1. Minimal Tiga Class** | ✅ Terpenuhi | Mengimplementasikan **6 class** terstruktur: `Media` (Abstract), `Anime`, `Manga`, `User`, `FlipPlayEngine`, dan `CliHelper`. |
| **2. Menerapkan Constructor (`__construct`)** | ✅ Terpenuhi | Seluruh class memiliki constructor terstruktur. Child class (`Anime` dan `Manga`) menerapkan *constructor inheritance* melalui `parent::__construct()`. |
| **3. Memiliki Property dan Method** | ✅ Terpenuhi | Setiap class memiliki data field khusus (misal: `$totalEpisodes`, `$resolution`, `$totalChapters`, `$collection`) serta method fungsional (`consume()`, `searchByTitle()`, `addToCollection()`). |
| **4. Access Modifier Secara Tepat** | ✅ Terpenuhi | Menggunakan kombinasi `private` (enkapsulasi penuh state internal), `protected` (atribut dasar pada parent class yang diwariskan ke child), dan `public` (antarmuka method publik). |
| **5. Inheritance Sederhana** | ✅ Terpenuhi | Base class `Media` diwariskan oleh dua turunan: `Anime extends Media` (Streaming) dan `Manga extends Media` (Reading), dengan polymorphic method `getDetails()` dan `consume()`. |
| **6. Type Hinting & Return Type** | ✅ Terpenuhi | Menerapkan `declare(strict_types=1);` di setiap file. Seluruh parameter memiliki type hint (`string`, `int`, `float`, `array`, `Media`, dsb) dan seluruh method memiliki return type eksplisit. |
| **7. Namespace Organisasi Class** | ✅ Terpenuhi | Struktur class diorganisasikan ke dalam sub-namespace PSR-4: `FlipPlay\Core`, `FlipPlay\Models`, `FlipPlay\Services`, dan `FlipPlay\Utils`. |
| **8. Satu File Utama (`index.php`)** | ✅ Terpenuhi | Berkas `index.php` bertindak sebagai entry point tunggal yang memuat SPL autoloader dan menjalankan seluruh simulasi terminal secara sekuensial dan interaktif. |

### 🎬 Alur Simulasi CLI yang Dijalankan

1. **Inisialisasi Engine & Banner**: Menampilkan identitas visual FlipPlay CLI dan engine metadata.
2. **Registrasi Media ke Library**: Instansiasi objek `Anime` (*Sousou no Frieren*, *Chainsaw Man*, *Cyberpunk: Edgerunners*) dan `Manga` (*Frieren Manga*, *Chainsaw Man Manga*, *Solo Leveling*) lalu didaftarkan ke `FlipPlayEngine`.
3. **Menampilkan Katalog Media**: Format tabel terminal yang menampilkan ID, Judul, Format, Rating Bintang, dan Tahun Rilis.
4. **Unified Search**: Simulasi pencarian real-time kata kunci (misal: *"Chainsaw"*, *"Frieren"*, *"Cyber"*).
5. **Detail Informasi Media & Simulasi Konsumsi**: Menampilkan sinopsis lengkap, resolusi video, penerbit manga, serta simulasi pemutaran episode (`playEpisode()`) dan pembacaan bab (`readChapter()`).
6. **Koleksi Pengguna (Watchlist & Reading List)**: Registrasi akun user, menambahkan media ke koleksi pribadi, dan melacak riwayat progres tontonan/bacaan.
7. **Fitur Khusus: Auto-Bridge Smart Sync™**: Menghubungkan akhir episode anime ke bab pembacaan manga lanjutannya secara otomatis.

### 💻 Cara Menjalankan Simulasi Backend (CLI)

Jalankan perintah berikut melalui terminal (Command Prompt, PowerShell, Bash, atau Terminal VS Code) di dalam folder proyek:

```bash
php index.php
```

---

---

## 💻 Panduan Menjalankan

Landing page ini **tidak memerlukan proses instalasi atau kompilasi server tambahan**. Cukup ikuti langkah berikut:

1. Buka berkas `index.html` langsung di peramban web modern favorit Anda (*Google Chrome*, *Mozilla Firefox*, *Microsoft Edge*, atau *Safari*):
   - Klik ganda berkas `index.html`, atau
   - Buka melalui URL lokal peramban: `file:///c:/kumpulansmt5/Pratikum/Prak_web/Demo/index.html`
2. Pastikan perangkat terhubung ke internet saat membuka halaman untuk pertama kali agar aset Tailwind CSS CDN dan font Google Fonts (*Plus Jakarta Sans* & *Inter*) dapat dimuat dengan sempurna.

---

## 📱 Fitur Interaktivitas

- **Mobile Hamburger Navigation**: Buka/tutup menu navigasi pada layar *smartphone* dengan animasi transisi yang mulus.
- **Hero Mode Switcher**: Klik tombol *"Mode Streaming Anime"* atau *"Mode Manga Reader"* di pratinjau hero untuk melihat simulasi antarmuka pemutar video atau pembaca manga.
- **Interactive Play/Pause**: Klik tombol putar pada video player hero untuk melihat simulasi pemutaran episode dan pergerakan *progress bar*.
- **Live Catalog Filtering**: Klik tab *Anime*, *Drama*, *Manga*, atau *Light Novel* untuk memfilter kartu konten secara instan dengan efek transisi.
- **Pricing Switcher**: Aktifkan *toggle* "Bulanan / Tahunan" pada tabel harga untuk melihat potongan diskon 20% secara dinamis.
- **FAQ Accordion**: Klik pertanyaan untuk membaca jawaban dengan rotasi ikon panah yang halus.
- **Validasi Form Kontak & Toast**: Mengisi formulir kontak dan menekan *"Kirim Pesan Sekarang"* akan menampilkan *spinner loading* dan memunculkan *feedback toast alert* konfirmasi penerimaan pesan.
- **Scroll-to-Top**: Tombol melayang di pojok kanan bawah otomatis muncul saat menggulir ke bawah dan memudahkan pengguna kembali ke puncak halaman.

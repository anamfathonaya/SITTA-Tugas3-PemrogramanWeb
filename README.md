# 📚 SITTA-UT: Sistem Informasi Tiras & Transaksi Bahan Ajar (Universitas Terbuka)
> **Tugas Praktik 3 - STSI4209 Pemrograman Berorientasi Objek / Framework JavaScript**  
> Anam Fathonaya | 050109245 | Sistem Informasi 2023

Aplikasi ini merupakan hasil refaktorisasi sistem informasi pengiriman dan tiras bahan ajar **SITTA UT** ke dalam arsitektur berbasis komponen **Vue.js (Vue 2.x)** yang dinamis, interaktif, dan modular. Seluruh data dikelola secara lokal pada browser melalui sinkronisasi *reaktif state* dengan dukungan data statis awal dari berkas JSON dan penyimpanan persisten `localStorage`.

---

## 📂 Struktur Pohon Direktori Proyek

Berikut adalah struktur pengorganisasian kode sumber aplikasi yang dirancang secara modular dan mengikuti praktik terbaik (*best practices*) pemisahan kepentingan (*Separation of Concerns*):

```text
tugas3-vue-ut/
├── index.html                  # Berkas Utama (Mount #app, kontainer tab navigation, & Vue Templates)
├── metadata.json               # Konfigurasi platform aplikasi AI Studio
├── package.json                # Pengaturan dependensi pengembangan (Vite, Tailwind, dsba)
├── tsconfig.json               # Konfigurasi TypeScript pendukung
├── vite.config.ts              # Konfigurasi bundling aset & proxy server Vite
├── .env.example                # Templat konfigurasi environment variables
├── .gitignore                  # Pengaturan folder/berkas yang diabaikan dalam Git
│
├── assets/
│   └── css/
│       └── style.css           # Gaya CSS global khusus (Tipografi, Tema UT Blue & Gold, Animasi Modal)
│
├── data/
│   └── dataBahanAjar.json      # Sumber data simulasi awal (Database JSON lokal)
│
└── js/
    ├── app.js                  # Vue Root Instance: Konfigurasi state global, filter Rupiah & Buah, dan localStorage
    │
    ├── services/
    │   └── api.js              # Data Service Layer: Fungsi asinkronus fetch data menggunakan Fetch API
    │
    └── components/             # Reusable & Modular Custom Vue Components
        ├── app-modal.js        # Komponen Pop-up Konfirmasi Penghapusan (<app-modal>)
        ├── do-tracking.js      # Komponen Pelacak Lokasi & Update Status Delivery Order (<do-tracking>)
        ├── order-form.js       # Komponen Pembuatan Delivery Order Baru (<order-form>)
        ├── status-badge.js     # Komponen Visual Lencana Status Stok Aman/Kritis (<status-badge>)
        └── stock-table.js      # Komponen Manajemen & CRUD Stok Bahan Ajar (<ba-stock-table>)
```

---

## 🎯 Pemenuhan 8 Indikator Capaian Penilaian

Sistem ini dirancang khusus untuk memenuhi seluruh indikator capaian pada Tugas Praktik 3 secara maksimal:

1. **Konsep Vue Component & Template (Skor Tinggi):** Seluruh visualisasi antarmuka dikemas dalam komponen berkas terpisah di dalam `/js/components/` dan diregistrasikan secara resmi dengan pola penamaan kebab-case (seperti `<ba-stock-table>`, `<do-tracking>`, `<order-form>`, `<status-badge>`, dan `<app-modal>`).
2. **Data Binding & Directives:** Memanfaatkan kombinasi *Mustache* `{{ }}`, `v-text` demi render teks aman, `v-html` untuk render catatan dokumen lapangan bercetak tebal/miring, `v-bind` (`:`) untuk pass properti dinamis, serta `v-model` untuk binding input formulir dua arah (*two-way data binding*).
3. **Conditionals rendering:** Menggunakan `v-if`, `v-else-if`, `v-else`, dan `v-show` secara efisien dalam menampilkan/menyembunyikan formulir input, modal konfirmasi, penanda daerah terpilih, hasil pencarian kosong, dan tooltip.
4. **Data Binding & Property (Computed vs Methods):** 
   - **Computed Properties:** Dioptimalkan untuk operasi berat seperti penggabungan penyaringan pencarian, filter wilayah regional, kondisi kritis, dan pengurutan data (`filteredAndSortedStocks`). Komponen tidak perlu menghitung ulang (*recomputation*) array jika state pemicunya tidak berubah.
   - **Methods Property:** Digunakan untuk eksekusi aksi interaktif seperti penyimpanan data (`saveStock()`), trigger modal (`triggerDelete()`), cetak waktu (`formatIndonesianDate()`), dan pengiriman sinyal trigger event (`$emit`).
5. **Watchers (Minimal 2 Watcher Aktif):** 
   - **Watcher 1 (`selectedUpbjj` di `stock-table.js`):** Memantau pemilihan wilayah regional UT Daerah. Apabila wilayah di-reset atau diubah, watcher otomatis mereset pilihan Kategori Mata Kuliah (mendukung *Dependent Filter* kaskade).
   - **Watcher 2 (`searchQuery` di `do-tracking.js`):** Memantau kata kunci pencarian No. DO/NIM. Apabila input dihapus bersih (`""`) oleh user, watcher mendeteksi dan mengembalikan serta membersihkan tabel detail otomatis.
6. **List Rendering (`v-for`):** Menggunakan iterasi `v-for` untuk menampilkan daftar *UPBJJ*, list *Kategori*, daftar *Paket*, riwayat *Stok Bahan Ajar* (berbasis index numerik), dan riwayat logistik perjalanan (berbasis *key-value associative*).
7. **Concept Filter (Mata Uang & Unit):** 
   - **Filter `rupiah`:** Memformat angka integer murni menjadi nilai moneter Rupiah (contoh: `65000` $\rightarrow$ `Rp 65.000`).
   - **Filter `buah`:** Menambahkan satuan kuantitas resmi logistik (contoh: `28` $\rightarrow$ `28 buah`).
8. **Custom Element, Vue Component & Property Template:** Memisahkan struktur layout di dalam `<template>` HTML di eksternal DOM `index.html` dengan pemetaan ID yang konsisten (`tpl-stock`, `tpl-tracking`, `tpl-order`, `tpl-badge`, `tpl-modal`) untuk kerapian kode.

---

## 💻 Panduan Instalasi & Menjalankan Aplikasi di Lokal

Untuk memasang dan menjalankan aplikasi **SITTA-UT** ini di komputer lokal Anda, silakan ikuti langkah-langkah praktis menggunakan **Node.js Package Manager (npm)** dan bundling engine **Vite** berikut:

### 1. Prasyarat Sistem
Pastikan perangkat Anda sudah terinstal pustaka run-time berikut:
* **Node.js** (Rekomendasi versi LTS terbaru, minimal v18+)
* **NPM** (Bawaan saat menginstal Node.js)

### 2. Langkah Penginstalan

1. **Unduh & Ekstrak Berkas:**  
   Ekstrak berkas ZIP proyek (`tugas3-vue-ut`) ke dalam folder komputer Anda.

2. **Buka Terminal / Command Prompt (CMD):**  
   Arahkan direktori terminal ke folder proyek utama yang berisi file `package.json`:
   ```bash
   cd path/ke/folder/tugas3-vue-ut
   ```

3. **Instal Dependensi (Node Modules):**  
   Jalankan perintah berikut untuk mengunduh seluruh pustaka yang diperlukan (Vite, Tailwind, dsba) secara otomatis:
   ```bash
   npm install
   ```

### 3. Menjalankan Server Pengembangan (Local Dev Server)

Guna menguji dan melihat aplikasi secara langsung dengan fitur pembaruan instan (*re-render* cepat oleh Vite), jalankan perintah:
```bash
npm run dev
```
* **Hasil:** Vite akan meluncurkan server lokal (secara standar berjalan pada alamat http://localhost:3000).
* **Akses Browser:** Buka browser favorit Anda lalu akses alamat `http://localhost:3000` untuk berinteraksi dengan aplikasi.

### 4. Membuat Bundle Produksi (Build & Deploy)

Apabila Anda siap untuk mengumpulkan hasil pekerjaan atau merilis aplikasi ini ke peladen (*hosting static* seperti GitHub Pages, Netlify, atau Vercel):

1. **Kompilasi Berkas:**  
   Jalankan perintah ini untuk menciptakan berkas distribusi siap pakai yang sangat optimal dan terkompresi:
   ```bash
   npm run build
   ```
2. **Hasil Kompilasi:**  
   Vite akan menghasilkan folder baru bernama `dist/` di root direktori Anda yang menampung file HTML, CSS, dan JS yang sudah diminifikasi secara efisien.
3. **Uji Hasil Build Secara Lokal (Preview):**  
   Anda dapat mensimulasikan rilis produksi di komputer Anda dengan perintah:
   ```bash
   npm run preview
   ```

---

## 🛠️ Panduan Pengoperasian Aplikasi

Aplikasi memiliki **tiga tab utama** yang mewakili siklus transaksi logistik SITTA UT:

### 1. Tab "Stok Bahan Ajar" (Katalog & CRUD Inventori)
* **Pencarian & Dependent Saringan:**
  1. Ketikkan kata kunci berupa kode atau judul pada kolom pencarian.
  2. Pilih menu dropdown **Pilih UT-Daerah** (misal: "Jakarta"). Setelah terpilih, barulah dropdown **Kategori Mata Kuliah** akan aktif dan menampilkan kategori yang relevan di daerah bersangkutan.
  3. Klik kotak centang **Tampilkan Hanya Stok Kritis** jika Anda hanya ingin menganalisis buku dengan kondisi stok yang berada di bawah ambang batas aman (*Safety Stock*) atau bernilai `0` (Kosong).
  4. Atur pengurutan berdasarkan Judul, Kuantitas, atau Harga menggunakan tombol arah panah menaik/menurun.
* **Hover Tooltip Catatan Lapangan:**
  * Dekatkan kursor mouse (*hover*) ke lencana status ("Aman", "Menipis", "Kosong") pada kolom paling belakang. Tooltip interaktif instan akan muncul menampilkan catatan khusus logistik yang di-render dalam format HTML tebal/miring.
* **CRUD Sederhana (Tambah/Edit/Hapus):**
  * **Tambah Data (Create):** Klik tombol **Tambah Stok Bahan Ajar**, isi data formulir secara lengkap, lalu klik simpan (atau cukup tekan tombol keyboard **'Enter'** sebagai jalan pintas).
  * **Ubah Data (Update):** Klik tombol **Edit** pada salah satu baris, ubah isi kuantitas atau harga, lalu simpan dengan tombol simpan atau tombol akselerasi **'Enter'**.
  * **Hapus Data (Delete):** Klik tombol **Hapus** pada salah satu baris. Komponen modal konfirmasi kustom `<app-modal>` akan muncul. Tekan tombol **Escape ('Esc')** pada keyboard untuk membatalkannya, atau klik **Ya, Hapus** untuk menghapus.

### 2. Tab "Buat Pesanan DO Baru" (Pengadaan & Distribusi)
* **Penerbitan Surat Pengiriman:**
  1. Masukkan data identitas mahasiswa (NIM Universitas Terbuka 9 angka murninya dan Nama Penerima).
  2. Pilih jenis layanan kurir pada dropdown **Ekspedisi** (JNE Regular / JNE Express).
  3. Pilih jenis **Paket Bahan Ajar** yang dipesan. Detail materi pokok dari isi paket akan dimunculkan di bawah form dropdown beserta kalkulasi total biaya instan berformat Rupiah.
  4. Tanggal Kirim dan **Nomor DO akan digenerate otomatis** menggunakan kode runut dinamis (Contoh: `DO2026-003`).
  5. Klik **Terbitkan Delivery Order (DO)**. Setelah diterbitkan, sistem menyisipkan log perjalanan perdana ke dalam timeline dan otomatis mengalihkan pandangan tab ke halaman tracking dalam 1,5 detik.

### 3. Tab "Tracking Pengiriman DO" (Pelacakan Logistik Real-Time)
* **Pelacakan Log:**
  1. Terdapat integrasi pencari interaktif. Masukkan Nomor DO atau NIM Mahasiswa pada kotak pelacakan di panel kiri.
  2. Tekan tombol keyboard **'Enter'** untuk memicu pencarian dan tekan **'Esc'** untuk mengosongkannya.
  3. Klik salah satu kartu DO hasil pencari untuk memaparkan **Timeline Vertikal Perjalanan Logistik** di sebelah kanan.
* **Aktivitas Update Lapangan oleh Admin:**
  * Tulis rincian lokasi atau peristiwa logistik baru di formulir bawah timeline (misalnya: *"Paket tiba di UPBJJ Surabaya"*).
  * Ubah opsi drop status (apakah masih *"Dalam Perjalanan"* atau sudah *"Diterima"* oleh mahasiswa).
  * Klik **Perbarui Progress Pengiriman** untuk menyisipkan log timestamp presisi lokal secara instan.

---
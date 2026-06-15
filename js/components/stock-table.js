/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * js/components/stock-table.js
 * 
 * Komponen utama Tabel Stok Bahan Ajar (<ba-stock-table>).
 * Mengimplementasikan visualisasi data inventori UT daerah secara masif, pencarian filter dependen,
 * fungsionalitas sort, rendering status rincian (aman/menipis/kosong), mouse hover tooltip catatan, 
 * dan CRUD terintegrasi dengan validasi input.
 * 
 * Kriteria Terpenuhi di File Ini:
 * 1. Component kebab-case: diregistrasikan sebagai 'ba-stock-table'.
 * 2. Data Binding: {{ }}, v-text, v-html, v-bind, v-model.
 * 3. List Rendering: v-for pada stok bahan ajar yang terfilter.
 * 4. Conditionals: v-if, v-else, v-else-if, v-show (misalnya form edit, dependent filter, tooltip).
 * 5. Computed & Methods: Dioptimalkan untuk proses filter dan sort agar efisien (tidak melakukan recompute tak perlu).
 * 6. Watchers: Mengamati perubahan dropdown 'selectedUpbjj' untuk mereset kategori secara otomatis (dependent logic).
 * 7. Event Handling: Mouse hover (mouseenter/mouseleave untuk tooltip) dan Keyboard handling (Enter untuk simpan, Esc untuk modal).
 */

Vue.component('ba-stock-table', {
  template: '#tpl-stock',
  
  // Menerima data statis awal dari root state sebagai props
  props: {
    items: {
      type: Array,
      required: true
    },
    upbjjList: {
      type: Array,
      required: true
    },
    kategoriList: {
      type: Array,
      required: true
    }
  },

  // State lokal eksklusif komponen tabel stok
  data() {
    return {
      // Pencarian kata kunci judul atau kode
      searchQuery: '',
      
      // Filter wilayah UT-Daerah (UPBJJ)
      selectedUpbjj: '',
      
      // Filter kategori mata kuliah (dependent terhadap terpilihnya selectedUpbjj)
      selectedKategori: '',
      
      // Filter khusus kondisi kritis (stok < safety atau stok = 0)
      filterCriticalOnly: false,
      
      // Pengurutan data (default: judul)
      sortBy: 'judul',
      sortOrder: 'asc',
      
      // Kode materi yang sedang di-hover untuk memicu tampilan tooltip catatan
      hoveredItem: null,

      // State form editing/creation
      showForm: false,
      isEditMode: false,
      formError: '',
      
      // Model form dinamis satu arah/dua arah
      form: {
        kode: '',
        judul: '',
        kategori: '',
        upbjj: '',
        lokasiRak: '',
        harga: 0,
        qty: 0,
        safety: 0,
        catatanHTML: ''
      },

      // State konfirmasi hapus data
      showDeleteModal: false,
      codeToDelete: null,
      titleToDelete: ''
    };
  },

  // Watchers: Menjawab kriteria minimal 2 watcher pada aplikasi
  watch: {
    /**
     * Memantau perubahan dropdown filter region (UT-Daerah / Upbjj).
     * Jika wilayah di-reset atau diganti, kita wajib mereset kategori agar sinkron
     * dengan prinsip kaskade dependent option.
     */
    selectedUpbjj(newVal, oldVal) {
      console.log(`Watcher [selectedUpbjj]: Berubah dari "${oldVal}" menjadi "${newVal}". Resetting selectedKategori.`);
      this.selectedKategori = ''; // Mereset kategori menjadi kosong
    }
  },

  // Computed Properties: Menyusun logika pengolahan data murni yang efisien secara reaktif
  computed: {
    /**
     * Dependent Options: Menyaring daftar kategori yang tersedia hanya berdasarkan bahan ajar
     * yang benar-benar ada di daerah (UPBJJ) terpilih.
     * Ini membuat form filter kategori relevan secara lokal.
     */
    availableCategoriesForSelectedUpbjj() {
      if (!this.selectedUpbjj) return [];
      
      // Mengambil daftar unik kategori dari materi yang ada di UPBJJ tersebut
      const categories = this.items
        .filter(item => item.upbjj === this.selectedUpbjj)
        .map(item => item.kategori);
        
      return [...new Set(categories)]; // Guna Set untuk menghilangkan duplikasi
    },

    /**
     * Fitur Filter & Sort Terintegrasi (Tanpa Recompute tak perlu).
     * Seluruh filter dievaluasi berurutan, lalu diurutkan. 
     * Vue akan meng-cache computed ini dan hanya mengalkulasi ulang jika array 'items' atau 
     * parameter filter lokal (searchQuery, selectedUpbjj, dll) mengalami modifikasi aktual.
     */
    filteredAndSortedStocks() {
      console.log('Computed [filteredAndSortedStocks]: Sedang menghitung ulang daftar stok.');
      
      // Salin data mentah
      let results = [...this.items];

      // 1. Filter Pencarian Teks (Kode atau Judul)
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase().trim();
        results = results.filter(item => 
          item.kode.toLowerCase().includes(query) || 
          item.judul.toLowerCase().includes(query)
        );
      }

      // 2. Filter UT-Daerah (selectedUpbjj)
      if (this.selectedUpbjj) {
        results = results.filter(item => item.upbjj === this.selectedUpbjj);
      }

      // 3. Filter Kategori Dependent (hanya jika regional terpilih dan kategori disaring)
      if (this.selectedUpbjj && this.selectedKategori) {
        results = results.filter(item => item.kategori === this.selectedKategori);
      }

      // 4. Filter Stok Kritis Khusus (Stok < Safety ATAU Stok = 0)
      if (this.filterCriticalOnly) {
        results = results.filter(item => item.qty < item.safety || item.qty === 0);
      }

      // 5. Menyortir Hasil Terakhir (Sort By: Judul, Qty/Stok, Harga)
      results.sort((a, b) => {
        let modifier = this.sortOrder === 'desc' ? -1 : 1;
        
        if (this.sortBy === 'judul') {
          return a.judul.localeCompare(b.judul) * modifier;
        } else if (this.sortBy === 'stok') {
          return (a.qty - b.qty) * modifier;
        } else if (this.sortBy === 'harga') {
          return (a.harga - b.harga) * modifier;
        }
        return 0;
      });

      return results;
    },

    /**
     * Menghitung rangkuman statistik untuk dashboard mini stok
     */
    stats() {
      const totalBuku = this.items.length;
      const kritis = this.items.filter(i => i.qty < i.safety && i.qty > 0).length;
      const kosong = this.items.filter(i => i.qty === 0).length;
      return { totalBuku, kritis, kosong };
    }
  },

  methods: {
    /**
     * Memfungsikan tombol reset filter
     */
    resetFilters() {
      this.searchQuery = '';
      this.selectedUpbjj = '';
      this.selectedKategori = '';
      this.filterCriticalOnly = false;
      this.sortBy = 'judul';
      this.sortOrder = 'asc';
    },

    /**
     * Memaparkan form pembuatan data baru (Create)
     */
    openAddForm() {
      this.isEditMode = false;
      this.formError = '';
      this.form = {
        kode: '',
        judul: '',
        kategori: this.kategoriList[0] || '',
        upbjj: this.upbjjList[0] || '',
        lokasiRak: '',
        harga: 50000,
        qty: 10,
        safety: 5,
        catatanHTML: ''
      };
      this.showForm = true;
    },

    /**
     * Memaparkan form edit isi materi (Update)
     * @param {Object} item Data referensi bahan ajar yang hendak diedit
     */
    openEditForm(item) {
      this.isEditMode = true;
      this.formError = '';
      // Deep copy sederhana agar editing form tidak langsung mengubah baris tabel sebelum di-save
      this.form = JSON.parse(JSON.stringify(item));
      this.showForm = true;
    },

    /**
     * Menyimpan data baru atau perubahan data ter-edit.
     * Menerapkan validasi input sederhana dan trigger otomatis via tombol 'Enter'.
     */
    saveStock() {
      // Validasi sederhana
      if (!this.form.kode || !this.form.kode.trim()) {
        this.formError = 'Kode Mata Kuliah wajib diaktifkan/diisi!';
        return;
      }
      if (!this.form.judul || !this.form.judul.trim()) {
        this.formError = 'Judul Mata Kuliah tidak boleh kosong!';
        return;
      }
      if (!this.form.lokasiRak || !this.form.lokasiRak.trim()) {
        this.formError = 'Lokasi rak penempatan wajib diisi!';
        return;
      }
      if (this.form.harga < 0 || this.form.qty < 0 || this.form.safety < 0) {
        this.formError = 'Harga, Jumlah Stok & Safety Stock tidak boleh bernilai negatif!';
        return;
      }

      // Pastikan format tipe data numerik
      this.form.harga = Number(this.form.harga);
      this.form.qty = Number(this.form.qty);
      this.form.safety = Number(this.form.safety);

      if (this.isEditMode) {
        // Logika Update: Emit ke parent event 'update-stock' agar state root berubah
        this.$emit('update-stock', this.form);
      } else {
        // Logika Create: Cek duplikasi kode mata kuliah terlebih dahulu
        const exists = this.items.some(i => i.kode.toUpperCase() === this.form.kode.toUpperCase());
        if (exists) {
          this.formError = `Kode MK "${this.form.kode}" sudah terdaftar dalam sistem!`;
          return;
        }
        this.form.kode = this.form.kode.toUpperCase();
        // Emit ke parent event 'add-stock'
        this.$emit('add-stock', this.form);
      }

      // Tutup form modal pengisian
      this.showForm = false;
      this.formError = '';
    },

    /**
     * Menutup form input tanpa menyimpan
     */
    closeForm() {
      this.showForm = false;
      this.formError = '';
    },

    /**
     * Memulai proses penghapusan (Delete) - memicu modal konfirmasi terlebih dahulu
     * @param {Object} item Data yang dipilih untuk dihapus
     */
    triggerDelete(item) {
      this.codeToDelete = item.kode;
      this.titleToDelete = `MK ${item.kode} - ${item.judul}`;
      this.showDeleteModal = true;
    },

    /**
     * Memproses penghapusan nyata setelah pengguna menyetujui konfirmasi di dalam modal
     */
    executeDelete() {
      if (this.codeToDelete) {
        // Emit ke parent event 'delete-stock'
        this.$emit('delete-stock', this.codeToDelete);
      }
      this.showDeleteModal = false;
      this.codeToDelete = null;
    }
  }
});

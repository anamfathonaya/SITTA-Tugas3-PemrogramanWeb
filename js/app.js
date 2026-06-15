/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * js/app.js
 * 
 * File Root Javascript / Inisialisasi Vue.js Root Instance.
 * Bertanggung jawab mengelola global state, mengintegrasikan data service (BahanAjarService),
 * mengaktifkan tab navigation, mendaftarkan global filter format, serta melakukan persistence
 * data otomatis ke dalam browser `localStorage` agar tidak hilang jika di-refresh.
 * 
 * Kriteria Wajib Terpenuhi di Sini:
 * 1. Vue Instance: Inisialisasi `new Vue({ el: '#app', ... })`
 * 2. Tab Navigation: Managing tab state ('stok' | 'tracking' | 'order').
 * 3. Filters: Mendaftarkan filter global 'rupiah' dan 'buah'.
 * 4. Methods & Local Storage: Menangani penambahan, pembaruan, dan penghapusan array data secara reaktif.
 * 
 * Presentasi Video Hint:
 * - Jelaskan fungsionalitas `Vue.filter` sebagai fitur formatting teks murni di Vue.js (misal: merubah angka 65000 menjadi Rp 65.000).
 * - Jelaskan alur sinkronisasi data dua arah reaktif antara component child dengan global state induk di app.js menggunakan mekanisme event listener ($emit).
 * - Gambarkan pemakaian Lifecycle Hooks `created` di mana aplikasi otomatis mendeteksi cache `localStorage` jika ada, atau mengunduh data baru via `BahanAjarService`.
 */

// 1. DAFTAR KATEGORI FILTER GLOBAL VUE.JS (Memenuhi Kriteria 7: Formatting Data menggunakan Filter)

/**
 * Filter Rupiah: Mengubah angka numerik murni menjadi format mata uang Rupiah Indonesia yang rapi.
 * Contoh: 65000 -> Rp 65.000
 */
Vue.filter('rupiah', function (value) {
  if (value === undefined || value === null) return 'Rp 0';
  const numeric = Number(value);
  if (isNaN(numeric)) return 'Rp 0';
  return 'Rp ' + numeric.toLocaleString('id-ID');
});

/**
 * Filter Buah: Menambahkan keterangan unit "buah" di belakang angka jumlah kuantitas.
 * Contoh: 28 -> 28 buah
 */
Vue.filter('buah', function (value) {
  if (value === undefined || value === null) return '0 buah';
  return value + ' buah';
});


// 2. INISIALISASI VUE ROOT INSTANCE
new Vue({
  // Menargetkan ID #app pada index.html sebagai mounting point utama aplikasi
  el: '#app',
  
  // State data reaktif global yang didistribusikan ke komponen-komponen anak
  data() {
    return {
      // Keadaan aktifitas tab navigasi utama: 'stok' | 'tracking' | 'order'
      activeTab: 'stok',
      
      // State data master aplikasi
      state: {
        upbjjList: [],
        kategoriList: [],
        pengirimanList: [],
        paket: [],
        stok: [],
        tracking: []
      },

      // Keadaan visual UI loading & error handling
      loading: true,
      errorMsg: ''
    };
  },

  // Lifecycle Hook: Dipanggil segera setelah instansi Vue dibuat (sebelum mounting DOM)
  created() {
    this.initializeState();
  },

  methods: {
    /**
     * Memuat konfigurasi awal.
     * Mencoba membaca dari localStorage terlebih dahulu agar perubahan CRUD user bersifat persisten.
     * Jika kosong, akan memanggil service api.js untuk fetch file JSON lokal.
     */
    async initializeState() {
      this.loading = true;
      this.errorMsg = '';
      
      try {
        const savedState = localStorage.getItem('sitta_app_state');
        
        if (savedState) {
          console.log('SITTA App: Memulihkan state data dari localStorage (Persisten).');
          this.state = JSON.parse(savedState);
        } else {
          console.log('SITTA App: Memuat data awal dari data/dataBahanAjar.json melalui api.js...');
          // Memanggil API service secara asinkron
          const defaultData = await window.BahanAjarService.fetchData();
          this.state = defaultData;
          this.saveStateToLocalStorage();
        }
      } catch (error) {
        this.errorMsg = 'Gagal memuat database internal bahan ajar UT: ' + error.message;
        console.error(error);
      } finally {
        this.loading = false;
      }
    },

    /**
     * Mempersisten state data reaktif saat ini ke dalam cookie/localStorage browser
     */
    saveStateToLocalStorage() {
      localStorage.setItem('sitta_app_state', JSON.stringify(this.state));
      console.log('SITTA App: State data berhasil disinkronisasi ke localStorage.');
    },

    /**
     * Berpindah tab navigasi utama
     * @param {String} tabName Target tab tujuan ('stok' | 'tracking' | 'order')
     */
    changeTab(tabName) {
      this.activeTab = tabName;
    },

    // ==========================================
    // LOGIKA EVENT HANDLER UNTUK CRUD STOK BAHAN AJAR
    // ==========================================

    /**
     * Menambahkan baris bahan ajar baru ke daftar stok (CREATE)
     * @param {Object} newItem Objek data bahan ajar baru dari form
     */
    handleAddStock(newItem) {
      console.log('CRUD [CREATE]: Menerima stok bahan ajar baru:', newItem);
      // Dorong data baru ke array stok secara reaktif
      this.state.stok.push(newItem);
      
      // Simpan perubahan secara lokal agar persisten
      this.saveStateToLocalStorage();
    },

    /**
     * Memperbarui detail bahan ajar lama yang telah diedit (UPDATE)
     * @param {Object} editedItem Objek data bahan ajar ter-update
     */
    handleUpdateStock(editedItem) {
      console.log('CRUD [UPDATE]: Memperbarui isi stok untuk:', editedItem.kode);
      
      // Cari indeks item yang cocok berdasarkan kode unik mata kuliah
      const index = this.state.stok.findIndex(item => item.kode === editedItem.kode);
      
      if (index !== -1) {
        // Mengubah item pada indeks tersebut secara reaktif
        Vue.set(this.state.stok, index, editedItem);
        this.saveStateToLocalStorage();
      }
    },

    /**
     * Menghapus baris bahan ajar dari memori (DELETE)
     * @param {String} kode Kode unik mata kuliah yang mau dihapus
     */
    handleDeleteStock(kode) {
      console.log('CRUD [DELETE]: Menghapus bahan ajar kode:', kode);
      
      // Menyaring array stok untuk mengecualikan item dengan kode yang bersangkutan
      this.state.stok = this.state.stok.filter(item => item.kode !== kode);
      
      this.saveStateToLocalStorage();
    },

    // ==========================================
    // LOGIKA EVENT HANDLER UNTUK PELACAKAN DO (DELIVERY ORDER)
    // ==========================================

    /**
     * Menerbitkan berkas Delivery Order baru dari formulir pemesanan
     * @param {Object} newDo Objek DO baru ter-generate
     */
    handleSubmitDo(newDo) {
      console.log('LOGISTIK [SUBMIT-DO]: Menerbitkan DO baru:', newDo);
      // Masukkan ke log pelacakan awal
      this.state.tracking.push(newDo);
      this.saveStateToLocalStorage();
    },

    /**
     * Memperbarui rincian riwayat pengiriman berjalan (menambahkan log timeline waktu & keterangan)
     * @param {Object} updatedDo Objek DO setelah disisipi timeline progress lapangan
     */
    handleUpdateTracking(updatedDo) {
      console.log('LOGISTIK [UPDATE-TRACKING]: Memperbarui progress perjalanan DO:', updatedDo.id);
      
      const index = this.state.tracking.findIndex(item => item.id === updatedDo.id);
      if (index !== -1) {
        Vue.set(this.state.tracking, index, updatedDo);
        this.saveStateToLocalStorage();
      }
    },

    /**
     * Reset manual untuk menghapus data cache penyimpanan lokal (kembali ke default JSON)
     */
    resetToFactoryDefaults() {
      if (confirm('Apakah Anda yakin ingin menyetel ulang database simulasi ke pengaturan bawaan (default JSON)? Seluruh edisi CRUD yang sudah Anda buat akan terhapus.')) {
        localStorage.removeItem('sitta_app_state');
        this.initializeState();
      }
    }
  }
});

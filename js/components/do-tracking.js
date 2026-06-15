/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * js/components/do-tracking.js
 * 
 * Komponen Lacak Delivery Order (<do-tracking>).
 * Berfungsi untuk melacak status paket bahan ajar mahasiswa Universitas Terbuka
 * berdasarkan Nomor DO atau NIM. Komponen ini juga memampukan admin memperbarui
 * perjalanan logistik nyata di lapangan secara instan.
 * 
 * Kriteria Terpenuhi di File Ini:
 * 1. Component kebab-case: diregistrasikan sebagai 'do-tracking'.
 * 2. Data Binding: {{ }}, v-text, v-html (jika perlu), v-bind, v-model.
 * 3. List Rendering: v-for pada log perjalanan history paket dan list hasil pencarian.
 * 4. Conditionals: v-if / v-else untuk menampilkan rincian timeline paket yang ditemukan.
 * 5. Watchers: Watcher ke-2 aplikasi yang memantau kolom 'searchQuery'. 
 *              Apabila input dikosongkan oleh user, watcher mendeteksi dan mengembalikan pencarian ke mode default.
 * 6. Event Handling: Menangkap tombol keyboard 'Enter' untuk trigger cari, dan 'Esc' untuk batalkan/reset pencarian.
 */

Vue.component('do-tracking', {
  template: '#tpl-tracking',

  props: {
    // List Delivery Order master keseluruhan dari parent scope
    trackingList: {
      type: Array,
      required: true
    },
    // List paket dari JSON
    paketList: {
      type: Array,
      required: true
    }
  },

  data() {
    return {
      // String input pencarian yang di-binding dua arah menggunakan v-model
      searchQuery: '',

      // String pencarian yang aktif digunakan setelah meluncurkan submit (Enter)
      activeSearchQuery: '',

      // Logistik tujuan terpilih jika user mengklik salah satu hasil dari table pencarian
      selectedDoId: null,

      // State input progress baru yang sedang ditulis oleh admin
      newProgressKeterangan: '',
      
      // Status baru opsional untuk sekaligus memperbarui kondisi paket ("Dalam Perjalanan" / "Diterima")
      updatedDoStatus: 'Dalam Perjalanan'
    };
  },

  // Watchers: Menjawab kriteria minimal 2 watcher pada sistem Vue
  watch: {
    /**
     * Memantau perubahan input string pencarian.
     * Jika user secara manual menghapus teks di kolom pencarian atau menekan backspace 
     * hingga bersih, watcher ini segera mereset pencarian aktif agar tabel kembali bersih/normal.
     */
    searchQuery(newVal) {
      if (!newVal || newVal.trim() === '') {
        console.log('Watcher [searchQuery]: Pencarian dihapus secara manual. Auto-clear active search filter.');
        this.activeSearchQuery = '';
        this.selectedDoId = null;
      }
    }
  },

  computed: {
    /**
     * Hasil filter pencarian reaktif (Berdasarkan No. DO atau NIM Mahasiswa).
     * Filter dihitung secara internal dan hanya dieksekusi saat activeSearchQuery berubah (setelah tekan Enter).
     */
    searchResults() {
      if (!this.activeSearchQuery.trim()) {
        return this.trackingList; // Tampilkan semua jika tidak ada query aktif
      }

      const query = this.activeSearchQuery.toLowerCase().trim();
      return this.trackingList.filter(item => 
        item.id.toLowerCase().includes(query) || 
        item.nim.includes(query)
      );
    },

    /**
     * Mengambil referensi DO yang sedang di-inspect secara detail untuk memunculkan timeline terlengkap
     */
    activeDoDetails() {
      if (!this.selectedDoId) return null;
      return this.trackingList.find(d => d.id === this.selectedDoId) || null;
    }
  },

  methods: {
    /**
     * Memicu eksekusi pencarian saat pengguna menekan tombol keyboard 'Enter'
     */
    executeSearch() {
      console.log(`KeyboardEvent [Enter]: Memicu pencarian berdasarkan kata kunci: "${this.searchQuery}"`);
      this.activeSearchQuery = this.searchQuery;
      
      // Jika hasil pencarian hanya ada satu barang, langsung pilih otomatis agar detail timelinenya terbuka
      const found = this.searchResults;
      if (found.length === 1) {
        this.selectDo(found[0]);
      } else {
        this.selectedDoId = null;
      }
    },

    /**
     * Mereset/Membersihkan pencarian secara instan saat pengguna menekan tombol keyboard 'Esc'
     */
    clearSearch() {
      console.log('KeyboardEvent [Esc]: Mereset seluruh kolom pencarian & rincian pelacakan.');
      this.searchQuery = '';
      this.activeSearchQuery = '';
      this.selectedDoId = null;
      this.newProgressKeterangan = '';
    },

    /**
     * Memilih salah satu item DO untuk dilacak rincian timelinenya
     * @param {Object} item Objek DO terpilih
     */
    selectDo(item) {
      this.selectedDoId = item.id;
      this.updatedDoStatus = item.status;
      this.newProgressKeterangan = '';
    },

    /**
     * Mengambil detail nama paket dari kode paket terdaftar
     * @param {String} kode Kode paket
     */
    getPaketNama(kode) {
      const match = this.paketList.find(p => p.kode === kode);
      return match ? `${match.kode} - ${match.nama}` : kode;
    },

    /**
     * Menambahkan riwayat / progress perjalanan logistik pengiriman bahan ajar.
     * Mengambil waktu lokal komputer ( Date ) secara realtime dan status baru dari input.
     */
    addTrackingProgress() {
      if (!this.newProgressKeterangan || !this.newProgressKeterangan.trim()) {
        alert('Tuliskan keterangan keterangan lokasi/posisi pengiriman bahan ajar terlebih dahulu!');
        return;
      }

      const currentDo = this.activeDoDetails;
      if (!currentDo) return;

      // Mengambil realtime local time terformat (dd Bulan yyyy jam:menit:detik)
      const now = new Date();
      const listBulan = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
      ];
      
      const tanggal = now.getDate();
      const namaBulan = listBulan[now.getMonth()];
      const tahun = now.getFullYear();
      
      const jam = String(now.getHours()).padStart(2, '0');
      const menit = String(now.getMinutes()).padStart(2, '0');
      const detik = String(now.getSeconds()).padStart(2, '0');
      
      const formattedTimestamp = `${tanggal} ${namaBulan} ${tahun} ${jam}:${menit}:${detik}`;

      // Menyusun baris progress baru
      const newProgressRow = {
        waktu: formattedTimestamp,
        keterangan: this.newProgressKeterangan.trim()
      };

      // Buat salinan dalam bentuk deep copy untuk update reaktif
      const updatedDo = JSON.parse(JSON.stringify(currentDo));
      
      // Amandemen riwayat logistik berjalan
      updatedDo.perjalanan.push(newProgressRow);
      
      // Amandemen status pemesanan utama ("Dalam Perjalanan" / "Diterima")
      updatedDo.status = this.updatedDoStatus;

      // Emit event 'update-tracking' ke induk (parent: app.js) agar state tersimpan permanen di memori aplikasi
      this.$emit('update-tracking', updatedDo);

      // Bersihkan input teks keterangan
      this.newProgressKeterangan = '';
      
      // Berikan efek notifikasi singkat log terupdate
      console.log(`Success: Menambahkan progress baru ke DO ${updatedDo.id}. Status terkini: ${updatedDo.status}`);
    }
  }
});

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * js/components/app-modal.js
 * 
 * Komponen Modal Reusable (<app-modal>) untuk konfirmasi popup sebelum melakukan aksi kritis,
 * salah satunya adalah proses menghapus data bahan ajar agar menghindari penghapusan tidak sengaja.
 * 
 * Komponen ini memiliki fitur penanganan event keyboard 'Escape' untuk menutup modal secara otomatis.
 * 
 * Presentasi Video Hint:
 * - Jelaskan penggunaan slot bawaan Vue untuk memisahkan konten (reusable layout).
 * - Jelaskan siklus hidup (lifecycle hooks) `mounted` dan `beforeDestroy` untuk mendaftarkan dan membersihkan global event listener keyboard 'Escape'.
 * - Jelaskan mekanisme `$emit` untuk mengirimkan sinyal ke komponen induk (parent) bahwa user memilih 'batal/close' atau 'konfirmasi/confirm'.
 */

Vue.component('app-modal', {
  template: '#tpl-modal',
  props: {
    // Menentukan apakah modal sedang terbuka atau tertutup
    show: {
      type: Boolean,
      default: false
    },
    // Judul modal
    title: {
      type: String,
      default: 'Konfirmasi Tindakan'
    },
    // Pesan konfirmasi utama di dalam modal
    message: {
      type: String,
      default: 'Apakah Anda yakin ingin melanjutkan tindakan ini?'
    },
    // Label tombol konfirmasi (bisa dicustomize)
    confirmText: {
      type: String,
      default: 'Ya, Hapus'
    },
    // Label tombol batal
    cancelText: {
      type: String,
      default: 'Batal'
    }
  },
  
  // Lifecycle Hook: Dipanggil saat elemen dimasukkan ke dalam DOM
  mounted() {
    window.addEventListener('keydown', this.handleKeyDown);
  },
  
  // Lifecycle Hook: Dipanggil sebelum komponen dihancurkan (mencegah memory leak)
  beforeDestroy() {
    window.removeEventListener('keydown', this.handleKeyDown);
  },
  
  methods: {
    /**
     * Menangani trigger tombol keyboard global
     * @param {KeyboardEvent} event Objek event keyboard dari browser
     */
    handleKeyDown(event) {
      // Sesuai kriteria wajib: menangani event keyboard 'Esc' untuk batalkan/tutup modal
      if (this.show && (event.key === 'Escape' || event.key === 'Esc')) {
        this.closeModal();
      }
    },
    
    /**
     * Emit event ke parent untuk menutup modal
     */
    closeModal() {
      // Mengirim pesan custom event 'close' ke parent komponen
      this.$emit('close');
    },
    
    /**
     * Emit event ke parent setelah mengonfirmasi aksi
     */
    confirmAction() {
      // Mengirim pesan custom event 'confirm' ke parent komponen
      this.$emit('confirm');
    }
  }
});

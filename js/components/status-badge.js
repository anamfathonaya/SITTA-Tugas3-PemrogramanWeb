/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * js/components/status-badge.js
 * 
 * Komponen ini bertanggung jawab untuk memvisualisasikan status stok bahan ajar secara dinamis.
 * Penilaian stok didasarkan pada perbandingan antara jumlah stok nyata (`qty`) dan ambang batas aman (`safety`).
 * 
 * Kriteria Kebab-case: <status-badge> atau <ba-status-badge>
 * 
 * Presentasi Video Hint:
 * - Jelaskan penggunaan `props` (qty dan safety) sebagai sarana komunikasi satu arah (one-way data binding) dari parent ke child.
 * - Jelaskan fungsionalitas `computed` di mana status badge secara otomatis beralih ('Aman', 'Menipis', 'Kosong') tanpa perlu kalkulasi manual di template.
 */

Vue.component('status-badge', {
  // Menggunakan template eksternal berupa script tag dengan ID tpl-badge yang terdefinisi di index.html
  template: '#tpl-badge',
  
  // Mendefinisikan prop yang dikirimkan oleh komponen induk (parent)
  props: {
    // Jumlah stok saat ini
    qty: {
      type: Number,
      required: true
    },
    // Jumlah minimum stok aman (safety stock)
    safety: {
      type: Number,
      required: true
    },
    // Catatan tambahan (misalnya untuk keperluan tooltip saat di-hover)
    catatanHtml: {
      type: String,
      default: ''
    }
  },

  // Computed Properties: Melakukan komputasi reaktif berdasarkan perubahan props 'qty' atau 'safety'
  computed: {
    /**
     * Menghasilkan teks status ("Aman", "Menipis", atau "Kosong")
     */
    statusText() {
      if (this.qty === 0) {
        return 'Kosong';
      } else if (this.qty < this.safety) {
        return 'Menipis';
      } else {
        return 'Aman';
      }
    },
    
    /**
     * Menghasilkan kelas warna CSS Tailwind sesuai dengan status stok
     */
    badgeClasses() {
      if (this.qty === 0) {
        // Status Kosong: Background merah muda transparan, teks merah tebal, border merah
        return 'bg-red-50 text-red-700 border-red-200';
      } else if (this.qty < this.safety) {
        // Status Menipis: Background oranye transparan, teks oranye tebal, border oranye
        return 'bg-amber-50 text-amber-700 border-amber-200';
      } else {
        // Status Aman: Background hijau transparan, teks hijau tebal, border hijau
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      }
    },

    /**
     * Menghasilkan ikon SVG berupa string untuk mewakili status visual secara inklusif
     */
    iconSvg() {
      if (this.qty === 0) {
        // Simbol X / Bahaya untuk stok habis
        return `
          <svg class="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
          </svg>
        `;
      } else if (this.qty < this.safety) {
        // Simbol Warning untuk stok menipis
        return `
          <svg class="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
          </svg>
        `;
      } else {
        // Simbol Checkmark untuk stok aman
        return `
          <svg class="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
          </svg>
        `;
      }
    }
  }
});

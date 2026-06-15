/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * js/services/api.js
 * 
 * File ini berfungsi sebagai service provider untuk memuat data bahan ajar (dataBahanAjar.json).
 * Dalam arsitektur Vue.js, pemisahan logika akses data ke dalam service/API layer (api.js) sangat penting
 * untuk menjaga kode tetap modular, bersih, dan sesuai dengan prinsip Separation of Concerns (SoC).
 * 
 * Presentasi Video Hint:
 * - Jelaskan bahwa fungsi `fetchData` menggunakan standard Fetch API bawaan browser untuk memuat file JSON lokal.
 * - Ini menyimulasikan pemanggilan REST API jika nantinya aplikasi dihubungkan dengan server backend sungguhan.
 */

const BahanAjarService = {
  /**
   * Mengambil seluruh data bahan ajar dari dataBahanAjar.json.
   * @returns {Promise<Object>} Data state awal yang berisi daftar upbjj, kategori, paket, stok, dan tracking.
   */
  async fetchData() {
    try {
      // Memuat file dataBahanAjar.json secara asinkronus (async-await)
      const response = await fetch('/data/dataBahanAjar.json');
      
      // Jika respons tidak sukses (misal: file tidak ditemukan atau server error)
      if (!response.ok) {
        throw new Error(`Gagal memuat data: ${response.statusText}`);
      }
      
      // Mengembalikan promise berisi data yang telah diparsing menjadi Javascript Object
      return await response.json();
    } catch (error) {
      console.error('Terjadi kesalahan pada layer service/api.js saat fetch data:', error);
      throw error;
    }
  }
};

// Mengekspos service ke global scope agar dapat diakses oleh js/app.js tanpa bundler tambahan
window.BahanAjarService = BahanAjarService;

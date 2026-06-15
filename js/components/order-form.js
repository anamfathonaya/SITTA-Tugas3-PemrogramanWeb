/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * js/components/order-form.js
 * 
 * Komponen Form Pesanan Baru (<order-form>).
 * Berfungsi untuk menangani pembentukan Delivery Order (DO) Baru secara instan dan interaktif.
 * 
 * Fitur Utama:
 * 1. Auto-generate No. DO berdasarkan tahun berjalan dan sequence counter aktif (misal: DO2026-003).
 * 2. Ambil Tanggal Kirim asinkron sesuai waktu lokal komputer terformat ("dd Bulan yyyy").
 * 3. Kalkulasi harga otomatis sesuai harga paket yang dipilih.
 * 4. Tampilkan isi modul materi di bawah dropdown paket setelah paket dipilih.
 * 5. Emit data pesanan baru ke root state untuk segera dilacak di tab tracking.
 * 
 * Presentasi Video Hint:
 * - Jelaskan penggunaan standard object `Date` untuk mengambil tahun saat ini dalam modul generator DO dan untuk menyusun string tanggal kirim berformat Indonesia.
 * - Tunjukkan binding `v-model` dua arah pada input NIM, Nama, Ekspedisi, dan Paket.
 * - Demonstrasikan validasi input wajib terisi, agar data kotor tidak masuk ke database bayangan.
 */

Vue.component('order-form', {
  template: '#tpl-order',
  
  props: {
    // Daftar paket bahan ajar yang tersedia
    paketList: {
      type: Array,
      required: true
    },
    // Daftar ekspedisi yang tersedia
    ekspedisiList: {
      type: Array,
      required: true
    },
    // Daftar tracking terkini untuk menghitung counter sequence urutan DO berikutnya
    trackingList: {
      type: Array,
      required: true
    }
  },

  data() {
    return {
      nim: '',
      nama: '',
      selectedEkspedisi: '',
      selectedPaketKode: '',
      formError: '',
      formSuccess: ''
    };
  },

  computed: {
    /**
     * Auto-generate No. DO secara dinamis sesuai spesifikasi:
     * Format: DO[Tahun Berjalan]-[Sequence_Number_3_Digit]
     * Contoh: DO2026-003
     */
    nextDoNumber() {
      const currentYear = new Date().getFullYear(); // Mengambil tahun berjalan (misal: 2026)
      const prefix = `DO${currentYear}-`;
      
      let maxSequence = 0;
      
      // Melakukan parsing pada daftar DO lama untuk mencari tahu sequence paling atas saat ini
      this.trackingList.forEach(item => {
        if (item.id && item.id.startsWith(prefix)) {
          // Mengambil bagian sequence setelah tanda hubung "DO2026-"
          const seqPart = item.id.replace(prefix, '');
          const seqNum = parseInt(seqPart, 10);
          if (!isNaN(seqNum) && seqNum > maxSequence) {
            maxSequence = seqNum;
          }
        }
      });
      
      // Sequence berikutnya adalah max + 1
      const nextSeq = maxSequence + 1;
      
      // Memformat sequence agar selalu memiliki panjang 3 digit dengan padding nol (001, 002, 010, dst)
      const paddedSeq = String(nextSeq).padStart(3, '0');
      
      return `${prefix}${paddedSeq}`;
    },

    /**
     * Mengambil tanggal saat ini terformat secara manual sebagai waktu lokal yang indah:
     * Format: dd Bulan yyyy (contoh: 15 Juni 2026)
     */
    formattedLaunchDate() {
      const today = new Date();
      return this.formatIndonesianDate(today);
    },

    /**
     * Mengidentifikasi detail isi paket bahan ajar saat dropdown dipilih
     */
    selectedPaketDetails() {
      if (!this.selectedPaketKode) return null;
      return this.paketList.find(p => p.kode === this.selectedPaketKode) || null;
    },

    /**
     * Otomatis mengalkulasi total harga berbasis paket terpilih
     */
    calculatedTotal() {
      if (!this.selectedPaketDetails) return 0;
      return this.selectedPaketDetails.harga;
    }
  },

  methods: {
    /**
     * Helper pemformat tanggal Indonesia sederhana tanpa library luar (moment.js/date-fns)
     * @param {Date} dateObj Objek tanggal standard
     */
    formatIndonesianDate(dateObj) {
      const listBulan = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
      ];
      const tanggal = dateObj.getDate();
      const namaBulan = listBulan[dateObj.getMonth()];
      const tahun = dateObj.getFullYear();
      
      return `${tanggal} ${namaBulan} ${tahun}`;
    },

    /**
     * Memproses submit pembuatan DO baru
     */
    submitOrder() {
      // 1. Reset status validasi
      this.formError = '';
      this.formSuccess = '';

      // 2. Validasi input sederhana
      if (!this.nim || !this.nim.trim()) {
        this.formError = 'NIM Universitas Terbuka wajib diisi (9 digit murni)!';
        return;
      }
      if (!this.nama || !this.nama.trim()) {
        this.formError = 'Nama Mahasiswa penerima tidak boleh kosong!';
        return;
      }
      if (!this.selectedEkspedisi) {
        this.formError = 'Silakan pilih Ekspedisi layanan pengiriman barang!';
        return;
      }
      if (!this.selectedPaketKode) {
        this.formError = 'Pilih salah satu Paket Bahan Ajar UT yang dipesan!';
        return;
      }

      // Ambil waktu jam sekarang untuk log perjalanan awal
      const now = new Date();
      const hourStr = String(now.getHours()).padStart(2, '0');
      const minStr = String(now.getMinutes()).padStart(2, '0');
      const secStr = String(now.getSeconds()).padStart(2, '0');
      const timeStr = `${hourStr}:${minStr}:${secStr}`;

      // 3. Merakit objek DO baru sesuai schema
      const newDO = {
        id: this.nextDoNumber,
        nim: this.nim.trim(),
        nama: this.nama.trim(),
        status: 'Dalam Perjalanan',
        ekspedisi: this.selectedEkspedisi,
        tanggalKirim: this.formattedLaunchDate,
        paketKode: this.selectedPaketKode,
        total: this.calculatedTotal,
        perjalanan: [
          {
            waktu: `${this.formattedLaunchDate} ${timeStr}`,
            keterangan: 'Delivery Order berhasil dibuat di sistem SITTA. Paket diserahkan ke Ekspedisi UT Pusat.'
          }
        ]
      };

      // 4. Kirimkan objek ke parent untuk digabung ke state utama modal root
      this.$emit('submit-do', newDO);

      // Tampilkan notifikasi keberhasilan
      this.formSuccess = `Berhasil! Delivery Order ${newDO.id} atas nama ${newDO.nama} telah diterbitkan.`;

      // 5. Reset internal state form input
      this.nim = '';
      this.nama = '';
      this.selectedEkspedisi = '';
      this.selectedPaketKode = '';

      // Alihkan tab secara otomatis ke halaman 'tracking' setelah 2 detik agar user bisa melihat langsung trackingnya
      setTimeout(() => {
        this.$emit('change-tab', 'tracking');
        this.formSuccess = '';
      }, 1500);
    }
  }
});

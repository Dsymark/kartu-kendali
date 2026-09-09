export interface ItemServisData {
  id?: number;
  servisId?: number;
  uraian: string;
  jumlah: number;
  hargaSatuan: number;
  subtotal: number;
}

export interface ServisData {
  id: number;
  mobilId: number;
  tanggal: string | Date;
  bengkel: string;
  nomorNota: string | null;
  totalBiaya: number;
  keterangan: string | null;
  items: ItemServisData[];
}

export interface HistoriPemakaiData {
  id: number;
  mobilId: number;
  nopol: string;
  namaPengguna: string;
  jabatan: string | null;
  tanggalMulai: string | Date;
  tanggalSelesai: string | Date | null;
  isAktif: boolean;
  catatan: string | null;
}

export interface MobilData {
  id: number;
  nama: string;
  jenis: string;
  tipe: string | null;
  nomorRangka?: string | null;
  nomorMesin?: string | null;
  keterangan?: string | null;
  pemakaiAktif?: HistoriPemakaiData | null;
  totalBiaya: number;
  jumlahServis: number;
  historiPemakai: HistoriPemakaiData[];
  riwayatServis: ServisData[];
}


"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Wrench,
  User,
  Plus,
  FileSpreadsheet,
  Printer,
  Trash2,
  Edit,
  FileText,
  AlertCircle,
  X,
  History,
  CheckCircle2,
  Car,
  Receipt,
  Info,
} from "lucide-react";
import { getDetailMobil, mutasiPemakai } from "@/lib/actions/mobil";
import { catatServis, updateServis, hapusServis, ItemServisInput } from "@/lib/actions/servis";
import { formatRupiah, formatTanggal, getTodayDateString } from "@/lib/utils";
import { MobilData, ServisData, ItemServisData, HistoriPemakaiData } from "@/lib/types";

export default function DetailMobilPage() {
  const params = useParams();
  const mobilId = parseInt(params.id as string);

  const [mobil, setMobil] = useState<MobilData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"servis" | "histori">("servis");
  const [filterTahun, setFilterTahun] = useState<string>("semua");

  // State Modals
  const [isModalServisOpen, setIsModalServisOpen] = useState(false);
  const [editingServisId, setEditingServisId] = useState<number | null>(null);
  const [selectedServisDetail, setSelectedServisDetail] = useState<ServisData | null>(null);
  const [isModalMutasiOpen, setIsModalMutasiOpen] = useState(false);

  // Form State Servis
  const [formServis, setFormServis] = useState({
    tanggal: getTodayDateString(),
    bengkel: "",
    nomorNota: "",
    keterangan: "",
    items: [
      { uraian: "", jumlah: 1, hargaSatuan: 0, subtotal: 0 },
    ] as ItemServisInput[],
  });
  const [servisLoading, setServisLoading] = useState(false);
  const [servisError, setServisError] = useState<string | null>(null);

  // Form State Mutasi
  const [formMutasi, setFormMutasi] = useState({
    nopol: "",
    namaPengguna: "",
    jabatan: "",
    tanggalMutasi: getTodayDateString(),
    catatan: "",
  });
  const [mutasiLoading, setMutasiLoading] = useState(false);
  const [mutasiError, setMutasiError] = useState<string | null>(null);

  const loadMobil = useCallback(async () => {
    setLoading(true);
    const data = await getDetailMobil(mobilId);
    if (data) {
      setMobil(data as unknown as MobilData);
      setFormMutasi({
        nopol: data.pemakaiAktif?.nopol || "",
        namaPengguna: data.pemakaiAktif?.namaPengguna || "",
        jabatan: data.pemakaiAktif?.jabatan || "",
        tanggalMutasi: getTodayDateString(),
        catatan: "",
      });
    }
    setLoading(false);
  }, [mobilId]);

  useEffect(() => {
    if (!isNaN(mobilId)) {
      loadMobil();
    }
  }, [mobilId, loadMobil]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-24 text-center space-y-3">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-600">Memuat kartu kendali kendaraan...</p>
      </div>
    );
  }

  if (!mobil) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <Car className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Mobil Tidak Ditemukan</h2>
        <p className="text-xs text-slate-500">Data armada ini tidak ada atau telah dihapus.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 rounded-2xl shadow-md transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Ringkasan Armada</span>
        </Link>
      </div>
    );
  }

  // Filter Servis per Tahun
  const allYears = Array.from(
    new Set(
      mobil.riwayatServis.map((s: ServisData) => new Date(s.tanggal).getFullYear())
    )
  ).sort((a: number, b: number) => b - a);

  const filteredServis = mobil.riwayatServis.filter((s: ServisData) => {
    if (filterTahun === "semua") return true;
    return new Date(s.tanggal).getFullYear() === parseInt(filterTahun);
  });

  const totalBiayaFiltered = filteredServis.reduce(
    (acc: number, s: ServisData) => acc + s.totalBiaya,
    0
  );

  // Handler Item Servis Baris Dinamis
  function handleItemChange(
    index: number,
    field: keyof ItemServisInput,
    value: string | number
  ) {
    const updated = [...formServis.items];
    const item = { ...updated[index], [field]: value };

    if (field === "jumlah" || field === "hargaSatuan") {
      const qty = field === "jumlah" ? Number(value) || 0 : item.jumlah;
      const harga = field === "hargaSatuan" ? Number(value) || 0 : item.hargaSatuan;
      item.subtotal = qty * harga;
    }

    updated[index] = item;
    setFormServis({ ...formServis, items: updated });
  }

  function tambahBarisItem() {
    setFormServis({
      ...formServis,
      items: [
        ...formServis.items,
        { uraian: "", jumlah: 1, hargaSatuan: 0, subtotal: 0 },
      ],
    });
  }

  function hapusBarisItem(index: number) {
    if (formServis.items.length <= 1) return;
    const updated = formServis.items.filter((_, i) => i !== index);
    setFormServis({ ...formServis, items: updated });
  }

  const liveTotalBiaya = formServis.items.reduce(
    (acc, item) => acc + (Number(item.subtotal) || 0),
    0
  );

  function bukaModalTambahServis() {
    setEditingServisId(null);
    setFormServis({
      tanggal: getTodayDateString(),
      bengkel: "",
      nomorNota: "",
      keterangan: "",
      items: [{ uraian: "", jumlah: 1, hargaSatuan: 0, subtotal: 0 }],
    });
    setServisError(null);
    setIsModalServisOpen(true);
  }

  function bukaModalEditServis(s: ServisData) {
    setEditingServisId(s.id);
    setFormServis({
      tanggal: new Date(s.tanggal).toISOString().split("T")[0],
      bengkel: s.bengkel,
      nomorNota: s.nomorNota || "",
      keterangan: s.keterangan || "",
      items: s.items.map((i: ItemServisData) => ({
        uraian: i.uraian,
        jumlah: i.jumlah,
        hargaSatuan: i.hargaSatuan,
        subtotal: i.subtotal,
      })),
    });
    setServisError(null);
    setIsModalServisOpen(true);
  }

  async function handleSimpanServis(e: React.FormEvent) {
    e.preventDefault();
    setServisError(null);

    if (!formServis.bengkel.trim()) {
      setServisError("Nama bengkel wajib diisi.");
      return;
    }

    const validItems = formServis.items.filter((item) => item.uraian.trim() !== "");
    if (validItems.length === 0) {
      setServisError("Minimal harus ada 1 item uraian pekerjaan atau sparepart.");
      return;
    }

    setServisLoading(true);

    let res;
    if (editingServisId) {
      res = await updateServis(editingServisId, mobilId, {
        ...formServis,
        items: validItems,
      });
    } else {
      res = await catatServis(mobilId, {
        ...formServis,
        items: validItems,
      });
    }

    setServisLoading(false);

    if (res.success) {
      setIsModalServisOpen(false);
      loadMobil();
    } else {
      setServisError(res.error || "Gagal menyimpan data servis.");
    }
  }

  async function handleHapusServis(servisId: number) {
    if (confirm("Apakah Anda yakin ingin menghapus catatan servis ini? Seluruh rincian item dalam nota ini akan ikut terhapus.")) {
      const res = await hapusServis(servisId, mobilId);
      if (res.success) {
        loadMobil();
      }
    }
  }

  async function handleSimpanMutasi(e: React.FormEvent) {
    e.preventDefault();
    setMutasiError(null);

    if (!formMutasi.nopol.trim() || !formMutasi.namaPengguna.trim()) {
      setMutasiError("Plat nomor dan Nama pejabat baru wajib diisi.");
      return;
    }

    setMutasiLoading(true);
    const res = await mutasiPemakai(mobilId, formMutasi);
    setMutasiLoading(false);

    if (res.success) {
      setIsModalMutasiOpen(false);
      loadMobil();
    } else {
      setMutasiError(res.error || "Gagal memproses mutasi pemakai.");
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back Link */}
      <div className="no-print">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Kembali ke Ringkasan Seluruh Armada</span>
        </Link>
      </div>

      {/* PRINT HEADER (HANYA MUNCUL SAAT CETAK / PDF) */}
      <div className="print-only text-center pb-4 border-b-2 border-black mb-6">
        <h1 className="text-xl font-bold uppercase tracking-wider">
          KARTU KENDALI PEMELIHARAAN KENDARAAN DINAS
        </h1>
        <div className="text-sm mt-1 font-semibold">
          KENDARAAN: {mobil.nama} | NOPOL: {mobil.pemakaiAktif?.nopol} | PENANGGUNG JAWAB: {mobil.pemakaiAktif?.namaPengguna} ({mobil.pemakaiAktif?.jabatan || "-"})
        </div>
      </div>

      {/* Cockpit Executive Header (Screen View) */}
      <div className="no-print relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-2xl">
        {/* Ambient Decorative Lighting */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 w-60 h-60 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Identitas Kendaraan & Plat */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Visual Plat Nomor Besar Autentik */}
            <div className="plat-nomor-id px-5 py-3 flex-shrink-0 shadow-2xl">
              <div className="flex flex-col items-center">
                <span className="text-xl sm:text-2xl font-mono font-black tracking-widest text-amber-300">
                  {mobil.pemakaiAktif?.nopol || "POLISI"}
                </span>
                <span className="text-[10px] font-mono text-slate-400 tracking-widest -mt-1 opacity-80">
                  RI • 06.29
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  {mobil.tipe || "Mobil Dinas"}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Status Aktif
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {mobil.nama}
              </h1>

              <div className="flex items-center gap-2 text-xs text-slate-300">
                <User className="w-3.5 h-3.5 text-blue-400" />
                <span>
                  Pejabat Aktif: <strong className="text-white font-bold">{mobil.pemakaiAktif?.namaPengguna || "-"}</strong>
                  {mobil.pemakaiAktif?.jabatan && ` (${mobil.pemakaiAktif.jabatan})`}
                </span>
              </div>
            </div>
          </div>

          {/* Saldo Akumulasi & Action Buttons */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="bg-slate-900/90 border border-slate-700/80 px-5 py-3 rounded-2xl backdrop-blur-md">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Total Pengeluaran Mobil Ini
              </span>
              <span className="text-xl font-black text-emerald-400 block mt-0.5">
                {formatRupiah(mobil.totalBiaya)}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={bukaModalTambahServis}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-2xl shadow-lg shadow-blue-600/30 active:scale-95 transition"
              >
                <Plus className="w-4 h-4" />
                <span>+ Catat Servis</span>
              </button>

              <button
                onClick={() => {
                  setIsModalMutasiOpen(true);
                  setMutasiError(null);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-indigo-300 bg-indigo-950/80 hover:bg-indigo-900/80 border border-indigo-700/50 rounded-2xl transition"
                title="Pergantian pejabat atau perubahan plat nomor"
              >
                <History className="w-4 h-4 text-indigo-400" />
                <span className="hidden sm:inline">Mutasi Nopol</span>
              </button>

              <a
                href={`/api/export/excel?mobilId=${mobil.id}${filterTahun !== "semua" ? `&tahun=${filterTahun}` : ""}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900/80 border border-emerald-700/50 rounded-2xl transition"
                title="Download Excel hidup untuk mobil ini"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Excel</span>
              </a>

              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-2xl transition"
                title="Cetak kartu kendali / Save PDF"
              >
                <Printer className="w-4 h-4 text-slate-400" />
                <span>Cetak / PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Segmented Pill Navigation Tabs */}
      <div className="no-print flex items-center p-1 bg-slate-200/80 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab("servis")}
          className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
            activeTab === "servis"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Riwayat Servis ({mobil.riwayatServis.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("histori")}
          className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
            activeTab === "histori"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <History className="w-4 h-4" />
          <span>Histori Nopol & Pemakai ({mobil.historiPemakai.length})</span>
        </button>
      </div>

      {/* ==================================================== */}
      {/* TAB 1: RIWAYAT SERVIS & REKAPITULASI TAHUNAN */}
      {/* ==================================================== */}
      {activeTab === "servis" && (
        <div className="space-y-4">
          {/* Controls Filter Bar */}
          <div className="no-print bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Filter Dropdown Tahun */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Filter Tahun Rekap:
              </span>
              <select
                value={filterTahun}
                onChange={(e) => setFilterTahun(e.target.value)}
                className="px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="semua">Semua Tahun</option>
                {allYears.map((yr: number) => (
                  <option key={yr} value={yr}>
                    Tahun {yr}
                  </option>
                ))}
              </select>

              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                {filteredServis.length} Nota Tercatat
              </span>
            </div>

            <button
              onClick={bukaModalTambahServis}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-md shadow-blue-500/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>+ Catat Nota Baru</span>
            </button>
          </div>

          {/* Tabel Riwayat Servis Modern */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white uppercase font-bold text-[11px] tracking-wider">
                    <th className="p-4 text-center w-12">No</th>
                    <th className="p-4 w-32">Tanggal</th>
                    <th className="p-4">Bengkel Pelaksana</th>
                    <th className="p-4 w-32">No. Nota</th>
                    <th className="p-4">Rincian Item Pekerjaan / Suku Cadang</th>
                    <th className="p-4 text-right w-40">Total Biaya</th>
                    <th className="no-print p-4 text-center w-36">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredServis.length > 0 ? (
                    filteredServis.map((s: ServisData, idx: number) => (
                      <tr key={s.id} className="hover:bg-slate-50/90 transition group">
                        <td className="p-4 text-center font-bold text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="p-4 font-bold text-slate-800 whitespace-nowrap">
                          {formatTanggal(s.tanggal)}
                        </td>
                        <td className="p-4">
                          <span className="font-extrabold text-slate-900 block">
                            {s.bengkel}
                          </span>
                          {s.keterangan && (
                            <span className="text-[11px] text-slate-400 block mt-0.5 italic">
                              {s.keterangan}
                            </span>
                          )}
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">
                            {s.nomorNota || "-"}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600">
                          <div className="space-y-1.5">
                            {s.items.slice(0, 3).map((it: ItemServisData, i: number) => (
                              <div key={i} className="flex items-center gap-2 text-xs">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                                <span className="font-medium text-slate-700">{it.uraian}</span>
                                <span className="text-slate-400 text-[11px]">
                                  ({it.jumlah}x {formatRupiah(it.hargaSatuan)})
                                </span>
                              </div>
                            ))}
                            {s.items.length > 3 && (
                              <span className="text-[11px] font-bold text-blue-600 block pl-3.5">
                                + {s.items.length - 3} suku cadang lainnya...
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-right font-black text-emerald-700 text-sm whitespace-nowrap">
                          {formatRupiah(s.totalBiaya)}
                        </td>
                        <td className="no-print p-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setSelectedServisDetail(s)}
                              className="p-2 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition"
                              title="Lihat Rincian Nota Digital"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => bukaModalEditServis(s)}
                              className="p-2 text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl transition"
                              title="Koreksi / Edit Nota"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleHapusServis(s.id)}
                              className="p-2 text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition"
                              title="Hapus Transaksi Servis"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-slate-400 space-y-2">
                        <Wrench className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="font-semibold text-slate-500">
                          Belum ada catatan servis pada filter tahun ini.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
                {/* Baris Total Akumulasi (Sesuai Filter Tahun) */}
                {filteredServis.length > 0 && (
                  <tfoot>
                    <tr className="bg-slate-900 text-white font-black border-t-2 border-slate-700">
                      <td colSpan={5} className="p-4 text-right uppercase tracking-wider text-xs text-slate-300">
                        TOTAL BIAYA {filterTahun !== "semua" ? `TAHUN ${filterTahun}` : "KESELURUHAN"}:
                      </td>
                      <td className="p-4 text-right text-emerald-400 font-black text-base whitespace-nowrap">
                        {formatRupiah(totalBiayaFiltered)}
                      </td>
                      <td className="no-print p-4"></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 2: HISTORI NOPOL & PEMAKAI */}
      {/* ==================================================== */}
      {activeTab === "histori" && (
        <div className="space-y-4">
          <div className="no-print bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Rekam Jejak Mutasi Pejabat & Pergantian Nopol
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Semua histori pemegang lama tersimpan abadi sebagai arsip resmi kantor tanpa menghapus nota perbaikan lama
              </p>
            </div>

            <button
              onClick={() => {
                setIsModalMutasiOpen(true);
                setMutasiError(null);
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-2xl shadow-lg shadow-blue-500/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>+ Mutasi / Update Nopol & Pejabat</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white uppercase font-bold text-[11px] tracking-wider">
                    <th className="p-4 text-center w-12">No</th>
                    <th className="p-4 w-36">Plat Nomor (Nopol)</th>
                    <th className="p-4">Pejabat / Penanggung Jawab</th>
                    <th className="p-4">Jabatan</th>
                    <th className="p-4">Periode Pemakaian</th>
                    <th className="p-4 text-center w-32">Status</th>
                    <th className="p-4">Catatan Mutasi / Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mobil.historiPemakai.map((h: HistoriPemakaiData, idx: number) => (
                    <tr
                      key={h.id}
                      className={h.isAktif ? "bg-blue-50/40 font-medium" : "hover:bg-slate-50 transition"}
                    >
                      <td className="p-4 text-center text-slate-400 font-bold">{idx + 1}</td>
                      <td className="p-4">
                        <div className="plat-nomor-id px-3 py-1">
                          <span className="font-mono font-black text-xs text-amber-300">
                            {h.nopol}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 font-black text-slate-900 text-sm">
                        {h.namaPengguna}
                      </td>
                      <td className="p-4 text-slate-600 font-medium">
                        {h.jabatan || "-"}
                      </td>
                      <td className="p-4 text-slate-600 whitespace-nowrap font-medium">
                        {formatTanggal(h.tanggalMulai)} s/d{" "}
                        {h.tanggalSelesai ? formatTanggal(h.tanggalSelesai) : "Sekarang"}
                      </td>
                      <td className="p-4 text-center">
                        {h.isAktif ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-sm">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            [Aktif Sekarang]
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                            [Selesai / Diarsipkan]
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-slate-500 italic">
                        {h.catatan || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: CATAT / EDIT SERVIS BERKALA */}
      {/* ==================================================== */}
      {isModalServisOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-400/40 text-blue-300 flex items-center justify-center font-bold">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">
                    {editingServisId ? "Koreksi Catatan Nota Servis" : "Catat Servis Berkala Baru"}
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Input rincian nota fisik servis untuk armada: {mobil.nama} ({mobil.pemakaiAktif?.nopol})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalServisOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSimpanServis} className="p-6 overflow-y-auto space-y-5">
              {servisError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{servisError}</span>
                </div>
              )}

              {/* General Nota Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tanggal Servis (Otomatis Hari Ini) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formServis.tanggal}
                    onChange={(e) =>
                      setFormServis({ ...formServis, tanggal: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Bengkel Pelaksana <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: HONDA KUDUS JAYA"
                    value={formServis.bengkel}
                    onChange={(e) =>
                      setFormServis({ ...formServis, bengkel: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor Nota / Kuitansi Fisik
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: INV/2026/089"
                    value={formServis.nomorNota}
                    onChange={(e) =>
                      setFormServis({ ...formServis, nomorNota: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Rincian Item Nota (Tabel Dinamis) */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      Rincian Pekerjaan & Suku Cadang
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={tambahBarisItem}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Tambah Baris</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {formServis.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2.5 rounded-2xl border border-slate-200 text-xs"
                    >
                      <div className="col-span-5">
                        <input
                          type="text"
                          placeholder="Uraian (cth: Ganti Oli Mesin 4L / Jasa Servis)"
                          value={item.uraian}
                          onChange={(e) => handleItemChange(idx, "uraian", e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium"
                          required
                        />
                      </div>

                      <div className="col-span-2">
                        <input
                          type="number"
                          min="1"
                          placeholder="Qty"
                          value={item.jumlah || ""}
                          onChange={(e) =>
                            handleItemChange(idx, "jumlah", parseInt(e.target.value) || 0)
                          }
                          className="w-full px-2 py-2 bg-white border border-slate-300 rounded-xl text-xs text-center font-bold"
                        />
                      </div>

                      <div className="col-span-2">
                        <input
                          type="number"
                          step="1000"
                          placeholder="Harga Satuan"
                          value={item.hargaSatuan || ""}
                          onChange={(e) =>
                            handleItemChange(
                              idx,
                              "hargaSatuan",
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-full px-2 py-2 bg-white border border-slate-300 rounded-xl text-xs text-right font-mono font-medium"
                        />
                      </div>

                      <div className="col-span-2 font-black text-slate-900 text-right pr-1 font-mono text-xs">
                        {formatRupiah(item.subtotal)}
                      </div>

                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => hapusBarisItem(idx)}
                          disabled={formServis.items.length <= 1}
                          className="text-slate-400 hover:text-rose-600 disabled:opacity-30 p-1.5 transition"
                          title="Hapus baris"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total Biaya Live Calculation Banner */}
                <div className="p-4 bg-gradient-to-r from-emerald-900 to-teal-950 text-white rounded-2xl flex items-center justify-between shadow-inner">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300 block">
                      Total Akumulasi Nota Fisik
                    </span>
                    <span className="text-xs text-slate-300">
                      Terhitung dinamis dari total subtotal baris
                    </span>
                  </div>
                  <span className="font-mono font-black text-xl sm:text-2xl text-emerald-300">
                    {formatRupiah(liveTotalBiaya)}
                  </span>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalServisOpen(false)}
                  className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-2xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={servisLoading}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 rounded-2xl shadow-lg shadow-blue-500/20 active:scale-95 transition flex items-center gap-2"
                >
                  {servisLoading ? "Menyimpan Data..." : "Simpan Catatan Servis"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: RINCIAN NOTA DIGITAL ELEGAN */}
      {/* ==================================================== */}
      {selectedServisDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Receipt className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-extrabold text-base">
                    Rincian Nota Servis Digital
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    {formatTanggal(selectedServisDetail.tanggal)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedServisDetail(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">
                    Nomor Nota Fisik:
                  </span>
                  <span className="font-mono font-bold text-slate-800 text-sm">
                    {selectedServisDetail.nomorNota || "-"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">
                    Bengkel Pelaksana:
                  </span>
                  <span className="font-bold text-slate-800 text-sm">
                    {selectedServisDetail.bengkel}
                  </span>
                </div>
              </div>

              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-200 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                    <th className="pb-2.5 text-left">Item Pekerjaan / Suku Cadang</th>
                    <th className="pb-2.5 text-center w-12">Qty</th>
                    <th className="pb-2.5 text-right w-24">Harga</th>
                    <th className="pb-2.5 text-right w-28">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedServisDetail.items.map((it: ItemServisData, i: number) => (
                    <tr key={i}>
                      <td className="py-2.5 text-slate-800 font-bold">{it.uraian}</td>
                      <td className="py-2.5 text-center text-slate-600 font-semibold">{it.jumlah}</td>
                      <td className="py-2.5 text-right text-slate-600 font-mono">
                        {formatRupiah(it.hargaSatuan)}
                      </td>
                      <td className="py-2.5 text-right font-black text-slate-900 font-mono">
                        {formatRupiah(it.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-800 font-black">
                    <td colSpan={3} className="pt-3 text-right text-slate-700 uppercase tracking-wider">
                      Grand Total Biaya Nota:
                    </td>
                    <td className="pt-3 text-right font-black text-emerald-700 text-base font-mono">
                      {formatRupiah(selectedServisDetail.totalBiaya)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedServisDetail(null)}
                className="px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 rounded-xl transition"
              >
                Tutup Nota
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: MUTASI / UPDATE NOPOL & PEMAKAI */}
      {/* ==================================================== */}
      {isModalMutasiOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 text-indigo-300 flex items-center justify-center font-bold">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">
                    Mutasi Nopol / Pergantian Pejabat
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Sertijab penanggung jawab dinas atau penyesuaian plat nomor baru
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalMutasiOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSimpanMutasi} className="p-6 space-y-4">
              {mutasiError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{mutasiError}</span>
                </div>
              )}

              <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-2xl text-xs text-blue-900 leading-relaxed flex items-start gap-2.5">
                <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Jaminan Keamanan Data:</strong> Penanggung jawab lama akan otomatis diarsipkan dengan status <strong>[Selesai]</strong>. Seluruh riwayat servis berkala dan akumulasi total biaya mobil ini <strong>TETAP UTUH 100%</strong>.
                </span>
              </div>

              {/* Live Preview Plat Nomor Baru */}
              <div className="bg-slate-900 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-inner">
                <span className="text-xs font-bold text-slate-300">
                  Pratinjau Plat Hasil Mutasi:
                </span>
                <div className="plat-nomor-id px-3 py-1">
                  <span className="font-mono font-black text-xs text-amber-300">
                    {formMutasi.nopol.trim() || "K 6 B"}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Plat Nomor (Nopol) Baru / Tetap <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: K 6 B"
                  value={formMutasi.nopol}
                  onChange={(e) =>
                    setFormMutasi({ ...formMutasi, nopol: e.target.value.toUpperCase() })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-sm font-black tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Pejabat / Pengguna Baru <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Bapak Budi Santoso, S.T."
                  value={formMutasi.namaPengguna}
                  onChange={(e) =>
                    setFormMutasi({ ...formMutasi, namaPengguna: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jabatan Baru
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Plt. Kepala Dinas"
                    value={formMutasi.jabatan}
                    onChange={(e) =>
                      setFormMutasi({ ...formMutasi, jabatan: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tanggal Efektif Mutasi
                  </label>
                  <input
                    type="date"
                    value={formMutasi.tanggalMutasi}
                    onChange={(e) =>
                      setFormMutasi({ ...formMutasi, tanggalMutasi: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catatan / Dasar Mutasi
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Berita Acara Sertijab Pejabat / Peremajaan Plat Dinas 5 Tahunan"
                  value={formMutasi.catatan}
                  onChange={(e) =>
                    setFormMutasi({ ...formMutasi, catatan: e.target.value })
                  }
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalMutasiOpen(false)}
                  className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-2xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={mutasiLoading}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 rounded-2xl shadow-lg shadow-blue-500/20 active:scale-95 transition flex items-center gap-2"
                >
                  {mutasiLoading ? "Memproses..." : "Terapkan Mutasi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

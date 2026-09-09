"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Car,
  Wrench,
  Wallet,
  Search,
  FileSpreadsheet,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { getDaftarMobil } from "@/lib/actions/mobil";
import MobilCard from "@/components/MobilCard";
import ModalTambahMobil from "@/components/ModalTambahMobil";
import { formatRupiah } from "@/lib/utils";
import { MobilData } from "@/lib/types";

export default function DashboardPage() {
  const [mobilList, setMobilList] = useState<MobilData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterJenis, setFilterJenis] = useState("semua");
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function loadData() {
    setLoading(true);
    const data = await getDaftarMobil();
    setMobilList(data as unknown as MobilData[]);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  // Ucapan waktu dinamis
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  // Filter pencarian & tipe
  const filteredMobil = mobilList.filter((m) => {
    const q = searchQuery.toLowerCase();
    const nama = m.nama.toLowerCase();
    const nopol = m.pemakaiAktif?.nopol?.toLowerCase() || "";
    const pengguna = m.pemakaiAktif?.namaPengguna?.toLowerCase() || "";
    const matchesSearch = nama.includes(q) || nopol.includes(q) || pengguna.includes(q);

    const matchesJenis = filterJenis === "semua" || m.jenis === filterJenis;
    return matchesSearch && matchesJenis;
  });

  // Kalkulasi statistik keseluruhan
  const totalKendaraan = mobilList.length;
  const totalMobil = mobilList.filter((m) => m.jenis === "Mobil").length;
  const totalMotor = mobilList.filter((m) => m.jenis === "Motor").length;
  const totalServis = mobilList.reduce((acc, m) => acc + m.jumlahServis, 0);
  const totalPengeluaran = mobilList.reduce((acc, m) => acc + m.totalBiaya, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Executive Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 border border-slate-800 shadow-2xl">
        {/* Ambient Decorative Light */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-52 h-52 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>{getGreeting()}, Rekapitulasi Kendaraan Kantor</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Sistem Kartu Kendali Armada Dinas
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Pantau histori penanggung jawab, perubahan nopol, serta rincian nota servis berkala untuk seluruh mobil dan motor dinas secara transparan dan akurat.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/api/export/excel"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/50 rounded-2xl transition shadow-lg shadow-emerald-950/50 active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Export Rekap Excel</span>
            </a>

            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-2xl shadow-lg shadow-blue-600/30 active:scale-95 transition"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Kendaraan Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3 Luminous High-Impact Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Card 1: Total Armada */}
        <div className="relative overflow-hidden bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Armada Aktif
            </span>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
              <Car className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {totalKendaraan}{" "}
              <span className="text-sm font-bold text-slate-400">Kendaraan</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {totalMobil} mobil, {totalMotor} motor tercatat aktif
            </p>
          </div>
          <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />
        </div>

        {/* Card 2: Total Servis */}
        <div className="relative overflow-hidden bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Servis Berkala
            </span>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
              <Wrench className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {totalServis}{" "}
              <span className="text-sm font-bold text-slate-400">Transaksi Nota</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Riwayat perbaikan & penggantian suku cadang
            </p>
          </div>
          <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
        </div>

        {/* Card 3: Total Akumulasi Biaya */}
        <div className="relative overflow-hidden bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Akumulasi Pengeluaran
            </span>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
              <Wallet className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight">
              {formatRupiah(totalPengeluaran)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Biaya servis akumulasi seluruh armada
            </p>
          </div>
          <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600" />
        </div>
      </div>

      {/* Modern Filter & Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input with Clear Button */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari kendaraan, nopol, atau nama pejabat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200/90 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Filter Pills & Refresh */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {["semua", "Mobil", "Motor"].map((jenis) => (
              <button
                key={jenis}
                onClick={() => setFilterJenis(jenis)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition capitalize ${
                  filterJenis === jenis ? "bg-slate-900 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {jenis}
              </button>
            ))}
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-2xl transition border border-slate-200/80"
            title="Segarkan Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* Grid Mobil Cards */}
      {loading ? (
        <div className="py-24 text-center space-y-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600">
            Sinkronisasi data armada kendaraan...
          </p>
        </div>
      ) : filteredMobil.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMobil.map((m) => (
            <MobilCard key={m.id} mobil={m} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
            <Car className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-extrabold text-slate-900">
              {searchQuery ? "Kendaraan tidak ditemukan" : "Belum ada armada terdaftar"}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {searchQuery
                ? `Tidak ditemukan kendaraan dengan kata kunci "${searchQuery}". Coba periksa kembali ejaan plat nomor atau nama mobil.`
                : "Mulai kelola inventaris kendaraan dinas kantor dengan mendaftarkan kendaraan pertama Anda sekarang."}
            </p>
          </div>
          {!searchQuery && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-md shadow-blue-500/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>+ Daftarkan Kendaraan Pertama</span>
            </button>
          )}
        </div>
      )}

      {/* Modal Tambah Mobil */}
      <ModalTambahMobil
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
}

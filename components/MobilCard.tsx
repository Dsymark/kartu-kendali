"use client";

import Link from "next/link";
import { useState } from "react";
import { Wrench, ChevronRight, FileSpreadsheet, Car, Bike, Trash2 } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { hapusMobil } from "@/lib/actions/mobil";

interface MobilCardProps {
  onDeleted: () => void;
  mobil: {
    id: number;
    nama: string;
    jenis: string;
    tipe: string | null;
    pemakaiAktif?: {
      nopol: string;
      namaPengguna: string;
      jabatan: string | null;
    } | null;
    totalBiaya: number;
    jumlahServis: number;
  };
}

export default function MobilCard({ mobil, onDeleted }: MobilCardProps) {
  const pemakai = mobil.pemakaiAktif;
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `Hapus ${mobil.jenis.toLowerCase()} ${mobil.nama}? Semua histori pemakai dan servisnya juga akan terhapus.`
    );
    if (!confirmed) return;

    setDeleting(true);
    const result = await hapusMobil(mobil.id);
    setDeleting(false);

    if (result.success) {
      onDeleted();
    } else {
      window.alert(result.error || "Gagal menghapus kendaraan.");
    }
  }

  // Mendapatkan inisial nama pemegang
  const getInitials = (name?: string) => {
    if (!name) return "KD";
    const parts = name.replace(/^(Bapak|Ibu|Ir\.|Drs\.|Dr\.)\s+/i, "").trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  };

  return (
    <div className="group relative bg-white rounded-3xl border border-slate-200/90 hover:border-blue-500/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">
      {/* Top Accent Gradient Bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500" />

      {/* Header Info Kendaraan */}
      <div className="p-5 pb-4 bg-gradient-to-b from-slate-50/70 to-white flex items-start justify-between gap-3 border-b border-slate-100">
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
              {mobil.jenis} / {mobil.tipe || "Armada Dinas"}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Siap Operasional
            </span>
          </div>
          <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition tracking-tight">
            <span className="flex items-center gap-2">
              {mobil.jenis === "Motor" ? <Bike className="w-5 h-5 text-slate-400" /> : <Car className="w-5 h-5 text-slate-400" />}
              {mobil.nama}
            </span>
          </h3>
        </div>

        {/* Realistis Plat Nomor Khas Indonesia */}
        <div className="plat-nomor-id px-3.5 py-1.5 flex-shrink-0">
          <div className="flex flex-col items-center">
            <span className="text-sm font-mono font-black tracking-widest text-amber-300">
              {pemakai?.nopol || "POLISI"}
            </span>
            <span className="text-[8px] font-mono text-slate-400 tracking-wider -mt-1 opacity-80">
              RI • 06.29
            </span>
          </div>
        </div>
      </div>

      {/* Info Pemegang Saat Ini */}
      <div className="p-5 py-4 space-y-4 flex-1">
        <div className="flex items-center gap-3">
          {/* Avatar Inisial Bulat */}
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-md shadow-blue-500/20 flex-shrink-0">
            {getInitials(pemakai?.namaPengguna)}
          </div>
          <div className="text-xs min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Pejabat / Pengguna Aktif
            </span>
            <p className="font-extrabold text-slate-800 text-sm truncate">
              {pemakai?.namaPengguna || "Belum ditentukan"}
            </p>
            <p className="text-[11px] text-slate-500 truncate">
              {pemakai?.jabatan || "Instansi Pemerintah"}
            </p>
          </div>
        </div>

        {/* Akumulasi Biaya & Status Servis */}
        <div className="bg-slate-50/90 rounded-2xl p-3 border border-slate-100 grid grid-cols-2 gap-3">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Akumulasi Servis
            </span>
            <span className="text-sm font-black text-emerald-700 block mt-0.5">
              {formatRupiah(mobil.totalBiaya)}
            </span>
          </div>

          <div className="border-l border-slate-200/80 pl-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Servis
              </span>
              <span className="text-sm font-bold text-slate-700 block mt-0.5">
                {mobil.jumlahServis} Nota
              </span>
            </div>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Wrench className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-3">
        <a
          href={`/api/export/excel?mobilId=${mobil.id}`}
          title="Export file Excel khusus mobil ini"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span className="text-[11px] hidden sm:inline">Excel</span>
        </a>

        <Link
          href={`/mobil/${mobil.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 group-hover:text-blue-700 bg-blue-50/80 hover:bg-blue-100/80 px-3.5 py-1.5 rounded-xl transition"
        >
          <span>Buka Kartu Kendali</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>

        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          title="Hapus kendaraan"
          aria-label={`Hapus ${mobil.nama}`}
          className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition disabled:opacity-50"
        >
          <Trash2 className={`w-4 h-4 ${deleting ? "animate-pulse" : ""}`} />
        </button>
      </div>
    </div>
  );
}

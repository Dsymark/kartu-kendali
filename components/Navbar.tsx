"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Car, FileSpreadsheet, LogOut, User } from "lucide-react";
import { getSesiPetugas, logoutAction } from "@/lib/actions/auth";

export default function Navbar() {
  const pathname = usePathname();
  const [petugas, setPetugas] = useState<string | null>(null);

  useEffect(() => {
    async function checkSesi() {
      const sesi = await getSesiPetugas();
      if (sesi && sesi.nama) {
        setPetugas(sesi.nama);
      }
    }
    checkSesi();
  }, []);

  async function handleLogout() {
    if (confirm("Apakah Anda yakin ingin keluar dari sistem?")) {
      await logoutAction();
    }
  }

  if (pathname === "/login") return null;

  return (
    <header className="no-print sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo & Branding */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-105 group-hover:shadow-blue-500/50 transition duration-200">
              <Car className="w-5 h-5" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-base sm:text-lg text-white tracking-tight group-hover:text-blue-400 transition">
                KARTU KENDALI
              </span>
              <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 text-[10px] font-bold border border-blue-500/30">
                OFFICIAL
              </span>
            </div>
            <span className="text-[11px] text-slate-400 block -mt-0.5">
              Sistem Pemeliharaan Armada Kendaraan Dinas
            </span>
          </div>
        </Link>

        {/* Right Actions & User Pill */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* User Badge */}
          {petugas && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
              <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[10px]">
                <User className="w-3 h-3" />
              </div>
              <span className="max-w-[150px] truncate text-slate-200 font-medium">
                {petugas}
              </span>
            </div>
          )}

          {/* Export Excel Button */}
          <a
            href="/api/export/excel"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-700/50 rounded-xl transition shadow-sm"
            title="Download Rekap Semua Mobil ke Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Export Excel</span>
          </a>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 text-xs font-semibold text-rose-300 hover:text-rose-200 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 rounded-xl transition"
            title="Keluar dari Aplikasi"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </div>
    </header>
  );
}

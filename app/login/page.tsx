"use client";

import { useState } from "react";
import { Car, Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle } from "lucide-react";
import { loginAction, UserRole } from "@/lib/actions/auth";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [namaPetugas, setNamaPetugas] = useState("");
  const [role, setRole] = useState<UserRole>("admin");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!password.trim()) {
      setError("Silakan masukkan kata sandi akses.");
      return;
    }

    setLoading(true);
    const res = await loginAction(password, namaPetugas, role);
    setLoading(false);

    if (res.success) {
      window.location.href = "/";
    } else {
      setError(res.error || "Kata sandi salah.");
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-slate-950 font-sans">
      {/* Dynamic Background Glowing Blobs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Main Glassmorphic Login Card */}
      <div className="relative w-full max-w-md bg-slate-900/80 backdrop-blur-2xl border border-slate-800 rounded-3xl p-8 shadow-2xl shadow-black/80 z-10">
        {/* Top Logo & Header */}
        <div className="text-center space-y-3 pb-6 border-b border-slate-800/80">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 text-white shadow-lg shadow-blue-500/30 ring-4 ring-blue-500/10 mx-auto">
            <Car className="w-8 h-8" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-[11px] font-semibold text-emerald-400 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Sistem Akses Terproteksi</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Kartu Kendali Kendaraan
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Manajemen Armada, Mutasi Nopol, & Rekapitulasi Servis
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          {error && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400 text-xs flex items-center gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Input Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Mode Akses <span className="text-rose-400">*</span>
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-3.5 py-3 bg-slate-800/60 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            >
              <option value="admin">Admin - Kelola data</option>
              <option value="viewer">Viewer - Lihat saja</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Kata Sandi Akses <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan kata sandi kantor..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-11 py-3 bg-slate-800/60 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                required
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Input Nama Petugas (Opsional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Nama Anda / Petugas <span className="text-slate-500 text-[10px]">(Opsional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Contoh: Budi - Bagian Umum"
                value={namaPetugas}
                onChange={(e) => setNamaPetugas(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 active:scale-[0.99] disabled:opacity-60 transition duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Memeriksa Akses...</span>
            ) : (
              <>
                <span>Buka Aplikasi</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}


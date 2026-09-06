"use client";

import { useState } from "react";
import { Plus, X, Car, AlertCircle, Sparkles } from "lucide-react";
import { tambahMobil } from "@/lib/actions/mobil";

interface ModalTambahMobilProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModalTambahMobil({
  isOpen,
  onClose,
  onSuccess,
}: ModalTambahMobilProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nama: "",
    tipe: "SUV",
    nopolAwal: "",
    namaPenggunaAwal: "",
    jabatanAwal: "",
    nomorRangka: "",
    nomorMesin: "",
  });

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!formData.nama.trim()) {
      setError("Nama kendaraan wajib diisi (contoh: HONDA CR-V).");
      return;
    }
    if (!formData.nopolAwal.trim()) {
      setError("Plat nomor (Nopol) awal wajib diisi (contoh: K 6 B).");
      return;
    }
    if (!formData.namaPenggunaAwal.trim()) {
      setError("Nama pejabat / pemakai awal wajib diisi.");
      return;
    }

    setLoading(true);
    const res = await tambahMobil(formData);
    setLoading(false);

    if (res.success) {
      setFormData({
        nama: "",
        tipe: "SUV",
        nopolAwal: "",
        namaPenggunaAwal: "",
        jabatanAwal: "",
        nomorRangka: "",
        nomorMesin: "",
      });
      onSuccess();
      onClose();
    } else {
      setError(res.error || "Gagal menyimpan mobil baru.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-400/40 text-blue-300 flex items-center justify-center font-bold">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight">Daftarkan Mobil Dinas Baru</h3>
              <p className="text-[11px] text-slate-300">
                Registrasi armada baru & pejabat penanggung jawab pertama
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section: Live Plat Preview */}
          <div className="bg-slate-900 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-inner">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">
                Pratinjau Plat Nomor Fisik
              </span>
              <span className="text-xs text-slate-300">
                Standar Plat Hitam Dinas / Operasional
              </span>
            </div>
            <div className="plat-nomor-id px-4 py-2">
              <div className="flex flex-col items-center">
                <span className="text-base font-mono font-black tracking-widest text-amber-300">
                  {formData.nopolAwal.trim() || "K 1234 XX"}
                </span>
                <span className="text-[9px] font-mono text-slate-400 tracking-wider -mt-1 opacity-80">
                  RI • 06.29
                </span>
              </div>
            </div>
          </div>

          {/* Section: Identitas Mobil */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama & Varian Kendaraan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: HONDA CR-V 1.5 TURBO PRESTIGE"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kategori / Tipe
                </label>
                <select
                  value={formData.tipe}
                  onChange={(e) => setFormData({ ...formData, tipe: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="SUV">SUV (Sport Utility)</option>
                  <option value="MPV">MPV (Mobil Penumpang)</option>
                  <option value="Sedan">Sedan</option>
                  <option value="Pick Up / Box">Pick Up / Operasional</option>
                  <option value="Bus / Minibus">Minibus / Bus</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Plat Nomor (Nopol) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: K 6 B"
                  value={formData.nopolAwal}
                  onChange={(e) =>
                    setFormData({ ...formData, nopolAwal: e.target.value.toUpperCase() })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-sm font-black tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section: Pemakai Awal */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider">
                Penanggung Jawab / Pejabat Pertama
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Lengkap Pejabat <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Bapak Ahmad Dahlan, S.E."
                value={formData.namaPenggunaAwal}
                onChange={(e) =>
                  setFormData({ ...formData, namaPenggunaAwal: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Jabatan / Kedudukan
              </label>
              <input
                type="text"
                placeholder="Contoh: Kepala Dinas / Kabid Pengelolaan Aset"
                value={formData.jabatanAwal}
                onChange={(e) =>
                  setFormData({ ...formData, jabatanAwal: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Section: Opsional Rangka / Mesin */}
          <div className="pt-2 border-t border-slate-100">
            <details className="group text-xs">
              <summary className="cursor-pointer font-bold text-slate-500 hover:text-slate-800 py-1 flex items-center gap-1.5">
                <span>+ Data Legalitas Kendaraan (No. Rangka & No. Mesin)</span>
              </summary>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Nomor Rangka (VIN)
                  </label>
                  <input
                    type="text"
                    placeholder="Sesuai BPKB / STNK"
                    value={formData.nomorRangka}
                    onChange={(e) =>
                      setFormData({ ...formData, nomorRangka: e.target.value.toUpperCase() })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Nomor Mesin
                  </label>
                  <input
                    type="text"
                    placeholder="Sesuai BPKB / STNK"
                    value={formData.nomorMesin}
                    onChange={(e) =>
                      setFormData({ ...formData, nomorMesin: e.target.value.toUpperCase() })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs uppercase"
                  />
                </div>
              </div>
            </details>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-2xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 rounded-2xl shadow-lg shadow-blue-500/20 active:scale-95 transition flex items-center gap-2"
            >
              {loading ? (
                "Menyimpan..."
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Daftarkan Mobil
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

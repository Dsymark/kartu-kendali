"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import { requireAdmin } from "@/lib/actions/auth";

export async function getDaftarMobil() {
  try {
    noStore();
    const mobilList = await prisma.mobil.findMany({
      include: {
        historiPemakai: {
          orderBy: { createdAt: "desc" },
        },
        riwayatServis: {
          include: {
            items: true,
          },
          orderBy: { tanggal: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return mobilList.map((m) => {
      const pemakaiAktif = m.historiPemakai.find((h) => h.isAktif) || m.historiPemakai[0];
      const totalBiaya = m.riwayatServis.reduce((acc, s) => acc + s.totalBiaya, 0);

      return {
        ...m,
        pemakaiAktif,
        totalBiaya,
        jumlahServis: m.riwayatServis.length,
      };
    });
  } catch (error) {
    console.error("Error getDaftarMobil:", error);
    return [];
  }
}

export async function getDetailMobil(id: number) {
  try {
    noStore();
    const mobil = await prisma.mobil.findUnique({
      where: { id },
      include: {
        historiPemakai: {
          orderBy: [{ isAktif: "desc" }, { tanggalMulai: "desc" }],
        },
        riwayatServis: {
          include: {
            items: true,
          },
          orderBy: { tanggal: "asc" },
        },
      },
    });

    if (!mobil) return null;

    const pemakaiAktif = mobil.historiPemakai.find((h) => h.isAktif) || mobil.historiPemakai[0];
    const totalBiaya = mobil.riwayatServis.reduce((acc, s) => acc + s.totalBiaya, 0);

    return {
      ...mobil,
      pemakaiAktif,
      totalBiaya,
    };
  } catch (error) {
    console.error("Error getDetailMobil:", error);
    return null;
  }
}

export async function tambahMobil(data: {
  nama: string;
  jenis: string;
  tipe?: string;
  nomorRangka?: string;
  nomorMesin?: string;
  nopolAwal: string;
  namaPenggunaAwal: string;
  jabatanAwal?: string;
}) {
  try {
    await requireAdmin();
    const mobil = await prisma.mobil.create({
      data: {
        nama: data.nama.trim(),
        jenis: data.jenis === "Motor" ? "Motor" : "Mobil",
        tipe: data.tipe?.trim() || null,
        nomorRangka: data.nomorRangka?.trim() || null,
        nomorMesin: data.nomorMesin?.trim() || null,
        historiPemakai: {
          create: {
            nopol: data.nopolAwal.trim().toUpperCase(),
            namaPengguna: data.namaPenggunaAwal.trim(),
            jabatan: data.jabatanAwal?.trim() || null,
            isAktif: true,
            tanggalMulai: new Date(),
          },
        },
      },
    });

    revalidatePath("/");
    return { success: true, mobilId: mobil.id };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal menambah mobil";
    console.error("Error tambahMobil:", msg);
    return { success: false, error: msg };
  }
}

export async function mutasiPemakai(
  mobilId: number,
  data: {
    nopol: string;
    namaPengguna: string;
    jabatan?: string;
    tanggalMutasi?: string;
    catatan?: string;
  }
) {
  try {
    await requireAdmin();
    const tanggalMulai = data.tanggalMutasi ? new Date(data.tanggalMutasi) : new Date();

    // 1. Nonaktifkan pemakai aktif saat ini
    await prisma.historiPemakai.updateMany({
      where: {
        mobilId,
        isAktif: true,
      },
      data: {
        isAktif: false,
        tanggalSelesai: tanggalMulai,
      },
    });

    // 2. Buat record histori pemakai baru yang aktif
    await prisma.historiPemakai.create({
      data: {
        mobilId,
        nopol: data.nopol.trim().toUpperCase(),
        namaPengguna: data.namaPengguna.trim(),
        jabatan: data.jabatan?.trim() || null,
        isAktif: true,
        tanggalMulai,
        catatan: data.catatan?.trim() || null,
      },
    });

    revalidatePath(`/`);
    revalidatePath(`/mobil/${mobilId}`);
    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal mutasi pemakai";
    console.error("Error mutasiPemakai:", msg);
    return { success: false, error: msg };
  }
}

export async function hapusMobil(id: number) {
  try {
    await requireAdmin();
    await prisma.mobil.delete({
      where: { id },
    });
    revalidatePath("/");
    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal menghapus mobil";
    console.error("Error hapusMobil:", msg);
    return { success: false, error: msg };
  }
}


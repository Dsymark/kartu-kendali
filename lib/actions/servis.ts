"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface ItemServisInput {
  uraian: string;
  jumlah: number;
  hargaSatuan: number;
  subtotal: number;
}

export async function catatServis(
  mobilId: number,
  data: {
    tanggal: string; // YYYY-MM-DD
    bengkel: string;
    nomorNota?: string;
    keterangan?: string;
    items: ItemServisInput[];
  }
) {
  try {
    const totalBiaya = data.items.reduce((acc, item) => acc + (Number(item.subtotal) || 0), 0);

    const servis = await prisma.servis.create({
      data: {
        mobilId,
        tanggal: new Date(data.tanggal),
        bengkel: data.bengkel.trim(),
        nomorNota: data.nomorNota?.trim() || null,
        totalBiaya,
        keterangan: data.keterangan?.trim() || null,
        items: {
          create: data.items.map((item) => ({
            uraian: item.uraian.trim(),
            jumlah: Number(item.jumlah) || 1,
            hargaSatuan: Number(item.hargaSatuan) || 0,
            subtotal: Number(item.subtotal) || 0,
          })),
        },
      },
    });

    revalidatePath("/");
    revalidatePath(`/mobil/${mobilId}`);
    return { success: true, servisId: servis.id };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal mencatat servis";
    console.error("Error catatServis:", msg);
    return { success: false, error: msg };
  }
}

export async function updateServis(
  servisId: number,
  mobilId: number,
  data: {
    tanggal: string;
    bengkel: string;
    nomorNota?: string;
    keterangan?: string;
    items: ItemServisInput[];
  }
) {
  try {
    const totalBiaya = data.items.reduce((acc, item) => acc + (Number(item.subtotal) || 0), 0);

    // Hapus item lama dan buat item baru (atomic transaction)
    await prisma.$transaction([
      prisma.itemServis.deleteMany({
        where: { servisId },
      }),
      prisma.servis.update({
        where: { id: servisId },
        data: {
          tanggal: new Date(data.tanggal),
          bengkel: data.bengkel.trim(),
          nomorNota: data.nomorNota?.trim() || null,
          totalBiaya,
          keterangan: data.keterangan?.trim() || null,
          items: {
            create: data.items.map((item) => ({
              uraian: item.uraian.trim(),
              jumlah: Number(item.jumlah) || 1,
              hargaSatuan: Number(item.hargaSatuan) || 0,
              subtotal: Number(item.subtotal) || 0,
            })),
          },
        },
      }),
    ]);

    revalidatePath("/");
    revalidatePath(`/mobil/${mobilId}`);
    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal update servis";
    console.error("Error updateServis:", msg);
    return { success: false, error: msg };
  }
}

export async function hapusServis(servisId: number, mobilId: number) {
  try {
    await prisma.servis.delete({
      where: { id: servisId },
    });

    revalidatePath("/");
    revalidatePath(`/mobil/${mobilId}`);
    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal menghapus servis";
    console.error("Error hapusServis:", msg);
    return { success: false, error: msg };
  }
}


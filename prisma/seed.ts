import { PrismaClient } from "@prisma/client";
import { createClient } from "@libsql/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";

const database = createClient({ url: "file:./prisma/dev.db" });
const prisma = new PrismaClient({ adapter: new PrismaLibSQL(database) });

async function main() {
  // Cek apakah data sudah ada
  const count = await prisma.mobil.count();
  if (count > 0) {
    console.log("Database sudah memiliki data mobil.");
    return;
  }

  console.log("Menanamkan data awal kendaraan dinas...");

  // 1. Mobil Honda CR-V (Skenario alur cerita user)
  const crv = await prisma.mobil.create({
    data: {
      nama: "HONDA CR-V 1.5 TURBO",
      jenis: "Mobil",
      tipe: "SUV",
      nomorRangka: "MH1RW1880KK102931",
      nomorMesin: "L15BG1028301",
      historiPemakai: {
        create: [
          {
            nopol: "K 7890 AB",
            namaPengguna: "Bapak Ahmad Dahlan, S.E.",
            jabatan: "Kepala Dinas",
            tanggalMulai: new Date("2024-01-02"),
            tanggalSelesai: new Date("2025-06-15"),
            isAktif: false,
            catatan: "Plat nomor awal dinas",
          },
          {
            nopol: "K 6 B",
            namaPengguna: "Bapak Budi Santoso, S.T.",
            jabatan: "Kepala Dinas",
            tanggalMulai: new Date("2025-06-15"),
            isAktif: true,
            catatan: "Sertijab Pejabat dan peremajaan plat nopol dinas",
          },
        ],
      },
      riwayatServis: {
        create: [
          {
            tanggal: new Date("2025-08-20"),
            bengkel: "HONDA KUDUS JAYA",
            nomorNota: "INV/HKJ/2025/082",
            totalBiaya: 1450000,
            keterangan: "Servis berkala 20.000 KM",
            items: {
              create: [
                { uraian: "Oli Mesin Honda E-Pro Gold 4L", jumlah: 1, hargaSatuan: 650000, subtotal: 650000 },
                { uraian: "Filter Oli Mesin Asli", jumlah: 1, hargaSatuan: 85000, subtotal: 85000 },
                { uraian: "Pembersih Injektor (Cleaner)", jumlah: 1, hargaSatuan: 165000, subtotal: 165000 },
                { uraian: "Jasa Servis Berkala & Tune Up", jumlah: 1, hargaSatuan: 550000, subtotal: 550000 },
              ],
            },
          },
          {
            tanggal: new Date("2026-02-10"),
            bengkel: "HONDA KUDUS JAYA",
            nomorNota: "INV/HKJ/2026/019",
            totalBiaya: 2150000,
            keterangan: "Servis berkala 30.000 KM & Ganti Kampas Rem",
            items: {
              create: [
                { uraian: "Oli Mesin Honda E-Pro Gold 4L", jumlah: 1, hargaSatuan: 680000, subtotal: 680000 },
                { uraian: "Filter Udara Mesin", jumlah: 1, hargaSatuan: 220000, subtotal: 220000 },
                { uraian: "Kampas Rem Depan (Brake Pad)", jumlah: 1, hargaSatuan: 850000, subtotal: 850000 },
                { uraian: "Jasa Servis & Penggantian Rem", jumlah: 1, hargaSatuan: 400000, subtotal: 400000 },
              ],
            },
          },
        ],
      },
    },
  });

  // 2. Mobil Toyota Innova
  await prisma.mobil.create({
    data: {
      nama: "TOYOTA INNOVA REBORN 2.4 G",
      jenis: "Mobil",
      tipe: "MPV",
      historiPemakai: {
        create: [
          {
            nopol: "K 1234 B",
            namaPengguna: "Bapak Ir. Hendro Wibowo",
            jabatan: "Sekretaris Dinas",
            tanggalMulai: new Date("2024-05-10"),
            isAktif: true,
            catatan: "Penyerahan kendaraan dinas operasional",
          },
        ],
      },
      riwayatServis: {
        create: [
          {
            tanggal: new Date("2026-01-15"),
            bengkel: "Nasmoco Kudus",
            nomorNota: "NSM-2026-041",
            totalBiaya: 1200000,
            keterangan: "Ganti oli transmisi & filter",
            items: {
              create: [
                { uraian: "Oli Mesin Diesel TMO 5W-30 6L", jumlah: 1, hargaSatuan: 720000, subtotal: 720000 },
                { uraian: "Filter Oli Diesel", jumlah: 1, hargaSatuan: 130000, subtotal: 130000 },
                { uraian: "Jasa Servis Ringan", jumlah: 1, hargaSatuan: 350000, subtotal: 350000 },
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.mobil.create({
    data: {
      nama: "HONDA VARIO 160",
      jenis: "Motor",
      tipe: "Skuter",
      historiPemakai: {
        create: {
          nopol: "K 5678 C",
          namaPengguna: "Bapak Andi Pratama",
          jabatan: "Staf Operasional",
          isAktif: true,
          catatan: "Motor dinas operasional lapangan",
        },
      },
    },
  });

  console.log("Data awal berhasil ditanamkan.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


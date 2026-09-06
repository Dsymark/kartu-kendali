import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import { getSesiPetugas } from "@/lib/actions/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const sesi = await getSesiPetugas();
  if (!sesi) {
    return NextResponse.json(
      { error: "Akses ditolak: Silakan login terlebih dahulu." },
      { status: 401 }
    );
  }
  try {
    const searchParams = request.nextUrl.searchParams;
    const mobilIdParam = searchParams.get("mobilId");
    const tahunParam = searchParams.get("tahun");

    const mobilId = mobilIdParam ? parseInt(mobilIdParam) : undefined;
    const tahun = tahunParam && tahunParam !== "semua" ? parseInt(tahunParam) : undefined;

    // Filter tanggal jika tahun ditentukan
    let dateFilter = {};
    if (tahun) {
      dateFilter = {
        gte: new Date(`${tahun}-01-01T00:00:00.000Z`),
        lte: new Date(`${tahun}-12-31T23:59:59.999Z`),
      };
    }

    // Ambil data dari Prisma
    const dataServis = await prisma.servis.findMany({
      where: {
        ...(mobilId ? { mobilId } : {}),
        ...(tahun ? { tanggal: dateFilter } : {}),
      },
      include: {
        mobil: {
          include: {
            historiPemakai: {
              orderBy: [{ isAktif: "desc" }, { tanggalMulai: "desc" }],
            },
          },
        },
        items: true,
      },
      orderBy: { tanggal: "asc" },
    });

    // Cari info mobil jika export spesifik satu mobil
    let targetMobil = null;
    if (mobilId) {
      targetMobil = await prisma.mobil.findUnique({
        where: { id: mobilId },
        include: {
          historiPemakai: {
            orderBy: [{ isAktif: "desc" }, { tanggalMulai: "desc" }],
          },
        },
      });
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Aplikasi Kartu Kendali Kendaraan";
    workbook.created = new Date();

    // ==========================================
    // SHEET 1: REKAP SERVIS / KARTU KENDALI
    // ==========================================
    const sheet1 = workbook.addWorksheet("Rekap Pemeliharaan", {
      views: [{ state: "frozen", ySplit: 1 }], // FREEZE HEADER ROW 1
    });

    // Definisi Kolom
    sheet1.columns = [
      { header: "No", key: "no", width: 6 },
      { header: "Tanggal", key: "tanggal", width: 14 },
      { header: "Kendaraan", key: "mobil", width: 22 },
      { header: "Nopol Aktif", key: "nopol", width: 14 },
      { header: "Pejabat / Pemakai", key: "pemakai", width: 25 },
      { header: "Bengkel Pelaksana", key: "bengkel", width: 28 },
      { header: "No. Nota", key: "nota", width: 16 },
      { header: "Jumlah Item", key: "itemCount", width: 13 },
      { header: "Total Biaya (Rp)", key: "biaya", width: 20 },
      { header: "Keterangan", key: "keterangan", width: 25 },
    ];

    // Styling Header Row
    const headerRow1 = sheet1.getRow(1);
    headerRow1.height = 26;
    headerRow1.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    headerRow1.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1E3A8A" }, // Indigo / Navy Elegant
    };
    headerRow1.alignment = { vertical: "middle", horizontal: "center" };

    // Format Rupiah
    sheet1.getColumn("biaya").numFmt = '"Rp "#,##0';
    sheet1.getColumn("no").alignment = { horizontal: "center" };
    sheet1.getColumn("tanggal").alignment = { horizontal: "center" };
    sheet1.getColumn("nopol").alignment = { horizontal: "center" };
    sheet1.getColumn("itemCount").alignment = { horizontal: "center" };

    // Isi Data
    dataServis.forEach((item, index) => {
      const pemakaiAktif =
        item.mobil.historiPemakai.find((h) => h.isAktif) ||
        item.mobil.historiPemakai[0];

      const row = sheet1.addRow({
        no: index + 1,
        tanggal: item.tanggal.toISOString().split("T")[0],
        mobil: item.mobil.nama,
        nopol: pemakaiAktif?.nopol || "-",
        pemakai: pemakaiAktif?.namaPengguna || "-",
        bengkel: item.bengkel,
        nota: item.nomorNota || "-",
        itemCount: item.items.length,
        biaya: item.totalBiaya,
        keterangan: item.keterangan || "-",
      });

      // Border halus untuk tiap baris data
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin", color: { argb: "FFE2E8F0" } },
          left: { style: "thin", color: { argb: "FFE2E8F0" } },
          bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
          right: { style: "thin", color: { argb: "FFE2E8F0" } },
        };
      });
    });

    const totalDataRows = dataServis.length;

    // AUTOFILTER DI HEADER (Semua kolom bisa difilter & disortir langsung)
    sheet1.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: 10 },
    };

    // BARIS TOTAL DENGAN RUMUS SUM ASLI
    if (totalDataRows > 0) {
      const totalRow = sheet1.addRow({
        bengkel: "TOTAL KESELURUHAN",
        biaya: { formula: `SUM(I2:I${totalDataRows + 1})` }, // RUMUS DINAMIS EXCEL
      });

      totalRow.height = 24;
      totalRow.font = { bold: true, size: 11 };
      totalRow.getCell("bengkel").alignment = { horizontal: "right" };
      totalRow.getCell("biaya").font = { bold: true, color: { argb: "FF047857" } }; // Hijau emerald
      totalRow.getCell("biaya").numFmt = '"Rp "#,##0';

      totalRow.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF1F5F9" },
        };
        cell.border = {
          top: { style: "medium", color: { argb: "FF94A3B8" } },
          bottom: { style: "double", color: { argb: "FF334155" } },
        };
      });
    }

    // ==========================================
    // SHEET 2: RINCIAN LENGKAP ITEM PER NOTA
    // ==========================================
    const sheet2 = workbook.addWorksheet("Rincian Item Nota", {
      views: [{ state: "frozen", ySplit: 1 }], // FREEZE HEADER ROW 1
    });

    sheet2.columns = [
      { header: "No", key: "no", width: 6 },
      { header: "Tanggal", key: "tanggal", width: 14 },
      { header: "Kendaraan", key: "mobil", width: 22 },
      { header: "No. Nota", key: "nota", width: 16 },
      { header: "Bengkel", key: "bengkel", width: 25 },
      { header: "Uraian Pekerjaan / Sparepart", key: "uraian", width: 35 },
      { header: "Qty", key: "jumlah", width: 8 },
      { header: "Harga Satuan (Rp)", key: "hargaSatuan", width: 18 },
      { header: "Subtotal (Rp)", key: "subtotal", width: 20 },
    ];

    const headerRow2 = sheet2.getRow(1);
    headerRow2.height = 26;
    headerRow2.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    headerRow2.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0F766E" }, // Teal Elegant
    };
    headerRow2.alignment = { vertical: "middle", horizontal: "center" };

    sheet2.getColumn("hargaSatuan").numFmt = '"Rp "#,##0';
    sheet2.getColumn("subtotal").numFmt = '"Rp "#,##0';
    sheet2.getColumn("no").alignment = { horizontal: "center" };
    sheet2.getColumn("tanggal").alignment = { horizontal: "center" };
    sheet2.getColumn("jumlah").alignment = { horizontal: "center" };

    let itemCounter = 1;
    dataServis.forEach((servis) => {
      servis.items.forEach((item) => {
        const row = sheet2.addRow({
          no: itemCounter++,
          tanggal: servis.tanggal.toISOString().split("T")[0],
          mobil: servis.mobil.nama,
          nota: servis.nomorNota || "-",
          bengkel: servis.bengkel,
          uraian: item.uraian,
          jumlah: item.jumlah,
          hargaSatuan: item.hargaSatuan,
          subtotal: item.subtotal,
        });

        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin", color: { argb: "FFE2E8F0" } },
            left: { style: "thin", color: { argb: "FFE2E8F0" } },
            bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
            right: { style: "thin", color: { argb: "FFE2E8F0" } },
          };
        });
      });
    });

    const totalItemRows = itemCounter - 1;

    // AUTOFILTER DI SHEET 2
    sheet2.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: 9 },
    };

    // RUMUS SUM DI SHEET 2
    if (totalItemRows > 0) {
      const totalRow2 = sheet2.addRow({
        uraian: "TOTAL BIAYA ITEM",
        subtotal: { formula: `SUM(I2:I${totalItemRows + 1})` },
      });

      totalRow2.height = 24;
      totalRow2.font = { bold: true, size: 11 };
      totalRow2.getCell("uraian").alignment = { horizontal: "right" };
      totalRow2.getCell("subtotal").font = { bold: true, color: { argb: "FF047857" } };
      totalRow2.getCell("subtotal").numFmt = '"Rp "#,##0';

      totalRow2.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF1F5F9" },
        };
        cell.border = {
          top: { style: "medium", color: { argb: "FF94A3B8" } },
          bottom: { style: "double", color: { argb: "FF334155" } },
        };
      });
    }

    // Nama file export yang rapi
    let fileName = "Kartu_Kendali_Semua_Armada";
    if (targetMobil) {
      const plat = targetMobil.historiPemakai.find((h) => h.isAktif)?.nopol || targetMobil.nama;
      fileName = `Kartu_Kendali_${plat.replace(/\s+/g, "_")}`;
    }
    if (tahun) {
      fileName += `_${tahun}`;
    }
    fileName += ".xlsx";

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "Terjadi kesalahan";
    console.error("Export Excel Error:", errMsg);
    return NextResponse.json(
      { error: "Gagal membuat file Excel: " + errMsg },
      { status: 500 }
    );
  }
}


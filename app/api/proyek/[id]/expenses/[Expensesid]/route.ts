// FILE: app/api/proyek/[id]/expenses/[Expensesid]/route.ts
// ========================================
import { NextRequest, NextResponse } from "next/server";
import { updateExpense, deleteExpense } from "@/lib/actions/mandor/pengeluaran";

// 1. Definisikan tipe Params agar sesuai dengan NAMA FOLDER [Expensesid]
//    Perhatikan huruf besar 'E' pada 'Expensesid'
type Params = Promise<{ id: string; Expensesid: string }>;

export async function PUT(
  request: NextRequest,
  { params }: { params: Params } // Gunakan tipe Params yang sudah didefinisikan
) {
  // 2. Await params terlebih dahulu
  const { Expensesid } = await params;

  const body = await request.json();

  // Gunakan variabel Expensesid (sesuai nama folder)
  const result = await updateExpense(Expensesid, {
    nama: body.nama,
    deskripsi: body.deskripsi,
    harga: body.harga,
    kuantitas: body.kuantitas,
    satuan: body.satuan,
    status: body.status,
    tanggal: body.tanggal,
    milestoneId: body.milestoneId,
    gambar: body.gambar,
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ data: result.data });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Params } // Gunakan tipe Params
) {
  // 2. Await params terlebih dahulu
  const { Expensesid } = await params;

  // Gunakan variabel Expensesid
  const result = await deleteExpense(Expensesid);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ message: result.message });
}

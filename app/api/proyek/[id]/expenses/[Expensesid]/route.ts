// FILE: app/api/projects/[id]/expenses/[expenseId]/route.ts
// ========================================
import { NextRequest, NextResponse } from "next/server";
import { updateExpense, deleteExpense } from "@/lib/actions/mandor/pengeluaran";

// DEFINISIKAN TIPE PARAMS
type Params = Promise<{ id: string; Expensesid: string }>;

export async function PUT(
  request: NextRequest,
  { params }: { params: Params } // Params kini Promise
) {
  // 1. AWAIT PARAMS TERLEBIH DAHULU
  const { Expensesid } = await params;

  const body = await request.json();

  // Gunakan Expensesid yang sudah di-await
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
  { params }: { params: Params } // Params kini Promise
) {
  // 1. AWAIT PARAMS
  const { Expensesid } = await params;

  // Gunakan Expensesid
  const result = await deleteExpense(Expensesid);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ message: result.message });
}

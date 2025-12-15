// FILE: app/api/projects/[id]/expenses/route.ts
// ========================================
import { NextRequest, NextResponse } from "next/server";
import {
  getExpensesByProjectId,
  createExpense,
} from "@/lib/actions/mandor/pengeluaran";

// Definisikan tipe Params sebagai Promise
type Params = Promise<{ id: string }>;

export async function GET(
  request: NextRequest,
  { params }: { params: Params } // Ubah tipe di sini
) {
  // Await params sebelum digunakan
  const { id } = await params;

  const result = await getExpensesByProjectId(id);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: result.error === "Unauthorized" ? 401 : 404 }
    );
  }

  return NextResponse.json({ data: result.data });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Params } // Ubah tipe di sini
) {
  // Await params sebelum digunakan
  const { id } = await params;

  const body = await request.json();

  const result = await createExpense({
    proyekId: id, // Gunakan id yang sudah di-await
    milestoneId: body.milestoneId,
    nama: body.nama,
    deskripsi: body.deskripsi,
    harga: body.harga,
    kuantitas: body.kuantitas,
    satuan: body.satuan,
    status: body.status,
    tanggal: body.tanggal,
    gambar: body.gambar,
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ data: result.data }, { status: 201 });
}

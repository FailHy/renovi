// ========================================
// FILE: app/api/projects/[id]/expenses/[expenseId]/route.ts
// ========================================
import { NextRequest, NextResponse } from 'next/server'
import { updateExpense, deleteExpense } from '@/lib/actions/mandor/pengeluaran'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; expenseId: string } }
) {
  const body = await request.json()

  const result = await updateExpense(params.expenseId, {
    nama: body.nama,
    deskripsi: body.deskripsi,
    harga: body.harga,
    kuantitas: body.kuantitas,
    satuan: body.satuan,
    status: body.status,
    tanggal: body.tanggal,
    milestoneId: body.milestoneId,
    gambar: body.gambar
  })

  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: 400 }
    )
  }

  return NextResponse.json({ data: result.data })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; expenseId: string } }
) {
  const result = await deleteExpense(params.expenseId)

  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: 400 }
    )
  }

  return NextResponse.json({ message: result.message })
}


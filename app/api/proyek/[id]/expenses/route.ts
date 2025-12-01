// ========================================
// FILE: app/api/projects/[id]/expenses/route.ts
// ========================================
import { NextRequest, NextResponse } from 'next/server'
import { getExpensesByProjectId, createExpense } from '@/lib/actions/mandor/pengeluaran'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const result = await getExpensesByProjectId(params.id)
  
  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: result.error === 'Unauthorized' ? 401 : 404 }
    )
  }

  return NextResponse.json({ data: result.data })
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json()

  const result = await createExpense({
    proyekId: params.id,
    milestoneId: body.milestoneId,
    nama: body.nama,
    deskripsi: body.deskripsi,
    harga: body.harga,
    kuantitas: body.kuantitas,
    satuan: body.satuan,
    status: body.status,
    tanggal: body.tanggal,
    gambar: body.gambar
  })

  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: 400 }
    )
  }

  return NextResponse.json({ data: result.data }, { status: 201 })
}


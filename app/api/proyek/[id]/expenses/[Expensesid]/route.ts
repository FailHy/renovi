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

// ========================================
// FILE: app/api/mandor/dashboard/route.ts
// ========================================
import { NextRequest, NextResponse } from 'next/server'
import { getMandorDashboardSummary } from '@/lib/actions/mandor/dashboard'
import { getProjectPerformanceStats, getMonthlyActivitySummary } from '@/lib/actions/mandor/dashboard-enhanced'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const type = searchParams.get('type') || 'summary'

  switch (type) {
    case 'summary':
      const summaryResult = await getMandorDashboardSummary()
      if (!summaryResult.success) {
        return NextResponse.json(
          { error: summaryResult.error },
          { status: 401 }
        )
      }
      return NextResponse.json({ data: summaryResult.data })

    case 'performance':
      const performanceResult = await getProjectPerformanceStats()
      if (!performanceResult.success) {
        return NextResponse.json(
          { error: performanceResult.error },
          { status: 401 }
        )
      }
      return NextResponse.json({ data: performanceResult.data })

    case 'monthly':
      const monthlyResult = await getMonthlyActivitySummary()
      if (!monthlyResult.success) {
        return NextResponse.json(
          { error: monthlyResult.error },
          { status: 401 }
        )
      }
      return NextResponse.json({ data: monthlyResult.data })

    default:
      return NextResponse.json(
        { error: 'Invalid type parameter' },
        { status: 400 }
      )
  }
}
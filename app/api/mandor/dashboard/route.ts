// ========================================
// FILE: app/api/mandor/dashboard/route.ts
// ========================================
import { NextRequest, NextResponse } from 'next/server'
import { getMandorDashboardSummary } from '@/lib/actions/mandor/dashboard'
import { getProjectPerformanceStats, getMonthlyActivitySummary } from '@/lib/actions/mandor/dashboardplus'

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